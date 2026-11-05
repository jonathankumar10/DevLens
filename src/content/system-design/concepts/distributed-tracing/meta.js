// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'distributed-tracing',
  type:        'concept',
  title:       'Distributed Tracing',
  category:    'observability',
  tags:        ['distributed-tracing', 'opentelemetry', 'jaeger', 'zipkin', 'trace-id', 'span', 'service-mesh', 'latency-profiling', 'dependency-graph'],
  description: 'Distributed tracing follows a single request as it travels through multiple microservices, recording a timeline of which service did what and how long each step took. A trace is composed of spans — one per service invocation — linked by a shared trace ID propagated in HTTP headers. It answers the question "why was that specific request slow?" in a system too complex to debug by reading individual service logs.',
}
