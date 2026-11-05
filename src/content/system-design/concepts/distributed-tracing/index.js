import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A GPS breadcrumb trail for a package moving through a fulfillment network. The package gets a barcode at dispatch (trace ID). Each warehouse, sorting facility, and delivery truck scans the barcode with a timestamp on arrival and departure (spans). At the end, you have a complete timeline showing exactly where the package spent each minute — which stop caused the delay, and which handled it instantly.",
  howItWorks: [
    'Trace ID and span ID: when a request enters the system, the entry point generates a random 128-bit trace ID and a span ID for the initial operation. Both are injected into outgoing HTTP headers (W3C traceparent standard). Each downstream service reads the headers, creates a child span with its own span ID referencing the parent, and propagates the same trace ID further.',
    'Spans record: start time, end time (duration), service name, operation name, HTTP status or error flag, and key-value tags (user ID, query hash, cache hit/miss). Spans are emitted asynchronously to a trace collector (Jaeger, Zipkin, AWS X-Ray, Honeycomb) without blocking the request path.',
    'OpenTelemetry (OTel) is the vendor-neutral standard for instrumenting services. Auto-instrumentation libraries for Java, Python, Go, Node.js automatically create spans for HTTP calls, database queries, and message queue operations with zero manual code. Manual instrumentation adds spans for custom business logic.',
    'Trace visualization: the collector stores spans in a searchable backend. Jaeger UI renders a flame graph showing each service as a horizontal bar on a timeline, revealing which service contributed the most to end-to-end latency. Service dependency graphs visualize call patterns and identify unexpected coupling.',
    'Sampling: collecting every span for every request at high QPS is expensive. Head-based sampling decides at the trace root whether to record the full trace (typically 1%). Tail-based sampling makes the decision after the trace completes — it can keep 100% of slow or error traces and discard 99% of fast ones, capturing exactly the data you need.',
    'Correlation with logs and metrics: include the trace ID as a field in all log lines. When an alert fires for a spike in p99 latency, look up a slow trace, then query the logs for that trace ID to see detailed context from each service. This three-way correlation (metrics → traces → logs) is the complete observability loop.',
  ],
  keyPoints: [
    'Distributed tracing is the only way to understand latency at the request level in a microservices system — logs show what happened, metrics show aggregate trends, traces show exactly why one specific request was slow',
    'Propagate trace context in every outgoing call: HTTP headers, Kafka message headers, gRPC metadata. A broken propagation link splits a trace into disconnected fragments',
    'OpenTelemetry is the industry standard — instrument once, export to any backend (Jaeger, Datadog, Honeycomb) by swapping the exporter config',
    'Tail-based sampling is worth the added complexity: it ensures you capture 100% of high-value traces (errors, slow requests) while staying within storage budgets',
    'In an interview, mention traces when asked about debugging latency, diagnosing cascading failures, or understanding service dependencies — it signals production maturity',
  ],
}
