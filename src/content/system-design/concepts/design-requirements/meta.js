// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'design-requirements',
  type:        'concept',
  title:       'Design Requirements',
  category:    'requirements',
  tags:        ['requirements', 'scalability', 'availability', 'reliability', 'redundancy', 'throughput', 'latency', 'sla', 'slo', 'fault-tolerance'],
  description: 'Every distributed system reduces to three problems: moving data across a network, storing it in the right place, and transforming it into something useful. Design requirements are the measurable targets — availability, reliability, throughput, and latency — that tell you whether your solution to those three problems is actually good enough.',
}
