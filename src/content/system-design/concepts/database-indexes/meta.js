// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'database-indexes',
  type:        'concept',
  title:       'Database Indexes',
  category:    'databases',
  tags:        ['indexes', 'b-tree', 'hash-index', 'query-optimization', 'covering-index', 'composite-index', 'write-amplification'],
  description: 'An index is a data structure maintained alongside a table that makes specific queries dramatically faster at the cost of write overhead and storage. Without an index, the database scans every row to find matches — O(n). With a B-tree index on the right column, it jumps directly to matching rows — O(log n). Choosing which columns to index and which index type to use is one of the highest-leverage database performance decisions.',
}
