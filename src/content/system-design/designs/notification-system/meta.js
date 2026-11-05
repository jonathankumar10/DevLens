// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'notification-system',
  type:        'design',
  title:       'Design a Notification System',
  category:    'designs',
  tags:        ['notifications', 'push-notifications', 'email', 'sms', 'fcm', 'apns', 'message-queue', 'retry', 'fan-out', 'user-preferences', 'rate-limiting'],
  description: 'Design a notification delivery system that sends millions of push notifications, emails, and SMS messages per day to users across mobile (iOS/Android) and email channels. The system must be highly available, handle delivery failures with retries, respect user notification preferences, and not spam users — while delivering time-sensitive notifications quickly.',
}
