import { useMemo } from 'react'
import { buildFileStorageSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import StepBanner from '../../../../components/ui/StepBanner'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

// ── Layout ────────────────────────────────────────────────────────────────────
// Left:         client (Device 1), syncClient (Sync Client)
// Center-left:  apiSvc (API Service)
// Center:       metaDB (Metadata DB)
// Center-right: chunkStore (Object Storage), cdn (CDN)
// Right:        notifSvc (Notification Service), device2 (Device 2)

const CW = 740
const CH = 350

const NODES = [
  {
    id: 'client', label: 'Device 1', icon: '💻', dir: 'left',
    cx: 56, cy: 105, w: 92, h: 70,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'user device', sub2: 'any platform',
    desc: 'The user\'s primary device — desktop, laptop, or mobile. Changes detected by file system watcher.',
    note: 'The sync client runs as a background process, watching for file system events.',
  },
  {
    id: 'syncClient', label: 'Sync Client', icon: '🔄', dir: 'left',
    cx: 56, cy: 215, w: 92, h: 70,
    color: '#7c3aed', glow: 'rgba(124,58,237,0.65)', lc: '#c4b5fd', strip: 'bg-violet-700',
    sub1: 'chunk + hash', sub2: 'diff local index',
    desc: 'Computes SHA-256 per chunk, diffs against the local index, and uploads only new chunks. Also reassembles chunks on download.',
    note: 'The client owns the diff logic — the server is a store + notifier, not a diff engine.',
  },
  {
    id: 'apiSvc', label: 'API Service', icon: '⚙️', dir: 'top',
    cx: 210, cy: 160, w: 108, h: 72,
    color: '#6366f1', glow: 'rgba(99,102,241,0.65)', lc: '#a5b4fc', strip: 'bg-indigo-500',
    sub1: 'REST / gRPC', sub2: 'auth + routing',
    desc: 'Validates uploads, checks deduplication, orchestrates writes to Metadata DB and object storage, and triggers sync notifications.',
    note: 'Separates metadata operations (relational DB) from binary content (object storage) — different scaling tiers.',
  },
  {
    id: 'metaDB', label: 'Metadata DB', icon: '🗂️', dir: 'top',
    cx: 370, cy: 105, w: 112, h: 72,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'PostgreSQL', sub2: 'file tree + versions',
    desc: 'Stores file hierarchy, chunk hash lists, version history, share permissions, and device sync state. Relational DB for ACID guarantees on metadata.',
    note: 'Never mix metadata and content in the same store — they have different access patterns and scale independently.',
  },
  {
    id: 'chunkStore', label: 'Object Storage', icon: '🪣', dir: 'top',
    cx: 370, cy: 215, w: 112, h: 72,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: 'S3 / GCS', sub2: 'content-addressed',
    desc: 'Stores raw chunk bytes, keyed by SHA-256 hash. Immutable blobs — chunks are written once, never overwritten. Deduplication happens naturally.',
    note: 'Chunk key = SHA-256(content) means identical content from any user is stored exactly once.',
  },
  {
    id: 'cdn', label: 'CDN', icon: '🌐', dir: 'bottom',
    cx: 370, cy: 305, w: 112, h: 66,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'edge cache', sub2: 'hot chunks',
    desc: 'Caches frequently downloaded chunks at edge nodes close to users. Reduces object storage egress costs for popular shared files.',
    note: 'Cold / rarely accessed chunks fall back to object storage. CDN TTL tuned to file version lifecycle.',
  },
  {
    id: 'notifSvc', label: 'Notif Service', icon: '📣', dir: 'right',
    cx: 572, cy: 105, w: 112, h: 70,
    color: '#a855f7', glow: 'rgba(168,85,247,0.65)', lc: '#d8b4fe', strip: 'bg-purple-500',
    sub1: 'WebSocket / poll', sub2: 'push sync events',
    desc: 'Pushes "file changed" events to all connected devices for the affected user. Devices then pull only the new chunk hashes.',
    note: 'Long polling or WebSocket — the device does not poll for changes; the server pushes them.',
  },
  {
    id: 'device2', label: 'Device 2', icon: '📱', dir: 'right',
    cx: 690, cy: 160, w: 92, h: 70,
    color: '#06b6d4', glow: 'rgba(6,182,212,0.65)', lc: '#67e8f9', strip: 'bg-cyan-500',
    sub1: 'phone / tablet', sub2: 'receives sync',
    desc: 'Second user device. Receives push sync notification, fetches only new chunks, and assembles the updated file locally.',
    note: 'If both devices are offline and edit the same file, a conflict copy is created on sync.',
  },
]

const EDGES = {
  'syncClient-apiSvc':  { x1: 102, y1: 215, x2: 156, y2: 185 },
  'client-syncClient':  { x1: 56,  y1: 140, x2: 56,  y2: 180 },
  'client-apiSvc':      { x1: 102, y1: 110, x2: 156, y2: 148 },
  'apiSvc-metaDB':      { x1: 264, y1: 145, x2: 314, y2: 122 },
  'apiSvc-chunkStore':  { x1: 264, y1: 175, x2: 314, y2: 205 },
  'apiSvc-notifSvc':    { x1: 264, y1: 152, x2: 516, y2: 122 },
  'cdn-chunkStore':     { x1: 370, y1: 272, x2: 370, y2: 251 },
  'device2-cdn':        { x1: 644, y1: 185, x2: 426, y2: 290 },
  'device2-apiSvc':     { x1: 644, y1: 168, x2: 264, y2: 162 },
  'notifSvc-device2':   { x1: 628, y1: 120, x2: 644, y2: 148 },
}

const DIR_MAP = {
  request:  { fwd: FLOW.violet,  bwd: null },
  response: { fwd: FLOW.emerald, bwd: null },
  both:     { fwd: FLOW.violet,  bwd: FLOW.emerald },
  write:    { fwd: FLOW.amber,    bwd: null },
  notify:   { fwd: FLOW.purple,   bwd: null },
}

// ── Edge connection ───────────────────────────────────────────────────────────

// ── Node block ────────────────────────────────────────────────────────────────

// ── Main component ────────────────────────────────────────────────────────────

export default function FileStorageDiagram() {
  const steps  = useMemo(() => buildFileStorageSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  const { nodeState } = useDiagramNodes(steps, index)


  return (
    <div className="space-y-4">

      <DiagramHeader title="File Storage Architecture">
        Trace upload chunking, deduplication, cross-device sync, CDN delivery, and conflict resolution.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIR_MAP} />
          <text x={12}  y={20} style={{ fill: '#4c1d95', fontSize: 8, fontFamily: 'monospace', fontWeight: 700, opacity: 0.7 }}>CLIENT</text>
          <text x={162} y={20} style={{ fill: '#312e81', fontSize: 8, fontFamily: 'monospace', fontWeight: 700, opacity: 0.7 }}>API LAYER</text>
          <text x={320} y={20} style={{ fill: '#0c4a6e', fontSize: 8, fontFamily: 'monospace', fontWeight: 700, opacity: 0.7 }}>STORAGE</text>
          <text x={526} y={20} style={{ fill: '#4a044e', fontSize: 8, fontFamily: 'monospace', fontWeight: 700, opacity: 0.7 }}>DELIVERY</text>
        </>}
        footer={<>
          <StepBanner banner={step.banner} />

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,  glow: FLOW.violet.glow,  label: 'upload / request' },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'download / response' },
              { color: FLOW.amber.hex,    glow: FLOW.amber.glow,    label: 'write / store' },
              { color: FLOW.purple.hex,   glow: FLOW.purple.glow,   label: 'sync notification' },
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
