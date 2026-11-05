// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'social-media-feed',
  type:        'design',
  title:       'Design a Social Media Feed',
  category:    'designs',
  tags:        ['social-feed', 'news-feed', 'fan-out', 'fan-out-on-write', 'fan-out-on-read', 'ranking', 'timeline', 'celebrity-problem', 'redis', 'pagination'],
  description: 'Design the news feed feature of a social media platform (like Twitter or Instagram) that shows each user a ranked, paginated stream of posts from accounts they follow, updated in near real-time. The core challenges are feed generation at scale (fan-out across millions of followers), feed ranking, and handling celebrity accounts with millions of followers efficiently.',
}
