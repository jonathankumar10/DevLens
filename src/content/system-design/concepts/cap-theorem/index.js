import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "Three employees at a bank: one ensures every teller always shows the correct balance (Consistency), one ensures every customer gets served immediately even when the back office is unreachable (Availability), and one ensures the bank keeps operating even when internal phone lines go down (Partition Tolerance). You can fully staff any two, but the third always ends up short-handed during crises — because crises are exactly when you need all three.",
  howItWorks: [
    'Partition Tolerance is mandatory in any real distributed system. Networks drop packets, routers fail, and data center links go down. A system that assumes it will never partition is not a distributed system — it is a single node with a prayer.',
    'When a partition occurs in a CP system, the system chooses consistency over availability. Nodes that cannot confirm they have the latest data refuse to serve requests, returning errors until the partition heals. Examples: ZooKeeper, etcd, HBase. Use for leader election, distributed locks, configuration stores.',
    'When a partition occurs in an AP system, the system chooses availability over consistency. Nodes continue serving requests from whatever data they have — potentially stale. Conflicting writes from the two sides of the partition are resolved later via merging or last-write-wins. Examples: DynamoDB, Cassandra, CouchDB.',
    'CA systems (consistent + available, sacrificing partition tolerance) only exist as single-node databases or systems within a perfectly reliable network. A standalone PostgreSQL instance is CA — but it is not a distributed system.',
    'PACELC extends CAP beyond the partition scenario: even without a partition, every distributed system trades off latency vs consistency on every read. Reading from the local replica is fast but potentially stale (latency wins). Waiting for confirmation from the majority of nodes is consistent but slow (consistency wins).',
    'Practical implication: ask "what happens to users when a network partition occurs?" CP systems show error pages or maintenance screens. AP systems show potentially stale data but keep serving. Which is worse for your users depends entirely on the use case.',
  ],
  keyPoints: [
    'Partition tolerance is not optional — the real choice is always CP (refuse to serve stale data) vs AP (serve stale data rather than an error)',
    'CP systems: ZooKeeper, etcd, HBase, MongoDB (default config). AP systems: DynamoDB, Cassandra, CouchDB, Riak',
    'Most databases offer configurable consistency — Cassandra\'s quorum reads are CP; its eventual reads are AP — the knob lets you tune per query',
    'PACELC generalizes CAP: even without a partition, latency and consistency trade off on every request — not just during failures',
    'CAP is a simplification: the "C" in CAP (linearizability) is stronger than the "C" in ACID (integrity constraints) — they are different concepts despite sharing the word',
  ],
}
