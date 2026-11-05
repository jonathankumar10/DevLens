// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'search-autocomplete',
  type:        'design',
  title:       'Design Search Autocomplete',
  category:    'designs',
  tags:        ['autocomplete', 'typeahead', 'trie', 'prefix-search', 'top-k', 'caching', 'ranking', 'personalization', 'debouncing', 'suggestion-api'],
  description: 'Design a typeahead search suggestion system (like Google\'s search bar) that returns the top 5–10 most relevant query completions for a prefix as the user types, with sub-100ms response time. The system must handle thousands of requests per second per character typed, rank suggestions by popularity, refresh rankings as search trends change, and optionally personalize suggestions per user.',
}
