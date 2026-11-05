import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A radio broadcast versus a phone call. A phone call (point-to-point queue) connects one caller to one specific recipient. A radio broadcast (pub-sub) is transmitted once, and anyone with a receiver tuned to that frequency (subscribed to that topic) hears it — the broadcaster never knows or cares how many receivers are listening.",
  howItWorks: [
    'Topics and subscriptions: a publisher sends messages to a named topic, unaware of any subscribers. Each subscriber creates a subscription to that topic, and the system maintains an independent copy of the message stream (or independent delivery cursor) per subscription — one publish can fan out to dozens of unrelated subscriptions, each processed at its own pace.',
    'Push vs pull delivery: in push delivery, the system calls a subscriber\'s registered HTTP endpoint or webhook as soon as a message arrives — lower latency, but the subscriber must be reachable and handle bursts. In pull delivery, the subscriber polls the system for new messages on its own schedule — better backpressure control, since a slow subscriber just pulls less often instead of the system retrying failed pushes.',
    'At-least-once delivery and ack deadlines: a delivered message is not removed from a subscription\'s backlog until the subscriber explicitly acknowledges it within an ack deadline (e.g., 30s). If the deadline passes without an ack, the message is redelivered — so subscribers must be idempotent, exactly like a message queue consumer.',
    'Filtering: subscribers can attach a filter expression (matching message attributes, not payload) so a subscription only receives the subset of a topic\'s messages it cares about — e.g., a topic of "order events" where one subscription filters to order.cancelled only, avoiding the cost of processing and discarding irrelevant messages downstream.',
    'Fan-out at scale: the hard scaling problem is not accepting publishes (that\'s just appending to a log, as in a message queue) but replicating one message to N independent subscription backlogs efficiently. Systems typically store the message once and let each subscription hold only a lightweight cursor/pointer into the shared log, rather than physically copying the payload N times.',
    'Ordering trade-off: because a single topic fans out to many subscriptions that each process independently and often in parallel for throughput, pub-sub systems commonly relax the strict per-partition ordering a message queue offers — ordering, if needed, is usually scoped to a per-key basis similar to partitioned queues, not guaranteed globally.',
  ],
  keyPoints: [
    'The defining difference from a message queue: pub-sub fans a single message out to every independent subscription, while a queue delivers each message to exactly one consumer',
    'Push delivery minimizes latency but requires the system to manage retries against unreliable subscriber endpoints; pull delivery puts backpressure control in the subscriber\'s hands',
    'At-least-once delivery with ack deadlines means subscribers must be idempotent — the same duplicate-handling requirement as any message queue consumer',
    'Storing the message once and giving each subscription a lightweight read cursor (rather than copying the payload per subscriber) is what makes fan-out to many subscriptions efficient',
    'Attribute-based filtering lets subscribers receive only a relevant slice of a topic without the publisher needing to know about every downstream consumer\'s interests',
  ],
}
