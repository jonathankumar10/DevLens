// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'building-blocks-overview',
  type:        'concept',
  title:       'Introduction to Building Blocks for Modern System Design',
  category:    'framework',
  tags:        ['building-blocks', 'bottom-up-approach', 'dns', 'load-balancer', 'database', 'key-value-store', 'cdn', 'sequencer', 'monitoring', 'distributed-cache', 'message-queue', 'pub-sub', 'rate-limiter', 'blob-store', 'distributed-search', 'distributed-logging', 'task-scheduler', 'sharded-counters'],
  description: 'Most system design problems are the same handful of recurring components wired together differently. Rather than re-deriving a load balancer or a message queue from scratch inside every design, this app — like the interview itself — treats each one as a building block: designed once in depth, then reused by reference whenever a flagship design (Twitter, Uber, WhatsApp, ...) needs it.',
}
