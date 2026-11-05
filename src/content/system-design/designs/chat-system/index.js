import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A massive switchboard where each online user holds a live phone line (WebSocket) connected to the board. When User A sends a message to User B, the switchboard routes it directly to B's line if B is connected. If B's line is down (offline), the switchboard records the message and queues a callback notification so B gets it when they reconnect.",
  howItWorks: [
    'WebSocket connections: HTTP is request-response; chat requires the server to push messages to clients without waiting for a request. WebSockets provide a persistent bidirectional connection. Each client connects to a chat server and holds the connection open. Fallback: Server-Sent Events (SSE) for clients that can\'t maintain WebSocket connections.',
    'Connection routing: with thousands of chat servers, a message sent from User A on Server 1 to User B on Server 2 requires routing. A presence service (backed by Redis) maps user ID to connected server ID. The sending server looks up the recipient\'s server and forwards the message via an internal message bus (Kafka) or direct server-to-server connection.',
    'Message storage: store messages in a column-family store like Cassandra or HBase, keyed by conversation ID + message ID (a time-ordered sequence number). This access pattern — give me all messages in conversation X after message Y — maps perfectly to a range scan on the primary key. Avoid relational databases for high-volume message storage.',
    'Message ordering with sequence IDs: clients cannot trust wall-clock timestamps for ordering (clocks drift). Use a distributed sequence ID generator (Snowflake, Twitter\'s algorithm) that produces monotonically increasing 64-bit IDs encoding a timestamp, machine ID, and sequence. Messages within a conversation are ordered by sequence ID.',
    'Presence service: track who is online using a heartbeat mechanism — clients ping the server every 5 seconds. Presence state is stored in Redis with a short TTL. The last-seen timestamp updates on every heartbeat. Group chat presence fanout: when User A joins a group with 100 members, the system must notify 100 connections — use pub/sub to broadcast to all group members\' servers.',
    'Offline delivery: when a message is sent to an offline user, the server persists it normally and triggers the notification system (push notification via APNs/FCM). When the user comes back online, the client syncs missed messages by requesting all messages after its last known sequence ID — no "you missed X messages" summary, just a replay.',
  ],
  keyPoints: [
    'WebSockets for live connections; Kafka or Redis Pub/Sub for cross-server message routing; Cassandra for message storage — these three together form the core of every real-time chat system',
    'Use a distributed sequence ID generator, not wall-clock timestamps, for message ordering — clients\' clocks are unreliable and can be set backwards',
    'Presence at scale is expensive: updating 1,000 group members that one person went offline generates 1,000 writes. Cap group fanout — WhatsApp limits groups to 256; Slack uses coarse presence ("active/away") rather than per-user real-time updates',
    'Message storage access pattern: retrieve all messages in a conversation, paginated backwards from the newest. This is exactly what Cassandra\'s partition key (conversation ID) + clustering key (message ID) optimizes for',
    'End-to-end encryption (Signal protocol) means the server stores and routes opaque ciphertext — it cannot read messages. This is a product and legal decision as much as a technical one: server-side search and compliance logging become impossible',
  ],
}
