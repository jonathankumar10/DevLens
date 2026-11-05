// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'distributed-message-queue',
  type:        'design',
  title:       'Design a Distributed Messaging Queue',
  category:    'designs',
  tags:        ['kafka', 'message-queue', 'partitioning', 'replication', 'consumer-offset', 'log-structured', 'isr'],
  description: 'Design the message queue itself — a system like Kafka or SQS — rather than just using one. The core requirements: durable storage that survives broker crashes, throughput that scales past a single machine, ordering guarantees within a defined scope, and delivery semantics producers and consumers can rely on.',
}
