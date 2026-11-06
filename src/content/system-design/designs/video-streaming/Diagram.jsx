import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildVideoStreamingSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

// ── Layout ─────────────────────────────────────────────────────────────────────
// Upload pipeline (top lane): uploader → uploadsvc → transcoder → storage
// Playback path (bottom lane): player ← cdn ← storage
// storage bridges both lanes (center-right)

const CW = 750
const CH = 345

const NODES = [
  {
    id: 'uploader', label: 'Uploader', icon: '📤', dir: 'left',
    cx: 62, cy: 112, w: 100, h: 76,
    color: '#94a3b8', glow: 'rgba(148,163,184,0.65)', lc: '#cbd5e1', strip: 'bg-slate-400',
    sub1: 'raw video', sub2: 'multipart upload',
    desc: 'The content creator uploading a raw video file. Uses a presigned S3 URL for direct upload to object storage.',
    note: 'Resumable uploads (TUS / S3 multipart) mean a broken connection does not restart from zero — critical for large files over mobile.',
  },
  {
    id: 'uploadsvc', label: 'Upload Service', icon: '⚙️', dir: 'top',
    cx: 208, cy: 112, w: 116, h: 80,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'presigned URL', sub2: 'enqueue transcode',
    desc: 'Generates a presigned S3 URL for direct upload, writes metadata to DB, and enqueues a transcoding job via message queue.',
    note: 'Application servers never handle video bytes during upload — they only generate the URL and track state.',
  },
  {
    id: 'transcoder', label: 'Transcoding Workers', icon: '🎬', dir: 'top',
    cx: 384, cy: 112, w: 126, h: 80,
    color: '#7c3aed', glow: 'rgba(124,58,237,0.65)', lc: '#ddd6fe', strip: 'bg-violet-700',
    sub1: '240p / 720p / 1080p', sub2: 'HLS segments',
    desc: 'Horizontally scalable workers (FFmpeg / AWS MediaConvert) convert raw video to multiple resolutions and HLS/DASH segments.',
    note: 'Transcoding on spot instances cut costs 70%+ vs. on-demand — a single 1-hour video generates ~GB of segmented output across all quality levels.',
  },
  {
    id: 'storage', label: 'Object Storage', icon: '🪣', dir: 'right',
    cx: 555, cy: 200, w: 116, h: 80,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: 'S3 — durable origin', sub2: 'raw + segments',
    desc: 'S3 stores raw uploads (raw/ prefix) and transcoded HLS segments + manifests (processed/ prefix). The durable origin that CDN caches from.',
    note: 'Popular videos are 100% edge-served by CDN — S3 origin receives only cache-miss traffic, which is a tiny fraction of total views.',
  },
  {
    id: 'cdn', label: 'CDN Edge', icon: '🌐', dir: 'right',
    cx: 676, cy: 112, w: 108, h: 78,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'global PoPs', sub2: '< 10ms latency',
    desc: 'CDN edge nodes cache HLS segments and manifests regionally. GeoDNS routes players to the nearest PoP.',
    note: 'First viewer in a region triggers a cache fill from S3. Every subsequent viewer is served from edge cache — CDN cache hit rate is the primary cost driver.',
  },
  {
    id: 'player', label: 'Video Player', icon: '▶️', dir: 'bottom',
    cx: 676, cy: 280, w: 108, h: 78,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'HLS.js / native', sub2: 'adaptive bitrate',
    desc: 'The client-side video player fetches the manifest, selects the appropriate quality playlist, and requests segments from the nearest CDN edge.',
    note: 'ABR switching is the reason streaming works on mobile — the player silently downgrades quality when bandwidth drops and upgrades when conditions improve.',
  },
]

const EDGES = {
  'uploader-uploadsvc':   { x1: 112, y1: 112, x2: 150, y2: 112 },
  'uploadsvc-storage':    { x1: 266, y1: 120, x2: 497, y2: 168 },
  'uploadsvc-transcoder': { x1: 266, y1: 112, x2: 321, y2: 112 },
  'transcoder-storage':   { x1: 447, y1: 120, x2: 497, y2: 164 },
  'storage-cdn':          { x1: 611, y1: 175, x2: 622, y2: 150 },
  'player-cdn':           { x1: 676, y1: 241, x2: 676, y2: 190 },
}

// ── Edge connection (SVG particles) ──────────────────────────────────────────

// ── Node block ────────────────────────────────────────────────────────────────

// ── Quality levels badge (transcoding step) ───────────────────────────────────

const QUALITIES = ['240p · 300kbps', '480p · 800kbps', '720p · 2.5Mbps', '1080p · 5Mbps']

function QualityBadge({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="mt-3 rounded-xl border border-violet-500/30 bg-violet-500/[0.07] px-4 py-3"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-400 mb-2">
            HLS Output — 4 Quality Levels
          </p>
          <div className="flex flex-wrap gap-2">
            {QUALITIES.map((q, i) => (
              <motion.span
                key={q}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 360, damping: 22 }}
                className="text-[11px] font-mono text-violet-200 bg-violet-500/15 border border-violet-500/25 rounded px-2 py-0.5"
              >
                {q}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── ABR status badge ──────────────────────────────────────────────────────────

function AbrBadge({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="relative mt-3 flex items-center gap-3 rounded-xl border border-sky-500/40 bg-sky-500/[0.07] px-4 py-3 overflow-hidden"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`abr-${i}`}
              className="absolute inset-0 rounded-xl border border-sky-400/18 pointer-events-none"
              initial={{ scale: 0.95, opacity: 0.65 }}
              animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
              transition={{ duration: 1.1, delay: i * 0.2, ease: 'easeOut' }}
            />
          ))}
          <span className="text-xl relative z-10 select-none">📶</span>
          <div className="relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-sky-400">Adaptive Bitrate Active</p>
            <p className="text-sm text-white">Buffer health: 8s ahead · Current: 720p · Bandwidth: 4.2 Mbps</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function VideoStreamingDiagram() {
  const steps  = useMemo(() => buildVideoStreamingSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  const { nodeState } = useDiagramNodes(steps, index)

  const showQualityBadge = step.type === 'multi-resolution' || step.type === 'segments-to-storage'
  const showAbrBadge     = step.type === 'adaptive-bitrate' || step.type === 'manifest-fetch'

  return (
    <div className="space-y-4">

      <DiagramHeader title="Video Streaming — Upload to Playback">
        Trace raw video from upload through transcoding and object storage, then follow the CDN-powered playback path with adaptive bitrate switching.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} />

          {/* Lane labels */}
          <text x={60} y={56} style={{ fill: '#8b5cf6', fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 600, opacity: 0.55 }}>
            UPLOAD + TRANSCODE PIPELINE
          </text>
          <text x={570} y={248} style={{ fill: '#10b981', fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 600, opacity: 0.55 }}>
            PLAYBACK PATH
          </text>
        </>}
        footer={<>
          <QualityBadge visible={showQualityBadge} />
          <AbrBadge     visible={showAbrBadge}     />

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,  glow: FLOW.violet.glow,  label: 'upload / transcode' },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'playback / data'    },
              { color: FLOW.sky.hex,     glow: FLOW.sky.glow,     label: 'CDN cache fill'     },
            ].map(({ color, glow, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-5 h-px rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 4px ${glow}` }} />
                <span className="text-[10px] text-slate-500">{label}</span>
              </div>
            ))}
            <span className="text-[10px] text-slate-600 ml-auto hidden sm:inline">tap any node for details</span>
          </div>
        </>}
      >
        {NODES.map((node) => (
          <DiagramNode
            key={node.id}
            node={node}
            {...nodeState(node.id)}
          />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
