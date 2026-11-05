// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'availability-patterns',
  type:        'concept',
  title:       'Availability Patterns',
  category:    'reliability',
  tags:        ['availability', 'failover', 'active-passive', 'active-active', 'circuit-breaker', 'retry', 'graceful-degradation', 'health-check'],
  description: 'Availability patterns are the architectural strategies that keep a system responding to users despite hardware failures, software crashes, and network partitions. The core mechanisms are redundancy (duplicate components), automated failover (promotion when a primary fails), circuit breaking (stopping cascading failures), and graceful degradation (serving reduced functionality rather than returning errors).',
}
