// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'http',
  type:        'concept',
  title:       'HTTP',
  category:    'apis',
  tags:        ['http', 'https', 'tls', 'request', 'response', 'stateless', 'rest', 'http2', 'http3', 'quic', 'keep-alive', 'multiplexing', 'status-codes', 'headers'],
  description: 'The request-response protocol powering the web. A client sends a request (method, path, headers, body); a server returns a response (status code, headers, body). Every exchange is stateless and self-contained — the server holds no memory between requests, which is what makes HTTP services easy to scale horizontally.',
}
