// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'microservices',
  type:        'concept',
  title:       'Microservices',
  category:    'architecture',
  tags:        ['microservices', 'service-mesh', 'api-gateway', 'monolith', 'domain-driven-design', 'service-discovery', 'sidecar', 'containerization', 'kubernetes'],
  description: 'Microservices architecture decomposes an application into small, independently deployable services that each own a single bounded domain. Each service runs in its own process, communicates over a network (HTTP/gRPC or async messaging), and can be built, deployed, and scaled independently of the rest. The trade-off versus a monolith: operational complexity increases significantly, but individual services can move fast, scale independently, and be isolated from each other\'s failures.',
}
