// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'acid-and-base',
  type:        'concept',
  title:       'ACID vs BASE',
  category:    'databases',
  tags:        ['acid', 'base', 'transactions', 'atomicity', 'consistency', 'isolation', 'durability', 'eventual-consistency', 'distributed'],
  description: 'ACID and BASE are two competing models for how databases handle concurrent writes, failures, and consistency. ACID (Atomicity, Consistency, Isolation, Durability) guarantees every transaction either fully succeeds or fully rolls back with no intermediate state visible to others. BASE (Basically Available, Soft state, Eventually consistent) trades strict correctness for availability and write throughput — accepting that replicas may briefly diverge.',
}
