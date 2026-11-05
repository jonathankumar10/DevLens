import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A concert ticketing office with a shared tally board. Multiple ticket windows (API gateway nodes) serve customers simultaneously. Instead of each window keeping its own count, they all consult a central board (Redis) before issuing a ticket. The board uses chalk that can be updated in a single atomic swipe — no two windows can accidentally hand out the same ticket.",
  howItWorks: [
    'Algorithm choice: token bucket for API rate limiting (allows bursts up to bucket capacity while enforcing sustained average rate). Sliding window counter for per-minute quotas with boundary-attack protection. Fixed window for simplicity in low-risk contexts. The sliding window counter approximates accuracy by interpolating two adjacent fixed-window counters.',
    'Distributed counter with Redis: store counters in Redis using INCR + EXPIRE. The check-and-increment must be atomic — use a Lua script or Redis MULTI/EXEC transaction. A single Lua script reads the current count, compares to limit, increments if below limit, and returns the result atomically without race conditions.',
    'Key design: the Redis key encodes the identifier and the time window — "rl:{userId}:{windowStart}". For sliding window: "rl:{userId}:{minuteBucket}". TTL is set to slightly longer than the window to handle boundary reads. Key size matters at scale: millions of users × multiple windows = millions of keys.',
    'Middleware placement: rate limiting runs as middleware in the API gateway before requests reach backend services. The gateway reads the user/IP/API-key from the request, queries Redis, returns 429 with Retry-After and X-RateLimit-* headers on violation, or passes the request through. Keep the Redis call sub-millisecond with a local connection pool.',
    'Fail-open strategy: if Redis is unavailable or responds too slowly, the rate limiter should fail open — let requests through — rather than blocking all traffic. Rate limiting is a guard rail, not a hard gate. Log the bypass so operations teams can detect Redis outages via the alert.',
    'Multi-tier limits: combine per-second burst limits (token bucket) with per-day quota limits (fixed window). Different API tiers (free, pro, enterprise) have different bucket sizes and quota amounts, stored in a configuration service or database the gateway reads at startup and refreshes periodically.',
  ],
  keyPoints: [
    'Atomic Redis operations (Lua scripts) are the correct solution for distributed rate limiting — non-atomic check-then-increment has a race condition that lets users exceed limits under concurrent load',
    'Return meaningful 429 responses: HTTP 429 status, Retry-After header (seconds until the rate limit resets), X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset',
    'Fail-open is the correct default: a broken rate limiter that blocks all traffic is worse than a broken rate limiter that lets extra requests through — the backend can handle a brief surge better than a complete outage',
    'Rate limiting by user ID is safer than IP — one NAT gateway can represent 10,000 users, and one user might have multiple IPs. Layer both: IP-based for DDoS protection, user-based for quota enforcement',
    'Monitor rate limiter hit rate as a business signal: sudden spikes indicate API abuse, a viral moment, or a client bug causing retry storms',
  ],
}
