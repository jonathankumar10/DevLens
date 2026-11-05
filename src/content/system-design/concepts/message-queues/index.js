import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A restaurant order rail. The waiter (producer) clips your ticket to the pass-through rail (queue) and immediately returns to seat the next table. The kitchen (consumer) picks up tickets in order and cooks at its own pace. The waiter doesn't stand at the rail waiting — and the kitchen doesn't get overwhelmed by all customers arriving at once. If the kitchen falls behind, tickets pile up on the rail rather than customers being turned away.",
  howItWorks: [
    'Producers publish messages to a named topic or queue. Each message contains a payload (the work to do) and optional metadata — priority, timestamp, correlation ID, trace ID. The producer does not wait for the work to be processed.',
    'Consumers subscribe to a topic or poll the queue at their own rate. Each message is delivered at least once — the consumer must explicitly acknowledge receipt before the queue removes the message. If the consumer crashes before acknowledging, the message is redelivered.',
    'At-least-once delivery means consumers must be idempotent: processing the same message twice must produce the same result as processing it once. Use idempotency keys (a unique message ID stored on the consumer side) to detect and skip duplicates.',
    'Pub/sub pattern: one publisher, many independent consumer groups. Kafka implements this with topics and consumer groups — each group gets its own independent copy of every message. One group sends emails, another sends push notifications, another writes to an analytics warehouse — all from the same event stream.',
    'Dead letter queues (DLQs) capture messages that repeatedly fail processing. After N failed delivery attempts, the message moves to a DLQ for manual inspection, alerting, and replay after the bug is fixed. Without a DLQ, a poison pill message blocks an entire consumer.',
    'Backpressure absorption: queues naturally handle traffic spikes. If consumers process 1,000 messages/second and producers send 10,000, the queue grows rather than the system crashing. Consumers drain the backlog when load subsides. Monitor queue depth as a leading indicator of processing lag.',
  ],
  keyPoints: [
    'Message queues replace synchronous HTTP calls with async work — the caller no longer waits and is no longer coupled to the consumer\'s availability or speed',
    'At-least-once delivery is the safe default; exactly-once is theoretically achievable (Kafka transactions) but expensive — design consumers to be idempotent instead',
    'Kafka retains messages on disk for days or weeks — consumers can replay historical events and new consumers can read from the beginning; traditional queues delete messages on acknowledgment',
    'Dead letter queues are mandatory in production: without one, a single malformed message can permanently block a consumer',
    'Use queues for work that doesn\'t need an immediate response: email delivery, push notifications, image processing, report generation, data pipeline ingestion',
  ],
}
