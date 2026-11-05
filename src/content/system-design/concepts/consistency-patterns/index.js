import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "Updating your contact info in a large organization. Strong consistency: IT updates the global directory and every building's desk phone immediately shows your new number. Eventual consistency: IT updates the global directory, but each building syncs overnight — your colleagues in another office might reach the old number until tomorrow morning, but everyone eventually gets the right one. Read-your-writes: you always see your own update immediately, even if others don't yet.",
  howItWorks: [
    'Strong (linearizable) consistency: every read reflects the most recent completed write, regardless of which replica serves it. Requires coordination — the write must be confirmed by a quorum of nodes before being acknowledged. High confidence, higher latency. Used in configuration stores, distributed locks, financial balances.',
    'Weak consistency: after a write, there is no guarantee when (or if) subsequent reads will see it. The system makes a best-effort attempt with no timing commitment. Used in real-time gaming state, VoIP call data, and live video — scenarios where stale data expires immediately.',
    'Eventual consistency: after a write, all replicas will converge to the same value given no new conflicting writes and sufficient time. The convergence window is typically milliseconds to seconds in practice. Used in social feeds, DNS propagation, shopping carts, and most NoSQL datastores.',
    'Read-your-writes (read-your-own-writes): a user always sees their own most recent writes immediately, even if other users do not. Implemented by routing the same user\'s reads to the primary or the same replica, or by including a write token that forces reads to wait until replication catches up.',
    'Monotonic reads: once a reader has seen a value at version V, they never see an older version on subsequent reads. Prevents the disorienting experience of a post appearing, then disappearing on refresh because two reads hit different replicas at different replication lag points.',
    'Causal consistency: writes that are causally related (a reply to a post must be seen after the post) appear in the correct order to all nodes. Causally independent writes may appear in any order. Weaker than strong consistency but stronger than eventual — captures the most important ordering guarantees for social applications.',
  ],
  keyPoints: [
    'Eventual consistency is the default in most distributed NoSQL databases — design your application to tolerate brief divergence between replicas',
    'Read-your-writes is the minimum consistency users expect: posting a comment and immediately not seeing it is a jarring experience that breaks trust',
    'Cassandra and DynamoDB let you specify consistency level per query — use stronger consistency only for critical reads to avoid paying the latency cost everywhere',
    'Conflict-free Replicated Data Types (CRDTs) allow concurrent writes that automatically merge without conflicts — used in distributed counters, sets, and collaborative editors',
    'Session consistency (combining read-your-writes + monotonic reads) is the practical baseline for most web applications — users see a consistent view within their own session',
  ],
}
