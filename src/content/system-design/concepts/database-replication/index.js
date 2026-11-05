import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A document simultaneously auto-saving to multiple cloud accounts. You write to one laptop, but copies appear in two other accounts almost instantly. If your laptop is stolen, you switch to a replica without losing anything. If both accounts sync simultaneously but see a conflict, you need a policy for which version wins — that's the multi-primary replication problem.",
  howItWorks: [
    'Primary-replica (leader-follower) replication: all writes go to a single primary. The primary writes a change to its write-ahead log (WAL) and streams that log to one or more replicas. Each replica applies the same operations in the same order.',
    'Synchronous replication: the write is not acknowledged to the client until at least one replica confirms it received and applied the data. Guarantees zero data loss on primary failure — but every write waits for a network round trip to the replica.',
    'Asynchronous replication: the primary acknowledges the write immediately after writing to its own WAL, then propagates changes in the background. Lower write latency, but if the primary crashes before replication finishes, the most recent writes are lost (replication lag determines the exposure window).',
    'Read replicas absorb SELECT queries directly, reducing load on the primary. Application code (or a proxy like ProxySQL) routes reads to replicas and writes to primary. Typical ratio: 1 primary to 3–5 read replicas for read-heavy workloads.',
    'Failover: when the primary fails, an orchestration layer (cloud RDS Multi-AZ, Patroni, MHA) detects the failure via health checks, promotes the most up-to-date replica to primary, and updates DNS so applications reconnect automatically. Failover typically takes 30–60 seconds.',
    'Multi-primary (primary-primary) replication allows writes to multiple nodes simultaneously, enabling write scaling across geographic regions. Requires conflict resolution when two primaries receive conflicting writes — last-write-wins or application-level merge.',
  ],
  keyPoints: [
    'Replication solves availability and read scalability — it does not solve write scalability; all writes still route through a single primary',
    'Synchronous replication guarantees zero data loss at the cost of higher write latency; asynchronous sacrifices durability for speed — choose based on the data\'s criticality',
    'Replication lag — the delay between a write on the primary and its appearance on replicas — is normally milliseconds but can spike to seconds under heavy load; read-your-own-writes consistency breaks during spikes',
    'Read replicas are the standard solution for high read:write ratios — 90% reads, 10% writes is common in web applications',
    'Replication is not a backup: if someone runs DELETE FROM orders WHERE 1=1, the delete replicates to all replicas immediately',
  ],
}
