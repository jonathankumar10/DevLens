import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A daily personalized newspaper. When a journalist (user you follow) publishes a story, the newspaper has two options: immediately print a copy for each subscriber (fan-out on write) or wait until you open the paper and pull all stories from every journalist you follow (fan-out on read). Most newspapers pre-print editions for most journalists, but for the most famous columnists with 10 million readers, they print on demand to avoid a 10-million-copy print run for every tweet.",
  howItWorks: [
    'Fan-out on write (push model): when User A posts, the system immediately writes the post ID into the feed caches of all A\'s followers. Each follower\'s feed is a pre-computed, sorted list of post IDs in Redis. Loading the feed is a single Redis ZRANGE read — extremely fast. Cost: each post triggers N writes (N = follower count). Infeasible for accounts with millions of followers.',
    'Fan-out on read (pull model): the feed is computed at read time by fetching the last K posts from each account the user follows and merging them. No pre-computation. Cost: each feed load triggers N database reads (one per followed account), then a sort/merge. Infeasible when a user follows thousands of accounts.',
    'Hybrid model (Twitter\'s approach): use fan-out on write for regular users (< 1M followers). For celebrities with > 1M followers, skip the fan-out entirely and use fan-out on read at load time. When computing a user\'s feed, merge their pre-built cache with a real-time fetch of posts from celebrity accounts they follow. Celebrities represent < 0.01% of accounts but generate disproportionate fan-out.',
    'Feed storage in Redis sorted sets: each user\'s feed is a Redis ZSET keyed by "feed:{userId}", where each member is a post ID and the score is a rank (timestamp, or a weighted ranking signal). ZADD adds new posts; ZRANGE with pagination returns the next page. TTL-based eviction keeps only the last 1,000 posts per user.',
    'Post storage: post content (text, media URLs, author ID, timestamp, engagement counts) is stored in a document store or relational database. The feed contains only post IDs — the client hydrates post content in a second lookup, batched via a Posts service. Separate the "what order to show posts" (feed) from "what the posts say" (post content).',
    'Ranking: chronological feeds are simpler but ranked feeds (by estimated engagement) retain users longer. Rank signals: recency, engagement rate of the post, author affinity (how often you interact with this author), content type preference. A lightweight ranking model scores post IDs in the feed cache at read time — the model input is the raw feed list, output is a reordered list.',
  ],
  keyPoints: [
    'The celebrity problem (fan-out for accounts with millions of followers) is the defining challenge of social feed design — the hybrid model (fan-out on write for regular users, fan-out on read for celebrities) is the standard solution',
    'Store post IDs in the feed, not post content — content changes (edits, deletion) must not require updating millions of feed caches, just one post record',
    'Redis sorted sets are the canonical feed cache data structure: O(log N) insert, O(log N + K) range read, automatic ordering by score, and easy pagination with ZRANGE + OFFSET',
    'Design for eventual consistency in the feed: a post from a followed user may appear 1–5 seconds after posting, not instantaneously. Users accept this; "read your own writes" for the author\'s own profile is more important to get right',
    'Pagination cursor, not offset: use the score (timestamp) of the last seen item as the cursor for the next page. Offset-based pagination drifts when new posts are inserted, causing items to skip or appear twice',
  ],
}
