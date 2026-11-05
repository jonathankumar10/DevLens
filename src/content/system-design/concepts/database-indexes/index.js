import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "The index at the back of a textbook. Without it, finding every mention of 'replication' means reading every page sequentially — O(n). With it, you jump directly to the right pages in one lookup — O(log n). The publisher pays the cost of building and maintaining the index at print time so readers save time at read time. A bad index (indexing every word including 'the' and 'and') wastes space and slows printing without helping readers.",
  howItWorks: [
    'B-tree indexes (the default in PostgreSQL and MySQL) maintain a balanced tree of indexed values pointing to row locations. Supports equality lookups, range queries (WHERE age > 30), and ORDER BY operations in O(log n). The most versatile index type.',
    'Hash indexes store a hash of each indexed value pointing to the row. O(1) equality lookups — faster than B-tree for exact matches. Completely useless for range queries (WHERE id > 500) or sorting, since hash values have no ordering.',
    'Composite indexes index multiple columns together in a defined order. An index on (last_name, first_name) accelerates queries filtering on last_name alone or on both columns, but not on first_name alone. The leftmost prefix rule: the index is only used when the query matches columns from the left.',
    'Covering indexes include all the columns a query needs directly in the index structure. The database never touches the main table — it returns results from the index alone. A query that hits a covering index is called an "index-only scan" and is dramatically faster.',
    'Full-text search indexes (inverted indexes in Elasticsearch, PostgreSQL tsvector) tokenize text fields and index each word with its positions. Powers efficient LIKE \'%keyword%\' queries that would require a full table scan without the index.',
    'Every index slows down INSERT, UPDATE, and DELETE: the index structure must be updated in addition to the row. A table with 10 indexes on a high-write workload may see significant write amplification — benchmark before adding indexes in bulk.',
  ],
  keyPoints: [
    'Index the columns in WHERE, JOIN ON, and ORDER BY clauses of your most frequent and most expensive queries — not every column in the table',
    'An unused index is strictly harmful: it incurs write overhead on every INSERT/UPDATE/DELETE with no read benefit; drop indexes your queries don\'t use',
    'The query planner may ignore an index when the table is small (full scan is cheaper) or when selectivity is too low (a column with only two distinct values is a poor index candidate)',
    'Composite index column order matters: put the highest-selectivity column first and ensure the order matches your WHERE clause to allow leftmost prefix matching',
    'EXPLAIN (or EXPLAIN ANALYZE in PostgreSQL) shows how the query planner uses indexes — always verify an index is actually being used after creation',
  ],
}
