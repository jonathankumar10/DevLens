// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'key-value-store',
  type:        'design',
  title:       'Design a Key-Value Store',
  category:    'designs',
  tags:        ['key-value', 'distributed-hash-table', 'consistent-hashing', 'replication', 'conflict-resolution', 'vector-clocks', 'gossip-protocol', 'dynamo'],
  description: 'Design a distributed key-value store (like DynamoDB, Cassandra, or Redis Cluster) that supports GET, PUT, and DELETE operations on arbitrary byte-value pairs, with high availability, horizontal scalability, and tunable consistency across geographically distributed nodes.',
}
