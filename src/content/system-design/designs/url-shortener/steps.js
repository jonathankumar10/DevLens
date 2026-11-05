/**
 * URL Shortener architecture step trace.
 *
 * Three phases:
 *   write — user submits a long URL → get a short code back
 *   read  — user visits the short URL → gets redirected to the original
 *   analytics — the click is counted asynchronously, after the redirect
 *
 * Node IDs: client | lb | api | cache | db | kafka | analytics | counters | clickhouse
 *
 * Layout (vertical stack):
 *   client
 *     ↓
 *   lb  (API gateway)
 *     ↓
 *   api (app server)
 *    ↓ ↓
 *  cache  db
 *
 * Step shape:
 *   type         — identifier string
 *   phase        — 'write' | 'read'
 *   activeNodes  — node IDs that glow
 *   activeArrow  — { from: nodeId, to: nodeId } | null
 *   message      — short step label
 *   detail       — longer explanation
 *   shortCode    — null | 'aB3xK9z'  (shown on the short URL badge)
 */
export function buildUrlShortenerSteps() {
  return [
    // ── Write flow (shorten a URL) ─────────────────────────────────────────
    {
      type: 'write-init',
      phase: 'write',
      activeNodes: ['client'],
      activeArrow: null,
      message: 'User submits a long URL to shorten.',
      detail:
        'POST /api/urls  { url: "https://example.com/very/long/article?ref=newsletter" }\n\nThe client may be a browser, a mobile app, or another service.',
      shortCode: null,
    },
    {
      type: 'write-lb',
      phase: 'write',
      activeNodes: ['client', 'lb'],
      activeArrow: { from: 'client', to: 'lb' },
      message: 'Request hits the API Gateway.',
      detail:
        'The API Gateway is the single entry point. It authenticates the request, applies rate limits, and routes this POST to the Shortening Service. GET requests go to the Redirect Service instead.',
      shortCode: null,
    },
    {
      type: 'write-api',
      phase: 'write',
      activeNodes: ['lb', 'api'],
      activeArrow: { from: 'lb', to: 'api' },
      message: 'The Shortening Service receives and validates the request.',
      detail:
        'The service validates the URL and checks it against a threat list. Each request creates a new link, even for a URL that has been shortened before, so every link has its own owner and analytics.',
      shortCode: null,
    },
    {
      type: 'write-generate',
      phase: 'write',
      activeNodes: ['api'],
      activeArrow: null,
      message: 'Server generates a unique 7-char Base62 code.',
      detail:
        'The server takes the next ID from a block it holds in memory, shuffles it so codes aren\'t sequential, then encodes it in Base62 (0-9, A-Z, a-z). 7 chars give 62⁷ ≈ 3.5 trillion codes.',
      shortCode: 'aB3xK9z',
    },
    {
      type: 'write-custom-alias',
      phase: 'write',
      activeNodes: ['api'],
      activeArrow: null,
      message: 'Or: a custom alias skips ID generation entirely.',
      detail:
        'If the request includes custom_alias, the server skips Base62 encoding and uses that string as short_code directly.\n\nUniqueness is enforced by a DB constraint — an insert conflict returns 409 Conflict so the client can prompt for a different alias.',
      shortCode: 'my-launch',
    },
    {
      type: 'write-db',
      phase: 'write',
      activeNodes: ['api', 'db'],
      activeArrow: { from: 'api', to: 'db' },
      message: 'Mapping is persisted to the database.',
      detail:
        'Schema: { short_code, long_url, user_id, is_custom, expires_at, deleted_at, created_at }\n\nThe database is the source of truth, so write here first and warm the cache second. The primary key guarantees uniqueness.',
      shortCode: 'aB3xK9z',
    },
    {
      type: 'write-cache',
      phase: 'write',
      activeNodes: ['api', 'cache'],
      activeArrow: { from: 'api', to: 'cache' },
      message: 'Short code is written to Redis cache.',
      detail:
        'After the database write succeeds, add the link to Redis with a 24-hour TTL, or less if it expires sooner. New links tend to get clicked right away, so the first redirect is already a cache hit.',
      shortCode: 'aB3xK9z',
    },
    {
      type: 'write-response',
      phase: 'write',
      activeNodes: ['api', 'client'],
      activeArrow: { from: 'api', to: 'client' },
      message: 'Short URL returned to the client.',
      detail:
        'Response: { short_url: "https://short.ly/aB3xK9z" }\n\nFull write round-trip typically < 100 ms. The user can now share the short URL.',
      shortCode: 'aB3xK9z',
    },

    // ── Read flow (follow the short URL) ──────────────────────────────────
    {
      type: 'read-init',
      phase: 'read',
      activeNodes: ['client'],
      activeArrow: null,
      message: 'User visits short.ly/aB3xK9z in their browser.',
      detail:
        'GET /aB3xK9z\n\nThe browser first resolves short.ly via DNS, then opens a TCP connection. The short code is extracted from the URL path.',
      shortCode: 'aB3xK9z',
    },
    {
      type: 'read-lb',
      phase: 'read',
      activeNodes: ['client', 'lb'],
      activeArrow: { from: 'client', to: 'lb' },
      message: 'Request hits the API Gateway.',
      detail:
        'The same gateway as the write path, but this is a GET, so it routes to the Redirect Service. This path handles about 100 times more traffic than creating links.',
      shortCode: 'aB3xK9z',
    },
    {
      type: 'read-api',
      phase: 'read',
      activeNodes: ['lb', 'api'],
      activeArrow: { from: 'lb', to: 'api' },
      message: 'The Redirect Service parses the short code "aB3xK9z".',
      detail:
        'The server extracts the 7-character code from the path and prepares a lookup. It checks the cache first before going to the database.',
      shortCode: 'aB3xK9z',
    },
    {
      type: 'read-cache-hit',
      phase: 'read',
      activeNodes: ['api', 'cache'],
      activeArrow: { from: 'api', to: 'cache' },
      message: 'Cache HIT — Redis returns the long URL instantly.',
      detail:
        'Redis lookup is O(1) and takes < 1 ms. Since this URL was just created, it\'s warm in cache. The database is not touched — this is the fast path for popular links.',
      shortCode: 'aB3xK9z',
    },
    {
      type: 'read-expiry-check',
      phase: 'read',
      activeNodes: ['api'],
      activeArrow: null,
      message: 'Before redirecting, the server checks expires_at.',
      detail:
        'If now() > expires_at, the server returns 410 Gone instead of a redirect — the link is dead, not just missing.\n\nRedis TTL is set to min(default_ttl, expires_at - now()) when the cache is warmed, so expired entries fall out of cache on their own without an explicit eviction step.',
      shortCode: 'aB3xK9z',
    },
    {
      type: 'read-redirect',
      phase: 'read',
      activeNodes: ['api', 'client'],
      activeArrow: { from: 'api', to: 'client' },
      message: 'Server sends HTTP 302 redirect to the original URL.',
      detail:
        '302 Found (temporary): the browser does not cache the mapping, so every future click on this link routes through the server again.\n\nThis is the trade-off that makes analytics possible — a 301 would let browsers skip the server entirely after the first visit, and clicks would go uncounted.',
      shortCode: 'aB3xK9z',
    },

    // ── Analytics flow (decoupled from the redirect, fires async) ─────────
    {
      type: 'analytics-publish',
      phase: 'analytics',
      activeNodes: ['api', 'kafka'],
      activeArrow: { from: 'api', to: 'kafka' },
      message: 'Click event is published to Kafka.',
      detail:
        'This happens after the 302 response has already been sent to the client — the user never waits for it. Event payload: { short_code, timestamp, ip, referer, user_agent }.\n\nIf Kafka or the Analytics Service is down, redirects are completely unaffected.',
      shortCode: 'aB3xK9z',
    },
    {
      type: 'analytics-consume',
      phase: 'analytics',
      activeNodes: ['kafka', 'analytics'],
      activeArrow: { from: 'kafka', to: 'analytics' },
      message: 'Analytics Service consumes the event from the stream.',
      detail:
        'Consumers can lag behind by minutes during traffic spikes without any impact on the redirect path — the two systems are fully decoupled.',
      shortCode: 'aB3xK9z',
    },
    {
      type: 'analytics-counters',
      phase: 'analytics',
      activeNodes: ['analytics', 'counters'],
      activeArrow: { from: 'analytics', to: 'counters' },
      message: 'Redis counter is incremented for this short code.',
      detail:
        'INCR clicks:{short_code}:{YYYY-MM-DD-HH}\n\nGives a live count (e.g. "clicks in the last hour") cheaply, without writing to a database on every click.',
      shortCode: 'aB3xK9z',
    },
    {
      type: 'analytics-clickhouse',
      phase: 'analytics',
      activeNodes: ['analytics', 'clickhouse'],
      activeArrow: { from: 'analytics', to: 'clickhouse' },
      message: 'Counters are periodically flushed to ClickHouse.',
      detail:
        'Every few minutes, the Analytics Service flushes Redis counters into ClickHouse (or BigQuery) for durable, ad-hoc historical queries — e.g. "clicks per country per day over the last 90 days."\n\nRedis gives speed for the live dashboard; ClickHouse gives durability and depth for analysis.',
      shortCode: 'aB3xK9z',
    },
  ]
}
