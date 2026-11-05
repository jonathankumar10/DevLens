import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A single-node cache is one big walk-in fridge. A distributed cache is a chain of smaller fridges across a building, where a shared map (consistent hashing) tells everyone exactly which fridge holds the milk — so nobody has to check all of them, and adding a new fridge only reshuffles a small slice of the map instead of relabeling everything.",
  howItWorks: [
    'Key distribution with consistent hashing: each node owns a range of a hash ring, and a key\'s cache node is determined by hashing the key onto that ring. Adding or removing a node only remaps the keys in its immediate ring neighborhood, not the entire keyspace — critical for a cache, since a full remap would empty the cache and hammer the database.',
    'Client-side vs proxy routing: clients can embed the hash ring and talk directly to the correct cache node (lower latency, used by Memcached clients), or route through a proxy like Twemproxy or a Redis Cluster-aware client that hides the topology. Direct client routing is faster but means every client must stay in sync with cluster membership changes.',
    'Replication for availability: unlike a single-node cache where losing the node just means cold cache misses, some distributed caches (Redis Cluster) replicate each shard to one or more replicas so a node failure doesn\'t force every key on it back to the database simultaneously. Memcached classically has no replication — losing a node is treated as an acceptable, cheap cache-miss event, not a durability concern.',
    'Hot key / hot shard mitigation: consistent hashing balances keys evenly, but it cannot balance traffic — one viral key can overload the single node that owns it. Mitigations: key-level replication of hot keys across multiple nodes with client-side random selection, or an in-process local cache in front of the distributed tier for the very hottest items.',
    'Eviction and memory pressure: each node runs its own local eviction (typically LRU) independently once it hits its memory limit — there is no global eviction coordination. Sizing each node\'s memory and the shard count is a capacity-planning exercise, not something the cache adjusts automatically.',
    'Memcached vs Redis trade-off: Memcached is purely an in-memory key-value cache — simpler, multithreaded, slightly higher raw throughput per node, no persistence or replication. Redis adds data structures (lists, sets, sorted sets), optional persistence (RDB/AOF), pub-sub, and built-in replication/clustering — more capable, but more operational surface area. Choose Memcached for a pure cache-aside layer; choose Redis when you need atomic structures, persistence, or built-in HA.',
  ],
  keyPoints: [
    'Consistent hashing is what makes horizontal scaling of a cache viable — without it, adding one node invalidates nearly the entire cache at once',
    'Replication in a distributed cache is about availability under node failure, not durability — a cache is allowed to lose data; the source of truth is still the database',
    'Hot keys are the recurring failure mode in cache system design interviews — balanced key distribution does not imply balanced traffic distribution',
    'Memcached: simpler, faster per node, no replication. Redis: richer data structures, optional persistence, built-in clustering — pick based on whether you need more than get/set',
    'Each node evicts independently (typically LRU) — there is no global eviction policy across a distributed cache cluster',
  ],
}
