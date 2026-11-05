import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A nightclub bouncer with a clicker counter. The club allows 100 new entries per hour. Each person who enters gets one click. Once the counter hits 100, everyone waits at the door until the next hour starts — regardless of whether the dance floor is actually full. VIP guests (paid API tiers) get a separate, larger entrance with a higher limit.",
  howItWorks: [
    'Token bucket: a bucket holds tokens up to a maximum capacity. Tokens refill at a fixed rate (e.g., 10 per second). Each request consumes one token. If the bucket is empty, the request is rejected (429) or queued. Allows short bursts up to the bucket capacity while enforcing a sustained rate ceiling.',
    'Leaky bucket: requests enter a queue (the bucket) and are processed at a constant, fixed output rate — like water dripping from a hole. Regardless of input burst size, output is perfectly smooth. Requests that overflow the bucket capacity are dropped. Provides traffic shaping rather than just rejection.',
    'Fixed window: count requests per fixed time window (e.g., 100 per minute). Reset the counter at the window boundary. Simple to implement with a Redis INCR. Vulnerable to a boundary attack: a burst at 11:59:59 and another at 12:00:00 delivers 200 requests in 2 seconds while respecting the "100/minute" limit.',
    'Sliding window (log): record the timestamp of each request in a sorted list. On each new request, count entries in the last N seconds. Accurate and burst-resistant but requires storing a timestamp per request — expensive at high QPS.',
    'Sliding window (counter): approximate the sliding window by interpolating between two adjacent fixed-window counters. Much cheaper than the log approach while being significantly more accurate than a naive fixed window.',
    'Distributed rate limiting: with multiple API gateway nodes, per-node in-memory counters are inconsistent — a user can multiply their quota by hitting different nodes. Use Redis with atomic INCR + EXPIRE for a shared counter. Lua scripts or Redis transactions ensure the check-and-increment is atomic.',
  ],
  keyPoints: [
    'Token bucket is best for API rate limiting: allows bursts up to bucket size while enforcing a sustained average rate. Leaky bucket is best for traffic shaping: enforces constant output rate regardless of input bursts',
    'Distributed rate limiting requires a shared store (Redis) — otherwise users bypass limits by hitting different servers',
    'Apply limits at the right granularity: per-user or per-API-key for quota enforcement; per-IP for DDoS mitigation. Never rely on IP alone — NAT can hide thousands of users behind a single address',
    'Return HTTP 429 (Too Many Requests) with a Retry-After header telling the client exactly when they can retry — never silently drop requests or return a misleading 500',
    'Rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset) let clients self-throttle before hitting the limit — reducing the number of rejected requests in well-behaved clients',
  ],
}
