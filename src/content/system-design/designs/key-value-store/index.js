import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A network of post office boxes spread across a country. Each box has a unique number (key) and can hold any document (value). To add redundancy, copies of important boxes are kept in multiple cities. A consistent hashing ring decides which city owns which box range. When boxes get too full, new cities are added and the ring rebalances automatically.",
  howItWorks: [
    'Data partitioning with consistent hashing: a hash ring maps key hashes to node positions. Each node owns a range of the ring. Adding a node only rehashes its portion of the ring — not all keys. Virtual nodes (vnodes) ensure even distribution and smooth rebalancing when nodes join or leave.',
    'Replication: each key is replicated to N nodes (typically 3) — the primary and the next N-1 nodes clockwise on the ring. Writes are propagated asynchronously. Quorum reads and writes (W + R > N) guarantee overlap between the write set and read set, providing tunable consistency.',
    'Conflict resolution: concurrent writes from different nodes can create version conflicts. Vector clocks record which node made which writes in what causal order. On conflict, the client resolves divergent versions (last-write-wins or application-level merge). DynamoDB uses a variation of this with logical timestamps.',
    'Gossip protocol: nodes discover each other and exchange membership information peer-to-peer rather than through a central coordinator. Each node randomly picks another node every few seconds and exchanges state. Cluster membership and node failure detection propagate in O(log N) rounds.',
    'Sloppy quorum and hinted handoff: if a target node is temporarily unavailable, the write goes to the next healthy node with a "hint" noting the intended recipient. When the downed node recovers, the hinted handoff delivers the writes — ensuring availability over strict consistency during partial failures.',
    'Read repair and anti-entropy: during reads, if different replicas return different values, the coordinator applies read repair — sending the latest version to nodes with stale data. A separate Merkle tree-based anti-entropy process periodically reconciles full key ranges between replicas without sending all data.',
  ],
  keyPoints: [
    'Consistent hashing + virtual nodes enables horizontal scaling with minimal rebalancing — know this cold for any distributed storage interview',
    'Quorum (W + R > N) provides the knob between CP and AP: high quorum = strong consistency + lower availability; low quorum = eventual consistency + high availability',
    'Gossip protocol avoids a single point of failure in membership management — no central coordinator means no coordinator outage takes down the cluster',
    'Sloppy quorum and hinted handoff enable DynamoDB/Cassandra\'s "always writable" property — at the cost of potential brief inconsistency during node recovery',
    'In-memory key-value stores (Redis) add TTL expiration, eviction policies (LRU, LFU), and single-threaded event loop for predictable sub-millisecond latency — different trade-offs from disk-backed Cassandra',
  ],
}
