import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A library split across multiple buildings by subject. A-G books are in building 1, H-P in building 2, Q-Z in building 3. You know exactly which building to visit based on the first letter — no need to search all three. Adding more books to the H-P section requires only expanding building 2. But if the S section becomes unexpectedly popular, building 3 becomes a hotspot while 1 and 2 are underutilized.",
  howItWorks: [
    'A shard key is chosen — typically user_id, tenant_id, or geographic region — that determines which shard a given row belongs to. The shard key must be present in every write and in the WHERE clause of most queries.',
    'Range-based sharding assigns a contiguous range of shard key values to each shard (user_id 1–1M → shard 1, 1M–2M → shard 2). Simple routing logic, efficient range scans — but if one range contains power users with disproportionate activity, it becomes a hotspot.',
    'Hash-based sharding applies a hash function to the shard key and assigns the result modulo the shard count. Distributes data evenly regardless of access frequency — but destroys key ordering, making range queries expensive (must scan all shards).',
    'Directory-based sharding keeps a lookup table that maps each shard key to its shard. Maximally flexible — any key can be remapped without moving data. But the directory table itself becomes a bottleneck and single point of failure.',
    'Cross-shard queries (JOINs or aggregations spanning multiple shards) require the application layer to fan out queries to all relevant shards and merge results in memory. This is significantly more complex and slower than a single-shard query.',
    'Resharding — adding a new shard as data grows — requires moving a portion of existing data to the new shard while the system remains live. Consistent hashing minimizes data movement: only the keys that map to the new shard move, rather than remapping everything.',
  ],
  keyPoints: [
    'Sharding enables write scaling past a single machine; replication does not — they solve different problems and are typically used together',
    'The shard key choice is the most consequential sharding decision — a bad key creates hotspots that negate all the benefit of distributing the data',
    'Cross-shard transactions lose ACID guarantees; distributed transactions (2-phase commit) across shards are expensive and should be avoided by design',
    'Most applications should exhaust vertical scaling, connection pooling, read replicas, and caching before introducing sharding — it adds permanent operational complexity',
    'Application code must be shard-aware: every write must include the shard key, and every query must either target a specific shard or fan out and merge results',
  ],
}
