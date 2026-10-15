import { SYSTEM_DESIGN } from './systemDesignRegistry'

// ── System Design roadmap ─────────────────────────────────────────────────────
// The single source of truth for how System Design is taught: one system grows
// from a single user to millions, and every concept appears at the moment a
// bottleneck forces it. Drives the index page, the ScaleJourney animation, the
// detail-page sidebar, prev/next order, and each page's "Why this exists" panel.
//
// Step fields:
//   traffic     — the scale at which this bottleneck shows up
//   bottleneck  — the problem the user hits (the "why")
//   metric      — { label, value 0–100 } saturation meter for the journey
//   hot         — node id that pulses as the saturating resource
//   adds        — node ids that appear in the journey diagram at this step
//   flags       — cumulative diagram switches (e.g. 'services')
//   tradeoff    — the cost the fix introduces
//   concepts    — [{ id, why }] the concept(s) that relieve the bottleneck

export const ROADMAP_STAGES = [
  {
    id:         'request',
    label:      'How a Request Moves',
    hex:        '#f59e0b',
    text:       'text-amber-400',
    badge:      'bg-amber-500/15 text-amber-300',
    constraint: 'You cannot find a bottleneck until you know every hop a request takes and where latency accumulates.',
    steps: [
      {
        id:         'request-lifecycle',
        title:      'One user, one server',
        traffic:    '1 user',
        bottleneck: 'Nothing is slow yet — but every request already pays for DNS, TCP and TLS handshakes, server time and DB time.',
        metric:     { label: 'Page load (~120 ms)', value: 15 },
        hot:        null,
        adds:       ['client', 'dns', 'app', 'db'],
        tradeoff:   'Every hop adds latency, and latency compounds across hops.',
        concepts: [
          { id: 'networking-basics', why: 'IP addresses, packets and routing — how bytes find the server at all.' },
          { id: 'dns',               why: 'Turns a name into an IP — the first hop of every new visit.' },
          { id: 'tcp-and-udp',       why: 'The handshake and delivery guarantees every connection pays for.' },
          { id: 'http',              why: 'The request/response contract (plus TLS) that browser and server speak.' },
        ],
      },
      {
        id:         'memory-vs-disk',
        title:      'Memory vs disk',
        traffic:    '100 users',
        bottleneck: 'The same page is fast one time and slow the next — the difference is whether the data was in memory or on disk.',
        metric:     { label: 'Disk reads per request', value: 35 },
        hot:        'db',
        adds:       [],
        tradeoff:   'Memory is fast but small and volatile; disk is large and durable but orders of magnitude slower.',
        concepts: [
          { id: 'computer-architecture', why: 'CPU, RAM, disk and network latencies differ by orders of magnitude — every later design exploits that gap.' },
        ],
      },
      {
        id:         'monolith',
        title:      'Start with a monolith',
        traffic:    '1k users',
        bottleneck: 'One codebase, one deploy, function calls instead of network calls — the simplest system that works.',
        metric:     { label: 'Operational complexity', value: 10 },
        hot:        null,
        adds:       [],
        tradeoff:   'Simple to build and debug, but every part scales together whether it needs to or not.',
        concepts: [
          { id: 'application-architecture', why: 'A (modular) monolith keeps calls local, logs in one place, and bottlenecks easy to isolate.' },
        ],
      },
    ],
  },
  {
    id:         'data',
    label:      'Data First',
    hex:        '#10b981',
    text:       'text-emerald-400',
    badge:      'bg-emerald-500/15 text-emerald-300',
    constraint: 'Most scalability problems eventually become data problems — learn databases before distributed systems.',
    steps: [
      {
        id:         'slow-queries',
        title:      'Queries get slow',
        traffic:    '10k users',
        bottleneck: 'Pages that took 50 ms now take 2 s — the tables grew and every query scans them.',
        metric:     { label: 'DB query time', value: 70 },
        hot:        'db',
        adds:       [],
        tradeoff:   'Indexes speed up reads but slow down every write and cost storage.',
        concepts: [
          { id: 'sql',             why: 'Relational model, joins and query plans — know what the database actually does with your query.' },
          { id: 'database-indexes', why: 'A B-tree index turns a full-table scan into a handful of page reads.' },
          { id: 'acid-and-base',   why: 'Transactions keep concurrent writes from corrupting each other — know which guarantees you rely on.' },
        ],
      },
      {
        id:         'read-heavy',
        title:      'Reads swamp the database',
        traffic:    '50k users',
        bottleneck: 'The same hot rows are read thousands of times a second — the database repeats identical work.',
        metric:     { label: 'DB CPU', value: 85 },
        hot:        'db',
        adds:       ['cache'],
        tradeoff:   'Latency drops, but now you own invalidation — stale data can be worse than no cache.',
        concepts: [
          { id: 'caching', why: 'Keep hot results in memory so most reads never touch the database.' },
        ],
      },
      {
        id:         'read-replicas',
        title:      'One primary is not enough',
        traffic:    '200k users',
        bottleneck: 'Cache misses alone exceed what a single primary can serve, and if it dies, everything is down.',
        metric:     { label: 'Primary read load', value: 90 },
        hot:        'db',
        adds:       ['replica'],
        tradeoff:   'More read throughput and a warm standby — but replicas lag behind the primary.',
        concepts: [
          { id: 'database-replication', why: 'Copy data to read replicas so reads spread out and a standby is ready for failover.' },
        ],
      },
      {
        id:         'consistency',
        title:      'Replicas lag',
        traffic:    '200k users',
        bottleneck: 'A user edits their profile, refreshes, and sees the old value — the read hit a lagging replica.',
        metric:     { label: 'Replication lag', value: 55 },
        hot:        'replica',
        adds:       [],
        tradeoff:   'Stronger consistency costs latency and availability; weaker consistency costs correctness you must design around.',
        concepts: [
          { id: 'consistency-models-spectrum', why: 'Name the guarantee you actually need: linearizable, read-your-writes, eventual…' },
          { id: 'consistency-patterns',        why: 'Concrete weak / eventual / strong techniques and where each is acceptable.' },
          { id: 'cap-theorem',                 why: 'During a network partition you must choose between consistency and availability.' },
        ],
      },
      {
        id:         'sharding',
        title:      'Writes outgrow one node',
        traffic:    '1M users',
        bottleneck: 'Replicas help reads, but every write still hits one primary — and the data no longer fits on one machine.',
        metric:     { label: 'Primary write load', value: 95 },
        hot:        'db',
        adds:       ['shards'],
        tradeoff:   'Writes scale horizontally; cross-shard queries, joins and rebalancing get hard.',
        concepts: [
          { id: 'database-sharding',  why: 'Partition data by key so writes and storage spread across nodes.' },
          { id: 'consistent-hashing', why: 'Map keys to shards so adding a node moves only a fraction of the data.' },
          { id: 'nosql',              why: 'Many NoSQL stores shard natively by giving up joins, multi-row transactions or strong consistency.' },
        ],
      },
      {
        id:         'blobs',
        title:      'Files do not belong in rows',
        traffic:    '1M users',
        bottleneck: 'Users upload photos and videos; blobs in the database bloat backups and slow every query.',
        metric:     { label: 'DB size from uploads', value: 80 },
        hot:        'db',
        adds:       ['obj'],
        tradeoff:   'Cheap and practically infinite, but higher latency and no querying inside the files.',
        concepts: [
          { id: 'object-storage', why: 'Put files in S3-style storage; keep only metadata and a URL in the database.' },
        ],
      },
    ],
  },
  {
    id:         'scale-out',
    label:      'Scaling the Monolith',
    hex:        '#0ea5e9',
    text:       'text-sky-400',
    badge:      'bg-sky-500/15 text-sky-300',
    constraint: 'Scaling is not “adding servers” — it is finding which component saturates first, then relieving exactly that.',
    steps: [
      {
        id:         'cpu',
        title:      'One server pegs its CPU',
        traffic:    '1M users',
        bottleneck: 'The single app server hits 100% CPU at peak; a bigger machine only buys a few months.',
        metric:     { label: 'App server CPU', value: 95 },
        hot:        'app',
        adds:       ['lb', 'app2', 'app3'],
        tradeoff:   'Horizontal scale and redundancy — but servers must be stateless and the load balancer must not become a single point of failure.',
        concepts: [
          { id: 'proxies-and-load-balancing', why: 'Run stateless app servers behind a load balancer that spreads requests and drops dead nodes.' },
        ],
      },
      {
        id:         'far-users',
        title:      'Users are far away',
        traffic:    '5M users, worldwide',
        bottleneck: 'Users in Sydney wait 300 ms per asset because every byte crosses an ocean to one region.',
        metric:     { label: 'Latency for distant users', value: 75 },
        hot:        'client',
        adds:       ['cdn'],
        tradeoff:   'Large latency and bandwidth wins; purging stale content becomes your problem.',
        concepts: [
          { id: 'cdns', why: 'Serve static assets (and some responses) from edge locations near users.' },
        ],
      },
      {
        id:         'abuse',
        title:      'A few clients hog capacity',
        traffic:    '5M users + bots',
        bottleneck: 'A scraper or buggy client sends 10k requests per second and starves everyone else.',
        metric:     { label: 'Traffic from top 1% of clients', value: 80 },
        hot:        'lb',
        adds:       [],
        tradeoff:   'Protects capacity, but choosing limits and counting fairly across servers is tricky.',
        concepts: [
          { id: 'rate-limiting', why: 'Cap each client at the edge so one tenant cannot take the system down.' },
        ],
      },
    ],
  },
  {
    id:         'bottlenecks',
    label:      'Think in Bottlenecks',
    hex:        '#f43f5e',
    text:       'text-rose-400',
    badge:      'bg-rose-500/15 text-rose-300',
    constraint: 'Without metrics you are guessing. Tail latency and partial failures — not averages — are what users feel.',
    steps: [
      {
        id:         'observe',
        title:      'Something is slow — but what?',
        traffic:    '5M users',
        bottleneck: 'Average latency looks fine, but 1 in 100 requests takes 3 seconds and nobody can say where.',
        metric:     { label: 'P99 latency (P50 is 80 ms)', value: 85 },
        hot:        'app',
        adds:       ['monitor'],
        tradeoff:   'Metrics replace guesswork, at the cost of storage, cardinality limits and alert fatigue.',
        concepts: [
          { id: 'logging-and-monitoring', why: 'Logs, metrics and latency percentiles reveal which resource saturates first — P99, not the average.' },
        ],
      },
      {
        id:         'failure',
        title:      'Things fail partially',
        traffic:    '5M users',
        bottleneck: 'A replica hangs instead of crashing; retries pile up and a small fault turns into an outage.',
        metric:     { label: 'Errors during a partial outage', value: 70 },
        hot:        'replica',
        adds:       [],
        tradeoff:   'Every extra nine of availability costs redundancy, money and complexity.',
        concepts: [
          { id: 'failure-models-spectrum', why: 'Crash, omission, timing and Byzantine faults — know which ones you are designing for.' },
          { id: 'availability-patterns',   why: 'Failover, redundancy and timeouts turn individual failures into non-events.' },
        ],
      },
    ],
  },
  {
    id:         'distribute',
    label:      'Distribute Only When Forced',
    hex:        '#8b5cf6',
    text:       'text-violet-400',
    badge:      'bg-violet-500/15 text-violet-300',
    constraint: 'Every service boundary costs serialization, network latency, retries and operational overhead — pay it only when scale demands.',
    steps: [
      {
        id:         'async',
        title:      'Slow work blocks requests',
        traffic:    '10M users',
        bottleneck: 'Sign-up waits on sending email; uploads wait on transcoding. Side-work blocks user-facing requests.',
        metric:     { label: 'API time spent on side-work', value: 80 },
        hot:        'app',
        adds:       ['queue', 'workers'],
        tradeoff:   'Fast APIs and absorbed spikes — at the cost of eventual consistency, retries and duplicate handling.',
        concepts: [
          { id: 'message-queues',            why: 'Put slow work on a queue; workers process it in the background at their own pace.' },
          { id: 'event-driven-architecture', why: 'Publish events (“user signed up”) and let any number of consumers react independently.' },
        ],
      },
      {
        id:         'services',
        title:      'Teams collide in one codebase',
        traffic:    '10M users, 100 engineers',
        bottleneck: 'One team’s bug blocks everyone’s deploy, and parts with very different load are forced to scale together.',
        metric:     { label: 'Deploy conflicts per week', value: 85 },
        hot:        'app',
        adds:       [],
        flags:      ['services'],
        tradeoff:   'Independent deploys and scaling — paid for with network latency, partial failures and operational overhead.',
        concepts: [
          { id: 'microservices', why: 'Split along domain/team boundaries so services deploy and scale independently.' },
          { id: 'rpc',           why: 'Calls that used to be local now cross the network — with serialization, timeouts and retries.' },
          { id: 'api-paradigms', why: 'REST, GraphQL or gRPC — pick the contract style that fits each caller.' },
          { id: 'api-design',    why: 'Versioned, idempotent, paginated APIs let services evolve without breaking each other.' },
        ],
      },
      {
        id:         'realtime',
        title:      'Polling for updates',
        traffic:    '10M users',
        bottleneck: 'Chat and notifications poll every few seconds; most responses are empty and the load is enormous.',
        metric:     { label: 'Empty polling responses', value: 90 },
        hot:        'client',
        adds:       ['ws'],
        tradeoff:   'Real-time with less waste, but long-lived connections are stateful and harder to balance.',
        concepts: [
          { id: 'websockets', why: 'Keep a persistent connection so the server pushes updates the instant they happen.' },
        ],
      },
      {
        id:         'tracing',
        title:      'Requests span services',
        traffic:    '10M users',
        bottleneck: 'One slow request crossed 8 services; per-service logs cannot tell you which hop was slow.',
        metric:     { label: 'Services touched per request', value: 75 },
        hot:        'app',
        adds:       [],
        tradeoff:   'End-to-end visibility, but every service must be instrumented and traces sampled to control cost.',
        concepts: [
          { id: 'distributed-tracing', why: 'Propagate a trace ID so a request’s whole path and timings appear as one trace.' },
        ],
      },
      {
        id:         'ids',
        title:      'IDs across shards',
        traffic:    '10M users',
        bottleneck: 'Auto-increment IDs break once writes spread over shards — two shards hand out the same ID.',
        metric:     { label: 'ID collisions across shards', value: 60 },
        hot:        'shards',
        adds:       ['seq'],
        tradeoff:   'Unique IDs at scale; you give up strictly gap-free, perfectly ordered sequences.',
        concepts: [
          { id: 'sequencer', why: 'Generate unique, roughly time-ordered IDs (Snowflake-style) without a central bottleneck.' },
        ],
      },
    ],
  },
  {
    id:         'communicate',
    label:      'Communicating Trade-offs',
    hex:        '#ec4899',
    text:       'text-pink-400',
    badge:      'bg-pink-500/15 text-pink-300',
    constraint: 'Interviews compress this whole journey into 45 minutes — they test whether you can justify each step, not recite a diagram.',
    steps: [
      {
        id:         'interview',
        title:      'Explain the journey',
        traffic:    'Any scale',
        bottleneck: 'There is no perfect architecture — only one whose trade-offs fit the constraints you clarified up front.',
        metric:     null,
        hot:        null,
        adds:       [],
        tradeoff:   'Reasoning beats memorized templates: start simple, name the bottleneck, then evolve.',
        concepts: [
          { id: 'design-requirements',           why: 'Pin down functional and non-functional requirements before drawing a single box.' },
          { id: 'reshaded',                      why: 'A step-by-step framework that walks from requirements to a design without gaps.' },
          { id: 'abstractions-in-system-design', why: 'Reason in black boxes — good abstractions hide detail without hiding trade-offs.' },
          { id: 'building-blocks-overview',      why: 'The blocks you met on this journey, gathered into a toolkit you can assemble.' },
        ],
      },
    ],
  },
]

// Designs: build small systems first, then evolve them, then build the
// building blocks themselves.
export const DESIGN_TIERS = [
  {
    id:          'build-small',
    label:       'Build Small First',
    description: 'Systems small enough to build yourself — each forces one or two real architectural decisions.',
    items: [
      { id: 'url-shortener',       teaches: 'Hashing, redirects and read-heavy caching' },
      { id: 'rate-limiter',        teaches: 'Token buckets and distributed counters' },
      { id: 'notification-system', teaches: 'Async queues, retries and channel fan-out' },
      { id: 'chat-system',         teaches: 'WebSockets, message ordering and presence' },
      { id: 'file-storage',        teaches: 'Chunked uploads, object storage and sync' },
      { id: 'search-autocomplete', teaches: 'Tries, indexing and precomputed top-K' },
    ],
  },
  {
    id:          'at-scale',
    label:       'Same App, Bigger Scale',
    description: 'Products where the architecture changes as traffic grows — study how they evolve, not just the final diagram.',
    items: [
      { id: 'social-media-feed',            teaches: 'Fan-out on write vs read, timeline caching' },
      { id: 'video-streaming',              teaches: 'Transcoding pipelines, CDNs and adaptive bitrate' },
      { id: 'error-monitoring-system',      teaches: 'High-volume ingestion, grouping and alerting' },
      { id: 'client-side-error-monitoring', teaches: 'Browser batching, sampling and source maps' },
    ],
  },
  {
    id:          'building-blocks',
    label:       'Build the Building Blocks',
    description: 'The infrastructure the journey assumed exists — design each one from the inside.',
    items: [
      { id: 'key-value-store',             teaches: 'Partitioning, replication and quorums' },
      { id: 'distributed-cache',           teaches: 'Sharded memory, eviction and hot keys' },
      { id: 'distributed-message-queue',   teaches: 'Durable logs, partitions and delivery guarantees' },
      { id: 'pub-sub',                     teaches: 'Topics, subscriptions and decoupled fan-out' },
      { id: 'blob-store',                  teaches: 'Chunking, replication and metadata at scale' },
      { id: 'distributed-search',          teaches: 'Inverted indexes, sharding and ranking' },
      { id: 'distributed-logging-service', teaches: 'Collecting, shipping and querying logs' },
      { id: 'distributed-task-scheduler',  teaches: 'Leases, retries and at-least-once execution' },
      { id: 'sharded-counters',            teaches: 'Spreading hot writes across counter shards' },
    ],
  },
]

// ── Derived lookups ───────────────────────────────────────────────────────────

const ITEM_BY_ID = Object.fromEntries(SYSTEM_DESIGN.map((item) => [item.id, item]))

// Journey steps flattened, each tagged with its stage.
export const JOURNEY_STEPS = ROADMAP_STAGES.flatMap((stage, stageIndex) =>
  stage.steps.map((step) => ({ ...step, stage, stageIndex })),
)

// id → why-context for the detail page.
export const WHY_BY_ID = {}
JOURNEY_STEPS.forEach((step, stepIndex) => {
  step.concepts.forEach((c) => {
    WHY_BY_ID[c.id] = {
      kind:       'concept',
      stage:      step.stage,
      stageIndex: step.stageIndex,
      stepIndex,
      stepTitle:  step.title,
      problem:    step.bottleneck,
      why:        c.why,
      tradeoff:   step.tradeoff,
    }
  })
})
DESIGN_TIERS.forEach((tier) => {
  tier.items.forEach((d) => {
    WHY_BY_ID[d.id] = { kind: 'design', tier, teaches: d.teaches }
  })
})

// Items in learning order — concepts by journey step, then designs by tier.
export const ROADMAP_ITEMS = [
  ...JOURNEY_STEPS.flatMap((s) => s.concepts.map((c) => c.id)),
  ...DESIGN_TIERS.flatMap((t) => t.items.map((d) => d.id)),
].map((id) => ITEM_BY_ID[id]).filter(Boolean)

// Sidebar groups — same shape as groupByCategory() so DetailSidebar is unchanged.
export const ROADMAP_SIDEBAR_GROUPS = [
  ...ROADMAP_STAGES.map((stage, i) => ({
    key:   stage.id,
    label: `${i + 1}. ${stage.label}`,
    items: stage.steps.flatMap((s) => s.concepts.map((c) => ITEM_BY_ID[c.id])).filter(Boolean),
  })),
  ...DESIGN_TIERS.map((tier) => ({
    key:   tier.id,
    label: tier.label,
    items: tier.items.map((d) => ITEM_BY_ID[d.id]).filter(Boolean),
  })),
].map((group) => ({
  ...group,
  items: group.items.map((item) => ({ id: item.id, title: item.title, path: `/system-design/${item.id}` })),
}))

if (import.meta.env.DEV) {
  const missing = SYSTEM_DESIGN.filter((item) => !WHY_BY_ID[item.id]).map((item) => item.id)
  const unknown = Object.keys(WHY_BY_ID).filter((id) => !ITEM_BY_ID[id])
  console.assert(missing.length === 0, '[systemDesignRoadmap] not placed in roadmap:', missing)
  console.assert(unknown.length === 0, '[systemDesignRoadmap] unknown ids in roadmap:', unknown)
}
