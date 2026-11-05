import meta from './meta.js'

export default {
  ...meta,
  metaphor:    'A perfectly organised filing cabinet — every document has a defined type (schema), cross-referenced with other files (foreign keys). With the right index you can find any document in milliseconds across millions of files.',
  howItWorks: [
    'The client connects to the database engine using a connection pool (e.g., PgBouncer). Each connection can issue SQL queries independently.',
    'The query planner receives SQL, parses it into an AST, and generates an execution plan — choosing between index scans, full-table scans, and join strategies based on table statistics.',
    'B-tree indexes store column values in a sorted balanced tree. Lookups traverse O(log n) nodes instead of scanning O(n) rows, making indexed WHERE clauses milliseconds instead of seconds at scale.',
    'Transactions group multiple SQL statements under BEGIN/COMMIT. If any statement fails, ROLLBACK undoes all partial changes atomically. The WAL (Write-Ahead Log) ensures durability across crashes.',
    'ACID properties: Atomicity (all-or-nothing), Consistency (valid state transitions only), Isolation (concurrent transactions see committed data based on isolation level), Durability (committed data survives crashes via WAL).',
    'Normalisation (3NF) eliminates data duplication — each fact lives in one place. Denormalisation deliberately duplicates data to avoid expensive JOINs for read-heavy workloads.',
  ],
  keyPoints: [
    'ACID guarantees Atomicity, Consistency, Isolation, and Durability — the gold standard for financial systems',
    'B-tree indexes turn O(n) full-table scans into O(log n) lookups',
    'Normalisation eliminates data duplication — at the cost of JOIN complexity',
    'SQL databases excel at vertical scaling; horizontal sharding is complex but achievable',
    'Use SQL when you need complex queries, transactions, or strong consistency guarantees',
  ],
}
