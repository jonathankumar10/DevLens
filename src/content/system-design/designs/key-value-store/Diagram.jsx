import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildKeyValueStoreSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import StepBanner from '../../../../components/ui/StepBanner'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

// ── Layout ────────────────────────────────────────────────────────────────────
// Left:   client
// Center: coordinator (any node acting as request router)
// Right:  three storage nodes (A, B, C) stacked vertically
// Bottom: consistent hash ring indicator

const CW = 720
const CH = 370

const NODES = [
  {
    id: 'client', label: 'Client', icon: '💻', dir: 'left',
    cx: 62, cy: 175, w: 96, h: 74,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'PUT / GET', sub2: 'any node',
    desc: 'Application sending read/write requests. Can target any node in the cluster — there is no primary gatekeeper.',
    note: 'Clients hold the cluster topology and hash the key locally to pick a coordinator.',
  },
  {
    id: 'coordinator', label: 'Coordinator', icon: '🔀', dir: 'top',
    cx: 245, cy: 175, w: 118, h: 78,
    color: '#6366f1', glow: 'rgba(99,102,241,0.65)', lc: '#a5b4fc', strip: 'bg-indigo-500',
    sub1: 'any node', sub2: 'routes + fans out',
    desc: 'The node that received the request acts as coordinator. It hashes the key, identifies the replica set, and fans out reads/writes.',
    note: 'The coordinator role is stateless and per-request — any node can be coordinator without configuration.',
  },
  {
    id: 'nodeA', label: 'Node A', icon: '🗄️', dir: 'right',
    cx: 500, cy: 100, w: 110, h: 76,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'primary replica', sub2: 'LSM tree',
    desc: 'Primary owner of the key range. Writes to WAL first (sequential I/O), then memtable. Periodically flushed to SSTables on disk.',
    note: 'LSM trees make writes fast (sequential) at the cost of more complex reads (multi-level merge).',
  },
  {
    id: 'nodeB', label: 'Node B', icon: '🗄️', dir: 'right',
    cx: 500, cy: 200, w: 110, h: 76,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'replica 2', sub2: 'async replication',
    desc: 'Second replica in the preference list. Receives writes asynchronously from the primary. Participates in quorum reads.',
    note: 'Asynchronous replication means B may briefly lag behind A — this is the source of eventual consistency.',
  },
  {
    id: 'nodeC', label: 'Node C', icon: '🗄️', dir: 'right',
    cx: 500, cy: 300, w: 110, h: 76,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: 'replica 3', sub2: 'hinted handoff',
    desc: 'Third replica. Can go offline; coordinator uses sloppy quorum and stores a hint for when C recovers.',
    note: 'Hinted handoff enables "always writable" — the system never refuses a write due to one failed replica.',
  },
  {
    id: 'ring', label: 'Hash Ring', icon: '⭕', dir: 'bottom',
    cx: 245, cy: 310, w: 120, h: 70,
    color: '#a855f7', glow: 'rgba(168,85,247,0.65)', lc: '#d8b4fe', strip: 'bg-purple-500',
    sub1: 'SHA-256 positions', sub2: 'virtual nodes',
    desc: 'Consistent hash ring. Each node owns a range of the ring. Virtual nodes spread a single physical node across multiple ring positions for even load.',
    note: 'Adding a node only rebalances the adjacent key range — not the full dataset. This is why consistent hashing replaced modulo hashing.',
  },
]

const EDGES = {
  'client-coordinator':  { x1: 110, y1: 175, x2: 186, y2: 175 },
  'coordinator-nodeA':   { x1: 304, y1: 155, x2: 445, y2: 118 },
  'coordinator-nodeB':   { x1: 304, y1: 178, x2: 445, y2: 200 },
  'coordinator-nodeC':   { x1: 304, y1: 195, x2: 445, y2: 280 },
  'nodeA-nodeB':         { x1: 500, y1: 138, x2: 500, y2: 162 },
  'nodeB-nodeC':         { x1: 500, y1: 238, x2: 500, y2: 262 },
  'nodeA-coordinator':   { x1: 445, y1: 112, x2: 304, y2: 158 },
  'nodeB-coordinator':   { x1: 445, y1: 195, x2: 304, y2: 180 },
  'coordinator-ring':    { x1: 245, y1: 214, x2: 245, y2: 275 },
}

const DIR_MAP = {
  request:   { fwd: FLOW.violet,   bwd: null },
  response:  { fwd: FLOW.emerald,  bwd: null },
  both:      { fwd: FLOW.amber,    bwd: FLOW.amber },
  replicate: { fwd: FLOW.sky, bwd: null },
}

// ── Edge connection ───────────────────────────────────────────────────────────

// ── Node block ────────────────────────────────────────────────────────────────

// ── Quorum badge ──────────────────────────────────────────────────────────────

function QuorumBadge({ type }) {
  if (type !== 'quorum-write' && type !== 'quorum-read') return null
  const isWrite = type === 'quorum-write'
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={type}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
          isWrite
            ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
        }`}
      >
        <span>{isWrite ? '✍️' : '📖'}</span>
        {isWrite ? 'W=2 of N=3 — write quorum' : 'R=2 of N=3 — read quorum  ·  W+R=4 > N=3'}
      </motion.div>
    </AnimatePresence>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

// How a crashed replica is drawn.
const DOWN_NODE = (node) => ({ ...node, icon: '💀', label: `${node.label} ✕`, sub1: 'unavailable' })

export default function KeyValueStoreDiagram() {
  const steps  = useMemo(() => buildKeyValueStoreSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  const { nodeState } = useDiagramNodes(steps, index)

  const nodeCDown = step.type === 'hinted-handoff'

  return (
    <div className="space-y-4">

      <DiagramHeader title="Key-Value Store Architecture">
        Trace consistent hashing, quorum reads/writes, gossip failure detection, and conflict resolution.
      </DiagramHeader>

      <QuorumBadge type={step.type} />

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIR_MAP} />
          {/* N=3 W=2 R=2 annotation */}
          <text x={176} y={270} style={{ fill: '#6d28d9', fontSize: 8, fontFamily: 'monospace', fontWeight: 700, opacity: 0.6 }}>N=3  W=2  R=2</text>
          <text x={176} y={280} style={{ fill: '#6d28d9', fontSize: 8, fontFamily: 'monospace', opacity: 0.6 }}>W+R=4 &gt; N=3</text>
          <text x={440} y={20} style={{ fill: '#064e3b', fontSize: 8, fontFamily: 'monospace', fontWeight: 700, opacity: 0.7 }}>REPLICA SET  (N=3)</text>
        </>}
        footer={<>
          <StepBanner banner={step.banner} />

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,   glow: FLOW.violet.glow,   label: 'request / route' },
              { color: FLOW.emerald.hex,  glow: FLOW.emerald.glow,  label: 'response / ack' },
              { color: FLOW.sky.hex, glow: FLOW.sky.glow, label: 'replication' },
              { color: FLOW.amber.hex,    glow: FLOW.amber.glow,    label: 'gossip / both' },
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
            node={nodeCDown && node.id === 'nodeC' ? DOWN_NODE(node) : node}
            {...nodeState(node.id)}
            tone={nodeCDown && node.id === 'nodeC' ? FLOW.red.hex : null}
          />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
