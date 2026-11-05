import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A single message queue is one ledger book. A distributed one is a shelf of ledger books (partitions), each mirrored by a scribe in another room (replicas) who copies every entry in the same order as it's written. Readers can each track their own bookmark (consumer offset) independently, so ten different readers can be at ten different pages of the same book without interfering with each other.",
  howItWorks: [
    'Partitioned log storage: a topic is split into partitions, each an append-only, immutable log on disk. A message is assigned to a partition by a partition key (hashed) or round-robin. Sequential disk writes make this fast even without an in-memory buffer, and splitting across partitions is what lets throughput scale past one machine.',
    'Ordering scope: strict ordering is guaranteed only within a single partition, not across the whole topic. Messages that must stay ordered relative to each other (e.g., all events for one user) need the same partition key, so they land in the same partition and are read in write order.',
    'Replication: each partition is replicated to multiple brokers — one leader that handles all reads and writes for that partition, and follower replicas that continuously copy its log. If the leader broker dies, an in-sync replica (one that was fully caught up) is elected the new leader with no data loss.',
    'Producer acknowledgment levels: acks=0 (fire and forget, fastest, can silently lose messages), acks=1 (leader persisted it, still at risk if the leader dies before followers replicate), acks=all (every in-sync replica confirmed, strongest durability, highest latency). This is the queue\'s core durability/latency dial.',
    'Consumer offsets: rather than the broker tracking which messages each consumer has "taken" like a traditional queue, each consumer (or consumer group) tracks its own offset — the position it has read up to in each partition. This means multiple independent consumer groups can each read the entire log at their own pace, and a consumer can rewind by resetting its offset.',
    'Retention and compaction: messages are retained for a configured time or size window regardless of whether they\'ve been consumed (unlike a traditional queue that deletes on ack), enabling replay. Log compaction is an alternative retention mode that keeps only the latest message per key, useful for a changelog of current state rather than a full event history.',
  ],
  keyPoints: [
    'Ordering is per-partition, not per-topic — a common interview trap is assuming global ordering when only partition-local ordering is guaranteed',
    'Leader/follower replication per partition with in-sync replica (ISR) tracking is what gives the queue both durability and fast failover',
    'acks=0/1/all is the fundamental durability-vs-latency trade-off producers control — know what each level actually guarantees',
    'Consumer-tracked offsets (not broker-tracked delivery state) are what let multiple independent consumer groups replay the same log at different speeds',
    'Retention is time/size-based, not ack-based — this is the key structural difference from a traditional (SQS/RabbitMQ-style) queue and what enables replay',
  ],
}
