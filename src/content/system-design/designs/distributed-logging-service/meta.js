// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'distributed-logging-service',
  type:        'design',
  title:       'Design a Distributed Logging Service',
  category:    'designs',
  tags:        ['logging', 'elk-stack', 'log-aggregation', 'ingestion-pipeline', 'indexing', 'hot-warm-cold'],
  description: 'Design the logging platform itself — the system behind ELK, Splunk, or Datadog Logs — that collects log lines from thousands of hosts and services, makes them searchable within seconds, and retains months of history at a cost that doesn\'t scale linearly with a company\'s log volume. This is the infrastructure practitioners rely on, built from the same building blocks (message queue, distributed search) covered elsewhere.',
}
