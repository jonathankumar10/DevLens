// ── Background ────────────────────────────────────────────────────────────────
import computerArchitecture    from '../content/system-design/concepts/computer-architecture/index.js'
import applicationArchitecture from '../content/system-design/concepts/application-architecture/index.js'
import designRequirements      from '../content/system-design/concepts/design-requirements/index.js'
import reshaded                from '../content/system-design/concepts/reshaded/index.js'
import abstractionsInSystemDesign from '../content/system-design/concepts/abstractions-in-system-design/index.js'
import consistencyModelsSpectrum  from '../content/system-design/concepts/consistency-models-spectrum/index.js'
import failureModelsSpectrum      from '../content/system-design/concepts/failure-models-spectrum/index.js'
import rpc                        from '../content/system-design/concepts/rpc/index.js'
import buildingBlocksOverview     from '../content/system-design/concepts/building-blocks-overview/index.js'

// ── Networking ────────────────────────────────────────────────────────────────
import networkingBasics        from '../content/system-design/concepts/networking-basics/index.js'
import tcpAndUdp               from '../content/system-design/concepts/tcp-and-udp/index.js'
import dns                     from '../content/system-design/concepts/dns/index.js'

// ── APIs ──────────────────────────────────────────────────────────────────────
import http                    from '../content/system-design/concepts/http/index.js'
import websockets              from '../content/system-design/concepts/websockets/index.js'
import apiParadigms            from '../content/system-design/concepts/api-paradigms/index.js'
import apiDesign               from '../content/system-design/concepts/api-design/index.js'

// ── Caching Basics ────────────────────────────────────────────────────────────
import caching                 from '../content/system-design/concepts/caching/index.js'
import cdns                    from '../content/system-design/concepts/cdns/index.js'

// ── Proxies ───────────────────────────────────────────────────────────────────
import proxiesAndLoadBalancing from '../content/system-design/concepts/proxies-and-load-balancing/index.js'
import consistentHashing       from '../content/system-design/concepts/consistent-hashing/index.js'

// ── Storage ───────────────────────────────────────────────────────────────────
import sql                     from '../content/system-design/concepts/sql/index.js'
import nosql                   from '../content/system-design/concepts/nosql/index.js'
import databaseReplication     from '../content/system-design/concepts/database-replication/index.js'
import databaseSharding        from '../content/system-design/concepts/database-sharding/index.js'
import databaseIndexes         from '../content/system-design/concepts/database-indexes/index.js'
import acidAndBase             from '../content/system-design/concepts/acid-and-base/index.js'
import objectStorage           from '../content/system-design/concepts/object-storage/index.js'

// ── Reliability ───────────────────────────────────────────────────────────────
import capTheorem              from '../content/system-design/concepts/cap-theorem/index.js'
import consistencyPatterns     from '../content/system-design/concepts/consistency-patterns/index.js'
import availabilityPatterns    from '../content/system-design/concepts/availability-patterns/index.js'

// ── Scalability ───────────────────────────────────────────────────────────────
import rateLimiting            from '../content/system-design/concepts/rate-limiting/index.js'
import sequencer               from '../content/system-design/concepts/sequencer/index.js'

// ── Messaging ─────────────────────────────────────────────────────────────────
import messageQueues           from '../content/system-design/concepts/message-queues/index.js'

// ── Observability ─────────────────────────────────────────────────────────────
import loggingAndMonitoring    from '../content/system-design/concepts/logging-and-monitoring/index.js'
import distributedTracing      from '../content/system-design/concepts/distributed-tracing/index.js'

// ── Architecture ──────────────────────────────────────────────────────────────
import microservices           from '../content/system-design/concepts/microservices/index.js'
import eventDrivenArchitecture from '../content/system-design/concepts/event-driven-architecture/index.js'

// ── Designs ───────────────────────────────────────────────────────────────────
import urlShortener            from '../content/system-design/designs/url-shortener/index.js'
import keyValueStore           from '../content/system-design/designs/key-value-store/index.js'
import rateLimiterDesign       from '../content/system-design/designs/rate-limiter/index.js'
import notificationSystem      from '../content/system-design/designs/notification-system/index.js'
import chatSystem              from '../content/system-design/designs/chat-system/index.js'
import videoStreaming          from '../content/system-design/designs/video-streaming/index.js'
import socialMediaFeed         from '../content/system-design/designs/social-media-feed/index.js'
import fileStorage             from '../content/system-design/designs/file-storage/index.js'
import searchAutocomplete      from '../content/system-design/designs/search-autocomplete/index.js'
import errorMonitoringSystem   from '../content/system-design/designs/error-monitoring-system/index.js'
import clientSideErrorMonitoring from '../content/system-design/designs/client-side-error-monitoring/index.js'
import distributedCache        from '../content/system-design/designs/distributed-cache/index.js'
import distributedMessageQueue from '../content/system-design/designs/distributed-message-queue/index.js'
import pubSub                  from '../content/system-design/designs/pub-sub/index.js'
import blobStore               from '../content/system-design/designs/blob-store/index.js'
import distributedSearch       from '../content/system-design/designs/distributed-search/index.js'
import distributedLoggingService from '../content/system-design/designs/distributed-logging-service/index.js'
import distributedTaskScheduler from '../content/system-design/designs/distributed-task-scheduler/index.js'
import shardedCounters         from '../content/system-design/designs/sharded-counters/index.js'

// Ordered following the learning roadmap in systemDesignRoadmap.js (journey
// stages, then design tiers). Add new topics here — one import + one array
// entry — and place the id in systemDesignRoadmap.js.
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
]

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
