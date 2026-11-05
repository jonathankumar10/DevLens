import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A library reference desk with a card catalog pre-sorted by popularity. As you spell out letters, the librarian flips to the tab for your prefix and reads the top entries — already ranked by how often patrons have requested each book. The librarian doesn't search the stacks in real time; the catalog was pre-built during quiet hours from a log of all patron requests.",
  howItWorks: [
    'Trie data structure: a prefix tree where each path from root to node represents a prefix. Each node stores the top-K suggestions for that prefix (pre-computed). Lookup is O(prefix_length) — fast regardless of dataset size. A trie for all English words is small enough to fit in memory on a single node. For 1B+ queries, the trie is sharded by prefix range.',
    'Top-K pre-computation: the trie stores the top 5 suggestions at each node, not just the node\'s own word. Pre-computation traverses the trie bottom-up, aggregating frequency counts from the log of past searches. This means returning suggestions is a single node lookup — no traversal or sorting at query time.',
    'Data pipeline for ranking: aggregate search logs daily (or hourly for trending topics). A MapReduce or Spark job counts query frequency, filters spam, and writes updated top-K lists to the trie. The pipeline runs offline; the trie is updated atomically (swap to a new version, redirect traffic). Avoid updating the live trie in place during query serving.',
    'Caching: the 1,000 most popular prefixes cover the vast majority of traffic. Cache these in Redis with a short TTL (minutes). Cache miss rate is typically < 5% — the trie only receives truly novel prefixes. The cache protects the trie service from thundering herd on popular prefixes.',
    'Client-side optimizations: debounce keystrokes (fire suggestion request only after 150–300ms of no new input). Cancel in-flight requests when a new character arrives. Show cached local results instantly from a browser-side LRU for prefixes typed in this session. These client behaviors cut the request rate by ~60% without changing backend design.',
    'Personalization: blend global popularity with user-specific query history. A user who frequently searches "Python tutorial" should see Python-related suggestions above unrelated equally-popular queries. Store per-user query history in a personalization service; blend its signals with global top-K at query time. Keep personalization logic in a fast path — it cannot add >10ms to the response.',
  ],
  keyPoints: [
    'The trie stores pre-computed top-K at each node — no sorting at query time. Top-K pre-computation runs offline in a data pipeline; the live trie is read-only during query serving',
    'Debouncing on the client is the highest-leverage optimization: 150ms debounce cuts query volume by ~50% while being imperceptible to the user',
    'Cache the top 1,000 prefixes in Redis — they cover the majority of traffic. The trie itself only serves the cold long tail. This tiered approach keeps both layers appropriately sized',
    'Atomic trie updates: build the new trie in a staging environment, swap traffic when ready. Never mutate a live trie while serving queries — partial updates corrupt top-K lists mid-query',
    'Trending vs. historical: a query that surged in the last hour (breaking news) should outrank a historically popular query that has gone cold. Add a recency-weighted frequency signal to the offline ranking pipeline',
  ],
}
