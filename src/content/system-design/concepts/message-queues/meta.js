// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'message-queues',
  type:        'concept',
  title:       'Message Queues',
  category:    'messaging',
  tags:        ['message-queue', 'kafka', 'rabbitmq', 'sqs', 'pub-sub', 'async', 'producer', 'consumer', 'event-streaming', 'dead-letter-queue', 'backpressure'],
  description: 'Message queues decouple producers (services that generate work) from consumers (services that process it) by placing an intermediary buffer between them. Instead of Service A calling Service B synchronously and waiting for a response, A publishes a message to a queue and returns immediately. B reads from the queue at its own pace. This enables asynchrony, load leveling across traffic spikes, and fault isolation between services.',
}
