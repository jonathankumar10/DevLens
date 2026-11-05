import meta from './meta.js'

export default {
  ...meta,
  metaphor:    'Three ways to order food: REST is a fixed menu with clear item codes; GraphQL lets you specify exactly which ingredients you want on your plate; gRPC is a direct line to the kitchen with machine-readable order forms.',
  howItWorks: [
    'REST uses standard HTTP verbs (GET, POST, PUT, DELETE) on resource URLs. Every entity has a URL; HTTP handles caching via standard headers. The server defines the response shape — clients receive what the server decides to send.',
    'GraphQL exposes a single POST /graphql endpoint with a type system (schema). Clients send a query declaring exactly which fields to return, including nested relations. The server resolves each field independently using resolver functions.',
    'gRPC defines services in .proto files compiled into type-safe client/server stubs in any language. Messages are serialised as Protocol Buffers (binary) — 5–10× more compact than JSON. HTTP/2 multiplexes multiple streams over one TCP connection.',
    'REST over-fetches (returns all fields even when only 3 are needed) and under-fetches (requires multiple requests for related data). These problems drove GraphQL\'s invention at Facebook for their mobile apps.',
    'gRPC supports four call modes: unary (1 request / 1 response), server streaming, client streaming, and bidirectional streaming — making it a drop-in replacement for WebSockets in service-to-service real-time communication.',
  ],
  keyPoints: [
    'REST uses HTTP verbs and resources — simple, widely supported, but often over-fetches data',
    'GraphQL lets clients request exactly the fields they need — fewer round-trips, flexible for mobile',
    'gRPC uses Protocol Buffers over HTTP/2 — strongly typed, high-performance, ideal for internal services',
    'REST dominates public APIs; gRPC dominates internal microservice communication',
    'GraphQL wins when client data requirements vary widely (e.g. web vs. mobile vs. IoT)',
  ],
}
