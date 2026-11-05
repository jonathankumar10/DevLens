import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "An airline's contingency playbook. If the primary pilot is incapacitated, the co-pilot takes over immediately with no passenger impact (active-passive failover). If one runway is closed, flights divert to another gate (redundant routes). If weather makes landing unsafe, the plane enters a holding pattern rather than attempting a dangerous approach (circuit breaker). If the in-flight entertainment system fails, the flight still operates — just without movies (graceful degradation).",
  howItWorks: [
    'Active-passive failover: a primary node handles all traffic while a standby stays synchronized and ready. Health checks detect primary failure and promote the standby, updating DNS or load balancer config. Failover typically takes 30–120 seconds — users may see a brief outage window.',
    'Active-active: multiple nodes all serve live traffic simultaneously. When one fails, the load balancer removes it and remaining nodes absorb its traffic — no promotion delay. Requires the system to handle concurrent writes from multiple nodes, which introduces consistency complexity.',
    'Health checks: the load balancer pings each node on a defined endpoint every few seconds. Nodes failing to respond within a threshold are removed from rotation. Nodes that recover pass health checks and are gradually added back (with a warmup period to avoid cold cache issues).',
    'Circuit breaker pattern: when a downstream dependency starts failing or responding slowly, the circuit breaker "trips" and immediately returns a fallback response without attempting the call. After a defined timeout, the circuit enters half-open state and tests one request. If it succeeds, the circuit closes. Prevents one slow service from cascading failures across the entire system.',
    'Retry with exponential backoff and jitter: transient failures (brief network hiccup, brief overload) are retried automatically. Each retry waits 2× longer than the last (backoff), plus a small random delay (jitter). Without jitter, all retrying clients synchronize and create a thundering herd that amplifies the original problem.',
    'Graceful degradation: design systems to serve reduced but still useful functionality when a dependency is unavailable. A product page can display without the recommendations sidebar if the ML service is down. Showing a partial page is better than an error — degrade gracefully, fail noisily.',
  ],
  keyPoints: [
    'Active-active is strictly more available than active-passive but requires solving concurrent writes and cross-node consistency — more complex to build and operate',
    'Circuit breakers are the primary defense against cascading failures in service-oriented architectures — without them, one slow service can take down everything upstream',
    'Retry logic must use exponential backoff with jitter; naive immediate retries during an outage amplify load and delay recovery',
    'Health checks must distinguish between "node is down" and "node is overloaded" — an overloaded node removed from rotation shifts its load to remaining nodes and can cause a cascade',
    'Design every feature with graceful degradation in mind: ask "what should users see if this dependency is down?" before it becomes a crisis question',
  ],
}
