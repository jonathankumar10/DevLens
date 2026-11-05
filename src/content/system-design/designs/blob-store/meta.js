// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'blob-store',
  type:        'design',
  title:       'Design a Blob Store',
  category:    'designs',
  tags:        ['blob-store', 's3', 'erasure-coding', 'replication', 'metadata-service', 'chunking', 'durability'],
  description: 'Design the storage system itself — something like S3 or GCS — that object-storage clients build on top of. The interview problem is different from using a blob store: it is durably storing exabytes of arbitrary-sized binary data across a fleet of disks that fail regularly, while serving both tiny objects and multi-terabyte files efficiently.',
}
