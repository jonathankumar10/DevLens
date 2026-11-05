// Live simulator scenario for the URL Shortener. Capacities are round teaching
// numbers rather than benchmarks. `expect` on each guide step is checked by
// src/lib/sim/model.test.js, so the story can't drift from what the model does.

const APP_OPTIONS     = [1, 2, 3, 5, 10, 20, 50, 100, 200, 300]
const CACHE_OPTIONS   = [0, 1, 2, 4, 8, 16]
const REPLICA_OPTIONS = [0, 1, 2, 3, 4, 8, 16]
const SHARD_OPTIONS   = [1, 2, 4, 8]

const naive   = { appServers: 1, cacheNodes: 0, replicas: 0, shards: 1, useQueue: false }
const planned = { appServers: 2, cacheNodes: 1, replicas: 0, shards: 1, useQueue: true }

export default {
  id:      'url-shortener',
  title:   'Scale a URL shortener',
  summary: 'Grow to the design peak of 3,500 requests a second, then push on to a million and fix each bottleneck as it appears.',

  traffic: { min: 100, max: 1_000_000, initial: 3_500, designPeak: 3_500, unit: 'req/s' },
  slo:     { p99Ms: 50, errorRate: 0.001 },

  nodes: [
    {
      id: 'client', label: 'Users', kind: 'client',
      wide: { x: 66, y: 165 }, narrow: { x: 92, y: 40 },
    },
    {
      id: 'lb', label: 'API Gateway', kind: 'gateway', capacity: 2_000_000, serviceMs: 1,
      wide: { x: 236, y: 165 }, narrow: { x: 92, y: 125 },
    },
    {
      id: 'app', label: 'App servers', kind: 'service', capacity: 5_000, serviceMs: 4,
      instancesFrom: 'appServers', failure: 'one',
      hotText:  'The app tier is out of capacity. Add servers: they hold no state, so this is the easy fix.',
      downText: 'The only app server is down, so every request fails. Run more than one and a crash becomes a non-event.',
      wide: { x: 406, y: 165 }, narrow: { x: 92, y: 210 },
    },
    {
      id: 'cache', label: 'Redis cache', kind: 'cache', capacity: 100_000, serviceMs: 0.5,
      instancesFrom: 'cacheNodes', hitRatio: 0.95, failOpen: true,
      hotText: 'Even the cache has limits. Add nodes to split the hot keys across more memory.',
      wide: { x: 590, y: 90 }, narrow: { x: 92, y: 305 },
    },
    {
      id: 'replicas', label: 'Read replicas', kind: 'database', capacity: 5_000, serviceMs: 6,
      instancesFrom: 'replicas', failure: 'one',
      hotText: 'Cache misses are overwhelming the replicas. Add replicas to spread those reads.',
      wide: { x: 776, y: 70 }, narrow: { x: 92, y: 400 },
    },
    {
      id: 'primary', label: 'Primary DB', kind: 'database', capacity: 5_000, serviceMs: 8,
      instancesFrom: 'shards',
      hotText:  'The database can\'t keep up. Cache the hot links, move reads to replicas, and shard when writes alone exceed one primary.',
      downText: 'The primary is down, so new links can\'t be created. Redirects keep working only where the cache or a replica can serve them.',
      wide: { x: 776, y: 195 }, narrow: { x: 268, y: 400 },
    },
    {
      id: 'queue', label: 'Kafka', kind: 'queue', capacity: 5_000_000, serviceMs: 1,
      enabledWhen: 'useQueue',
      wide: { x: 540, y: 330 }, narrow: { x: 268, y: 210 },
    },
    {
      id: 'clicks', label: 'Click analytics', kind: 'database', capacity: 30_000, serviceMs: 5,
      hotText: 'Every redirect is waiting on an analytics write, so a reporting feature is taking down the core product. Move it behind a queue.',
      wide: { x: 776, y: 330 }, narrow: { x: 268, y: 305 },
    },
  ],

  workloads: [
    {
      id: 'redirects',
      label: 'Redirects',
      share: 0.99,
      path: [
        'client', 'lb', 'app',
        { node: 'clicks', unless: 'useQueue', side: true },
        { async: [{ node: 'queue' }, { node: 'clicks', weight: 0.05 }], when: 'useQueue' },
        'cache',
        { first: ['replicas', 'primary'] },
      ],
    },
    {
      id: 'creates',
      label: 'New links',
      share: 0.01,
      path: ['client', 'lb', 'app', { node: 'primary', weight: 2.5 }],
    },
  ],

  controls: [
    { id: 'appServers', label: 'App servers',   type: 'stepper', options: APP_OPTIONS,     initial: 2 },
    { id: 'cacheNodes', label: 'Cache nodes',   type: 'stepper', options: CACHE_OPTIONS,   initial: 1, offLabel: 'Off' },
    { id: 'replicas',   label: 'Read replicas', type: 'stepper', options: REPLICA_OPTIONS, initial: 0, offLabel: 'None' },
    { id: 'shards',     label: 'Database shards', type: 'stepper', options: SHARD_OPTIONS, initial: 1 },
    { id: 'useQueue',   label: 'Send clicks through Kafka', type: 'switch', initial: true },
  ],

  failures: [
    { node: 'app',      label: 'Crash an app server' },
    { node: 'cache',    label: 'Lose the cache' },
    { node: 'replicas', label: 'Crash a replica' },
    { node: 'primary',  label: 'Lose the primary' },
  ],

  healthyText: 'Healthy, with room to spare. Push the traffic higher to find what breaks next.',
  lagText:     'Users are fine, but analytics is falling behind: clicks arrive faster than the consumer can store them. Dashboards go stale, and no redirect slows down.',
  sloMissText: 'Nothing is overloaded, but the slowest requests miss the 50 ms target. Check which path they take.',

  guide: [
    {
      title: 'A thousand requests a second',
      text:  'One app server and one database are plenty, and every extra component is something else to run and debug. But there\'s no redundancy yet, so this can\'t survive a crash.',
      state: { traffic: 1_000, values: naive },
      expect: { bottleneck: null, meetsSlo: true },
    },
    {
      title: 'Reaching the design peak',
      text:  'At the 3,500 req/s peak from our requirements, it still works, but with no headroom: the database is above 70% load, and it\'s spending that on the same popular links again and again.',
      state: { traffic: 3_500, values: naive },
      expect: { bottleneck: 'primary' },
    },
    {
      title: 'The design we planned',
      text:  'Two app servers survive a crash, Redis takes about 95% of reads, and Kafka separates analytics from redirects. This matches the architecture above, and it meets the target comfortably. Compare p50 and p99: the slowest requests are the cache misses. Everything after this step is what-if, for traffic beyond the plan.',
      state: { traffic: 3_500, values: planned },
      expect: { bottleneck: null, meetsSlo: true },
    },
    {
      title: 'What if traffic grows sixfold?',
      text:  'At 20K req/s, the app servers can handle only half the traffic. They\'re the first limit, and the easiest to fix, because they hold no state.',
      state: { traffic: 20_000, values: planned },
      expect: { bottleneck: 'app', minErrorRate: 0.4 },
    },
    {
      title: 'Scaling out is enough',
      text:  'Ten app servers bring it back within target. The cache means the database barely notices the extra traffic, and adding stateless servers is about the cheapest fix available.',
      state: { traffic: 20_000, values: { ...planned, appServers: 10 } },
      expect: { bottleneck: null, meetsSlo: true },
    },
    {
      title: 'The cache was holding everything up',
      text:  'Lose the cache and the database\'s load jumps more than tenfold. Redirects fall back to the database by design, but this much traffic overwhelms it. A cache carrying this much load is critical infrastructure, not just an optimization.',
      state: { traffic: 20_000, values: { ...planned, appServers: 10 }, failed: ['cache'] },
      expect: { bottleneck: 'primary', minErrorRate: 0.5 },
    },
    {
      title: 'Why analytics goes through Kafka',
      text:  'Here\'s what happens at 200K req/s if each click is written during the redirect instead. The first thing to break is a reporting feature, and it takes redirects down with it. This is why the design uses a queue from the start.',
      state: { traffic: 200_000, values: { ...planned, appServers: 100, cacheNodes: 4, useQueue: false } },
      expect: { bottleneck: 'clicks', minErrorRate: 0.5 },
    },
    {
      title: 'With Kafka back, the database is next',
      text:  'Clicks are stored later in cheap batches, so redirects stop waiting on them, and analytics being slightly delayed is a fair price. Now the database is the limit, from both cache misses and new links.',
      state: { traffic: 200_000, values: { ...planned, appServers: 100, cacheNodes: 4 } },
      expect: { bottleneck: 'primary' },
    },
    {
      title: 'Replicas for reads, shards for writes',
      text:  'These solve different problems. Replicas spread the cache misses but can\'t help writes, because each replica applies every write too. Only sharding adds write capacity.',
      state: { traffic: 200_000, values: { ...planned, appServers: 100, cacheNodes: 4, replicas: 3, shards: 2 } },
      expect: { bottleneck: null, meetsSlo: true },
    },
    {
      title: 'Lose the primary',
      text:  'Redirects keep working, but creating links fails until a replica is promoted. Because reads and writes depend on different things, a major failure costs only about 1% of requests.',
      state: { traffic: 200_000, values: { ...planned, appServers: 100, cacheNodes: 4, replicas: 3, shards: 2 }, failed: ['primary'] },
      expect: { bottleneck: 'primary', minErrorRate: 0.005, maxErrorRate: 0.02 },
    },
    {
      title: 'A million requests a second',
      text:  'Users still get fast redirects, now from hundreds of machines, but analytics can\'t keep up and its lag keeps growing. That\'s deliberate: when something has to give, let it be the part users can\'t feel. Now use the controls and try breaking it yourself.',
      state: { traffic: 1_000_000, values: { appServers: 300, cacheNodes: 16, replicas: 16, shards: 8, useQueue: true } },
      expect: { bottleneck: null, meetsSlo: true, hasLag: true },
    },
  ],
}
