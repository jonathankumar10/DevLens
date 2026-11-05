// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'rate-limiter',
  type:        'design',
  title:       'Design a Rate Limiter',
  category:    'designs',
  tags:        ['rate-limiting', 'token-bucket', 'sliding-window', 'redis', 'api-gateway', 'distributed-rate-limiter', 'lua-script', 'throttling'],
  description: 'Design a distributed rate limiting service that enforces per-user, per-IP, or per-API-key request quotas across a fleet of API gateway nodes. The system must be accurate under concurrent requests, work consistently regardless of which gateway node a request hits, handle millions of unique identifiers, and fail open (pass traffic through) when the rate limiter itself becomes unavailable.',
}
