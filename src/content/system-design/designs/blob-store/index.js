import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A shipping company's internal warehouse network, not the tracking website customers use. Customers just see a tracking number (an object key); internally, a large shipment (a big object) is split into pallets (chunks) spread across multiple warehouses (storage nodes) for safety, a separate dispatch office (metadata service) records which warehouses hold which pallets, and damaged pallets are silently reconstructed from backup copies or parity pallets before anyone notices.",
  howItWorks: [
    'Two-tier architecture: a metadata service tracks, for every object key, which physical chunks make it up and which storage nodes hold each chunk — this lives in a fast, strongly consistent database (or a sharded key-value store) since it\'s small relative to the actual bytes. A separate data service on commodity storage nodes holds the actual chunk bytes and knows nothing about object keys or buckets.',
    'Chunking: large objects are split into fixed-size chunks (e.g., 64–128 MB) before being written, both to bound the blast radius of a single node failure and to allow chunks of one object to be spread and even uploaded in parallel across many storage nodes. Small objects may be packed together into a single chunk to avoid per-object storage overhead.',
    'Durability via replication: the simplest scheme stores each chunk on 3 different nodes (ideally across failure domains — different racks/AZs). Any single node loss is invisible to reads; a background repair process detects under-replicated chunks (via periodic health checks or checksums) and re-replicates them elsewhere.',
    'Durability via erasure coding: at scale, 3x replication means 3x the raw storage cost. Erasure coding (e.g., Reed-Solomon, splitting a chunk into k data fragments + m parity fragments across k+m nodes) achieves similar or better durability at roughly 1.4-1.5x raw storage instead of 3x, at the cost of more expensive reconstruction when a fragment is lost — a real trade-off between storage cost and recovery CPU/latency.',
    'Placement and rebalancing: consistent hashing (or a placement service that actively load-balances) decides which nodes hold new chunks, factoring in per-node free space and failure-domain diversity. When a node is added or removed, only the chunks it should now own or no longer own need to move — not the entire dataset.',
    'Write and read path: a write goes to the metadata service to reserve an object key and get a chunk placement plan, then chunk bytes stream directly to the assigned storage nodes (often via presigned URLs so the client writes directly rather than through a central bottleneck), then the metadata service commits the object once all chunks are durably written. A read looks up chunk locations in metadata, then fetches and reassembles chunks in parallel from storage nodes.',
  ],
  keyPoints: [
    'Separating a small, fast metadata service from a large, dumb data plane is the foundational design decision — metadata lookups must be fast even though the data itself is enormous',
    'Chunking large objects bounds failure blast radius and enables parallel upload/download — a single 10 GB object should not be one atomic write to one node',
    'Replication (3x, simple, expensive) vs erasure coding (~1.4x, cheaper storage, costlier reconstruction) is the central durability/cost trade-off — expect to justify the choice by access pattern and object size',
    'Rebalancing must move only the minimum necessary chunks when nodes join or leave — a full dataset shuffle on every topology change does not scale to exabytes',
    'Clients should write/read chunks directly to storage nodes wherever possible (not proxied through metadata service) so metadata capacity does not become the throughput bottleneck',
  ],
}
