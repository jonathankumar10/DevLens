// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'consistency-models-spectrum',
  type:        'concept',
  title:       'Spectrum of Consistency Models',
  category:    'framework',
  tags:        ['consistency', 'linearizability', 'sequential-consistency', 'causal-consistency', 'eventual-consistency', 'cap-theorem', 'distributed-systems', 'consistency-spectrum'],
  description: 'A ladder of consistency guarantees, from strongest (linearizability — behaves like there\'s only ever one copy of the data, with real-time recency) to weakest (eventual — replicas converge with no timing promise at all). Climbing the ladder buys stronger guarantees but costs latency and availability, especially under network partition. Picking the right rung for a given read path — not just "strong" or "eventual" as a binary — is one of the most consequential trade-offs in distributed systems.',
}
