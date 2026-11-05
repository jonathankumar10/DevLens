import meta from './meta.js'

export default {
  ...meta,
  metaphor:    'A public announcement system in a city versus a telephone tree. In a telephone tree (direct calls), the organizer must know who needs to hear the news and call each person individually. In the announcement system (event-driven), the organizer broadcasts once — "Game starts at 7 PM" — and anyone who cares tunes in: sports fans, food vendors, parking attendants. Adding a new listener (say, a taxi dispatcher) requires no change to the announcer.',
  howItWorks: [
    'Events as facts: an event captures what happened, immutably. "Order 123 was placed by User 456 at 14:32:05 for items X, Y, Z at $89.99." Events are past tense, timestamped, and never modified. Contrast with a command ("PlaceOrder") which is a request for something to happen and can be rejected.',
    'Choreography vs orchestration: in choreography, each service listens for events and reacts — no central coordinator. OrderService emits "OrderPlaced"; PaymentService hears it and charges the card; InventoryService hears it and reserves stock; NotificationService hears it and sends a confirmation. In orchestration, a central workflow engine (Temporal, Step Functions) explicitly directs each step.',
    'Event sourcing: instead of storing current state, store the full sequence of events that produced that state. Current state is derived by replaying events. The event log becomes the system of record. Benefits: complete audit history, ability to replay into different projections, time travel debugging. Cost: query patterns become more complex — you read projections (views), not the source.',
    'CQRS (Command Query Responsibility Segregation): separate the write model (commands that mutate state, emit events) from the read model (projections optimized for specific query patterns). The event stream feeds multiple read projections — a full-text search index, a relational view, a time-series aggregate. Each projection is eventually consistent with the write side.',
    'Outbox pattern: the most reliable way to emit events transactionally. Within the same database transaction that mutates application state, also insert a row into an "outbox" table. A separate relay process reads the outbox and publishes events to Kafka. This guarantees events are published exactly when and only when the transaction commits — no dual-write inconsistency.',
    'Pitfalls: event ordering is not guaranteed across partitions; consumers must be idempotent; schema evolution requires backward compatibility (never delete fields, add new optional fields); debugging a choreography flow across 8 services requires distributed tracing to reconstruct the causal chain.',
  ],
  keyPoints: [
    'EDA naturally decouples producers from consumers — adding a new service that reacts to existing events requires zero changes to any existing service',
    'Event sourcing provides a complete, immutable audit log for free — essential for financial systems, compliance-heavy domains, and collaborative editing',
    'Choreography scales better than orchestration but is harder to reason about — use distributed tracing to reconstruct the causal chain across services during debugging',
    'The outbox pattern is the standard solution for the dual-write problem: never write to a database and publish to Kafka in separate, non-transactional operations',
    'CQRS pairs naturally with EDA: the event stream feeds multiple read projections optimized for different query patterns, replacing a single normalized database with purpose-built read models',
    'Schema evolution must be backward-compatible — add optional fields, never remove or rename them. Consumers that ignore unknown fields can be deployed independently of producers',
  ],
}
