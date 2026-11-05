import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "Bricks versus buildings. Nobody re-invents the brick every time they put up a wall — they design the brick once (dimensions, load tolerance, how it interlocks with the next one) and then reuse that same brick in a house, a warehouse, or a tower, because the properties that make it a good brick don't change with the building. A load balancer, a key-value store, a message queue — same idea. Design each one once, understand it deeply, then snap it into whatever larger system needs it.",
  howItWorks: [
    'The building blocks below are ordered topologically, not alphabetically — each one only depends on blocks that came before it. DNS and load balancers come first because almost everything else assumes a request can already find a server. Databases and the key-value store come next because caching, search, and logging all need somewhere durable to land data. By the time you reach sharded counters at the end, you\'re assumed to already be fluent in caching, partitioning, and replication.',
    'Every building block gets the same treatment a flagship design gets: functional requirements (what it must do), non-functional requirements (how well — availability, latency, consistency), a high-level design, and a detailed design that resolves the one or two hardest sub-problems specific to that block. See Design Requirements for how functional and non-functional requirements are distinguished, and RESHADED for the full checklist this app structures every design around.',
    'A handful of these blocks — DNS, load balancers, CDNs, databases, sequencers, rate limiting — are covered as standalone concept pages here, because their core idea fits in one focused explainer. The rest — key-value store, distributed cache, message queue, pub-sub, blob store, distributed search, distributed logging, task scheduler, sharded counters — get full end-to-end walkthroughs in the Designs tier at the bottom of this page, because they\'re complex enough to need their own requirements → high-level → detailed-design pass.',
    'Every one of these also exists as a managed service from a public cloud — Route 53 or Cloud DNS for DNS, ELB/ALB for load balancing, DynamoDB or Bigtable for the key-value store, CloudFront or Cloud CDN for content delivery, SQS/SNS or Pub/Sub for messaging. Knowing the building block cold means you can reason about *why* a managed offering is shaped the way it is, not just that it exists.',
  ],
  keyPoints: [
    'This is a bottom-up approach: design the reusable component once, in depth, then compose it into larger systems by reference — the opposite of re-deriving a load balancer from scratch inside every flagship design',
    'Ordering is topological — each block only assumes blocks that came earlier are already understood (DNS/load balancing → storage/key-value → caching/CDN → messaging/pub-sub → search/logging/scheduling/counters)',
    'Simpler, single-idea blocks (DNS, load balancers, CDNs, databases, sequencer, rate limiting) live as concept pages; blocks complex enough to need a full requirements-to-detailed-design pass (key-value store, distributed cache, message queue, pub-sub, blob store, distributed search, distributed logging, task scheduler, sharded counters) live in the Designs tier',
    'Every building block still gets functional requirements (what it does) and non-functional requirements (how well — availability, latency, consistency) called out explicitly, the same split used throughout this app — see Design Requirements',
    'The payoff of learning building blocks in isolation shows up later: a flagship design like Twitter or WhatsApp becomes "load balancer + key-value store + message queue + CDN, wired together for this specific problem" instead of a system invented from a blank page',
    'These aren\'t just interview abstractions — DNS, load balancers, key-value stores, CDNs, and message queues all ship as managed cloud services (Route 53, ALB, DynamoDB, CloudFront, SQS), so the building block you study here maps directly onto a real, provisionable thing',
  ],
  components: [
    {
      id: 'dns', title: 'Domain Name System', icon: '🌐', color: '#38bdf8', animationType: 'router',
      summary: 'Hierarchical, distributed naming — resolves a domain to an IP address',
      detail: 'Translates human-readable domains into IP addresses via a distributed hierarchy of resolvers, root, TLD, and authoritative nameservers, with caching and TTLs keeping most lookups off the critical path.',
      stats: [{ label: 'Solves', value: 'Name → IP' }, { label: 'Key idea', value: 'Hierarchy + caching' }, { label: 'See', value: 'DNS Resolution' }],
    },
    {
      id: 'load-balancers', title: 'Load Balancers', icon: '⚖️', color: '#fb923c', animationType: 'loadbalancer',
      summary: 'Distributes incoming requests across a server pool, routes around failures',
      detail: 'Spreads client traffic across multiple backend instances so no single server is overloaded, and stops routing to instances that fail health checks — the mechanism nearly every other building block sits behind.',
      stats: [{ label: 'Solves', value: 'Overload + failover' }, { label: 'Layers', value: 'L4 / L7' }, { label: 'See', value: 'Proxies and Load Balancing' }],
    },
    {
      id: 'databases', title: 'Databases', icon: '🗄️', color: '#22c55e', animationType: 'database',
      summary: 'Store, retrieve, modify, and delete data — SQL vs. NoSQL, replication, partitioning',
      detail: 'Covers the access-pattern reasoning behind SQL vs. NoSQL, how replication trades consistency for availability, and how partitioning lets a dataset outgrow a single machine.',
      stats: [{ label: 'Solves', value: 'Durable storage' }, { label: 'Trade-off', value: 'Consistency ↔ scale' }, { label: 'See', value: 'SQL, NoSQL' }],
    },
    {
      id: 'key-value-store', title: 'Key-Value Store', icon: '🔑', color: '#a3e635', animationType: 'disk',
      summary: 'A non-relational store keyed by ID — the base case for scalable, replicated storage',
      detail: 'A minimal read/write-by-key interface used to teach scalability, replication, versioning, and failure detection in isolation, before those ideas get reused everywhere else.',
      stats: [{ label: 'Interface', value: 'get/put by key' }, { label: 'Teaches', value: 'Replication + partitioning' }, { label: 'See', value: 'Design a Key-Value Store' }],
    },
    {
      id: 'cdn', title: 'Content Delivery Network', icon: '📡', color: '#06b6d4', animationType: 'cdn',
      summary: 'Caches viral content close to users, cutting latency and origin load',
      detail: 'Pushes static and semi-static content (video, images, pages) to edge servers near end users, reducing both perceived latency and the load that hits the origin data center.',
      stats: [{ label: 'Solves', value: 'Latency + origin load' }, { label: 'Placement', value: 'Edge PoPs' }, { label: 'See', value: 'CDNs' }],
    },
    {
      id: 'sequencer', title: 'Sequencer', icon: '🔢', color: '#f59e0b', animationType: 'ttl',
      summary: 'Generates unique IDs at scale, with or without preserving causal ordering',
      detail: 'Compares UUIDs, ticket servers, range allocation, and Snowflake-style IDs for generating unique identifiers without coordination — and what it costs to also keep them causally ordered.',
      stats: [{ label: 'Solves', value: 'Unique IDs' }, { label: 'Hard part', value: 'Causality' }, { label: 'See', value: 'Sequencer' }],
    },
    {
      id: 'monitoring', title: 'Distributed Monitoring', icon: '📈', color: '#ef4444', animationType: 'monitor',
      summary: 'Detects and alerts on problems — both server-side and client-side',
      detail: 'An early-warning system that lets operators act before an impending problem becomes an outage, covering both server-side error monitoring and client-side (browser/app) error monitoring separately.',
      stats: [{ label: 'Solves', value: 'Early detection' }, { label: 'Scope', value: 'Server + client' }, { label: 'See', value: 'Logging & Monitoring' }],
    },
    {
      id: 'distributed-cache', title: 'Distributed Cache', icon: '⚡', color: '#facc15', animationType: 'cache',
      summary: 'Multiple cache servers coordinate to keep frequently accessed data in memory',
      detail: 'Extends a single in-memory cache into a coordinated cluster, using consistent hashing to place keys and eviction policies to bound memory — Memcached and Redis are the two reference implementations compared.',
      stats: [{ label: 'Solves', value: 'Hot-read latency' }, { label: 'Placement', value: 'Consistent hashing' }, { label: 'See', value: 'Design a Distributed Cache' }],
    },
    {
      id: 'message-queue', title: 'Distributed Messaging Queue', icon: '📬', color: '#f97316', animationType: 'packet',
      summary: 'Decouples producers from consumers for independent, reliable scaling',
      detail: 'Sits between producers and consumers so each side can scale, fail, and deploy independently, trading off delivery guarantees (at-least-once vs. exactly-once) and ordering against throughput.',
      stats: [{ label: 'Solves', value: 'Producer/consumer coupling' }, { label: 'Trade-off', value: 'Ordering ↔ throughput' }, { label: 'See', value: 'Design a Distributed Messaging Queue' }],
    },
    {
      id: 'pub-sub', title: 'Publish/Subscribe', icon: '📣', color: '#ec4899', animationType: 'multiplex',
      summary: 'Asynchronous service-to-service fan-out, one message to many subscribers',
      detail: 'A publisher emits events without knowing who consumes them; any number of subscribers can receive the same message independently — the backbone of serverless and event-driven microservice architectures.',
      stats: [{ label: 'Solves', value: 'One-to-many fan-out' }, { label: 'Common in', value: 'Serverless, microservices' }, { label: 'See', value: 'Design a Pub-Sub System' }],
    },
    {
      id: 'rate-limiter', title: 'Rate Limiter', icon: '🚦', color: '#eab308', animationType: 'throughput',
      summary: 'Throttles requests against a predefined limit to protect a service',
      detail: 'A defensive layer that rejects or delays requests once a client exceeds its quota, whether the overuse is intentional (abuse) or accidental (a runaway retry loop) — compares token bucket, leaky bucket, and sliding-window algorithms.',
      stats: [{ label: 'Solves', value: 'Overuse protection' }, { label: 'Algorithms', value: 'Token/leaky bucket' }, { label: 'See', value: 'Design a Rate Limiter' }],
    },
    {
      id: 'blob-store', title: 'Blob Store', icon: '📦', color: '#14b8a6', animationType: 'disk',
      summary: 'Storage for unstructured data — multimedia files and binary executables',
      detail: 'Optimized for large, immutable objects rather than structured rows — the same shape of problem S3-style object storage solves, with content-addressing and replication for durability.',
      stats: [{ label: 'Solves', value: 'Large unstructured objects' }, { label: 'Example data', value: 'Video, binaries' }, { label: 'See', value: "Design a Blob Store" }],
    },
    {
      id: 'distributed-search', title: 'Distributed Search', icon: '🔍', color: '#6366f1', animationType: 'pipeline',
      summary: 'Takes a query, returns relevant content in seconds via crawl, index, search',
      detail: 'Three integral components — crawling content, building an inverted index, and serving ranked search results — each of which has to scale independently as the corpus and query volume grow.',
      stats: [{ label: 'Solves', value: 'Relevant retrieval' }, { label: 'Pipeline', value: 'Crawl → index → search' }, { label: 'See', value: 'Design a Distributed Search System' }],
    },
    {
      id: 'distributed-logging', title: 'Distributed Logging', icon: '📝', color: '#84cc16', animationType: 'httpmessage',
      summary: 'Lets services log events efficiently without I/O becoming a bottleneck',
      detail: 'Logging is I/O-intensive and slow if done naively; this building block makes event logging scalable and reliable across many services without turning it into a throughput bottleneck.',
      stats: [{ label: 'Solves', value: 'Scalable event logging' }, { label: 'Constraint', value: 'I/O-bound' }, { label: 'See', value: 'Design a Distributed Logging Service' }],
    },
    {
      id: 'task-scheduler', title: 'Distributed Task Scheduler', icon: '🗓️', color: '#8b5cf6', animationType: 'congestion',
      summary: 'Mediates between tasks and resources to meet task- and system-level goals',
      detail: 'Intelligently allocates limited resources across pending tasks, commonly used to offload background processing for asynchronous completion rather than blocking a user-facing request.',
      stats: [{ label: 'Solves', value: 'Task ↔ resource matching' }, { label: 'Common use', value: 'Background jobs' }, { label: 'See', value: 'Design a Distributed Task Scheduler' }],
    },
    {
      id: 'sharded-counters', title: 'Sharded Counters', icon: '🧮', color: '#f43f5e', animationType: 'serverpulse',
      summary: 'A distributed counter that survives millions of concurrent read/write requests',
      detail: 'A single counter row becomes a write hotspot under high concurrency (think likes on a celebrity\'s post); sharding the counter across multiple keys and aggregating on read removes the bottleneck.',
      stats: [{ label: 'Solves', value: 'Write hotspots' }, { label: 'Example', value: 'Viral post likes' }, { label: 'See', value: 'Design Sharded Counters' }],
    },
  ],
}
