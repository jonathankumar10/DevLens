import meta from './meta.js'

export default {
  ...meta,
  metaphor:    'Memorising the answer to a question you get asked constantly — instead of re-reading the textbook every time, you keep the answer at the tip of your tongue. The challenge: knowing when to update your memory.',
  howItWorks: [
    'Cache-aside (lazy loading): the application checks the cache first; on a miss, it reads from the database, writes the result into the cache, then returns it. The most common pattern — simple, and the cache only ever holds data that was actually requested. Risk: if the DB is updated directly, the cache goes stale until its TTL expires.',
    'Read-through: the cache sits in front of the database and owns the miss-fill logic itself — the application only ever talks to the cache, which transparently loads from the DB on a miss. Simplifies application code at the cost of an extra layer to operate.',
    'Write-through: writes go to the cache and the database synchronously, in the same request. The cache is never stale, but every write pays the latency of both writes.',
    'Write-back (write-behind): writes go to the cache immediately and are acknowledged right away; the database update happens asynchronously in the background. Much faster writes, but a cache crash before the flush loses the unwritten data.',
    'Eviction policies: when the cache is full, something must be removed to make room. LRU (Least Recently Used) evicts the item that has gone longest untouched — the default choice for most workloads. LFU (Least Frequently Used) evicts by access count instead, better when popularity is stable but recency is noisy.',
    'Cache stampede protection: when a hot key expires, a flood of concurrent requests can all miss simultaneously and hammer the database at once. Request coalescing (only one request repopulates the cache, others wait on it) or probabilistic early expiration (refresh slightly before the real TTL, staggered per request) prevent this "thundering herd."',
  ],
  keyPoints: [
    'Cache hit ratio is the key metric — a 99% hit rate means 100× less database load',
    'TTL (Time To Live) controls how long cached data stays valid before expiring',
    'Cache invalidation is the hard problem — stale data can be worse than no cache at all',
    'Write-through caches update cache and DB together; write-back caches defer DB writes (faster, risk of data loss)',
    'LRU (Least Recently Used) eviction keeps the hottest data in memory when the cache is full',
    'Cache stampede protection (request coalescing or probabilistic early expiration) prevents a hot key\'s expiry from causing a synchronized flood of DB reads',
  ],
}
