// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'database-replication',
  type:        'concept',
  title:       'Database Replication',
  category:    'databases',
  tags:        ['replication', 'primary-replica', 'leader-follower', 'read-replica', 'synchronous', 'asynchronous', 'failover', 'high-availability'],
  description: 'Replication maintains identical copies of a database on multiple servers. It serves two goals: fault tolerance — if the primary fails, a replica promotes and the system keeps running — and read scaling — route read-heavy traffic to replicas, reducing load on the primary writer. The key trade-off is between synchronous replication (zero data loss, higher latency) and asynchronous (lower latency, small risk of data loss on crash).',
}
