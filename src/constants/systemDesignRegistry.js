// ── Background ────────────────────────────────────────────────────────────────
import computerArchitecture    from '../content/system-design/concepts/computer-architecture/meta.js'
import applicationArchitecture from '../content/system-design/concepts/application-architecture/meta.js'
import designRequirements      from '../content/system-design/concepts/design-requirements/meta.js'
import reshaded                from '../content/system-design/concepts/reshaded/meta.js'
import abstractionsInSystemDesign from '../content/system-design/concepts/abstractions-in-system-design/meta.js'
import consistencyModelsSpectrum  from '../content/system-design/concepts/consistency-models-spectrum/meta.js'
import failureModelsSpectrum      from '../content/system-design/concepts/failure-models-spectrum/meta.js'
import rpc                        from '../content/system-design/concepts/rpc/meta.js'
import buildingBlocksOverview     from '../content/system-design/concepts/building-blocks-overview/meta.js'

// ── Networking ────────────────────────────────────────────────────────────────
import networkingBasics        from '../content/system-design/concepts/networking-basics/meta.js'
import tcpAndUdp               from '../content/system-design/concepts/tcp-and-udp/meta.js'
import dns                     from '../content/system-design/concepts/dns/meta.js'

// ── APIs ──────────────────────────────────────────────────────────────────────
import http                    from '../content/system-design/concepts/http/meta.js'
import websockets              from '../content/system-design/concepts/websockets/meta.js'
import apiParadigms            from '../content/system-design/concepts/api-paradigms/meta.js'
import apiDesign               from '../content/system-design/concepts/api-design/meta.js'

// ── Caching Basics ────────────────────────────────────────────────────────────
import caching                 from '../content/system-design/concepts/caching/meta.js'
import cdns                    from '../content/system-design/concepts/cdns/meta.js'

// ── Proxies ───────────────────────────────────────────────────────────────────
import proxiesAndLoadBalancing from '../content/system-design/concepts/proxies-and-load-balancing/meta.js'
import consistentHashing       from '../content/system-design/concepts/consistent-hashing/meta.js'

// ── Storage ───────────────────────────────────────────────────────────────────
import sql                     from '../content/system-design/concepts/sql/meta.js'
import nosql                   from '../content/system-design/concepts/nosql/meta.js'
import databaseReplication     from '../content/system-design/concepts/database-replication/meta.js'
import databaseSharding        from '../content/system-design/concepts/database-sharding/meta.js'
import databaseIndexes         from '../content/system-design/concepts/database-indexes/meta.js'
import acidAndBase             from '../content/system-design/concepts/acid-and-base/meta.js'
import objectStorage           from '../content/system-design/concepts/object-storage/meta.js'

// ── Reliability ───────────────────────────────────────────────────────────────
import capTheorem              from '../content/system-design/concepts/cap-theorem/meta.js'
import consistencyPatterns     from '../content/system-design/concepts/consistency-patterns/meta.js'
import availabilityPatterns    from '../content/system-design/concepts/availability-patterns/meta.js'

// ── Scalability ───────────────────────────────────────────────────────────────
import rateLimiting            from '../content/system-design/concepts/rate-limiting/meta.js'
import sequencer               from '../content/system-design/concepts/sequencer/meta.js'

// ── Messaging ─────────────────────────────────────────────────────────────────
import messageQueues           from '../content/system-design/concepts/message-queues/meta.js'

// ── Observability ─────────────────────────────────────────────────────────────
import loggingAndMonitoring    from '../content/system-design/concepts/logging-and-monitoring/meta.js'
import distributedTracing      from '../content/system-design/concepts/distributed-tracing/meta.js'

// ── Architecture ──────────────────────────────────────────────────────────────
import microservices           from '../content/system-design/concepts/microservices/meta.js'
import eventDrivenArchitecture from '../content/system-design/concepts/event-driven-architecture/meta.js'

// ── Designs ───────────────────────────────────────────────────────────────────
import urlShortener            from '../content/system-design/designs/url-shortener/meta.js'
import keyValueStore           from '../content/system-design/designs/key-value-store/meta.js'
import rateLimiterDesign       from '../content/system-design/designs/rate-limiter/meta.js'
import notificationSystem      from '../content/system-design/designs/notification-system/meta.js'
import chatSystem              from '../content/system-design/designs/chat-system/meta.js'
import videoStreaming          from '../content/system-design/designs/video-streaming/meta.js'
import socialMediaFeed         from '../content/system-design/designs/social-media-feed/meta.js'
import fileStorage             from '../content/system-design/designs/file-storage/meta.js'
import searchAutocomplete      from '../content/system-design/designs/search-autocomplete/meta.js'
import errorMonitoringSystem   from '../content/system-design/designs/error-monitoring-system/meta.js'
import clientSideErrorMonitoring from '../content/system-design/designs/client-side-error-monitoring/meta.js'
import distributedCache        from '../content/system-design/designs/distributed-cache/meta.js'
import distributedMessageQueue from '../content/system-design/designs/distributed-message-queue/meta.js'
import pubSub                  from '../content/system-design/designs/pub-sub/meta.js'
import blobStore               from '../content/system-design/designs/blob-store/meta.js'
import distributedSearch       from '../content/system-design/designs/distributed-search/meta.js'
import distributedLoggingService from '../content/system-design/designs/distributed-logging-service/meta.js'
import distributedTaskScheduler from '../content/system-design/designs/distributed-task-scheduler/meta.js'
import shardedCounters         from '../content/system-design/designs/sharded-counters/meta.js'

// Ordered following the learning roadmap in systemDesignRoadmap.js (journey
// stages, then design tiers). Add new topics here — one import + one array
// entry — and place the id in systemDesignRoadmap.js.
// Metadata only (meta.js) so index pages, the roadmap and the sidebar stay
// small; the full content is fetched per item by loadSystemDesignItem().
export const SYSTEM_DESIGN = [
  // How a Request Moves
  networkingBasics,
  dns,
  tcpAndUdp,
  http,
  computerArchitecture,
  applicationArchitecture,
  // Data First
  sql,
  databaseIndexes,
  acidAndBase,
  caching,
  databaseReplication,
  consistencyModelsSpectrum,
  consistencyPatterns,
  capTheorem,
  databaseSharding,
  consistentHashing,
  nosql,
  objectStorage,
  // Scaling the Monolith
  proxiesAndLoadBalancing,
  cdns,
  rateLimiting,
  // Think in Bottlenecks
  loggingAndMonitoring,
  failureModelsSpectrum,
  availabilityPatterns,
  // Distribute Only When Forced
  messageQueues,
  eventDrivenArchitecture,
  microservices,
  rpc,
  apiParadigms,
  apiDesign,
  websockets,
  distributedTracing,
  sequencer,
  // Communicating Trade-offs
  designRequirements,
  reshaded,
  abstractionsInSystemDesign,
  buildingBlocksOverview,
  // Build Small First
  urlShortener,
  rateLimiterDesign,
  notificationSystem,
  chatSystem,
  fileStorage,
  searchAutocomplete,
  // Same App, Bigger Scale
  socialMediaFeed,
  videoStreaming,
  errorMonitoringSystem,
  clientSideErrorMonitoring,
  // Build the Building Blocks
  keyValueStore,
  distributedCache,
  distributedMessageQueue,
  pubSub,
  blobStore,
  distributedSearch,
  distributedLoggingService,
  distributedTaskScheduler,
  shardedCounters,
].map((item) => ({ ...item, path: `/system-design/${item.id}` }))

// type → display label
export const TYPE_LABEL = {
  concept: 'Concept',
  design:  'Design',
}

// type → colour tokens
export const TYPE_COLOR = {
  concept: 'text-sky-400 bg-sky-400/10',
  design:  'text-blue-400 bg-blue-400/10',
}

// Full content modules, one lazy chunk per item.
const CONTENT = import.meta.glob('../content/system-design/*/*/index.js', { import: 'default' })
const contentCache = new Map()

// Resolves to the item's full content (index.js) merged over its metadata.
// The promise is cached per id so React's use() gets a stable value.
export function loadSystemDesignItem(item) {
  if (!contentCache.has(item.id)) {
    const load = CONTENT[`../content/system-design/${item.type}s/${item.id}/index.js`]
    contentCache.set(item.id, load().then((content) => ({ ...item, ...content })))
  }
  return contentCache.get(item.id)
}
