// Index-level metadata, loaded eagerly by systemDesignRegistry.js.
// The full content in index.js is loaded only on the detail page.
export default {
  id:          'file-storage',
  type:        'design',
  title:       'Design a File Storage Service',
  category:    'designs',
  tags:        ['file-storage', 'dropbox', 'google-drive', 'block-storage', 'chunking', 'deduplication', 'sync', 'conflict-resolution', 'object-storage', 'delta-sync'],
  description: 'Design a cloud file storage and synchronization service (like Dropbox or Google Drive) that lets users store files in the cloud, sync them across multiple devices, and share them with collaborators. Key challenges include efficient sync of large files (delta sync, chunking), conflict resolution when the same file is edited on two offline devices, and handling billions of files at global scale.',
}
