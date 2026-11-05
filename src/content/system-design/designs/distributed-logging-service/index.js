import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A newsroom's wire service. Thousands of correspondents (hosts) each file dispatches (log lines) continuously. A wire service can't have every editor read every raw dispatch as it arrives — dispatches are queued, categorized, indexed by topic, and only the recent, high-traffic desk keeps everything instantly searchable; older dispatches move to the archive, still retrievable, just slower to pull.",
  howItWorks: [
    'Collection agents: a lightweight shipper (Fluentd, Filebeat, Vector) runs on every host or as a sidecar, tailing log files or reading from stdout, and forwards lines with minimal processing — parsing and enrichment are deliberately kept out of the hot write path on the source host so a logging problem never becomes a production incident.',
    'Ingestion buffer: shippers write into a durable, partitioned queue (see distributed message queue) rather than directly into the search index. This absorbs bursts — a bad deploy that logs at 100x normal volume queues up instead of overwhelming the indexing tier — and decouples collection uptime from indexing uptime.',
    'Stream processing: a consumer tier reads off the queue and parses raw lines into structured fields (timestamp, service, severity, trace ID, message), enriches them (adding host/region/deploy-version tags), and batches records for efficient indexing rather than indexing one line at a time.',
    'Indexing and storage: structured records are written into a distributed search index (see distributed search) partitioned by time — typically one shard set per day or per hour — so queries scoped to a recent time range only touch a small number of shards, and old shards can be dropped wholesale instead of deleted row by row.',
    'Hot/warm/cold tiering: the most recent hours or days live on fast, expensive nodes (hot) for low-latency interactive search during an incident. Older data moves to cheaper, slower nodes (warm), and beyond that to object storage or is deleted entirely (cold/expired) per a retention policy — trading query latency for storage cost as data ages.',
    'Query fan-out: a search request (e.g., "all ERROR logs for service=checkout in the last hour") is routed only to the time-partitioned shards covering that range, fanned out in parallel, and merged — the same scatter-gather pattern as any sharded search index, but the time-based partitioning here is what keeps most queries cheap by construction.',
  ],
  keyPoints: [
    'Keep parsing and enrichment off the source host — agents should just forward raw lines quickly; a logging pipeline problem must never become a production outage on the services being logged',
    'A durable queue between collection and indexing is what lets ingestion survive both traffic bursts and indexing-tier outages without losing or blocking on logs',
    'Time-based index partitioning (not just hash sharding) is the key design choice — it lets old data be dropped wholesale and keeps time-bounded queries (the overwhelming majority) fast by touching few shards',
    'Hot/warm/cold tiering is how a logging service controls cost at scale — most log volume is written once, queried heavily for a day or two during active debugging, then almost never read again',
    'This system composes two other building blocks directly: a message queue for ingestion durability and a distributed search index for the queryable store — recognizing that composition is often the interview signal being tested',
  ],
}
