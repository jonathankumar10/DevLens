import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A hotel with multiple check-in desks that still needs every room key to be unique. Instead of one clerk handing out every key (a bottleneck and single point of failure), each desk is pre-assigned its own block of key numbers, or stamps each key with its desk ID and a timestamp — so two desks issuing keys at the same instant never collide.",
  howItWorks: [
    'UUID (v4): 128 random bits, generated locally with no coordination and effectively zero collision probability. Simplest option, but the value is unordered — using it as a B-tree primary key causes random-order inserts that hurt index locality and write performance.',
    'Database auto-increment: a single database sequence guarantees strictly ordered, gap-free IDs — but the sequence itself is a single point of contention. Ticket servers (a dedicated DB whose only job is issuing IDs) scale this pattern out, still ordered, still a shared dependency.',
    'Range/segment allocation: a central coordinator hands each application node a reserved range of IDs (e.g., node A gets 1–10,000, node B gets 10,001–20,000). Each node then increments locally with zero coordination until its range is exhausted, then requests a new one. Reduces coordinator load dramatically at the cost of IDs not being issued in strict global order.',
    'Snowflake-style composite IDs (used by Twitter, Discord): a 64-bit ID packs a timestamp, a machine/worker ID, and a per-millisecond sequence number into one integer. Every worker generates IDs independently with no network call, IDs are roughly time-sortable, and collisions are impossible as long as machine IDs are unique.',
    'Causality: a Lamport clock or vector clock does not just make IDs unique — it also makes them causally ordered, so a system can tell that event A happened-before event B even across machines with unsynchronized wall clocks. This matters for event sourcing and conflict resolution, not just for row keys.',
  ],
  keyPoints: [
    'UUIDs need no coordination and never collide, but are unordered — a poor B-tree primary key at high write volume',
    'Snowflake-style IDs (timestamp + machine ID + sequence) are the standard interview answer: no coordination per request, roughly sortable, and collision-free',
    'Range/segment allocation trades a small amount of centralization (fetching a new range occasionally) for near-zero per-request coordination',
    'Clock skew across machines is the main failure mode for timestamp-based schemes — NTP drift can cause IDs to briefly appear out of order',
    'Causality (Lamport/vector clocks) is a stronger requirement than uniqueness — needed when the system must reason about happened-before relationships, not just avoid collisions',
  ],
  components: [
    {
      id:            'uuid',
      title:         'UUID v4',
      icon:          '🎲',
      color:         '#8b5cf6',
      animationType: 'random',
      summary: 'Random 128-bit ID — zero coordination, zero ordering',
      detail:  'Generated entirely locally from random bits. Collision probability is astronomically low, but the values are unordered, which fragments B-tree indexes if used as a primary key.',
      stats: [
        { label: 'Size',        value: '128 bits' },
        { label: 'Coordination', value: 'None' },
        { label: 'Ordered',      value: 'No' },
      ],
    },
    {
      id:            'ticket-server',
      title:         'Ticket Server',
      icon:          '🎟️',
      color:         '#3b82f6',
      animationType: 'database',
      summary: 'A dedicated DB whose only job is handing out the next ID',
      detail:  'Centralizes ID issuance behind a single auto-increment sequence. Strictly ordered and simple, but that server is a shared dependency and potential bottleneck at very high write rates.',
      stats: [
        { label: 'Ordered',      value: 'Strict' },
        { label: 'Bottleneck',   value: 'Yes, at scale' },
        { label: 'Complexity',   value: 'Low' },
      ],
    },
    {
      id:            'range-allocation',
      title:         'Range Allocation',
      icon:          '📦',
      color:         '#f59e0b',
      animationType: 'partition',
      summary: 'Each node reserves a block of IDs and increments locally',
      detail:  'A coordinator hands out ID ranges on request. Once a node has a range, it needs no further coordination until the range is exhausted — dramatically reducing load on the coordinator.',
      stats: [
        { label: 'Coordination', value: 'Per range, not per ID' },
        { label: 'Ordered',      value: 'Per-node only' },
        { label: 'Used by',      value: 'Many sharded DBs' },
      ],
    },
    {
      id:            'snowflake',
      title:         'Snowflake ID',
      icon:          '❄️',
      color:         '#10b981',
      animationType: 'composite',
      summary: 'Timestamp + machine ID + sequence packed into one 64-bit int',
      detail:  'Each worker generates IDs independently with no network call. IDs are roughly time-sortable and collision-free as long as machine IDs are assigned uniquely. The standard answer for "design a unique ID generator" interviews.',
      stats: [
        { label: 'Size',        value: '64 bits' },
        { label: 'Coordination', value: 'None per request' },
        { label: 'Ordered',      value: 'Roughly, by time' },
      ],
    },
  ],
}
