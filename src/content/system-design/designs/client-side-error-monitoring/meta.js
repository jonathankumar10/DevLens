// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'client-side-error-monitoring',
  type:        'design',
  title:       'Design a Client-Side Error Monitoring System',
  category:    'designs',
  tags:        ['monitoring', 'error-tracking', 'client-side', 'source-maps', 'javascript', 'observability', 'sendbeacon'],
  description: 'Design the browser/mobile-client counterpart to server-side error monitoring — capturing uncaught JS exceptions, unhandled promise rejections, and manual error reports from a device the monitoring system does not control, then reliably getting that data back to the server despite flaky networks, page unloads, and minified code.',
}
