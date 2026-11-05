import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "An ER triage desk instead of a pile of individual patient files. Thousands of walk-ins (raw error events) arrive per hour, but the desk doesn't hand a doctor one chart per patient — it groups them by symptom (this is the fourth cardiac case tonight), tracks how often each symptom is recurring, and pages a specialist only when a new symptom appears or an existing one is spiking.",
  howItWorks: [
    'Capture: a language-specific SDK wraps the service (middleware, uncaught exception handler, or explicit capture call) and turns a thrown exception into a structured event — stack trace, service name, host, deploy version, timestamp, and request context (user ID, route, headers minus secrets).',
    'Ingestion pipeline: the SDK POSTs the event to a lightweight ingestion API, which does minimal validation and immediately writes to a durable queue (Kafka) rather than processing synchronously. This decouples error-report volume from processing capacity and absorbs bursts — a bad deploy that throws on every request must not take down the monitoring system itself.',
    'Fingerprinting and grouping: a stream processor normalizes each stack trace (stripping line numbers and memory addresses that vary between identical logical errors) and hashes it into a fingerprint. Events sharing a fingerprint are grouped into one "issue" with an occurrence counter, first-seen/last-seen timestamps, and affected-user count — turning 50,000 raw events into perhaps 12 distinct issues.',
    'Storage: issue metadata (fingerprint, title, counts, status) lives in a relational or document store for fast dashboard queries; the full event payloads (stack traces, context) go to a cheaper, append-only store (object storage or a wide-column DB) since most are only inspected during investigation, not on every dashboard load.',
    'Alerting: a new fingerprint never seen before fires a "new issue" alert immediately. An existing issue whose occurrence rate crosses a threshold (e.g., 10x its 1-hour baseline) fires a "regression" alert. Alerting on the issue level rather than the raw event level is what keeps on-call from being paged 50,000 times for one bug.',
    'Retention and sampling: at extreme volume, sample raw event storage (keep 1 in N full payloads per fingerprint) while still counting every occurrence exactly, so the frequency graph stays accurate even though not every stack trace is retained in full.',
  ],
  keyPoints: [
    'The hard problem is grouping, not capturing — fingerprinting raw stack traces into issues is what makes the system usable at scale',
    'Ingestion must be asynchronous (queue-backed) so that an error storm from a bad deploy cannot overwhelm or crash the monitoring pipeline itself',
    'Alert on issues (new or regressed), never on raw events — alerting per-event at scale pages nobody usefully',
    'Separate hot metadata (issue counts, status) from cold payloads (full stack traces) — most reads only need the former',
    'Sampling full event storage while still counting every occurrence keeps frequency graphs accurate under extreme volume without unbounded storage growth',
  ],
}
