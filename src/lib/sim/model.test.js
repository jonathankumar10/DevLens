import { test } from 'node:test'
import assert from 'node:assert/strict'
import { initialState, simulate, getInsight } from './model.js'
import { SLIDER_STEP, SLIDER_STEPS, positionToTraffic, trafficToPosition } from './format.js'
import scenario from '../../content/system-design/designs/url-shortener/scenario.js'

const scaled = {
  traffic: 50_000,
  values: { appServers: 20, cacheNodes: 2, replicas: 2, shards: 2, useQueue: true },
  failed: [],
}

const TRAFFIC_SWEEP = [100, 1_000, 5_000, 20_000, 100_000, 500_000, 1_000_000]

test('more traffic never lowers the load on any node', () => {
  for (const values of [initialState(scenario).values, scaled.values]) {
    let previous = null
    for (const traffic of TRAFFIC_SWEEP) {
      const { nodes } = simulate(scenario, { traffic, values, failed: [] })
      if (previous) {
        for (const id of Object.keys(nodes)) {
          assert.ok(
            nodes[id].arrival >= previous[id].arrival - 1e-6,
            `${id} load fell at ${traffic} req/s`,
          )
        }
      }
      previous = nodes
    }
  }
})

test('more traffic never improves the error rate', () => {
  let previous = 0
  for (const traffic of TRAFFIC_SWEEP) {
    const { errorRate } = simulate(scenario, { ...scaled, traffic })
    assert.ok(errorRate >= previous - 1e-9, `errors improved at ${traffic} req/s`)
    previous = errorRate
  }
})

test('killing a node never adds capacity or lowers errors', () => {
  const healthy = simulate(scenario, scaled)
  for (const { node } of scenario.failures) {
    const broken = simulate(scenario, { ...scaled, failed: [node] })
    assert.ok(
      broken.nodes[node].alive < healthy.nodes[node].alive,
      `failing ${node} did not remove capacity`,
    )
    assert.ok(broken.errorRate >= healthy.errorRate - 1e-9, `failing ${node} lowered errors`)
  }
})

test('a cache reduces database load and p50', () => {
  const values = { appServers: 10, cacheNodes: 0, replicas: 0, shards: 1, useQueue: false }
  const without = simulate(scenario, { traffic: 2_000, values, failed: [] })
  const withIt  = simulate(scenario, { traffic: 2_000, values: { ...values, cacheNodes: 1 }, failed: [] })
  assert.ok(withIt.nodes.primary.arrival < without.nodes.primary.arrival / 5)
  assert.ok(withIt.p50 < without.p50)
})

test('p99 reveals cache misses that p50 hides', () => {
  const values = { appServers: 10, cacheNodes: 1, replicas: 0, shards: 1, useQueue: false }
  const { p50, p99 } = simulate(scenario, { traffic: 2_000, values, failed: [] })
  assert.ok(p99 > p50 * 1.4, `p50 ${p50} and p99 ${p99} are too close`)
})

test('more app servers lower the utilization of the app tier', () => {
  const at = (appServers) => simulate(scenario, {
    traffic: 4_000,
    values: { ...initialState(scenario).values, appServers },
    failed: [],
  })
  assert.ok(at(2).nodes.app.utilization < at(1).nodes.app.utilization)
})

test('a redundant tier survives losing one instance', () => {
  const single = { ...scaled, values: { ...scaled.values, appServers: 1 }, traffic: 1_000, failed: ['app'] }
  assert.equal(simulate(scenario, single).errorRate, 1)

  const redundant = { ...scaled, traffic: 1_000, failed: ['app'] }
  assert.equal(simulate(scenario, redundant).errorRate, 0)
})

test('overflowing a queue-fed consumer causes lag, not errors', () => {
  const result = simulate(scenario, {
    traffic: 1_000_000,
    values: { appServers: 300, cacheNodes: 16, replicas: 16, shards: 8, useQueue: true },
    failed: [],
  })
  assert.equal(result.errorRate, 0)
  assert.ok(result.lagPerSec > 0)
  assert.notEqual(result.bottleneck, 'clicks')
})

test('results stay within valid bounds across the control space', () => {
  const controls = Object.fromEntries(
    scenario.controls.map((c) => [c.id, c.type === 'switch' ? [false, true] : c.options]),
  )
  const failureSets = [[], ...scenario.failures.map((f) => [f.node])]

  for (const traffic of TRAFFIC_SWEEP) {
    for (const failed of failureSets) {
      for (const appServers of controls.appServers) {
        for (const cacheNodes of controls.cacheNodes) {
          for (const replicas of controls.replicas) {
            for (const useQueue of controls.useQueue) {
              const values = { appServers, cacheNodes, replicas, shards: 1, useQueue }
              const r = simulate(scenario, { traffic, values, failed })
              assert.ok(r.errorRate >= 0 && r.errorRate <= 1)
              assert.ok(r.throughput >= 0 && r.throughput <= traffic + 1e-6)
              assert.ok(r.lagPerSec >= 0)
              if (r.p50 !== null) {
                assert.ok(r.p50 > 0 && r.p50 <= r.p99 + 1e-6)
                assert.ok(r.p99 <= r.timeoutMs)
              }
              assert.ok(getInsight(scenario, r).text, 'every state needs an insight')
            }
          }
        }
      }
    }
  }
})

test('a side call adds latency and failures but never carries the request onward', () => {
  const values = { appServers: 10, cacheNodes: 1, replicas: 0, shards: 1, useQueue: false }
  const inline = simulate(scenario, { traffic: 2_000, values, failed: [] })
  assert.ok(inline.edges.some((e) => e.from === 'app' && e.to === 'clicks'))
  assert.ok(inline.edges.some((e) => e.from === 'app' && e.to === 'cache'))
  assert.ok(!inline.edges.some((e) => e.from === 'clicks'), 'nothing flows onward from analytics')

  const queued = simulate(scenario, { traffic: 2_000, values: { ...values, useQueue: true }, failed: [] })
  assert.ok(queued.p50 < inline.p50, 'removing the inline write should be faster')

  const melted = simulate(scenario, { traffic: 200_000, values: { ...values, appServers: 100, cacheNodes: 4 }, failed: [] })
  assert.equal(melted.bottleneck, 'clicks')
  assert.ok(melted.errorRate > 0.5, 'an overloaded side call still fails requests')
})

test('every slider step changes the traffic, in both directions', () => {
  const config = scenario.traffic
  let traffic = config.min
  let steps = 0
  while (traffic < config.max) {
    const next = positionToTraffic(trafficToPosition(traffic, config) + SLIDER_STEP, config)
    assert.ok(next > traffic, `stuck at ${traffic} going up`)
    traffic = next
    assert.ok(++steps <= SLIDER_STEPS, 'never reached the maximum')
  }
  while (traffic > config.min) {
    const next = positionToTraffic(trafficToPosition(traffic, config) - SLIDER_STEP, config)
    assert.ok(next < traffic, `stuck at ${traffic} going down`)
    traffic = next
  }
})

test('scenario references only real nodes and controls', () => {
  const nodeIds = new Set(scenario.nodes.map((n) => n.id))
  const controlIds = new Set(scenario.controls.map((c) => c.id))

  const checkStep = (step) => {
    if (typeof step === 'string') return assert.ok(nodeIds.has(step), step)
    if (step.node) assert.ok(nodeIds.has(step.node), step.node)
    if (step.first) step.first.forEach(checkStep)
    if (step.async) step.async.forEach(checkStep)
    for (const key of [step.when, step.unless]) {
      if (key) assert.ok(controlIds.has(key), key)
    }
  }
  scenario.workloads.forEach((w) => w.path.forEach(checkStep))
  scenario.failures.forEach((f) => assert.ok(nodeIds.has(f.node), f.node))

  const shares = scenario.workloads.reduce((sum, w) => sum + w.share, 0)
  assert.ok(Math.abs(shares - 1) < 1e-9, 'workload shares must sum to 1')

  for (const node of scenario.nodes) {
    assert.ok(node.wide && node.narrow, `${node.id} needs both layouts`)
    if (node.kind !== 'client') assert.ok(node.capacity > 0, `${node.id} needs a capacity`)
  }
})

for (const [i, step] of scenario.guide.entries()) {
  test(`guide step ${i + 1} behaves as narrated: ${step.title}`, () => {
    const state = { failed: [], ...step.state }
    for (const control of scenario.controls) {
      assert.ok(control.id in state.values, `step sets no value for ${control.id}`)
      if (control.type === 'stepper') {
        assert.ok(control.options.includes(state.values[control.id]), `${control.id} isn't an option`)
      }
    }

    const result = simulate(scenario, state)
    const { expect } = step
    if ('bottleneck' in expect) assert.equal(result.bottleneck, expect.bottleneck)
    if ('meetsSlo' in expect) assert.equal(result.meetsSlo, expect.meetsSlo)
    if (expect.minErrorRate !== undefined) assert.ok(result.errorRate >= expect.minErrorRate, `errors ${result.errorRate}`)
    if (expect.maxErrorRate !== undefined) assert.ok(result.errorRate <= expect.maxErrorRate, `errors ${result.errorRate}`)
    if (expect.hasLag) assert.ok(result.lagPerSec > 0)
  })
}
