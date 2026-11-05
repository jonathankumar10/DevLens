// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'failure-models-spectrum',
  type:        'concept',
  title:       'Spectrum of Failure Models',
  category:    'framework',
  tags:        ['failure-model', 'fail-stop', 'crash-recovery', 'omission-failure', 'byzantine-failure', 'fault-tolerance', 'distributed-systems', 'consensus'],
  description: 'A taxonomy of the ways a component can actually fail, from easiest to detect and handle (fail-stop — it crashes and stays down) to hardest (Byzantine — it keeps running and reports results, but some of them are wrong or malicious). The failure model you assume determines how much redundancy and coordination machinery your design actually needs: assuming Byzantine failures when the interview expects fail-stop wastes time building consensus nobody asked for; assuming fail-stop when the requirements imply otherwise misses a real correctness gap.',
}
