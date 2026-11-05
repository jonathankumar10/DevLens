// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'cap-theorem',
  type:        'concept',
  title:       'CAP Theorem',
  category:    'reliability',
  tags:        ['cap', 'consistency', 'availability', 'partition-tolerance', 'distributed-systems', 'cp', 'ap', 'pacelc'],
  description: 'The CAP theorem states that a distributed system can simultaneously guarantee at most two of three properties: Consistency (every read reflects the most recent write), Availability (every request receives a non-error response), and Partition Tolerance (the system continues operating despite network partitions). Because network partitions are inevitable in any real distributed system, the practical choice is always CP vs AP — never CA.',
}
