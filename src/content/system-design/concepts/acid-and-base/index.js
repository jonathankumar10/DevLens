import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "ACID is a bank vault transaction: the teller locks the counter, deducts from one account, credits another, verifies both, then unlocks. No one sees the intermediate state. BASE is a crowdsourced wiki: your edit goes live immediately, propagates to mirrors over the next few seconds, and any reader may briefly see the old version — but the system stays available at all times and all readers eventually converge.",
  howItWorks: [
    'Atomicity: a transaction is all-or-nothing. A bank transfer that debits Account A and credits Account B either completes both operations or neither — a crash halfway through rolls back both. No partial writes survive a failure.',
    'Consistency: every transaction transitions the database from one valid state to another, enforcing all defined constraints — foreign keys, unique constraints, check constraints. A transaction that would violate a constraint is aborted entirely.',
    'Isolation: concurrent transactions do not see each other\'s intermediate states. The result of running N transactions in parallel is identical to running them serially. Isolation levels (Read Committed, Repeatable Read, Serializable) trade off correctness for throughput.',
    'Durability: once committed, a transaction survives crashes. The write-ahead log (WAL) ensures data is flushed to disk before the commit acknowledgment is sent to the client. Power loss after a commit loses nothing.',
    'BASE sacrifices strict isolation and immediate consistency for scale. Writes are acknowledged quickly and propagated to replicas asynchronously. Readers from different replicas may briefly see different values — this is expected and acceptable for the use case.',
    'Choose ACID for financial systems, inventory counts, booking systems, and any scenario where partial writes or stale reads cause real harm. Choose BASE for social feeds, analytics dashboards, recommendation engines, and any scenario where a slightly stale read is acceptable and availability trumps correctness.',
  ],
  keyPoints: [
    'Atomicity and durability are non-negotiable for financial data — half-completed transfers or lost commits cause real monetary harm',
    'Isolation levels are a dial: Serializable (fully ACID, lowest throughput) → Repeatable Read → Read Committed → Read Uncommitted (highest throughput, allows dirty reads)',
    'Most SQL databases are ACID by default; most distributed NoSQL databases (DynamoDB, Cassandra) offer BASE semantics with optional stronger consistency at higher latency cost',
    'Eventual consistency means "will converge given no new writes" — not "might be wrong forever"; the divergence window is typically milliseconds to seconds',
    'Many systems mix both: ACID transactions for writes, BASE reads from replicas — the application must tolerate the replication lag between the two',
  ],
}
