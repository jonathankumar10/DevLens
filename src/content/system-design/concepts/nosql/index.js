import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A filing cabinet vs. a wall of sticky notes. SQL is the cabinet — strict folders, labeled tabs, every document in its place. NoSQL is the sticky-note wall — you can put anything anywhere, find things fast by color or tag, and add thousands of new notes without restructuring the whole wall. Chaotic if misused, powerful if your access pattern matches the model.",
  howItWorks: [
    'Document stores (MongoDB, Firestore) keep data as self-contained JSON documents — no schema required, nested fields allowed. A user document can embed their address, preferences, and recent orders all in one read. Good for content, user profiles, and catalogs with variable fields.',
    'Key-value stores (Redis, DynamoDB in key-value mode) retrieve a single record by key in O(1). Exceptional throughput with zero query flexibility — you can only look up by the exact key. Good for sessions, caches, shopping carts, and feature flags.',
    'Wide-column stores (Cassandra, HBase) organize data in column families where each row can have different columns. Optimized for write-heavy workloads and time-series access patterns where you read all data for a specific partition key. Powers IoT telemetry, activity feeds, and audit logs.',
    'Graph databases (Neo4j, Amazon Neptune) model data as nodes and edges with properties on both. Traversing relationships (friends-of-friends, shortest path, recommendations) is dramatically faster than SQL JOINs at depth — a 6-hop graph traversal that takes hours in SQL takes milliseconds in a graph DB.',
    'Horizontal scaling is a first-class feature: NoSQL databases shard data across nodes natively. Adding servers increases both storage capacity and write throughput without application changes.',
    'The trade-off: you lose ACID transactions and relational integrity. NoSQL databases are typically BASE (Basically Available, Soft state, Eventually consistent) — writes propagate across replicas with a small delay, and there is no foreign key enforcement.',
  ],
  keyPoints: [
    'Choose by access pattern: key-value for O(1) lookups, document for flexible schemas and embedded data, wide-column for write-heavy time-series, graph for deep relationship traversal',
    'NoSQL scales horizontally out of the box — SQL scales vertically first and requires significant effort (sharding, Vitess) to scale horizontally',
    'Schema flexibility is a double-edged sword — no enforcement means application code must validate and handle missing or malformed fields',
    'Eventual consistency means a write may not be immediately visible to all readers — acceptable for social feeds and analytics, not for bank balances or inventory counts',
    'Most large systems use both SQL and NoSQL: relational DB for transactional data, key-value store for caching, document store for flexible content, object store for files',
  ],
}
