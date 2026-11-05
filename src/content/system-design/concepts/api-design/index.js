import meta from './meta.js'

export default {
  ...meta,
  metaphor:    'Designing a public door — it must be clearly labelled, wide enough for everyone, safe to open repeatedly, and must not break when the building is renovated. A good API is a contract that outlasts the code behind it.',
  howItWorks: [
    'REST maps CRUD operations to HTTP verbs on resource URLs. GET retrieves without side effects, POST creates, PUT/PATCH updates, DELETE removes. The URL is the noun, the HTTP verb is the action.',
    'An API gateway handles cross-cutting concerns centrally: authentication (JWT/API key validation), rate limiting, request routing, versioning, and structured error formatting before requests reach backend services.',
    'Versioning keeps the API stable as it evolves. URL versioning (/v1/, /v2/) is explicit and cache-friendly. Within a version, only backward-compatible changes are allowed — add optional fields, never remove required ones.',
    'Pagination prevents unbounded responses. Cursor-based pagination (return a next_cursor token) is stable when rows are inserted between pages. Offset pagination is simpler but drifts when data changes.',
    'Rate limiting uses token bucket or sliding window algorithms to cap requests per user/key per time window. Return 429 with Retry-After and X-RateLimit-Remaining headers so clients back off intelligently.',
    'Idempotency keys enable safe retries on POST endpoints. The server stores the key + response for 24 hours; duplicate requests return the stored result without re-executing, preventing double charges or duplicate resources.',
  ],
  keyPoints: [
    'Version your API from day one — /v1/ in the URL; breaking changes are inevitable',
    'Paginate all list endpoints — never return unbounded result sets (use cursor-based pagination for large datasets)',
    'Idempotent methods (PUT, DELETE, GET) can be safely retried — design POST endpoints carefully',
    'Rate limit to protect downstream services — return 429 with Retry-After header',
    'Return structured errors with machine-readable codes and human-readable messages',
  ],
}
