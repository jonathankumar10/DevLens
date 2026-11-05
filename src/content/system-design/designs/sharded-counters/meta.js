// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'sharded-counters',
  type:        'design',
  title:       'Design Sharded Counters',
  category:    'designs',
  tags:        ['sharded-counter', 'hot-row', 'write-contention', 'eventual-consistency', 'redis', 'aggregation'],
  description: 'Design a counter (like a viral post\'s like count or a video\'s view count) that can absorb tens of thousands of increments per second on a single logical entity — far beyond what one database row can handle, since every increment to the same row contends for the same row-level lock no matter how many database servers exist.',
}
