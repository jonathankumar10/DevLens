import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A sophisticated copy shop that handles both storage and synchronization. You send a document to the shop once. They cut it into standard-size sections, label each section with a fingerprint, and store only unique sections — if two customers have the same legal disclaimer on page 3, they share one stored copy of that section. When you update just page 5, only that section's fingerprint changes and only that chunk needs uploading.",
  howItWorks: [
    'File chunking: large files are split into fixed-size chunks (4–8 MB). Each chunk is content-addressed — its ID is a hash (SHA-256) of its content. Changed files produce a changed chunk set; unchanged chunks are not re-uploaded. A 1 GB file edited in the last paragraph produces exactly one new chunk and 249 unchanged, already-stored chunks — delta sync.',
    'Deduplication: because chunks are content-addressed, identical chunks across different files or users share a single stored copy. The metadata service maps file → chunk list; the chunk store maps chunk hash → stored bytes. Dropbox reports saving enormous amounts of storage via deduplication across their user base.',
    'Metadata service: stores the file hierarchy (folder tree), file versions, chunk lists, share permissions, and device sync state for each user. A relational database for metadata (file names, folder structure, permissions) and a separate chunk store (object storage: S3/GCS) for binary data. Never mix metadata and content in the same store.',
    'Sync protocol: a sync client on each device maintains a local index (file path → hash list). On file change, the client computes the new hash list, diffs against the server\'s version, uploads only new chunks, and commits the new file version to the metadata service. The metadata service notifies other connected devices via long polling or WebSocket.',
    'Conflict resolution: if Device A and Device B both modify the same file while offline, two divergent versions exist. The system creates a conflict copy: "file.txt" (from the first sync) and "file (Jonathan\'s conflicted copy 2024-01-15).txt". The user resolves manually — automatic merge is only possible for text files with line-level diffing (Google Docs uses OT/CRDT instead).',
    'Sharing and permissions: a share link maps to a file/folder ID with an access level (view, comment, edit). The metadata service enforces permissions on every API call. Link-based sharing generates a token (opaque random ID) that resolves to a file without requiring the viewer to have an account — important for public link sharing.',
  ],
  keyPoints: [
    'Content-addressed chunking (chunk ID = hash of content) enables delta sync and cross-user deduplication — the two most impactful optimizations in a file sync system',
    'Separate metadata (relational DB for file tree, permissions, versions) from content (object storage for chunk bytes) — they have different access patterns, scale independently, and should not share a storage tier',
    'The sync client, not the server, should compute the diff — the client knows what has changed locally. The server is an authoritative store and notification hub, not a diff engine',
    'Conflict copies are the correct conflict resolution strategy for binary files — automatic merge without semantic understanding produces corrupt files. Only text/structured data (Google Docs) can merge automatically',
    'Versioning is non-negotiable: users accidentally delete or overwrite files. Retain N versions per file (or 30-day history). Version storage is the largest cost driver after raw file storage — use lifecycle policies to tier old versions to cheaper storage classes',
  ],
}
