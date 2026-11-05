import meta from './meta.js'

export default {
  ...meta,
  metaphor:    "A global film distribution network. Filmmakers submit raw reels to a central lab (upload + transcoding pipeline). The lab produces copies at multiple qualities: IMAX, standard, and low-bandwidth. These copies are shipped to thousands of regional cinemas (CDN edge nodes) closest to where audiences live. When you watch, the cinema plays the quality that matches your theater's projector capacity — swapping up or down as conditions change.",
  howItWorks: [
    'Upload pipeline: users upload raw video to object storage (S3) directly via presigned URL — bypassing application servers to eliminate an upload bottleneck. The upload triggers a transcoding job via message queue. Resumable uploads (TUS protocol or S3 multipart) handle large files over unstable connections.',
    'Transcoding: a transcoding cluster (AWS MediaConvert, FFmpeg workers, or a dedicated service like Zencoder) converts the raw video into multiple resolutions (240p, 480p, 720p, 1080p, 4K) and bitrates. Audio tracks, subtitle streams, and thumbnail frames are extracted as separate assets. Output is segmented into 2–10 second chunks in HLS (.m3u8 + .ts) or MPEG-DASH format.',
    'Adaptive bitrate streaming (ABR): video is served as a playlist of small segments. The client (video player) monitors download speed and buffer health. If segments are arriving slowly, the player switches to a lower bitrate playlist; if the buffer is healthy and connection is fast, it switches up. The switch is seamless — no rebuffering, no quality cliff.',
    'CDN distribution: encoded segments and manifest files are stored in object storage and cached at CDN edge nodes globally (CloudFront, Fastly, Akamai). The first viewer in a region triggers a cache miss — the edge fetches from origin S3. Subsequent viewers in the same region get segments from the edge cache with sub-10ms latency. Popular videos are 100% edge-served.',
    'Video metadata service: stores title, description, creator, duration, resolution variants, thumbnail URLs, and view counts in a relational database. A separate search index (Elasticsearch) enables full-text search over titles, descriptions, and tags. View counts use approximate counting (Redis INCR, batch-flushed to DB) to avoid hot-row contention.',
    'Content delivery path: client player → CDN edge → (cache miss) → origin S3. The manifest URL resolves via GeoDNS to the nearest CDN PoP. Each segment URL is signed and expires — preventing hotlinking and enabling DRM. DRM (Widevine, FairPlay) encrypts segments with per-session keys distributed by a license server, preventing local recording.',
  ],
  keyPoints: [
    'Never stream video through your application servers — direct S3 presigned URLs for upload, CDN edge for playback. Your servers only serve metadata and auth tokens',
    'Adaptive bitrate (HLS/DASH) is not optional — it is the reason streaming works on mobile. A fixed-bitrate stream would buffer whenever bandwidth drops; ABR switches quality seamlessly',
    'Transcoding is the most compute-intensive part of the pipeline — use dedicated, horizontally scalable workers triggered by a queue; never transcode synchronously in the upload handler',
    'CDN cache hit rate is the primary cost driver: popular content should be 99%+ edge-cached. Rare content (long tail) may be re-fetched from origin on every view — use tiered caching (edge + mid-tier) to reduce origin egress costs',
    'Resumable upload is essential for large video files — a broken connection mid-upload should not force the user to restart from zero. S3 multipart upload and the TUS protocol both support resumability',
  ],
}
