// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'url-shortener',
  type:        'design',
  title:       'Design a URL Shortener',
  category:    'web-services',
  tags:        ['api', 'database', 'cache', 'redis', 'base62', 'scalability'],
  description: 'A service that maps long URLs to short codes (like bit.ly). Handles high read traffic with caching, generates unique codes with Base62, and persists mappings to a database.',
}
