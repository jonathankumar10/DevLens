// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'distributed-cache',
  type:        'design',
  title:       'Design a Distributed Cache',
  category:    'designs',
  tags:        ['distributed-cache', 'memcached', 'redis', 'consistent-hashing', 'hot-key', 'replication', 'eviction'],
  description: 'Design a cache that spans multiple machines — like a Memcached or Redis cluster — so that the working set of hot data can exceed the memory of any single server. Unlike an in-process or single-node cache, a distributed cache must decide which node owns which key, survive individual node failure, and handle a small number of keys receiving disproportionate traffic.',
}
