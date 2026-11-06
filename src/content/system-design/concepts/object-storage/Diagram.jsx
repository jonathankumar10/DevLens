import { useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildObjectStorageSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

// ── Layout ────────────────────────────────────────────────────────────────────
// Client (left) → Object Storage API (center) → Storage Nodes A/B/C (right, stacked)

const CW = 640
const CH = 300

const NODES = [
  {
    id: 'client', label: 'Client', icon: '💻', dir: 'bottom',
    cx: 72, cy: 150, w: 100, h: 78,
    color: '#94a3b8', glow: 'rgba(148,163,184,0.65)', lc: '#cbd5e1', strip: 'bg-slate-400',
    sub1: 'HTTP PUT / GET', sub2: 'browser / backend',
    desc: 'Makes HTTP calls to the storage API. For large uploads, uses presigned URLs to write directly — bypassing application servers entirely.',
    note: 'Never route file uploads through your app servers. Use presigned URLs for direct S3 access.',
  },
  {
    id: 'api', label: 'S3 API', icon: '☁️', dir: 'top',
    cx: 290, cy: 150, w: 128, h: 86,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'object storage', sub2: 'REST API / SDK',
    desc: 'The storage service API (AWS S3, GCS, Azure Blob). Handles authentication, generates object keys, and orchestrates replication across nodes.',
    note: 'Bucket names are globally unique and become part of the URL — choose carefully, they cannot be renamed.',
  },
  {
    id: 'nodeA', label: 'Node A', icon: '💾', dir: 'right',
    cx: 548, cy: 80, w: 100, h: 72,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'AZ-1', sub2: 'replica 1/3',
    desc: 'Storage node in Availability Zone 1. Each S3 object is stored in at least 3 AZs for 11-nines durability.',
    note: 'Durability: 99.999999999%. Even if two AZs fail simultaneously, your data is safe.',
  },
  {
    id: 'nodeB', label: 'Node B', icon: '💾', dir: 'right',
    cx: 548, cy: 155, w: 100, h: 72,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'AZ-2', sub2: 'replica 2/3',
    desc: 'Storage node in Availability Zone 2. Stores the same object independently.',
    note: 'Read-after-write consistency: a GET immediately after PUT returns the new object, guaranteed.',
  },
  {
    id: 'nodeC', label: 'Node C', icon: '💾', dir: 'right',
    cx: 548, cy: 230, w: 100, h: 72,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'AZ-3', sub2: 'replica 3/3',
    desc: 'Storage node in Availability Zone 3. Third replica ensures durability even if two AZs are lost.',
    note: 'Lifecycle policy can move objects from Standard → Infrequent Access → Glacier to cut storage costs automatically.',
  },
]

const EDGES = {
  'client-api':  { x1: 122, y1: 150, x2: 226, y2: 150 },
  'api-nodeA':   { x1: 354, y1: 120, x2: 498, y2: 92 },
  'api-nodeB':   { x1: 354, y1: 150, x2: 498, y2: 155 },
  'api-nodeC':   { x1: 354, y1: 180, x2: 498, y2: 218 },
}

const DIR_C_MAP = {
  request:   FLOW.violet,
  response:  FLOW.emerald,
  replicate: FLOW.blue,
  presigned: FLOW.amber,
  both:      FLOW.violet,
}

// ── Edge connection ───────────────────────────────────────────────────────────

// ── Node block ────────────────────────────────────────────────────────────────

// ── Main component ────────────────────────────────────────────────────────────

export default function ObjectStorageDiagram({ onStepChange }) {
  const steps  = useMemo(() => buildObjectStorageSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  const { nodeState } = useDiagramNodes(steps, index)

  const showKeyBadge    = step.type === 'key-generated'
  const showPresigned   = step.type === 'presigned-url'
  const showReplicated  = step.type === 'replication'

  return (
    <div className="space-y-4">

      <DiagramHeader title="Object Storage — Upload, Replicate, Retrieve">
        Trace a file from HTTP PUT through key assignment, three-way AZ replication, and retrieval by key.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} />
          {/* Replica label */}
          {showReplicated && (
            <text x={388} y={106} style={{ fill: '#3b82f6', fontSize: 8, fontFamily: 'ui-monospace, monospace', fontWeight: 700, opacity: 0.8 }}>
              3× replicate
            </text>
          )}
        </>}
        footer={<>
          {/* Status banners */}
          <AnimatePresence mode="wait">
            {showKeyBadge && (
              <motion.div
                key="key"
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="relative mt-3 flex items-center gap-4 rounded-xl border border-violet-500/40 bg-violet-500/[0.06] px-4 py-3 overflow-hidden"
              >
                <span className="text-xl relative z-10 select-none">🔑</span>
                <div className="relative z-10">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-violet-400">Object Key Assigned</p>
                  <p className="text-sm font-mono text-white">uploads/2024/user-123/<span className="text-violet-300 font-bold">avatar.jpg</span></p>
              </div>
            </motion.div>
            )}
            {showPresigned && (
              <motion.div
                key="presigned"
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="relative mt-3 flex items-center gap-4 rounded-xl border border-amber-500/40 bg-amber-500/[0.06] px-4 py-3 overflow-hidden"
              >
                <span className="text-xl relative z-10 select-none">⏱️</span>
                <div className="relative z-10">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Presigned URL Generated</p>
                  <p className="text-sm font-mono text-white">expires in <span className="text-amber-300 font-bold">15 min</span> · client uploads directly to S3</p>
              </div>
            </motion.div>
            )}
            {showReplicated && (
              <motion.div
                key="replicated"
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="relative mt-3 flex items-center gap-4 rounded-xl border border-emerald-500/40 bg-emerald-500/[0.06] px-4 py-3 overflow-hidden"
              >
                <span className="text-xl relative z-10 select-none">✅</span>
                <div className="relative z-10">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Replicated — 3 AZs</p>
                  <p className="text-sm text-white">Durability: <span className="text-emerald-300 font-bold">99.999999999%</span> (11 nines)</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,   glow: FLOW.violet.glow,   label: 'upload / request'   },
              { color: FLOW.emerald.hex,  glow: FLOW.emerald.glow,  label: 'retrieve / response'},
              { color: FLOW.blue.hex, glow: FLOW.blue.glow, label: 'replication'         },
              { color: FLOW.amber.hex, glow: FLOW.amber.glow, label: 'presigned URL'       },
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
            badge={node.id === 'api' && step.badge && step.activeNodes.includes(node.id) ? { text: step.badge, color: '#c4b5fd' } : null}
          />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
