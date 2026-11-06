// Teaching model behind the system design simulators. A pure function of
// (scenario, state), with no React, so it can be tested with `node --test`.
//
// It produces directionally honest numbers, not a benchmark:
//   - Each request type walks a declared path through the nodes.
//   - A node past its capacity drops the excess, shielding everything after it.
//   - Queueing delay uses the Sakasegawa approximation for a G/G/c queue.
//   - Percentiles come from the mix of paths, so fast cache hits and slow misses
//     separate p50 from p99 the way they do in production.

const WAIT_LIMIT_MS = 1000 // A saturated queue stops growing here: clients give up.
const TIMEOUT_MS    = 3000 // Upper bound on any reported latency.

const BUSY_AT = 0.7
const HOT_AT  = 0.9

// ── Node state ───────────────────────────────────────────────────────────────

function readNode(node, state) {
  const instances = node.instancesFrom ? state.values[node.instancesFrom] : (node.instances ?? 1)
  const enabled   = (node.enabledWhen ? Boolean(state.values[node.enabledWhen]) : true) && instances > 0
  const failed    = enabled && state.failed.includes(node.id)
  const alive     = !failed ? instances : node.failure === 'one' ? Math.max(0, instances - 1) : 0
  return { enabled, instances, alive, failed }
}

function usable(node, state) {
  const { enabled, alive } = readNode(node, state)
  return enabled && alive > 0
}

// ── Paths ────────────────────────────────────────────────────────────────────

function stepApplies(step, state) {
  if (step.when   && !state.values[step.when])  return false
  if (step.unless &&  state.values[step.unless]) return false
  return true
}

// Expands a workload into concrete paths. A cache splits the path into a hit
// that ends there and a miss that continues. An async step becomes its own path
// which the user's request doesn't wait for.
function expandWorkload(workload, byId, state) {
  const paths = []
  const hops  = []
  let prob = workload.share
  let caller = null

  // A side call (`side: true`) still adds latency and can fail the request, but
  // the caller makes the next hop itself, so the request doesn't flow through it.
  const addHop = (id, weight = 1, side = false) => {
    hops.push({ id, weight, from: caller })
    if (!side) caller = id
  }

  for (const step of workload.path) {
    if (typeof step === 'object' && step.async) {
      if (!stepApplies(step, state)) continue
      const asyncHops = step.async
        .filter((s) => usable(byId[s.node], state))
        .map((s, i, all) => ({ id: s.node, weight: s.weight ?? 1, from: i === 0 ? caller : all[i - 1].node }))
      paths.push({
        workload: workload.id,
        prob,
        hops:      [...hops, ...asyncHops],
        countFrom: hops.length,
        isAsync:   true,
      })
      continue
    }

    if (typeof step === 'object' && !stepApplies(step, state)) continue

    let id = typeof step === 'string' ? step : step.node
    if (typeof step === 'object' && step.first) {
      const candidates = step.first.filter((c) => readNode(byId[c], state).enabled)
      id = candidates.find((c) => usable(byId[c], state)) ?? candidates.at(-1)
    }
    if (!id) continue

    const node = byId[id]
    const { enabled, alive } = readNode(node, state)
    if (!enabled) continue                  // Not part of this architecture.
    if (alive === 0 && node.failOpen) continue // Dead, and traffic carries on without it.

    addHop(id, typeof step === 'object' ? step.weight : 1, typeof step === 'object' && step.side)

    if (node.hitRatio && alive > 0) {
      paths.push({
        workload:  workload.id,
        prob:      prob * node.hitRatio,
        hops:      [...hops],
        countFrom: 0,
        isAsync:   false,
      })
      prob *= 1 - node.hitRatio
    }
  }

  paths.push({ workload: workload.id, prob, hops: [...hops], countFrom: 0, isAsync: false })
  return paths
}

// ── Queueing ─────────────────────────────────────────────────────────────────

function queueWait(serviceMs, servers, utilization) {
  if (serviceMs <= 0 || servers <= 0) return 0
  if (utilization >= 1) return WAIT_LIMIT_MS
  const exponent = Math.sqrt(2 * (servers + 1)) - 1
  const wait = (serviceMs * utilization ** exponent) / (servers * (1 - utilization))
  return Math.min(wait, WAIT_LIMIT_MS)
}

// A path's latency is modeled as fixed service time plus exponential waiting.
function mixtureQuantile(paths, q) {
  const total = paths.reduce((sum, p) => sum + p.weight, 0)
  if (total <= 0) return null

  const cdf = (t) => paths.reduce((sum, p) => {
    if (t < p.base) return sum
    const done = p.wait > 0 ? 1 - Math.exp(-(t - p.base) / p.wait) : 1
    return sum + (p.weight / total) * done
  }, 0)

  let lo = 0
  let hi = TIMEOUT_MS
  if (cdf(hi) < q) return TIMEOUT_MS
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2
    if (cdf(mid) < q) lo = mid
    else hi = mid
  }
  return hi
}

// ── Simulation ───────────────────────────────────────────────────────────────

export function initialState(scenario) {
  return {
    traffic: scenario.traffic.initial,
    values:  Object.fromEntries(scenario.controls.map((c) => [c.id, c.initial])),
    failed:  [],
  }
}

export function simulate(scenario, state) {
  const byId  = Object.fromEntries(scenario.nodes.map((n) => [n.id, n]))
  const paths = scenario.workloads.flatMap((w) => expandWorkload(w, byId, state))
  const rate  = state.traffic

  const capacities = {}
  const drops      = {}
  for (const node of scenario.nodes) {
    capacities[node.id] = node.kind === 'client' ? Infinity : readNode(node, state).alive * node.capacity
    drops[node.id]      = 0
  }

  // Asynchronous hops feed a queue, so overflow becomes lag rather than errors.
  const asyncNodes = new Set(
    paths.filter((p) => p.isAsync).flatMap((p) => p.hops.slice(p.countFrom).map((h) => h.id)),
  )
  const syncNodes = new Set(
    paths.filter((p) => !p.isAsync).flatMap((p) => p.hops.map((h) => h.id)),
  )

  // Relax until drops settle. Paths form a DAG, so its depth is always enough.
  let arrivals = {}
  let edges    = {}
  const passes = scenario.nodes.length + 1
  for (let pass = 0; pass < passes; pass++) {
    arrivals = Object.fromEntries(scenario.nodes.map((n) => [n.id, 0]))
    edges    = {}

    for (const path of paths) {
      let flowing = rate * path.prob
      path.hops.forEach((hop, i) => {
        if (i >= path.countFrom) {
          arrivals[hop.id] += flowing * hop.weight
          if (hop.from) {
            const key = `${hop.from}>${hop.id}`
            edges[key] ??= { key, from: hop.from, to: hop.id, rate: 0, isAsync: path.isAsync }
            edges[key].rate += flowing
          }
        }
        if (!path.isAsync || i < path.countFrom) flowing *= 1 - drops[hop.id]
      })
    }

    for (const node of scenario.nodes) {
      const load = arrivals[node.id]
      const cap  = capacities[node.id]
      const overflow = load > 0 ? Math.max(0, 1 - cap / load) : 0
      // Overflow on a queue-fed node is lag, so it can't drop user requests.
      drops[node.id] = syncNodes.has(node.id) ? overflow : 0
    }
  }

  // Per-node results.
  const nodes = {}
  let bottleneck = null
  let worst = 0
  let servers = 0

  for (const node of scenario.nodes) {
    const { enabled, instances, alive, failed } = readNode(node, state)
    const arrival     = arrivals[node.id]
    const isClient    = node.kind === 'client'
    const cap         = capacities[node.id]
    const utilization = isClient || cap === 0 ? 0 : arrival / cap
    const parallel    = alive * node.capacity * (node.serviceMs ?? 0) / 1000
    const down        = !isClient && enabled && alive === 0
    const wait        = isClient ? 0 : queueWait(node.serviceMs ?? 0, Math.max(1, parallel), utilization)

    let status = 'ok'
    if (!enabled)                    status = 'off'
    else if (down)                   status = 'down'
    else if (arrival === 0)          status = 'idle'
    else if (utilization >= 1)       status = 'saturated'
    else if (utilization >= HOT_AT)  status = 'hot'
    else if (utilization >= BUSY_AT) status = 'busy'

    nodes[node.id] = {
      enabled, instances, alive, failed, down, status, arrival, utilization, wait,
      capacity: isClient ? null : cap,
      drop:     drops[node.id],
    }

    if (!isClient && enabled) servers += alive

    // Bottleneck: whichever request-path node is most overloaded.
    if (!isClient && enabled && syncNodes.has(node.id)) {
      const pressure = down ? Infinity : utilization
      if (pressure >= BUSY_AT && pressure > worst) {
        worst = pressure
        bottleneck = node.id
      }
    }
  }

  // End-to-end outcome across the synchronous paths.
  const served = []
  let failedShare = 0
  for (const path of paths) {
    if (path.isAsync) continue
    const survive = path.hops.reduce((s, h) => s * (1 - drops[h.id]), 1)
    failedShare += path.prob * (1 - survive)
    served.push({
      weight: path.prob * survive,
      base:   path.hops.reduce((sum, h) => sum + (byId[h.id].serviceMs ?? 0), 0),
      wait:   path.hops.reduce((sum, h) => sum + nodes[h.id].wait, 0),
    })
  }
  const errorRate = Math.min(1, Math.max(0, failedShare))

  // Queue lag: events arriving faster than the consumer path can drain them.
  let lagPerSec = 0
  for (const id of asyncNodes) {
    const node = byId[id]
    if (node.kind !== 'queue') continue
    const events = nodes[id].arrival
    const drain  = paths
      .filter((p) => p.isAsync && p.hops.some((h) => h.id === id))
      .flatMap((p) => p.hops.slice(p.hops.findIndex((h) => h.id === id) + 1))
      .reduce((limit, hop) => Math.min(limit, capacities[hop.id] / hop.weight), Infinity)
    lagPerSec += Math.max(0, events - drain)
  }

  const p50 = mixtureQuantile(served, 0.5)
  const p99 = mixtureQuantile(served, 0.99)
  const slo = scenario.slo
  const meetsSlo = errorRate <= slo.errorRate && p99 !== null && p99 <= slo.p99Ms

  return {
    nodes,
    edges: Object.values(edges).filter((e) => e.rate > 0),
    bottleneck,
    errorRate,
    throughput: rate * (1 - errorRate),
    lagPerSec,
    p50,
    p99,
    servers,
    meetsSlo,
    timeoutMs: TIMEOUT_MS,
  }
}

// The single most useful thing to say about the current result.
export function getInsight(scenario, result) {
  const byId = Object.fromEntries(scenario.nodes.map((n) => [n.id, n]))
  const { bottleneck, lagPerSec, meetsSlo } = result

  if (bottleneck) {
    const node = byId[bottleneck]
    if (result.nodes[bottleneck].down) return { tone: 'danger', text: node.downText }
    const tone = result.nodes[bottleneck].utilization >= 1 ? 'danger' : 'warning'
    return { tone, text: node.hotText }
  }
  if (lagPerSec > 0) return { tone: 'warning', text: scenario.lagText }
  if (!meetsSlo)     return { tone: 'warning', text: scenario.sloMissText }
  return { tone: 'good', text: scenario.healthyText }
}
