import meta from './meta.js'

export default {
  ...meta,
  metaphor:    'A coat-check counter: you hand in a long URL and receive a short ticket (code). Anyone with the ticket can redeem it later for the original coat (URL).',
  interviewEnabled: true,

  requirements: {
    functional: [
      'Given a long URL, generate and return a unique short code (7 chars) — the CREATE operation',
      'Visiting the short URL redirects the user to the original long URL — the READ operation',
      'Short URLs can optionally expire after a configurable TTL',
      'Users can optionally request a custom alias (vanity URL) instead of an auto-generated code',
      'Track click analytics per short URL (count, referrer, country) — the UPDATE/INCREMENT operation, handled internally rather than as a public endpoint',
    ],
    nonFunctional: [
      'Low latency: redirects must complete in milliseconds (derived from "near real-time" + "efficiently") — < 10 ms p99',
      'High availability: 99.99% uptime, short links must never go dark (derived from "handle high traffic")',
      'High durability: mappings must survive server failures (derived from "persistent")',
      'Uniqueness: every short code maps to exactly one long URL, no collisions (derived from "unique")',
      'Security: prevent malicious/spam links and unauthorized access to analytics (derived from "millions of URLs" at "high traffic")',
      'Analytics lag up to a few seconds is acceptable (eventual consistency) — counts don\'t need to be real-time-exact',
    ],
    scale: [
      '100M DAU, 100:1 read/write ratio, ~1M new short URLs created/day',
      '~100M redirects/day → ~1,160/sec average (~3,500/sec at 3× peak); ~12 writes/sec average',
      'Storage: 500 bytes/row × 1M new rows/day × 5 years ≈ 1.8B rows ≈ ~915 GB',
      'Cache hot set: top 20% of URLs serve 80% of traffic → ~5 GB in Redis',
    ],
    outOfScope: [
      'Authentication/authorization for who can create URLs or view analytics',
      'User-initiated expiration or deletion of URLs',
      'Advanced analytics beyond click counts (geographic tracking, device types)',
    ],
  },

  dataModel: [
    {
      entity: 'URLMapping',
      note: 'One row per shortened URL — primary lookup table',
      fields: [
        { name: 'id',         type: 'BIGINT',     note: 'PK, auto-increment — used as Base62 input' },
        { name: 'short_code', type: 'VARCHAR(7)',  note: 'Unique index — fast lookup on every redirect' },
        { name: 'long_url',   type: 'TEXT',        note: 'The original destination URL' },
        { name: 'user_id',    type: 'BIGINT',      note: 'FK → User, nullable (anonymous links allowed)' },
        { name: 'is_custom',  type: 'BOOLEAN',     note: 'TRUE if user supplied the alias — skips the ID generator, still needs a uniqueness check' },
        { name: 'expires_at', type: 'TIMESTAMP',   note: 'NULL = never expires — checked on read, enforced by a background cleanup job' },
        { name: 'created_at', type: 'TIMESTAMP',   note: 'Default NOW()' },
      ],
    },
    {
      entity: 'Analytics',
      note: 'Append-only click log — write-heavy, analytics read separately',
      fields: [
        { name: 'id',         type: 'BIGINT',     note: 'PK' },
        { name: 'short_code', type: 'VARCHAR(7)',  note: 'FK → URLMapping.short_code' },
        { name: 'clicked_at', type: 'TIMESTAMP',   note: 'Event timestamp' },
        { name: 'referrer',   type: 'TEXT',        note: 'HTTP Referer header' },
        { name: 'country',    type: 'CHAR(2)',     note: 'Geo-resolved from client IP' },
      ],
    },
  ],

  apiDesign: [
    {
      method:      'POST',
      path:        '/api/urls/shorten',
      description: 'Create a short URL (optionally with a custom alias)',
      reqBody:     `{\n  "url": "https://example.com/very/long/path?ref=campaign",\n  "ttl_days": 30,\n  "custom_alias": "my-launch"   // optional\n}`,
      resBody:     `201 Created\n{\n  "short_url": "https://short.ly/aB3xK9z",\n  "short_code": "aB3xK9z",\n  "expires_at": "2026-07-15T00:00:00Z"\n}\n\n// 409 Conflict if custom_alias is already taken`,
    },
    {
      method:      'GET',
      path:        '/{shortCode}',
      description: 'Redirect to the original URL',
      reqBody:     null,
      resBody:     `302 Found\nLocation: https://example.com/very/long/path?ref=campaign\n\n// 410 Gone if the short code has expired\n// Use 301 only for permanent links where click analytics don't matter`,
    },
    {
      method:      'GET',
      path:        '/api/urls/{shortCode}/stats',
      description: 'Fetch click analytics',
      reqBody:     `Query params:\n  ?window=7d   // 1d | 7d | 30d | all`,
      resBody:     `200 OK\n{\n  "short_code": "aB3xK9z",\n  "clicks": 14823,\n  "top_referrers": ["twitter.com", "google.com"],\n  "top_countries": ["US", "IN", "GB"]\n}`,
    },
    {
      method:      'DELETE',
      path:        '/api/urls/{shortCode}',
      description: 'Delete a short URL (owner only)',
      reqBody:     null,
      resBody:     `204 No Content`,
    },
  ],

  hldFlows: [
    {
      title: '1. URL Shortening',
      description: 'Start with the simplest version of the product: turning a long URL into a short one. The client sends a POST request containing the long URL. The URL Shortening Service validates the input, generates a unique short code by encoding an auto-incremented ID in Base62, and persists the short_code → long_url mapping to the database before returning the short URL. If the client supplied a custom_alias instead, the service skips ID generation entirely and writes that string directly as short_code, relying on a DB uniqueness constraint to reject duplicates. No caching and no redirects yet — this stage is just the write path.',
      flow: [
        { label: 'Client',                  icon: '💻', note: 'POST /api/urls/shorten' },
        { label: 'URL Shortening Service',   icon: '⚙️', note: 'Validate + generate Base62 code' },
        { label: 'Database',                 icon: '🗄️', note: 'Persist short_code → long_url' },
      ],
    },
    {
      title: '2. URL Redirection',
      description: 'Now add the read path: following a short link back to its destination. The system handles two distinct request types — POST to shorten, GET to redirect — so an API Gateway is introduced to route each one to the right handler. On a GET, the Redirection Handler checks Redis first: a cache hit returns the redirect in under 1 ms. On a cache miss, it falls back to the database and warms the cache so the next request for that code is fast too. Before issuing the redirect, the handler also checks expires_at — an expired mapping returns 410 Gone instead.',
      flow: [
        { label: 'Client',           icon: '💻', note: 'GET /{shortCode}' },
        { label: 'API Gateway',      icon: '🔀', note: 'Route GET → redirect handler' },
        { label: 'Request Handler',  icon: '⚙️', note: 'Cache-first lookup' },
        [
          { label: 'Redis Cache', icon: '⚡', note: 'Checked first — < 1 ms on hit' },
          { label: 'Database',    icon: '🗄️', note: 'Fallback only on cache miss' },
        ],
      ],
    },
    {
      title: '3. Link Analytics',
      description: 'Once redirects work, the product needs to know which links get clicked. The redirect path must stay fast even as analytics gets bolted on, so the two concerns are decoupled right at the API Gateway: it fans out each request to the Redirect Handler (the user-facing path) and publishes a click event toward the Analytics pipeline without making the user wait for it. This is also why the redirect must be a 302 (temporary), not a 301 — a 301 lets browsers cache the mapping and skip the server entirely on repeat visits, so the server would never see most clicks. The click event lands on Kafka first (a fire-and-forget write, sent after the redirect response is already on its way back to the user), so the Analytics Service can consume it asynchronously: it increments Redis counters for real-time dashboards and periodically flushes those counters to a durable store for historical queries.',
      preFlow: [
        { label: 'Client',      icon: '💻', note: 'GET /{shortCode}' },
        { label: 'API Gateway', icon: '🔀', note: 'Fan-out to both paths' },
      ],
      branches: [
        {
          label: 'Redirect path',
          nodes: [
            { label: 'Request Handler', icon: '⚙️', note: '302 redirect — must hit the server every time' },
            [
              { label: 'Redis Cache', icon: '⚡', note: 'Checked first — URL lookup' },
              { label: 'Database',    icon: '🗄️', note: 'Fallback only on cache miss' },
            ],
          ],
        },
        {
          label: 'Analytics path',
          nodes: [
            { label: 'Kafka',             icon: '📨', note: 'Fire-and-forget click event, after the redirect is sent' },
            { label: 'Analytics Service', icon: '📊', note: 'Consumes the stream asynchronously' },
            { label: 'Redis Counters',    icon: '⚡', note: 'INCR short_code count — real-time reads' },
            { label: 'ClickHouse',        icon: '🗄️', note: 'Periodic flush — durable historical queries' },
          ],
        },
      ],
    },
  ],

  keyPoints: [
    'Write path: validate → encode auto-increment ID in Base62 → persist to DB → warm Redis cache',
    'Read path: parse 7-char code → Redis GET (< 1 ms) → check expiry → 302 redirect; DB fallback on cache miss',
    '7-char Base62 yields 62⁷ ≈ 3.5 trillion unique codes — effectively unlimited at any scale',
    '301 (permanent) lets browsers cache forever; 302 (temporary) routes every click through your server for analytics',
    'Decouple analytics: publish click events to Kafka; consume asynchronously into ClickHouse — keeps redirect path read-only against Redis',
    'Fail-open on Redis outage: fall back to DB reads rather than returning errors — a slower redirect beats a broken link',
    'Expired links: cache TTL ≤ expires_at so stale entries fall out of Redis naturally; a periodic job deletes expired rows from the DB to reclaim storage',
    'Custom aliases skip the ID generator entirely — the user-chosen string is written directly as short_code after a uniqueness check',
  ],

  deepDive: [
    {
      level: 'mid',
      question: 'What two properties must the short code ID satisfy?',
      description: 'The basic idea behind URL generation is creating a unique integer ID for each URL, then encoding it into a shorter human-readable format. The ID must satisfy two core properties:',
      options: [
        {
          label: 'Property 1: Global Uniqueness',
          content: 'Two different long URLs must never map to the same short code. A collision is a correctness bug — users would silently be redirected to the wrong destination.\n\nThis rules out any approach that requires truncation (like MD5/SHA), since truncating a hash reintroduces collision probability.',
        },
        {
          label: 'Property 2: Shortness',
          content: 'The code must be short enough to be practical. Production shorteners use 5–8 characters:\n  • bit.ly: 7 chars (e.g., bit.ly/aB3xK9z)\n  • t.ly: 5 chars (e.g., t.ly/ecgGp)\n  • TinyURL: 8 chars (e.g., tinyurl.com/e9enh3uz)\n\nWith Base62 and 7 chars: 62⁷ ≈ 3.5 trillion combinations — sufficient for any realistic scale. This rules out UUID (36 chars) and plain Snowflake IDs (18 decimal digits).',
        },
      ],
    },
    {
      level: 'mid',
      question: 'What are the options for generating unique IDs for each URL?',
      description: 'There are several approaches to generating unique integer IDs. Note: "integer" means a whole number representable in different number systems — e.g., 123456 in decimal is 0x1e240 in hex.',
      options: [
        {
          label: 'Option 1: Hash Functions',
          content: 'MD5: produces a 128-bit hash value, fast but prone to collisions — not suitable for guaranteed unique ID generation.\n  Example: md5("url") → c984d06aafbecf6bc55569f964148ea3 (32 hex chars)\n\nSHA-256: 256-bit hash, more collision-resistant but 64 chars long — far too long for URL shortening.\n  Example: e3b0c44298fc1c149afbf4c8996fb924...\n\nTruncating to 7 chars reintroduces collision risk. Double hashing adds complexity without solving length.',
        },
        {
          label: 'Option 2: UUID',
          content: 'UUIDv4: relies on randomness, 122-bit ID space making collisions extremely unlikely. However the 36-character output is still too long for URL shortening.\n  Example: f47ac10b-58cc-4372-a567-0e02b2c3d479\n\nUUIDv1: uses timestamp + MAC address, unique but leaks machine identity and generation time.',
        },
        {
          label: 'Option 3: Snowflake IDs',
          content: 'Structure: combines a timestamp, machine ID, and sequence number into a 64-bit integer — designed for distributed systems.\n  Example: 130267849091223552 (18 decimal digits)\n\nDrawback: Snowflake IDs are unique and timestamp-based, but the 64-bit integer Base62-encodes to ~10 chars — workable but not as compact as a pure sequence approach.',
        },
        {
          label: 'Option 4: Machine ID + Sequence Number',
          badge: 'Chosen',
          content: 'Method: assign each machine a unique prefix (1–2 chars). Each machine increments its own sequence counter independently.\n  Example: Machine "A1", sequence 0001 → ID "A10001" → Base62-encoded short code\n\nWhy this wins:\n• Fully controlled length — adjust prefix + sequence size to fit\n• Write paths are completely independent — no cross-machine coordination or distributed locks\n• Scale by adding machines with new prefixes\n• The database shards using the same Machine ID prefix, so reads route correctly on cache miss',
        },
      ],
    },
    {
      level: 'mid',
      question: 'How can we encode the unique IDs into short, user-friendly URLs?',
      description: 'After generating a unique integer ID, we encode it into a shorter, readable string. The encoding must balance compactness with URL safety — avoiding characters that require percent-encoding.',
      options: [
        {
          label: 'Option 1: Hexadecimal (Base16)',
          content: 'Characters: digits 0–9 and letters a–f (16 possible chars).\n  Example: 123456 → "1e240" in hex\n\nPros: widely recognized, simple to implement.\nCons: not compact enough — a 64-bit integer in hex requires 16 chars. Too long for URL shortening.',
        },
        {
          label: 'Option 2: Base64',
          content: 'Characters: A–Z, a–z, 0–9, +, /, = (64 chars).\n  Example: 123456 → "MTIzNDU2" in Base64\n\nPros: more compact than hex.\nCons: uses +, /, and = which are reserved in URLs and require percent-encoding, making short URLs ugly and breakable in some contexts.',
        },
        {
          label: 'Option 3: Base62',
          badge: 'Chosen',
          content: 'Characters: A–Z, a–z, 0–9 (62 chars — zero special characters).\n  Example: 123456 → "W7E" in Base62\n\nWith 7 chars: 62⁷ ≈ 3.5 trillion unique codes — more than enough at any realistic scale.\n\nPython implementation:\n  CHARS = \'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\'\n  def base62_encode(n):\n      if n == 0: return CHARS[0]\n      out = \'\'\n      while n > 0:\n          n, r = divmod(n, 62)\n          out = CHARS[r] + out\n      return out\n\nWhy Base62 wins: URL-safe, no special chars, compact, and the character set is human-readable and easy to type.',
        },
      ],
    },
    {
      level: 'mid',
      question: 'When should you use 301 vs 302 for the redirect?',
      description: 'The HTTP redirect status code determines whether browsers and CDNs cache the short-to-long URL mapping, which has significant performance and analytics implications.',
      options: [
        {
          label: '301 Moved Permanently',
          content: 'Tells browsers and CDNs to cache the mapping indefinitely. Future visits from the same browser never reach your servers.\n\nPros: massive performance win, eliminates server cost for repeat visitors.\nCons: you lose analytics data — browsers bypass your server entirely. And if you ever need to change the destination URL, cached 301s are nearly impossible to invalidate.\n\nBest for: permanent reference links where analytics do not matter.',
        },
        {
          label: '302 Found (Temporary)',
          content: 'Bypasses the browser cache. Every click routes through your servers, so you can record analytics, check expiry, and change the destination URL later.\n\nPros: accurate click analytics, supports mutable destinations.\nCons: every redirect incurs server round-trip latency. At 100M clicks/day this is significant infrastructure cost.\n\nBest for: marketing campaigns, short-lived links, any scenario where analytics matter.',
        },
        {
          label: 'Decision Guide',
          badge: 'Decision Guide',
          content: 'Practical rule:\n  • Marketing / campaign links → 302 (analytics are valuable)\n  • Permanent reference links → 301 (eliminate server load)\n  • Default when unsure → 302 (safer choice)\n\nCritical: you cannot retroactively recover click data from 301-cached requests. If analytics might matter later, start with 302. You can switch to 301 later, but you cannot undo lost analytics.',
        },
      ],
    },
    {
      level: 'mid',
      question: 'How do you support user-requested custom aliases?',
      description: 'Some users want a memorable code (e.g., short.ly/my-launch) instead of an auto-generated one. This changes the write path and has knock-on effects for sharding.',
      options: [
        {
          label: 'Skip the ID Generator',
          content: 'When custom_alias is present in the request, skip Base62 encoding entirely and attempt to write the user-supplied string directly as short_code.\n\nThe ID generator (and its Machine ID prefix) is only used for auto-generated codes — custom aliases bypass it completely.',
        },
        {
          label: 'Uniqueness Check Before Insert',
          content: 'Rely on a UNIQUE constraint on short_code and catch the insert conflict, or SELECT first if a pre-check is preferred.\n\nReturn HTTP 409 Conflict if the alias is already taken, with a clear error message so the client can prompt the user for a different alias.',
        },
        {
          label: 'Validation & Reserved Namespace',
          content: 'Whitelist the character set (alphanumeric + hyphen, no spaces) and cap length (e.g., 3–20 chars).\n\nReject aliases that collide with the app\'s own routes (api, admin, health, etc.) — otherwise a custom alias could shadow an internal endpoint.',
        },
        {
          label: 'Sharding Implication',
          badge: 'Key Insight',
          content: 'The read-path optimization that derives the DB shard from the first character of the code (the Machine ID prefix) does not hold for arbitrary user strings.\n\nFix: route custom-alias lookups through a separate index (or a dedicated shard) keyed by short_code directly, since there\'s no embedded shard key to extract on a cache miss.',
        },
      ],
    },
    {
      level: 'senior',
      question: 'How do you enforce short URL expiration?',
      description: 'expires_at is stored on write, but the system needs an active mechanism to actually stop serving — and eventually clean up — expired links.',
      options: [
        {
          label: 'Lazy Check on Read',
          content: 'On every redirect, after the cache/DB lookup returns a mapping, compare expires_at to now(). If expired, return 410 Gone instead of a redirect.\n\nThis is correct instantly — no background process needs to run for the system to stop honoring an expired link.',
        },
        {
          label: 'Cache TTL Tied to Expiration',
          content: 'Set the Redis TTL to min(default_ttl, expires_at - now()) when warming the cache, instead of a flat 24 h.\n\nThis way an expired mapping naturally falls out of Redis at (or before) its expiration time — no stale "still valid" cache entries can outlive the row.',
        },
        {
          label: 'Background Cleanup Job',
          content: 'Lazy checks alone leave dead rows in the database forever, bloating storage and indexes. Run a periodic batch job (e.g., hourly) that deletes rows where expires_at < now().\n\nThis is a low-priority background job — it only reclaims storage, it does not affect correctness (the lazy check already guarantees expired links 410 before this job ever runs).',
        },
      ],
    },
    {
      level: 'senior',
      question: 'How do you scale ID generation horizontally using sharding?',
      description: 'Request handlers are stateless HTTP servers — they scale trivially with more instances. The ID generator is the bottleneck because it must produce globally unique IDs under concurrent load.',
      options: [
        {
          label: 'Sharding Strategy: Machine ID as Shard Key',
          content: 'Assign each machine a unique prefix (1–2 chars). Each machine appends an incrementing sequence number to generate IDs.\n  Example: Machine "A1", sequence 0001 → short code "A10001" → Base62-encoded\n\nThe database is sharded using the same Machine ID prefix. This means each machine writes exclusively to its own DB shard — no cross-machine coordination, no distributed locks. Linear horizontal scalability: adding a machine = new prefix = new DB shard.',
        },
        {
          label: 'Write Path Independence',
          content: 'The primary benefit: write paths are completely independent across machines.\n\nMachine A writes to Shard A. Machine B writes to Shard B. They never interact. Under high write load you add machines without affecting existing ones — each new machine is self-sufficient from day one.\n\nThis is why we choose Machine ID over Snowflake IDs: Snowflake requires synchronized timestamps and a global machine registry. Machine ID + sequence requires only a startup configuration.',
        },
        {
          label: 'Read Path Routing',
          content: 'On a cache hit (Redis), the DB is never touched — no routing needed.\n\nOn a cache miss, the server extracts the Machine ID prefix from the short code to route the lookup to the correct DB shard.\n  Example: short code "a82c7w" → prefix "a" → DB Shard A\n\nThis makes reads as independent as writes — no cross-shard queries needed. The prefix is embedded in every short code by design.',
        },
        {
          label: 'Scaling Request Handlers vs ID Generator Independently',
          badge: 'Key Insight',
          content: 'Request Handlers and ID Generators have different resource profiles:\n\nRequest Handlers: primarily I/O bound (handling HTTP connections, holding open sockets). Need many instances for concurrency.\n\nID Generator / URL Shortening Service: CPU + I/O bound (generating IDs, writing to DB). Fewer instances needed per unit of throughput.\n\nThis asymmetry means you should NOT enforce 1:1 scaling between them. Request Handlers scale out faster. ID Generator machines can randomly pick from the pool of handler instances to balance load.',
        },
      ],
    },
    {
      level: 'senior',
      question: 'Should you pre-generate IDs in bulk, or generate on demand?',
      description: 'One potential bottleneck: under high write load, generating a new unique ID for each request and persisting it to the DB on the critical path may be too slow.',
      options: [
        {
          label: 'On-Demand Generation',
          content: 'Generate a new ID when each shorten request arrives, write it to the DB, then return the short code.\n\nPros: simple, no wasted IDs, easy to reason about state.\nCons: every shorten request requires a synchronous DB write. Under sudden traffic spikes, DB contention can spike write latency above acceptable thresholds.',
        },
        {
          label: 'Bulk Pre-Generation',
          content: 'Each machine pre-generates a batch of IDs on startup (or when the current batch runs low), stores them in memory, and hands them out without hitting the DB.\n\nPros:\n• Absorbs burst traffic — IDs available instantly from memory\n• Lower latency — no DB round-trip in the critical path\n\nCons:\n• More complex: must track batch state, handle machine restarts, avoid handing out duplicate IDs after crash recovery\n• ID waste: if a machine crashes with an unused batch, those IDs are lost (gaps in sequence — acceptable)',
        },
        {
          label: 'Recommendation',
          badge: 'Chosen',
          content: 'Start with on-demand generation. Measure DB write latency under peak load before adding complexity.\n\nIf DB write latency exceeds 50 ms under peak traffic, introduce bulk pre-generation with:\n  • Batch size: 1,000–10,000 IDs per machine\n  • Persist the high-water mark to durable storage to survive restarts\n  • Monitor batch exhaustion rate to tune batch size\n\nThis follows the principle: optimize only what you can measure, not what you can imagine.',
        },
      ],
    },
    {
      level: 'senior',
      question: 'How does the Redis caching layer work and what is the eviction strategy?',
      description: 'The cache is what makes the redirect path fast. The 80/20 rule applies strongly here: 20% of URLs receive 80% of traffic, so a modest Redis instance can absorb the vast majority of reads.',
      options: [
        {
          label: 'Write Path: Cache Warming',
          content: 'After a successful DB insert, immediately SET the mapping in Redis:\n  SET short_code long_url EX 86400  (24-hour TTL)\n\nThis "warms" the cache for the new URL before any user visits it. Cache-aside write ensures the first redirect after shortening is a cache hit.',
        },
        {
          label: 'Read Path: Cache-Aside',
          content: 'On every redirect request:\n  1. GET short_code from Redis\n  2. If hit (< 1 ms): return 301/302 redirect immediately — DB is never touched\n  3. If miss: query DB, SET result in Redis (lazy population), then redirect\n\nThis is the "cache-aside" pattern. The handler explicitly manages cache population rather than relying on a read-through proxy.',
        },
        {
          label: 'Eviction Strategy',
          content: 'Redis policy: allkeys-lru — evicts the least-recently-used keys when memory is full.\n\nSizing: with the 80/20 rule, ~5 GB of hot URLs serves ~80% of all traffic. Size Redis to hold the hot set comfortably with headroom.\n\nCache miss rate target: below 5%. A spike in misses usually means:\n  • A wave of new unique URLs (expected, temporary)\n  • TTL misconfiguration (investigate)\n  • Unusual traffic pattern (e.g., a viral link to a cold URL)\n\nNever use TTL=0 (infinite) for all keys — deleted short URLs would persist and serve stale data.',
        },
      ],
    },
    {
      level: 'staff',
      question: 'Should redirects be served from the edge (CDN) instead of origin servers?',
      description: 'Regional Redis replicas already get reads close to users. The next lever is skipping the origin entirely for the hottest codes.',
      options: [
        {
          label: 'Edge Redirect Logic',
          content: 'Deploy the short-URL domain behind a CDN (Cloudflare, Fastly) and run the redirect lookup in an edge function (Cloudflare Workers, Lambda@Edge).\n\nHot codes resolve at the nearest Point of Presence without a round trip to any region\'s origin servers — shaving latency beyond what regional Redis replicas alone achieve.',
        },
        {
          label: 'Trade-offs',
          content: 'Edge runtimes have restricted language/library support and are harder to debug and observe than a normal service.\n\nInvalidation lag is the real risk: if a destination URL changes, expires, or is deleted, the edge cache may keep serving the old mapping until its TTL lapses — worse than the DB-backed staleness window of regional caching.',
        },
        {
          label: 'When It Is Worth It',
          badge: 'Decision Guide',
          content: 'Only pays off once your user base is meaningfully cross-continental and the marginal latency below the regional-cache floor actually matters to the product.\n\nIf traffic is concentrated within a few regions, multi-region Redis replicas (already in the design) capture most of the benefit at a fraction of the operational complexity. Add edge redirects as a later optimization, not a day-one requirement.',
        },
      ],
    },
    {
      level: 'staff',
      question: 'How do you design multi-region active-active while guaranteeing uniqueness?',
      description: 'Multi-region deployment has two very different problems: the read path (easy) and the write path (hard). They must be solved independently.',
      options: [
        {
          label: 'Read Path (Trivial)',
          content: 'Replicate Redis and DB read replicas to every region. Serve redirect reads locally — no cross-region traffic needed.\n\nResult: redirect latency is sub-10 ms globally regardless of user location. This is the primary win of multi-region deployment.',
        },
        {
          label: 'Approach 1: Single Primary Region for Writes',
          content: 'Route all write requests (POST /api/urls/shorten) to a designated primary region. Other regions proxy the write through.\n\nPros: simple, no ID coordination across regions.\nCons: write latency for distant users is ~100–200 ms higher due to the cross-region round-trip.\n\nAcceptable? Yes — shortening happens rarely compared to redirecting. A user tolerates 200 ms to create a link; they would not tolerate 200 ms on every redirect.',
        },
        {
          label: 'Approach 2: Partitioned ID Space',
          badge: 'Chosen',
          content: 'Assign each region a unique datacenter bit in the Snowflake-style ID structure. Each region generates IDs in a completely disjoint range — no cross-region coordination needed for ID generation.\n\nReplication: after writing locally, the new mapping propagates to other regions asynchronously (~200 ms).\n\nUser impact: a link created in us-east takes ~200 ms to resolve in eu-west. This is invisible to users — they share the link after creation, not before.\n\nTrade-off: requires datacenter ID management and cross-region replication monitoring. More infrastructure to maintain, but eliminates the write latency penalty for distant users.',
        },
      ],
    },
    {
      level: 'staff',
      question: 'How do you handle analytics at 100 million clicks/day without slowing redirects?',
      description: 'The key insight: analytics writes must be completely decoupled from the redirect path. Any synchronous analytics work on the critical path is a latency and availability risk.',
      options: [
        {
          label: 'Decoupling Architecture',
          content: 'On every GET request, the redirect handler:\n  1. Sends the 301/302 redirect immediately (< 10 ms)\n  2. Fire-and-forgets a click event to Kafka after the response is sent\n\nThe user never waits for analytics. An analytics pipeline outage (Kafka down, Analytics Service down) has zero impact on redirect availability.',
        },
        {
          label: 'Kafka Event Stream',
          content: 'Event payload: { short_code, timestamp, ip, referer, user_agent }\n\nScale: 100M clicks/day ≈ 1,160 events/sec average, ~3,500/sec at peak — well under a single Kafka partition\'s ~100K msg/sec ceiling. Even so, run 3 partitions with RF=3 (replication factor 3) for fault tolerance, not throughput — the volume itself doesn\'t demand it.\n\nConsumers can lag behind by minutes during spikes — the redirect path is unaffected.',
        },
        {
          label: 'Analytics Service + Storage',
          content: 'The Analytics Service consumes the Kafka stream and:\n  1. Increments Redis counters: INCR rl:{short_code}:{YYYY-MM-DD-HH}\n  2. Periodically (every 5 min) flushes counters to ClickHouse or BigQuery\n\nRedis provides real-time counts (dashboard can show "clicks in the last hour"). ClickHouse provides historical ad-hoc queries ("clicks per country per day over the last 90 days").\n\nThis two-tier approach gives both speed and durability at scale.',
        },
      ],
    },
    {
      level: 'staff',
      question: 'How do you prevent abuse — link spam, phishing, and enumeration attacks?',
      description: 'A public URL shortener is an attractive abuse target: spammers can use it to obscure phishing URLs, and sequential short codes are enumerable. Defense requires multiple independent layers.',
      options: [
        {
          label: 'Rate Limiting',
          content: 'Apply a Redis sliding-window counter on POST /api/urls/shorten by two keys:\n  • IP address: catches unauthenticated bulk creation\n  • User ID: catches authenticated quota abuse\n\nReject at HTTP 429 after N requests/minute. Return Retry-After header so well-behaved clients back off gracefully.\n\nDo NOT rely solely on IP-based limiting — one NAT gateway can represent thousands of legitimate users.',
        },
        {
          label: 'Safe Browsing API',
          content: 'Before persisting a new mapping, check the destination URL against Google Safe Browsing or VirusTotal.\n\nReject known phishing, malware, and spam URLs synchronously — return HTTP 422 with a clear error message.\n\nLatency cost: ~50 ms added to the write path. Acceptable since shortening is rare and the safety benefit is high.\n\nAlso implement async re-scanning: periodically re-check existing URLs against updated threat databases. Malicious content may not be flagged at creation time.',
        },
        {
          label: 'Non-Guessable Codes',
          content: 'Base62 encoding of sequential IDs is predictable — an attacker can enumerate codes sequentially to scrape all stored URLs.\n\nFix: XOR-mask the integer with a per-deployment secret before Base62 encoding.\n  encode(id XOR SECRET) → appears random, but SECRET lets you decode it server-side\n\nThe codes appear random while remaining efficiently decodable. No lookup table or DB query needed to validate a code.\n\nCombine with GET rate limiting (by IP + user agent) as a backstop against enumeration even if the XOR mask is discovered.',
        },
      ],
    },
  ],

  levelExpectations: [
    {
      dimension: 'ID Generation',
      mid:    'Explain uniqueness + shortness requirements; propose one valid approach',
      senior: 'Compare hash vs UUID vs Snowflake vs Machine ID with trade-offs for each',
      staff:  'Design ID coordination across regions; handle clock skew and machine failures',
    },
    {
      dimension: 'Encoding Strategy',
      mid:    'Explain Base62 encoding and calculate the ID space (62⁷ ≈ 3.5T)',
      senior: 'Compare Base16/Base62/Base64 trade-offs; explain why special URL chars matter',
      staff:  'Consider encoding implications for analytics, debugging, and obfuscation',
    },
    {
      dimension: 'Scaling Strategy',
      mid:    'Understand sharding concept and why it enables horizontal scaling',
      senior: 'Design a shard key strategy; explain write-path independence and read routing',
      staff:  'Handle shard rebalancing, hot shards, and cross-region consistency trade-offs',
    },
    {
      dimension: 'Caching & Performance',
      mid:    'Include a cache layer; explain the cache-aside read pattern',
      senior: 'Calculate cache hit ratios; design TTL and invalidation strategy',
      staff:  'Design multi-tier caching; handle cache stampede and thundering herd',
    },
  ],
}
