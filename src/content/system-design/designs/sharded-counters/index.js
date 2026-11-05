import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A single tip jar at a busy concert versus ten tip jars spread around the venue. One jar means every fan waits in line to drop a coin — the line, not the fans' generosity, becomes the bottleneck. Ten jars let ten people give at once; the venue just needs to empty and add up all ten jars at the end of the night instead of pretending there was only one all along.",
  howItWorks: [
    'The hot-row problem: a naive UPDATE posts SET likes = likes + 1 WHERE id = X serializes every concurrent increment on that row through the same lock, regardless of how many database shards or replicas exist elsewhere — a viral post can produce tens of thousands of increments per second on one row, and the row itself is the bottleneck, not overall database capacity.',
    'High-level design — splitting the counter: instead of one row per entity, store N shard rows (e.g., post_id=X, shard=0..9), each holding a partial count. An increment picks a random (or hashed-by-requester) shard and updates only that row — spreading write contention across N independently-lockable rows instead of funneling everything through one.',
    'Reading the total: a naive read sums all N shard rows on every request — correct, but N times more expensive than a single-row read and still a lot of load for a frequently-viewed counter like a view count shown on every page load.',
    'Detailed design — cached aggregate: maintain a periodically-refreshed cached total (e.g., in Redis, updated every few seconds by a background job that sums the shards) that reads hit directly. This trades perfect real-time accuracy for cheap reads — acceptable for a like/view count, where a user seeing "48.2K" that is a few seconds stale is a non-issue.',
    'In-memory pre-aggregation: for extreme write rates, increments can land first in an in-memory counter (Redis INCR on a sharded key) rather than the database at all, with a background job periodically flushing the delta to durable storage. This absorbs bursts far above what direct DB writes could sustain, at the cost of a small window of increments being lost if the in-memory layer crashes before flushing.',
    'Shard count tuning: too few shards and hot rows still contend under viral load; too many shards and normal-traffic reads waste effort summing mostly-empty rows. Some designs scale shard count dynamically per entity — a brand-new post starts with 1 shard and gains more only if its write rate crosses a threshold, rather than over-provisioning shards for every entity up front.',
  ],
  keyPoints: [
    'The problem is row-level write contention, not overall database capacity — adding database replicas or shards elsewhere does not help one row that is being hammered',
    'Splitting one counter into N shard rows turns serialized writes into N-way parallel writes; reads must then sum across shards instead of reading one row',
    'A periodically-refreshed cached total (not summed live on every read) is what keeps reads cheap — exact real-time accuracy is rarely required for a like/view counter',
    'In-memory pre-aggregation (Redis INCR) with periodic flush absorbs write bursts far beyond direct database throughput, trading a small durability window for that headroom',
    'Shard count is a tuning knob: under-sharded counters still contend under viral load, over-sharded counters waste read effort on quiet entities — some systems grow shard count dynamically per entity',
  ],
}
