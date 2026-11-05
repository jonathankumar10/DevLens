// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'sequencer',
  type:        'concept',
  title:       'Sequencer (Unique ID Generator)',
  category:    'scalability',
  tags:        ['unique-id', 'sequencer', 'snowflake', 'uuid', 'causality', 'distributed-systems'],
  description: 'A sequencer generates unique, often ordered, IDs across a distributed system — for primary keys, event ordering, and idempotency tokens. A single auto-increment counter cannot scale past one machine, so distributed systems need a way to hand out IDs that are unique (and ideally roughly time-ordered) without every node coordinating on every request.',
}
