// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'distributed-search',
  type:        'design',
  title:       'Design a Distributed Search System',
  category:    'designs',
  tags:        ['elasticsearch', 'inverted-index', 'tf-idf', 'bm25', 'sharding', 'tokenization', 'relevance-ranking'],
  description: 'Design a full-text search system (like Elasticsearch or Solr) that indexes a large, constantly-updated document collection and answers free-text queries ranked by relevance within milliseconds. This is a different problem from prefix autocomplete: the query is arbitrary text, matches can be partial and fuzzy, and results must be ranked by relevance rather than simple popularity.',
}
