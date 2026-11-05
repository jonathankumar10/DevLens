// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'error-monitoring-system',
  type:        'design',
  title:       'Design a Server-Side Error Monitoring System',
  category:    'designs',
  tags:        ['monitoring', 'error-tracking', 'observability', 'sentry', 'fingerprinting', 'kafka', 'alerting'],
  description: 'Design a system (like Sentry or Rollbar) that captures exceptions thrown by backend services, groups the millions of raw occurrences into a manageable list of distinct issues, and alerts on-call engineers when something new or newly-worse appears. The core challenge is not capturing an error — it is turning a firehose of individual stack traces into a small, ranked, actionable list.',
}
