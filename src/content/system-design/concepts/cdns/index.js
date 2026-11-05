import meta from './meta.js'

export default {
  ...meta,
  metaphor:    'A chain of local warehouses — instead of shipping every order from one central factory, you pre-position inventory in cities close to your customers. Most orders ship in hours, not days.',
  howItWorks: [
    'Pull CDN (lazy population): edges start cold and populate on demand — the first request for a path is a miss that fetches from origin and caches the result, every request after is a hit. Simple to operate (no publish step) but a newly-deployed or rarely-hit asset causes a "thundering herd" of near-simultaneous origin fetches across edges.',
    'Push CDN (eager population): the origin proactively uploads content to every edge ahead of time, typically on publish. No cold-cache misses for known content — used for video segments and release bundles where the full asset set is known in advance. Costs more storage since every edge holds content regardless of local demand.',
    'Routing to the nearest edge: the client never explicitly picks a PoP. Anycast IP (many edges answer the same IP; BGP routes to the network-nearest one) or GeoDNS (the CDN\'s DNS server resolves the domain to a different edge IP based on the resolver\'s location) transparently sends each user to their nearest or lowest-latency edge.',
    'Cache invalidation: since an edge can hold a stale copy for the full TTL, sites need a way to force an update before then. Content-addressed URLs (app.abc123.js) sidestep the problem entirely — a new deploy is a new URL, so nothing needs purging. Mutable paths require an explicit purge/invalidate API call that propagates to every edge, which is slower and more operationally fragile than versioned URLs.',
  ],
  keyPoints: [
    'CDNs cache static assets at edge nodes close to users — reducing latency from 200 ms to < 20 ms',
    'Origin servers receive only a fraction of traffic once the CDN cache is warm',
    'Cache-Control headers tell the CDN how long to cache each response',
    'Dynamic or personalised content cannot be cached at the edge — only static or shared content can',
    'CDNs absorb DDoS traffic far from the origin, protecting infrastructure',
    'Pull CDNs populate lazily on first miss; push CDNs are eagerly uploaded ahead of demand — pull is simpler, push avoids cold-cache misses',
    'Content-addressed (versioned) URLs avoid cache invalidation entirely; mutable paths need an explicit purge that must reach every edge',
  ],
}
