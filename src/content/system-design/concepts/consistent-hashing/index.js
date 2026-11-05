import meta from './meta.js'

export default {
  ...meta,
  metaphor:    'A circular clock face where servers and keys share positions. When a server is removed, only the keys "just behind" it need to move to the next server — not the entire keyspace.',
  howItWorks: [
    'A virtual ring represents the 0–2³² hash space. Both server identifiers and data keys are hashed onto this ring. Each key maps to the first server encountered when walking clockwise from its ring position — this is its "responsible" server.',
    'When a server is added, only the keys that fall between the new server and its predecessor on the ring need to move. On average only 1/N of the keyspace is affected, versus ~all keys with naive modulo hashing.',
    'When a server is removed, only its keys migrate to the next clockwise server. All other servers keep their existing keys unchanged, enabling live topology changes with minimal data movement.',
    'Virtual nodes (vnodes) assign each physical server multiple positions on the ring by hashing its ID with different suffixes ("ServerA#0" through "ServerA#150"). This smooths out uneven key distribution and ensures that when a server fails, its load spreads proportionally across all remaining servers rather than piling onto one neighbour.',
    'Consistent hashing is used in Apache Cassandra and Amazon DynamoDB for primary data partitioning, in Memcached and Redis clusters for cache key routing, and in distributed load balancers to maintain session affinity while still allowing server addition and removal.',
  ],
  keyPoints: [
    'Regular hashing (key % N) remaps nearly all keys when N changes — unusable for live systems',
    'Consistent hashing places servers and keys on a ring — each key routes to the nearest server clockwise',
    'Adding or removing a server moves only ~1/N of keys on average',
    'Virtual nodes improve distribution uniformity and make rebalancing smoother',
    'Used in Amazon DynamoDB, Apache Cassandra, Memcached clusters, and distributed load balancers',
  ],
}
