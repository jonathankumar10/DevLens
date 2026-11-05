import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A postal sorting facility that handles physical mail, email, and text messages simultaneously. Incoming requests drop into sorting queues by channel and priority. Workers pick from their queue, stamp with user preferences (do-not-disturb, opted out), and route to the appropriate carrier: Apple's postal network for iPhones, Google's for Androids, an SMTP relay for email. Undelivered items go to a retry queue, not the trash.",
  howItWorks: [
    'Notification service API: upstream services (OrderService, SocialService, MarketingService) call a simple API — "notify user X with message Y via channels Z." The notification service owns channel selection, user preference checks, and delivery — callers do not need to know about APNs or FCM.',
    'User preference store: each user has a preference record — opted-in channels, quiet hours, notification categories they want. The notification service checks preferences before dispatching. Marketing notifications respect opt-outs; security alerts may override quiet hours. Store in a fast key-value store (Redis or DynamoDB) with TTL-based caching.',
    'Fan-out via message queues: the notification service writes one message per delivery channel to channel-specific queues (push_queue, email_queue, sms_queue). Separate worker pools process each queue independently, allowing different scaling profiles — push workers scale to thousands; SMS workers scale to hundreds (SMS is slower and more expensive).',
    'Channel workers and third-party providers: push workers call FCM (Android) or APNs (iOS) with the device token and message payload. Email workers call SendGrid or SES with the recipient address and HTML template. SMS workers call Twilio. Third-party provider failures are retried with exponential backoff; persistent failures move to a dead-letter queue.',
    'Device token management: mobile device tokens expire and change (user reinstalls the app, gets a new device). Maintain a device token store mapping user ID → list of active tokens per platform. Process provider feedback (APNs feedback service, FCM canonical ID responses) to remove stale tokens and add new canonical ones.',
    'Rate limiting and deduplication: prevent notification storms — if 10,000 events simultaneously trigger notifications for the same user, collapse them into one summary notification. Deduplicate using a Redis SET with a short TTL keyed by user + notification type. Rate limit per-user across all channels to avoid overwhelming any single user.',
  ],
  keyPoints: [
    'Always queue notifications asynchronously — the upstream caller should not wait for FCM/APNs to respond. Queue depth and delivery latency are the key SLOs, not caller latency',
    'Device token hygiene is critical: APNs returns feedback for invalid tokens; FCM returns canonical IDs for rotated tokens. Process both immediately or you waste deliveries and stay on provider blocklists',
    'Idempotency: every notification should have a unique notification ID. Workers use the ID as an idempotency key to prevent duplicate sends on retry',
    'Priority queues: real-time notifications (OTP codes, security alerts) must jump the queue ahead of marketing blasts — use separate high-priority and low-priority queues, not a single FIFO queue',
    'Observability: track delivery rate, failure rate, and latency per channel and per notification type. A sudden drop in FCM delivery rate often indicates a broken API key or provider outage, not a code bug',
  ],
}
