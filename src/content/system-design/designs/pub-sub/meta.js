// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'pub-sub',
  type:        'design',
  title:       'Design a Pub-Sub System',
  category:    'designs',
  tags:        ['pub-sub', 'fan-out', 'topics', 'subscriptions', 'sns', 'push-delivery', 'pull-delivery'],
  description: 'Design a publish-subscribe system (like Google Cloud Pub/Sub or AWS SNS) where publishers send messages to a topic without knowing who — or how many — subscribers will receive them. Where a point-to-point queue delivers each message to exactly one consumer, pub-sub\'s defining property is fan-out: every message reaches every independent subscription to that topic.',
}
