// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'event-driven-architecture',
  type:        'concept',
  title:       'Event-Driven Architecture',
  category:    'architecture',
  tags:        ['event-driven', 'event-sourcing', 'cqrs', 'pub-sub', 'kafka', 'choreography', 'orchestration', 'domain-events', 'outbox-pattern'],
  description: 'Event-driven architecture (EDA) is a pattern where components communicate by emitting and consuming events rather than calling each other directly. An event represents a fact that happened — "OrderPlaced", "PaymentProcessed", "InventoryReserved". Producers emit events without knowing who will consume them. Consumers react to events independently. This produces a system where services are loosely coupled, highly extensible, and naturally asynchronous.',
}
