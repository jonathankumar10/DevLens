import meta from './meta.js'

export default {
  ...meta,
  metaphor:    'A phone call instead of sending letters. Both parties stay connected and can speak simultaneously at any moment — rather than one person mailing a letter and waiting for a reply.',
  howItWorks: [
    'The client sends a normal HTTP GET with Upgrade: websocket and Sec-WebSocket-Key headers. The server responds with HTTP 101 Switching Protocols. The underlying TCP connection is now a WebSocket channel.',
    'After the upgrade, both sides communicate with WebSocket frames — lightweight binary envelopes with a 2-byte minimum header (vs HTTP\'s ~400-byte header per request). Text or binary payloads are both supported.',
    'Either side can send frames at any time without waiting. The server pushes new data the instant it\'s available — no polling interval delay. Latency is bounded by network RTT, not by poll frequency.',
    'Heartbeat ping/pong frames keep idle connections alive through load balancers and proxies (which close idle TCP connections after 60–120s). The server sends a Ping frame; the client responds with Pong automatically.',
    'WebSocket servers maintain an in-memory map of open connections. Horizontal scaling is the key challenge: a message for a client on Server 2 must be routed from Server 1 via a shared pub/sub layer (Redis Pub/Sub, Kafka) or sticky sessions.',
    'On disconnect, clients implement exponential backoff reconnection (1s, 2s, 4s…). After reconnection, clients re-subscribe to channels and request missed messages using sequence numbers or timestamps stored server-side.',
  ],
  keyPoints: [
    'WebSockets upgrade an HTTP connection to a persistent bidirectional channel',
    'Either side can push data at any time — no polling, no waiting for a request',
    'Ideal for: chat, live dashboards, multiplayer games, collaborative editing, stock tickers',
    'Servers maintain state per open connection — horizontal scaling requires sticky sessions or a shared pub/sub layer (Redis)',
    'Long-polling is the HTTP fallback when WebSockets are unavailable',
  ],
}
