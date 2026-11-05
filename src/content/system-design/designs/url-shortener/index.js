import meta from './meta.js'

export default {
  ...meta,
  metaphor: 'A coat-check counter: you hand in a long URL and receive a short ticket. Anyone holding the ticket can redeem it later for the original coat, and the attendant keeps a tally of how often each ticket gets used.',
  interviewEnabled: true,

  requirements: {
    functional: [
      'Create: given a long URL, return a unique short link with a 7-character code',
      'Redirect: visiting a short link sends the user to the original URL',
      'Custom aliases: users can choose a memorable code instead of a generated one',
      'Expiration: links can optionally expire after a set time',
      'Deletion: owners can delete their links, which stop working immediately after',
      'Analytics: owners can see click counts, top referrers and top countries per link',
    ],
    nonFunctional: [
      'Low latency: redirects under 50 ms p99 on the server, and under 10 ms for cache hits (network time to the user not included)',
      'High availability: 99.99% for redirects. Creating links can tolerate lower availability, because a broken link hurts far more than a brief failure to create one',
      'Durability: a link that has been created must never be lost',
      'Uniqueness: a code maps to exactly one URL, always',
      'Consistency: a new link works immediately, while analytics can lag by a few seconds',
      'Security: codes are hard to enumerate, and known malicious destinations are blocked',
    ],
    scale: [
      '100M redirects/day ÷ 86,400 ≈ 1,160/sec average, ~3,500/sec at 3× peak',
      '1M new links/day ≈ 12 writes/sec, a 100:1 read-to-write ratio',
      'Storage: 1M/day × 5 years ≈ 1.8B rows × 500 bytes ≈ 915 GB',
      'Cache: ~5M distinct links clicked per day × ~1 KB per entry with overhead ≈ 5 GB',
      'Hit rate: only the first click per link each day misses a 24-hour cache, so ~95% hit, leaving ~175 database reads/sec at peak',
      'Code space: 62⁷ ≈ 3.5T codes, so 5 years of links uses about 0.05% of it',
    ],
    outOfScope: [
      'Accounts and authentication: a separate service handles these, and requests arrive with a verified user ID',
      'Editing a link\'s destination after it is created',
      'Advanced analytics such as device breakdowns and funnels',
      'Link previews and QR codes',
    ],
  },

  dataModel: [
    {
      entity: 'Link',
      note: 'One row per short link. The code is the primary key, so a redirect is a single-key lookup',
      fields: [
        { name: 'short_code', type: 'VARCHAR(20)', note: 'PK: 7 chars when generated, up to 20 for custom aliases' },
        { name: 'long_url',   type: 'TEXT',        note: 'The original destination' },
        { name: 'user_id',    type: 'BIGINT',      note: 'Owner, indexed so users can list their links' },
        { name: 'is_custom',  type: 'BOOLEAN',     note: 'TRUE if the owner chose the alias' },
        { name: 'expires_at', type: 'TIMESTAMP',   note: 'Nullable: NULL means the link never expires' },
        { name: 'deleted_at', type: 'TIMESTAMP',   note: 'Nullable: soft delete, so the code returns 410 and is never reused' },
        { name: 'created_at', type: 'TIMESTAMP',   note: 'Default NOW()' },
      ],
    },
    {
      entity: 'CodeRange',
      note: 'One small row that hands out blocks of IDs. It is updated about once every few minutes, not on every create',
      fields: [
        { name: 'name',       type: 'VARCHAR(20)', note: 'PK: "short_codes"' },
        { name: 'next_value', type: 'BIGINT',      note: 'Start of the next unallocated block' },
      ],
    },
    {
      entity: 'ClickEvent',
      note: 'Append-only, in a columnar analytics store rather than the main database',
      fields: [
        { name: 'short_code', type: 'VARCHAR(20)', note: 'Sort key with clicked_at. There is no foreign key: this store is separate' },
        { name: 'clicked_at', type: 'TIMESTAMP',   note: 'When the click happened' },
        { name: 'referrer',   type: 'TEXT',        note: 'HTTP Referer header' },
        { name: 'country',    type: 'CHAR(2)',     note: 'Resolved from the client IP, which is not stored' },
      ],
    },
  ],

  apiDesign: [
    {
      method:      'POST',
      path:        '/api/urls',
      description: 'Create a short link, optionally with a custom alias or an expiry',
      reqBody:     `Authorization: Bearer <token>\nIdempotency-Key: 7f3c9a10-2b\n\n{\n  "url": "https://example.com/very/long/path?ref=campaign",\n  "expires_in_days": 30,      // optional\n  "custom_alias": "my-launch" // optional\n}`,
      resBody:     `201 Created\n{\n  "short_url": "https://short.ly/aB3xK9z",\n  "short_code": "aB3xK9z",\n  "expires_at": "2026-12-15T00:00:00Z"\n}\n\n// 409 Conflict: custom alias already taken\n// 422 Unprocessable Entity: invalid or malicious URL\n// 429 Too Many Requests: rate limit exceeded`,
    },
    {
      method:      'GET',
      path:        '/{shortCode}',
      description: 'Redirect to the original URL. Public, and the path that handles almost all traffic',
      reqBody:     null,
      resBody:     `302 Found\nLocation: https://example.com/very/long/path?ref=campaign\n\n// 404 Not Found: the code never existed\n// 410 Gone: the link expired or was deleted`,
    },
    {
      method:      'GET',
      path:        '/api/urls/{shortCode}/stats?window=7d',
      description: 'Fetch a link\'s analytics. Owner only',
      reqBody:     `Authorization: Bearer <token>\n\n// window: 1d | 7d | 30d | all`,
      resBody:     `200 OK\n{\n  "short_code": "aB3xK9z",\n  "clicks": 14823,\n  "top_referrers": ["twitter.com", "google.com"],\n  "top_countries": ["US", "IN", "GB"]\n}\n\n// 403 Forbidden: the caller doesn't own this link`,
    },
    {
      method:      'DELETE',
      path:        '/api/urls/{shortCode}',
      description: 'Delete a link. Owner only. The code then returns 410 and is never reissued',
      reqBody:     `Authorization: Bearer <token>`,
      resBody:     `204 No Content\n\n// 403 Forbidden: the caller doesn't own this link`,
    },
  ],

  hldFlows: [
    {
      title: '1. Creating a link',
      description: 'Start with the simplest version of the product: turn a long URL into a short one. The API Gateway authenticates the request and applies rate limits. The Shortening Service validates the URL, takes the next ID from a block it already holds in memory, shuffles it, and encodes it as a 7-character code. It writes the row to the database first, because that is the source of truth, and then warms the cache. A custom alias skips ID generation, and the primary key rejects duplicates.',
      flow: [
        { label: 'Client',            icon: '💻', note: 'POST /api/urls' },
        { label: 'API Gateway',       icon: '🔀', note: 'Authenticate, rate limit, route' },
        { label: 'Shortening Service', icon: '⚙️', note: 'Validate, then next ID → shuffle → Base62' },
        [
          { label: 'Code Range', icon: '🔢', note: 'Hands out a new block only when one runs low' },
          { label: 'Database',   icon: '🗄️', note: 'Write the link: source of truth' },
          { label: 'Redis Cache', icon: '⚡', note: 'Warm it after the database write' },
        ],
      ],
    },
    {
      title: '2. Following a link',
      description: 'Redirects outnumber creates 100 to 1, so they get their own service that can scale separately. The Redirect Service checks Redis first, and about 95% of requests end there. On a miss, it reads the database and fills the cache for the next click. Before redirecting, it checks expiry and deletion, so the same check protects both paths. If Redis is down, it falls back to the database: a slower redirect beats a broken link, as long as the database can absorb the load.',
      flow: [
        { label: 'Client',           icon: '💻', note: 'GET /{shortCode}' },
        { label: 'API Gateway',      icon: '🔀', note: 'Routes to the Redirect Service' },
        { label: 'Redirect Service', icon: '⚙️', note: 'Cache first, check expiry, return 302' },
        [
          { label: 'Redis Cache', icon: '⚡', note: 'About 95% of requests, under 1 ms' },
          { label: 'Database',    icon: '🗄️', note: 'Only on a cache miss, then fills the cache' },
        ],
      ],
    },
    {
      title: '3. Counting clicks',
      description: 'Analytics must never be able to slow or break a redirect. So the Redirect Service sends the 302 first, then adds a click event to an in-memory buffer that is published to Kafka in batches. If Kafka is down, the buffer fills and old events are dropped: losing a few clicks is far better than losing redirects. The Analytics Service consumes the stream at its own pace, keeping live counters in Redis and durable history in ClickHouse. This is also why the redirect is a 302: a 301 lets browsers skip the server on repeat visits, and those clicks would never be counted.',
      preFlow: [
        { label: 'Client',           icon: '💻', note: 'GET /{shortCode}' },
        { label: 'Redirect Service', icon: '⚙️', note: 'Handles the request' },
      ],
      branches: [
        {
          label: 'Redirect (user waits)',
          nodes: [
            { label: 'Client', icon: '💻', note: '302 returned right away' },
          ],
        },
        {
          label: 'Analytics (user does not wait)',
          nodes: [
            { label: 'Kafka',             icon: '📨', note: 'Batched, after the response is sent' },
            { label: 'Analytics Service', icon: '📊', note: 'Consumes at its own pace' },
            [
              { label: 'Redis Counters', icon: '⚡', note: 'Live counts for dashboards' },
              { label: 'ClickHouse',     icon: '🗄️', note: 'Durable history for reports' },
            ],
          ],
        },
      ],
    },
    {
      title: '4. Deleting a link',
      description: 'A deleted link has to stop working despite the cache that makes redirects fast. The Shortening Service sets deleted_at in the database, then removes the code from Redis. The row stays, so the code returns 410 Gone and can never be reissued to someone else, which would silently send old links to a new destination. Expired links work the same way: the cache TTL never outlasts expires_at, and a background job clears old rows.',
      flow: [
        { label: 'Owner',              icon: '💻', note: 'DELETE /api/urls/{code}' },
        { label: 'API Gateway',        icon: '🔀', note: 'Authenticate, route' },
        { label: 'Shortening Service', icon: '⚙️', note: 'Check ownership' },
        [
          { label: 'Database',    icon: '🗄️', note: 'Set deleted_at: the code is never reused' },
          { label: 'Redis Cache', icon: '⚡', note: 'Delete the entry so redirects stop' },
        ],
      ],
    },
  ],

  keyPoints: [
    'Create path: take the next ID from an in-memory block, shuffle it, encode in Base62, write to the database, then warm the cache',
    'Redirect path: check Redis, fall back to the database on a miss, check expiry and deletion, then return a 302',
    'Range allocation gives short, unique codes with no coordination per request. A crash wastes some IDs, which is harmless with 3.5T available',
    'Shuffling with a keyed permutation makes codes hard to enumerate while keeping them unique. Simple XOR doesn\'t achieve this',
    '302 sends every click through your servers, which makes analytics, expiry and deletion possible. A 301 gives all of that up for lower load',
    'Publish click events after the response, in batches: an analytics outage should never affect redirects',
    'At the stated scale, a relational primary with a replica and a cache is enough. Sharding is for growth, not for 12 writes a second',
    'Before returning a 404, check the primary: a brand-new link may simply not have reached a replica yet',
  ],

  deepDive: [
    {
      level: 'mid',
      question: 'What properties must a short code have?',
      description: 'Before comparing ways to generate codes, pin down what a good one looks like. Every option in the next question gets judged against these three.',
      options: [
        {
          label: 'Property 1: Unique',
          content: 'Two different URLs must never share a code. A collision isn\'t a performance problem but a correctness bug: users are silently sent to the wrong destination.',
        },
        {
          label: 'Property 2: Short',
          content: 'Short enough to share and type. Seven Base62 characters give 62⁷ ≈ 3.5 trillion codes, and 5 years of links uses about 0.05% of them. Six would also fit (about 57B), but with less headroom for growth.',
        },
        {
          label: 'Property 3: Hard to enumerate',
          content: 'If codes are sequential, anyone can walk through them and scrape every link, including private documents people assumed were hidden.\n\nThis is easy to miss because it isn\'t about generation speed or correctness, and it rules out the simplest approach of encoding a plain counter.',
        },
      ],
    },
    {
      level: 'mid',
      question: 'How should you generate unique codes?',
      description: 'This is the central decision on the write path. Each approach trades off length, coordination and predictability differently.',
      options: [
        {
          label: 'Option 1: Hash the URL',
          content: 'Method: take the MD5 or SHA-256 of the URL and keep the first 7 characters.\n\nPros: no shared state, and the same URL always produces the same code.\n\nDrawback: truncation is the real problem. With billions of links, different URLs will collide, so every write needs a check-and-retry path. Two users shortening the same URL also end up sharing one code, which complicates ownership and analytics.',
        },
        {
          label: 'Option 2: UUID',
          content: 'Pros: any server can generate one with no coordination, and collisions are effectively impossible.\n\nDrawback: a UUID is 36 characters as text, or about 22 in Base62, which defeats the purpose of a short link. Truncating it brings back the collision problem.',
        },
        {
          label: 'Option 3: Snowflake IDs',
          content: 'Structure: a 64-bit integer built from a timestamp, machine ID and sequence.\n\nPros: unique and generated without coordination.\n\nDrawback: it encodes to about 11 Base62 characters, which doesn\'t fit our 7. Snowflake\'s main benefit is time ordering, and a URL shortener has no need for that.',
        },
        {
          label: 'Option 4: Random code with a uniqueness check',
          content: 'Method: generate 7 random characters and insert. If the code is taken, pick another.\n\nPros: very simple, and naturally unguessable. With 0.05% of the space used, collisions are rare.\n\nTrade-off: every create depends on a uniqueness check, and retries grow slowly as the space fills. It\'s a genuinely good choice at this scale, and worth saying so in an interview.',
        },
        {
          label: 'Option 5: Range allocation',
          badge: 'Chosen',
          content: 'Method: a small counter service hands each server a block of IDs, such as 10,000. The server issues them from memory, shuffling each one before encoding.\n  Example: block 1,000,000-1,009,999 → next ID → shuffle → Base62 → 0mfXDT8\n\nWhy this wins: codes are guaranteed unique with no check on the generated path, they always fit in 7 characters, and creating a link needs no coordination between servers. Refilling a block takes one small query every few minutes.\n\nTrade-off: one more small component to run, and a crash wastes the rest of a block, which is harmless with 3.5T codes available.',
        },
      ],
    },
    {
      level: 'mid',
      question: 'How should you encode IDs into short, URL-friendly strings?',
      description: 'A numeric ID is just a number, and the encoding decides how many characters it takes. Using 123456 as the example, compare how each one does.',
      options: [
        {
          label: 'Option 1: Hexadecimal (Base16)',
          content: 'Characters: 0-9 and a-f.\n  Example: 123456 → 1e240\n\nDrawback: only 16 symbols per character, so 7 characters give just 268M codes. We\'d use that up in under a year.',
        },
        {
          label: 'Option 2: Base64',
          content: 'Characters: A-Z, a-z, 0-9, + and /.\n  Example: 123456 → eJA\n\nPros: the most compact of these, with about 4.4T codes in 7 characters.\n\nDrawback: + and / have special meanings in URLs. The URL-safe variant swaps them for - and _, which fixes that, but trailing or leading symbols are still easy to lose when copying or when text wraps.',
        },
        {
          label: 'Option 3: Base62',
          badge: 'Chosen',
          content: 'Characters: 0-9, A-Z and a-z, with no symbols at all.\n  Example: 123456 → W7E\n\nWhy this wins: it\'s safe everywhere a link might appear, and it barely costs anything compared with Base64: 3.5T codes against 4.4T.\n\nPython implementation:\n  CHARS = \'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz\'\n  def base62_encode(n, width=7):\n      out = \'\'\n      while n > 0:\n          n, r = divmod(n, 62)\n          out = CHARS[r] + out\n      return out.rjust(width, \'0\')\n\nTrade-off: characters like 0 and O or l and I are easy to confuse when someone types a link by hand. If that matters for your product, Base58 removes them.',
        },
      ],
    },
    {
      level: 'mid',
      question: 'Should the redirect be a 301 or a 302?',
      description: 'This looks like a small detail, but the status code decides whether your servers see repeat clicks at all, which affects analytics, deletion and expiry.',
      options: [
        {
          label: '301 Moved Permanently',
          content: 'Browsers cache the mapping, potentially for a long time, and future visits skip your servers.\n\nPros: much less traffic, and faster repeat visits.\n\nCons: you can\'t count those clicks. You also can\'t reliably stop them: a deleted or expired link keeps working in any browser that has already cached it.\n\nBest for: permanent links where analytics and control genuinely don\'t matter.',
        },
        {
          label: '302 Found',
          badge: 'Chosen',
          content: 'Browsers don\'t cache it by default, so every click comes through your servers.\n\nWhy this wins: our requirements include analytics, expiry and deletion, and all three depend on seeing each request.\n\nTrade-off: more traffic. That\'s the cost of the 3,500 redirects/sec this design is built for.',
        },
        {
          label: 'The asymmetry',
          badge: 'Key Insight',
          content: 'These two choices aren\'t equally reversible. You can move from 302 to 301 whenever you like, but a 301 already cached in someone\'s browser can\'t be recalled, and clicks you never saw can\'t be recovered.\n\nWhen unsure, choose the option you can change later.',
        },
      ],
    },
    {
      level: 'mid',
      question: 'Which database should store the links?',
      description: 'Links are simple: one primary key, one main query, no joins on the hot path. That makes a key-value store sound obvious, but the numbers are worth checking first.',
      options: [
        {
          label: 'Option 1: Relational database (PostgreSQL, MySQL)',
          badge: 'Chosen',
          content: 'Why this wins: the load is small. There are 12 writes/sec, about 175 reads/sec after the cache, and about 915 GB after 5 years. One primary with a replica handles this comfortably.\n\nIt also gives you the primary key constraint that makes custom aliases safe, plus a simple index for listing a user\'s links, with tooling everyone knows.\n\nTrade-off: you\'ll have to shard by hand if growth far outruns the plan.',
        },
        {
          label: 'Option 2: Key-value store (DynamoDB, Cassandra)',
          content: 'Pros: a natural fit for single-key lookups, and scaling out is built in.\n\nCons: secondary queries like "my links" need extra design, conditional writes for aliases vary by product, and operating Cassandra takes real expertise.\n\nBest for: traffic far beyond this plan. It\'s a defensible answer if you can explain the limits you\'re expecting to reach.',
        },
        {
          label: 'How to answer this',
          badge: 'Decision Guide',
          content: 'Do the arithmetic before naming a technology. A common mistake is choosing a horizontally scaled store for a workload one machine can handle.\n\nThe strong answer: "Relational is enough at this scale. If writes reached thousands per second I\'d reconsider, and because the code is the key, the data would move cleanly."',
        },
      ],
    },
    {
      level: 'mid',
      question: 'How do you support custom aliases?',
      description: 'Some users want short.ly/my-launch instead of a generated code. It\'s a small feature with a few traps.',
      options: [
        {
          label: 'Let the primary key enforce uniqueness',
          content: 'Skip ID generation and insert the alias as short_code. If it\'s already taken, the database rejects the insert and the API returns 409 Conflict.\n\nDon\'t check first and insert second: two users could both pass the check at the same moment. The constraint is the only check that can\'t race.',
        },
        {
          label: 'Validate and reserve names',
          content: 'Allow letters, digits and hyphens, from 3 to 20 characters. Block names that clash with your own routes, such as api, admin and health, or an alias could take over a real endpoint. Block offensive words and brand names too, which are an abuse issue as well as a technical one.',
        },
        {
          label: 'Aliases and generated codes share a namespace',
          badge: 'Key Insight',
          content: 'A user might pick an alias that a future generated code would land on. It\'s very unlikely, but the design has to handle it.\n\nFix: generated-code inserts also rely on the primary key. On the rare conflict, take the next ID and try again. Because shards use a hash of the code, aliases and generated codes also route in exactly the same way.',
        },
      ],
    },
    {
      level: 'mid',
      question: 'What happens when the same URL is shortened twice?',
      description: 'It seems wasteful to create two codes for one URL, but returning the existing code causes more problems than it solves.',
      options: [
        {
          label: 'Option 1: Return the existing code',
          content: 'Pros: saves a little storage.\n\nDrawback: it needs a unique index on a hash of every URL, which adds cost to every write. Ownership also breaks: if two users share one code, whose analytics are they, who can delete it, and whose expiry wins?',
        },
        {
          label: 'Option 2: Create a new code every time',
          badge: 'Chosen',
          content: 'Why this wins: each link has one owner, its own analytics and its own expiry. Campaigns often want this on purpose, using separate links for email and social to compare them.\n\nTrade-off: some duplicate rows, at about 500 bytes each. Storage is the cheapest resource in this design.',
        },
        {
          label: 'Accidental duplicates are a different problem',
          badge: 'Key Insight',
          content: 'A double-click or a client retry shouldn\'t create two links. That\'s a question of request idempotency rather than URL deduplication.\n\nFix: the client sends an Idempotency-Key header. The server remembers it briefly, and returns the original response if the same key arrives again.',
        },
      ],
    },
    {
      level: 'senior',
      question: 'How does range allocation work in practice?',
      description: 'The idea is simple, but three details need answers: how a block is claimed safely, what happens on failure, and how to stop the output from being sequential.',
      options: [
        {
          label: 'Claiming a block',
          content: 'A single atomic update hands out each block, so two servers can never get the same one:\n  Example: UPDATE code_range SET next_value = next_value + 10000 RETURNING next_value\n\nAt 12 writes/sec, a block of 10,000 lasts about 14 minutes on a single server. That\'s very low load, so this table can sit on an ordinary small database.',
        },
        {
          label: 'What happens on failure',
          content: 'A server crash loses the unused part of its block. The IDs are never issued, which leaves a gap and nothing more. Even losing whole blocks every day would barely touch 3.5T codes.\n\nIf the counter service goes down, servers keep working from the blocks they hold. Refill before a block runs out, and you have minutes of warning instead of an instant outage.',
        },
        {
          label: 'Shuffling so codes aren\'t sequential',
          badge: 'Key Insight',
          content: 'Encoding the counter directly gives away the sequence:\n  Example: 0004C92, 0004C93, 0004C94, 0004C95\n\nUse a keyed permutation such as a small Feistel cipher. It maps every number to a different number in the same range, so uniqueness is preserved and no lookup table is needed:\n  Example: 0mfXDT8, 4eScIgb, PMv5L02, x8vrzrl\n\nSimple XOR with a secret doesn\'t work. It only flips the same bits each time, so neighboring IDs still produce nearly identical codes (OqNG, OqNH, OqNE), and the pattern is easy to spot.',
        },
      ],
    },
    {
      level: 'senior',
      question: 'How should the cache work?',
      description: 'The cache is what makes redirects fast and keeps the database small. Getting it right comes down to how entries get in, what they contain and how they leave.',
      options: [
        {
          label: 'Reads: cache-aside',
          content: 'On each redirect:\n  1. Look up the code in Redis\n  2. On a hit, check expiry and redirect, without touching the database\n  3. On a miss, read the database, fill the cache, then redirect\n\nStore expires_at in the entry along with the URL, so expiry can be checked without a database read.',
        },
        {
          label: 'Writes: warm on create',
          content: 'After the database write succeeds, add the new link to Redis. New links tend to get clicked right away, as people test and share them.\n\nWrite to the database first. If the cache write fails the link still exists and the next click fills the cache, whereas the reverse order could serve a link that was never saved.',
        },
        {
          label: 'Sizing and eviction',
          content: 'With about 5M distinct links clicked per day at about 1 KB each, the hot set is about 5 GB. A 24-hour TTL means only each link\'s first click of the day misses, which gives a hit rate of about 95%.\n\nUse allkeys-lru so the least recently used keys are evicted if memory fills. Keep the size comfortably above the hot set, and alert on hit rate: a drop usually means something has changed.',
        },
      ],
    },
    {
      level: 'senior',
      question: 'How do you handle viral links and lookups that don\'t exist?',
      description: 'Average numbers hide two dangerous cases. One link can suddenly receive a huge share of traffic, and codes that don\'t exist can bypass the cache altogether.',
      options: [
        {
          label: 'Cache stampede',
          content: 'When a very popular entry expires, thousands of concurrent requests all miss together and hit the database for the same row.\n\nFix: let only one request per server fetch from the database, while the others wait for its result (request coalescing). Adding random jitter to TTLs also stops many entries from expiring at the same moment.',
        },
        {
          label: 'Hot keys',
          content: 'A single Redis node can serve a lot, but one viral link could still overload the node holding it, and adding nodes doesn\'t help because the key lives in one place.\n\nFix: keep the hottest entries in a small in-process cache on each Redirect Service instance, for a few seconds. Most repeat lookups stop at the server, and the short lifetime limits staleness.',
        },
        {
          label: 'Nonexistent codes',
          content: 'A code that doesn\'t exist is never in the cache, so every attempt reaches the database. A bot trying random codes can turn this into an attack.\n\nFix: cache "not found" results for a short time, around 60 seconds, and rate limit by client. The create path must clear that entry, or a new link could return 404 until the entry expires.\n\nA Bloom filter of existing codes can block these lookups earlier, though it needs rebuilding as the data changes.',
        },
      ],
    },
    {
      level: 'senior',
      question: 'How do you avoid serving stale data?',
      description: 'Caches and replicas are always slightly behind the primary. In most systems that\'s fine, but two moments here are visible to users: right after a link is created and right after it is deleted.',
      options: [
        {
          label: 'A new link returns 404',
          content: 'If a cache miss reads a replica that hasn\'t received the row yet, someone opening a link they just created sees a 404. It looks like a broken product.\n\nFix: warming the cache on create covers most cases. If the lookup still finds nothing, check the primary before returning a 404. Nonexistent codes are uncommon, so this adds little load, and the negative cache absorbs the rest.',
        },
        {
          label: 'A deleted link keeps working',
          content: 'Without invalidation, a deleted link keeps redirecting until its 24-hour TTL expires. If someone deletes a link because it exposed something sensitive, that isn\'t acceptable.\n\nFix: delete the Redis entry as part of the delete request. A failed cache delete must be retried, so publish a message and let a worker retry it until it succeeds. In-process caches keep their lifetime to a few seconds, which sets the upper limit on how stale they can get.',
        },
        {
          label: 'Be honest about what you promise',
          badge: 'Key Insight',
          content: 'Our requirement says a deleted link stops working immediately, but that\'s only true to within a few seconds, and a browser that cached an old response could still follow it.\n\nA strong answer says this directly: state the actual window, explain what controls it, and mention that it\'s why this design avoids a 301.',
        },
      ],
    },
    {
      level: 'senior',
      question: 'How do you enforce expiration?',
      description: 'expires_at is only a stored value. The system still needs something to make it take effect, and then clean up afterwards.',
      options: [
        {
          label: 'Check on every read',
          content: 'After any lookup, compare expires_at with the current time, and return 410 Gone if it has passed.\n\nThis makes expiry correct the moment it happens, with no background process involved. Everything else here is just optimization and cleanup.',
        },
        {
          label: 'Align the cache TTL',
          content: 'Set the Redis TTL to the smaller of 24 hours and the time remaining until expiry. Entries then leave the cache by the time they expire, so the cache doesn\'t fill up with dead links.',
        },
        {
          label: 'Clean up in the background',
          content: 'Read checks leave expired rows in the database forever. A low-priority job can remove old rows in small batches to reclaim storage.\n\nIt doesn\'t affect correctness, so it can run whenever load is low. Keep a record of used custom aliases if you want to prevent them from being reissued to a new owner.',
        },
      ],
    },
    {
      level: 'senior',
      question: 'How would you scale the database if traffic grows far beyond the plan?',
      description: 'The stated scale doesn\'t require any of this, and saying so is part of a good answer. But interviewers often ask what happens at 100 times the load, and the two paths have different answers.',
      options: [
        {
          label: 'Reads: more cache, then replicas',
          content: 'The cache absorbs about 95% of reads, and misses go to read replicas. Replicas are simple to add, but each one applies every write too, so they do nothing for write capacity.\n\nBecause reads and writes run in separate services, each one can scale without affecting the other.',
        },
        {
          label: 'Writes: shard by a hash of the code',
          badge: 'Chosen',
          content: 'Method: shard = hash(short_code) mod the shard count, ideally using consistent hashing so adding shards moves as little data as possible.\n\nWhy this wins: a redirect always knows its shard from the code alone, and custom aliases route the same way as generated codes.\n\nTrade-off: listing a user\'s links now touches every shard, unless you keep a separate index by user_id.',
        },
        {
          label: 'Try it in the simulator',
          badge: 'Key Insight',
          content: 'The live simulator on this page lets you push traffic past the design peak and see this order for yourself. The app tier goes first, then the database under reads, then the database under writes.\n\nNotice that each fix solves one specific bottleneck and then reveals the next. That\'s a much stronger story than listing every technique up front.',
        },
      ],
    },
    {
      level: 'staff',
      question: 'How would you run this across multiple regions?',
      description: 'Reads and writes have very different needs here. Redirects must be fast everywhere, while creating a link is rare and tolerates some delay.',
      options: [
        {
          label: 'Reads: local in every region',
          content: 'Run Redis and database replicas in each region, so a redirect only travels to the nearest one. This removes the long-distance trip from nearly all traffic, which is the main benefit of going multi-region.',
        },
        {
          label: 'Approach 1: One primary region for writes',
          badge: 'Chosen',
          content: 'Other regions forward creates to the primary region.\n\nWhy this wins: writes are rare, and an extra 100-200 ms is acceptable when creating a link, unlike on every redirect. Custom aliases stay simple too, because one primary decides who owns each name.\n\nTrade-off: if the primary region fails, creating links stops until failover, although redirects keep working. That matches our requirement, which puts redirect availability first.',
        },
        {
          label: 'Approach 2: Writes in every region',
          content: 'Range allocation makes this possible for generated codes, because each region can hold its own blocks and they can\'t overlap.\n\nDrawback: custom aliases are the hard part. Two regions could accept the same alias at once, so you still need a single authority for aliases, or a globally consistent store. All of that complexity saves about 200 ms on an uncommon operation.',
        },
        {
          label: 'Don\'t forget replication lag',
          badge: 'Key Insight',
          content: 'A link created in the US might be opened in Europe before it has replicated. Someone sharing a link in a group chat can trigger this within seconds.\n\nFix: when a region can\'t find a code, it asks the primary region before returning a 404. This costs a slow lookup in a rare case, in exchange for never showing a false 404.',
        },
      ],
    },
    {
      level: 'staff',
      question: 'Should redirects be served from the edge?',
      description: 'A CDN or edge function could answer the most popular links from a location close to each user, without reaching your servers at all.',
      options: [
        {
          label: 'How it works',
          content: 'Put the short domain behind a CDN and run the lookup in an edge function, with a small key-value store or a short-lived cached response.\n\nPros: the lowest possible latency, and the origin is shielded from traffic spikes on viral links.',
        },
        {
          label: 'What it costs',
          content: 'Invalidation is the main risk. A deleted link can keep working until the edge entry expires, which weakens a requirement this design explicitly makes.\n\nAnalytics also get harder, because clicks answered at the edge never reach your servers. Events have to be sent from the edge or collected from CDN logs. Edge runtimes are also harder to debug and observe.',
        },
        {
          label: 'When it\'s worth it',
          badge: 'Decision Guide',
          content: 'Use it when users are spread across continents, and the latency left after regional deployment actually affects the product.\n\nStart with a short TTL, and consider caching only links that have no expiry and are unlikely to be deleted. Treat it as a later optimization, not part of the first design.',
        },
      ],
    },
    {
      level: 'staff',
      question: 'How do you count clicks without slowing redirects?',
      description: 'Each redirect creates a click event. The aim is useful analytics, with no way for that pipeline to affect the redirect path.',
      options: [
        {
          label: 'Publish after responding',
          content: 'The Redirect Service sends the 302, then adds the event to a bounded in-memory buffer that is published to Kafka in batches.\n\nThe bound is what matters. If Kafka is unavailable, the buffer fills and events get dropped, so memory can\'t grow until the server fails. A crash can lose a few seconds of clicks, which is acceptable for analytics. It wouldn\'t be for billing.',
        },
        {
          label: 'The Kafka stream',
          content: 'Event: short_code, timestamp, referrer and country, resolved at the edge of the system so the raw IP needn\'t be stored.\n\nScale: about 3,500 events/sec at peak is modest. A few partitions are enough, with a replication factor of 3 for fault tolerance.\n\nDon\'t partition by short_code, or a viral link will overload one partition. Clicks can be counted in any order, so distribute them evenly instead.',
        },
        {
          label: 'Two stores for two jobs',
          content: 'The Analytics Service writes to both of these:\n  1. Redis counters give live numbers cheaply\n  2. ClickHouse stores events in batches, for queries such as clicks per country over 90 days\n\nA live counter key might look like this:\n  INCR clicks:{short_code}:{YYYY-MM-DD-HH}\n\nKafka delivers at least once, so a consumer restart can double-count a few events. If analytics ever needs to be exact, deduplicate using an event ID.',
        },
      ],
    },
    {
      level: 'staff',
      question: 'How do you prevent abuse?',
      description: 'A shortener is attractive to attackers because it hides where a link really goes. Link reputation is a product risk too: if email providers start blocking your domain, every customer suffers.',
      options: [
        {
          label: 'Limit how fast links are created',
          content: 'Apply a sliding-window limit on POST /api/urls per user, with a broader one per IP. Return 429 with a Retry-After header.\n\nDon\'t rely only on IP limits, since a single office or mobile network can represent thousands of real users.',
        },
        {
          label: 'Check destinations',
          content: 'Check each URL against a threat list such as Google Safe Browsing before saving it, and return 422 if it\'s flagged. This adds some latency to creating links, which is rare, and none to redirects.\n\nRe-scan existing links on a schedule. A destination can turn malicious after the link is created, and flagged links should be disabled.',
        },
        {
          label: 'Make scraping impractical',
          content: 'Shuffled codes remove the sequence to walk through. With only about 0.05% of the code space in use, random guessing mostly finds nothing.\n\nRate limit redirects per client, and alert on clients with a high rate of 404s, which is a clear sign of scanning. Short links still aren\'t a security boundary, so anything sensitive needs real access control behind it.',
        },
      ],
    },
  ],

  levelExpectations: [
    {
      dimension: 'Code Generation',
      mid:    'Compare a few options against uniqueness and length; choose one and justify it',
      senior: 'Explain range allocation, including crash handling and why codes shouldn\'t be sequential',
      staff:  'Explain why XOR falls short and what a keyed permutation provides; extend it to multiple regions',
    },
    {
      dimension: 'Data & Scaling',
      mid:    'Estimate load and storage, then choose a database using those numbers',
      senior: 'Separate read and write scaling; shard by a hash of the code when that\'s justified',
      staff:  'Plan resharding, regional replication and the failover behavior for each path',
    },
    {
      dimension: 'Caching',
      mid:    'Add a cache with the cache-aside pattern, and explain why reads benefit most',
      senior: 'Derive the hit rate and size from the numbers; handle stampedes and hot keys',
      staff:  'Design layered caching (in-process, Redis, edge), stating how stale each layer can be',
    },
    {
      dimension: 'Correctness',
      mid:    'Explain 301 vs 302, and handle expiry with a check on read',
      senior: 'Prevent false 404s on new links, and make deletion take effect through the cache',
      staff:  'State the actual consistency window users experience, and what it would take to shrink it',
    },
    {
      dimension: 'Analytics & Abuse',
      mid:    'Keep click tracking out of the redirect path, using a queue',
      senior: 'Bound the buffer and define what\'s lost in a failure; add rate limits and URL checks',
      staff:  'Design for domain reputation, scanning detection and ongoing re-checks of destinations',
    },
  ],
}
