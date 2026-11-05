import meta from './meta.js'

export default {
  ...meta,
  metaphor:    'A traffic controller at a busy intersection — directing vehicles to open lanes, hiding the internal road layout, and preventing any single road from becoming gridlocked.',
  howItWorks: [
    'Forward proxy vs reverse proxy: a forward proxy sits in front of clients, masking their identity — used for content filtering, corporate security, and VPNs. A reverse proxy sits in front of servers, hiding backend topology from the internet — used for SSL termination, compression, caching, and routing. In interviews, "proxy" almost always means reverse proxy.',
    'Load balancing algorithms: round-robin cycles through servers in order — simple and effective when requests have similar cost. Least-connections routes to the server with the fewest active connections — better for variable-duration requests (file uploads, streaming). IP hash (sticky hash) consistently routes the same client IP to the same server — a simple form of session affinity.',
    'Health checks: the load balancer polls each backend server at regular intervals (e.g., GET /health every 5 seconds). After N consecutive failures, the server is marked unhealthy and removed from the rotation. After M consecutive successes, it is re-added. This enables zero-downtime deployments and automatic recovery from crashes.',
    'L4 vs L7 load balancing: Layer 4 (transport) routes by IP address and TCP port — fast, low CPU overhead, no HTTP awareness. Layer 7 (application) reads the HTTP request line, headers, and body — enables content-based routing (/api/* to API servers, /static/* to CDN origin), A/B testing by cookie, and canary deployments. AWS ALB, nginx, and HAProxy operate at L7.',
    'SSL termination: the load balancer decrypts HTTPS at the edge and forwards plain HTTP to backend servers. Benefits: one certificate to manage, backends avoid TLS overhead, L7 routing can inspect headers. The backend-to-LB connection is on a trusted private network. If end-to-end encryption is required, use SSL passthrough (L4) or re-encrypt to backends.',
    'Active-active vs active-passive: active-active runs all servers simultaneously, maximizing throughput and providing instant failover — requires stateless servers with shared state in Redis or a database. Active-passive keeps one server idle as a hot standby — simpler for stateful workloads (primary database + replica). For stateless app servers, always prefer active-active.',
    'Global vs local load balancing: local load balancing is everything above — an L4/L7 LB distributing traffic across a server pool inside one data center or region. Global load balancing happens a tier above that, before a request ever reaches a region: DNS-based GSLB (geo-DNS) or anycast IP routes each user to their nearest or lowest-latency healthy region based on geography, latency, or region health. AWS Route 53, Cloudflare Load Balancing, and GCP\'s Global Load Balancer operate at this tier. Most systems at scale use both — global picks the region, local picks the server within it.',
  ],
  keyPoints: [
    'Forward proxies sit in front of clients — used for privacy, filtering, and corporate security',
    'Reverse proxies sit in front of servers — SSL termination, caching, and routing',
    'Load balancers distribute requests across a server pool: round-robin, least-connections, or IP hash',
    'Health checks automatically remove failed servers from the pool',
    'L4 load balancers route by IP/TCP; L7 load balancers route by HTTP path, headers, or cookies',
    'Global load balancing (DNS/anycast) picks a region; local load balancing (L4/L7) picks a server within it',
  ],
}
