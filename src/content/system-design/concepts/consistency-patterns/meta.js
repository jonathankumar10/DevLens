// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'consistency-patterns',
  type:        'concept',
  title:       'Consistency Patterns',
  category:    'reliability',
  tags:        ['consistency', 'strong-consistency', 'eventual-consistency', 'weak-consistency', 'read-your-writes', 'monotonic-reads', 'causal-consistency'],
  description: 'Consistency patterns describe the guarantees a distributed system makes about when a write becomes visible to subsequent readers. Strong consistency means every reader immediately sees the latest write from any node. Eventual consistency means all readers will converge to the same value given enough time. Most production systems use a model between these extremes, tuned to the specific feature\'s requirements.',
}
