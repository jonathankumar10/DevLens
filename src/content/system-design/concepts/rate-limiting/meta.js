// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'rate-limiting',
  type:        'concept',
  title:       'Rate Limiting',
  category:    'scalability',
  tags:        ['rate-limiting', 'token-bucket', 'leaky-bucket', 'sliding-window', 'fixed-window', 'throttling', 'ddos-protection', 'api-abuse'],
  description: 'Rate limiting controls how many requests a client can make within a given time window. It protects backend services from being overwhelmed by traffic spikes, prevents API abuse, enforces fair usage across customers, and provides a first line of defense against DDoS attacks. The key design choices are the algorithm (token bucket, leaky bucket, sliding window) and the scope at which limits are applied (per user, per IP, per API key).',
}
