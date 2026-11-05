// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'chat-system',
  type:        'design',
  title:       'Design a Chat System',
  category:    'designs',
  tags:        ['chat', 'websocket', 'real-time', 'message-storage', 'presence', 'fanout', 'pub-sub', 'unread-count', 'message-ordering', 'end-to-end-encryption'],
  description: 'Design a real-time chat system (like Slack or WhatsApp) supporting one-on-one and group messaging with message persistence, online presence, and push notifications for offline users. The core technical challenges are maintaining persistent bidirectional connections at scale, ordering messages consistently, and delivering messages reliably across both live connections and offline fallback.',
}
