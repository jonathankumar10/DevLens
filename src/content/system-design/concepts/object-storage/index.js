import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A massive warehouse where every item is stored in its own sealed bag labeled with a barcode. You tell the warehouse which barcode you want and it retrieves the bag directly, without navigating aisles or shelves. The warehouse can hold billions of bags, adds new ones instantly, and lets you share a temporary time-limited voucher to retrieve a specific bag without giving away your master key.",
  howItWorks: [
    'Objects are stored with three components: the data payload (binary content of any size), metadata (content-type, size, user-defined key-value pairs), and a unique key within a bucket. Keys can contain slashes to simulate directory structure, but the namespace is fundamentally flat — there are no real directories.',
    'Uploads go directly to the storage service via HTTP PUT or multipart upload. Multipart upload splits files into parts (minimum 5 MB each), uploads them in parallel or across resumable sessions, then assembles them. Essential for files over 1 GB — a failed single-part upload wastes the entire transfer.',
    'Presigned URLs grant temporary, scoped access to a specific object without exposing API credentials. A backend generates a URL that expires in N minutes, signs it with the service credentials, and hands it to the client. The client can then upload or download directly to/from storage — bypassing your servers and eliminating the bandwidth cost.',
    'Static website hosting: configure a bucket to serve its content over HTTP directly. Combined with a CDN (CloudFront, Cloud CDN), objects are cached at edge locations worldwide — users download from the nearest point of presence, not the origin bucket. Latency drops from hundreds of milliseconds to single digits.',
    'Lifecycle policies automate storage cost management. Objects can transition through storage tiers: Standard (fast, expensive) → Infrequent Access (slower retrieval, cheaper) → Glacier/Archive (very slow retrieval, very cheap). Policies also expire objects after a defined number of days — critical for log retention and GDPR compliance.',
    'Consistency model: S3 delivers strong read-after-write consistency for all operations — a GET immediately after a successful PUT is guaranteed to return the new object. Object versioning preserves every version of an object under the same key; deletion creates a delete marker rather than permanently removing data.',
  ],
  keyPoints: [
    'Never store object metadata (filenames, sizes, access control, associations) in object storage itself — put it in a relational database and store only the object key reference',
    'Use presigned URLs for user-facing uploads and downloads — clients write directly to S3 without routing through your API servers, which eliminates a bottleneck and reduces your infrastructure costs',
    'Multipart upload is mandatory for large files: it enables parallel transfer, resumability after network failures, and unlocks S3 Transfer Acceleration',
    'Object storage has high per-request latency vs local disk — cache frequently accessed objects at the CDN edge; do not use S3 as a low-latency random-read database',
    'Bucket names are globally unique within AWS and become part of the public URL — choose them carefully; they cannot be renamed after creation',
  ],
}
