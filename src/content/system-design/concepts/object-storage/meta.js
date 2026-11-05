// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'object-storage',
  type:        'concept',
  title:       'Object Storage',
  category:    'storage',
  tags:        ['object-storage', 's3', 'blob-storage', 'cdn', 'presigned-url', 'multipart-upload', 'versioning', 'lifecycle-policy', 'gcs', 'azure-blob'],
  description: 'Object storage treats files as discrete objects — each with its data, metadata, and a globally unique key — stored in flat namespaces called buckets. Unlike file systems (hierarchical directories) or block storage (raw disk sectors), object storage is accessed entirely via HTTP APIs and scales to exabytes without administrative overhead. It is the foundation of virtually every cloud storage system: AWS S3, Google Cloud Storage, and Azure Blob Storage.',
}
