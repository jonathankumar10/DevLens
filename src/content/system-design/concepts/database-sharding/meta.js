// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'database-sharding',
  type:        'concept',
  title:       'Database Sharding',
  category:    'databases',
  tags:        ['sharding', 'partitioning', 'horizontal-scaling', 'shard-key', 'hotspot', 'resharding', 'consistent-hashing'],
  description: 'Sharding horizontally partitions a database — each shard holds a distinct subset of rows, and together they hold the complete dataset. Where replication duplicates data for fault tolerance and read scaling, sharding distributes data to break through single-machine storage and write throughput limits. The defining challenge is choosing a shard key that distributes data evenly while keeping related data co-located.',
}
