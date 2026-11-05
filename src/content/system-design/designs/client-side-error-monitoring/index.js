import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A black box flight recorder versus a server's control-tower logs. The control tower (backend monitoring) has a stable connection and full visibility. The flight recorder (client SDK) has to keep working when the connection drops, survive the plane going down (the tab closing) without losing the last few seconds of data, and its raw recording is meaningless until someone with the decoder key (source maps) translates it back into readable events.",
  howItWorks: [
    'Capture surface: window.onerror catches uncaught synchronous exceptions, window.addEventListener("unhandledrejection", ...) catches rejected promises nothing else handled, and an explicit captureException() call lets application code report handled errors it still wants visibility into. All three funnel into one internal event format.',
    'Self-protection: the SDK\'s own instrumentation must never throw — every capture path is wrapped so that a bug in the monitoring code cannot itself crash the host page or, worse, recursively report itself as an error. This is the client-side analogue of the ingestion pipeline needing to survive an error storm.',
    'Source maps: production JS is minified, so a raw stack trace like "at t.a (app.a1b2.js:1:48213)" is useless. The build pipeline uploads a source map for each deployed bundle to the monitoring backend at build time; symbolication happens server-side by matching the deployed release version to its map, keeping the map itself (which can reveal original source) off the public client.',
    'Delivery under adverse conditions: reports batch client-side and flush periodically or on a size threshold, not one HTTP call per error. On page unload, navigator.sendBeacon (or fetch with keepalive) is used instead of a normal XHR, because a regular request can be cancelled mid-flight when the tab closes. Failed sends queue in localStorage/IndexedDB and retry on the next page load.',
    'Sampling and rate limiting: a single broken retry loop or a render-thrashing bug can generate thousands of identical client errors in seconds. The SDK caps reports per fingerprint per session client-side, and the backend enforces a per-project ingestion quota so one misbehaving client cannot exhaust shared ingestion capacity.',
    'Privacy scrubbing: request context is far more sensitive on the client — form field values, cookies, and full DOM state must be redacted or opted-in explicitly before an event ever leaves the browser, since the client cannot be trusted to have already stripped PII the way a controlled backend service can.',
  ],
  keyPoints: [
    'The SDK must be crash-proof itself — a monitoring library that throws defeats its own purpose and can take down the page it is meant to observe',
    'Source maps must be uploaded at build time and kept server-side only — shipping them publicly re-exposes the original, unminified source',
    'sendBeacon (or fetch keepalive) is required for unload-time delivery — a normal request racing the page teardown silently loses data',
    'Client-side sampling and per-session caps are non-negotiable — one runaway loop in one user\'s browser can otherwise flood shared ingestion capacity',
    'Redact PII on the client before transmission — the backend never gets a chance to sanitize data it never should have received in the first place',
  ],
}
