import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A dispatch office for a delivery fleet, not a single driver's to-do list. Jobs arrive with different urgency (priority), some must happen at an exact future time (delayed execution), and the dispatcher must never send the same package out with two different drivers (idempotency) even if a driver's radio cuts out mid-route (worker failure) and needs the job reassigned.",
  howItWorks: [
    'Task submission and priority queuing: clients submit a task (payload, priority, optional run-at time, retry policy) to the scheduler, which persists it durably before returning — a task must survive a scheduler crash between submission and execution. Ready tasks sit in a priority queue so urgent work is dispatched ahead of routine work even under backlog.',
    'Delayed/scheduled execution: tasks with a future run-at time don\'t belong in the ready queue yet. A time-indexed structure (a min-heap keyed by run time, or a "timing wheel" bucketed by time slot) holds pending-future tasks efficiently and moves each into the ready queue exactly when its time arrives, without polling every pending task on every tick.',
    'Worker assignment and resource awareness: each worker advertises its available CPU/memory capacity. The scheduler (or workers pulling from a shared queue) avoids bin-packing a task onto a worker that cannot fit it — assigning by resource fit, not just round-robin, prevents one oversized task from starving a worker that could otherwise run several smaller ones concurrently.',
    'Idempotency and exactly-once semantics: task execution is at-least-once by construction (a worker can crash after finishing but before reporting success, causing a retry). Every task carries an idempotency key; workers (or a downstream side-effect system) use it to detect and skip a task that already completed, so "at-least-once delivery, idempotent execution" together behave like exactly-once from the caller\'s perspective.',
    'Leader election for singleton scheduling: recurring jobs (like a nightly cron) must fire exactly once across the whole cluster, not once per scheduler replica. A leader election protocol (e.g., via a distributed lock in ZooKeeper/etcd) ensures only one scheduler instance is actively dispatching time-based triggers at any moment, with automatic failover if that leader dies.',
    'Retry, backoff, and dead-letter: a failed task is retried with exponential backoff up to a configured limit, then moved to a dead-letter queue for manual inspection rather than retried forever — identical reasoning to a message queue\'s DLQ, since a scheduler is fundamentally a specialized queue with a time dimension added.',
  ],
  keyPoints: [
    'A distributed scheduler is a priority queue plus a time dimension — delayed tasks need an efficient "not ready yet" structure (min-heap or timing wheel), not a linear scan of every pending task',
    'At-least-once execution is the achievable guarantee; exactly-once behavior is achieved by combining it with idempotency keys on the task, not by trying to prevent all duplicate dispatch',
    'Leader election is required specifically for recurring/singleton triggers — without it, running multiple scheduler replicas for availability causes the same cron job to fire multiple times',
    'Resource-aware assignment (bin packing by CPU/memory) prevents a single large task from monopolizing a worker that could otherwise run several smaller concurrent tasks',
    'Retries need exponential backoff and a maximum attempt count feeding a dead-letter queue — an infinite retry loop on a permanently-failing task wastes worker capacity indefinitely',
  ],
}
