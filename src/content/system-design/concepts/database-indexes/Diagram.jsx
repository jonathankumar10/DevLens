import { useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildDatabaseIndexesSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

const CW = 620
const CH = 280

const NODES = [
  {
    id: 'table', label: 'Table', icon: '📋', dir: 'left',
    cx: 95, cy: 140, w: 110, h: 84,
    color: '#3b82f6', glow: 'rgba(59,130,246,0.65)', lc: '#93c5fd', strip: 'bg-blue-500',
    sub1: '10M rows', sub2: 'heap pages',
    desc: 'The base table stored on disk as unordered heap pages. Without an index every query reads all 10M rows.',
    note: 'A sequential scan of 10M rows may take 150ms+ even when data is cached in memory.',
  },
  {
    id: 'btree', label: 'B-Tree Index', icon: '🌳', dir: 'top',
    cx: 370, cy: 80, w: 130, h: 84,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'O(log n) lookup', sub2: 'sorted leaf list',
    desc: 'A balanced tree sorted by the indexed column. Each leaf node holds column values and row pointers (ctid/rowid). Leaf nodes are linked for efficient range scans.',
    note: 'PostgreSQL and MySQL default to B-tree. Supports equality, range, ORDER BY, and prefix matching.',
  },
  {
    id: 'disk', label: 'Disk / Heap', icon: '💾', dir: 'bottom',
    cx: 370, cy: 218, w: 130, h: 76,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: 'heap pages', sub2: 'random I/O',
    desc: 'Physical storage on disk. An index lookup returns a row pointer (ctid), then the engine fetches the actual row from its heap page.',
    note: 'A covering index eliminates this step entirely — data is returned directly from the index.',
  },
]

const EDGES = {
  'table-btree': { x1: 150, y1: 118, x2: 305, y2: 88 },
  'table-disk':  { x1: 150, y1: 162, x2: 305, y2: 210 },
  'btree-disk':  { x1: 370, y1: 122, x2: 370, y2: 180 },
}

const DIR_MAP = {
  both:     { fwd: FLOW.blue,    bwd: FLOW.emerald },
  request:  { fwd: FLOW.violet,  bwd: null       },
  response: { fwd: FLOW.emerald, bwd: null       },
  write:    { fwd: FLOW.amber,   bwd: null       },
}

const QUERY_BADGE = {
  scan:      { label: 'SEQ SCAN',         color: FLOW.red.hex,     bg: 'bg-red-500/[0.08]',     border: 'border-red-500/40',     icon: '🐢', note: 'O(n) — reads all 10M rows' },
  create:    { label: 'CREATE INDEX',     color: FLOW.violet.hex,  bg: 'bg-violet-500/[0.08]',  border: 'border-violet-500/40',  icon: '🌳', note: 'one-time build cost' },
  indexed:   { label: 'INDEX SCAN',       color: FLOW.violet.hex,  bg: 'bg-violet-500/[0.08]',  border: 'border-violet-500/40',  icon: '⚡', note: 'O(log n) — ~0.1 ms' },
  range:     { label: 'INDEX RANGE SCAN', color: FLOW.violet.hex,  bg: 'bg-violet-500/[0.08]',  border: 'border-violet-500/40',  icon: '📊', note: 'walks sorted leaf list' },
  composite: { label: 'COMPOSITE INDEX',  color: FLOW.blue.hex,    bg: 'bg-blue-500/[0.08]',    border: 'border-blue-500/40',    icon: '🔑', note: 'leftmost-prefix rule' },
  write:     { label: 'WRITE OVERHEAD',   color: FLOW.amber.hex,   bg: 'bg-amber-500/[0.08]',   border: 'border-amber-500/40',   icon: '⚠️', note: '11 writes for 1 row + 10 indexes' },
  covering:  { label: 'COVERING INDEX',   color: FLOW.emerald.hex, bg: 'bg-emerald-500/[0.08]', border: 'border-emerald-500/40', icon: '✓',  note: 'index-only scan — disk never touched' },
}

export default function DatabaseIndexesDiagram({ onStepChange }) {
  const steps  = useMemo(() => buildDatabaseIndexesSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  const { nodeState } = useDiagramNodes(steps, index)

  const badge = step.queryType ? QUERY_BADGE[step.queryType] : null

  return (
    <div className="space-y-4">

      <DiagramHeader title="Database Indexes — B-Tree in Action">
        See how a B-tree index transforms a full table scan into an O(log n) lookup, and when indexes hurt.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIR_MAP} />
          <text x={225} y={65}  style={{ fill: FLOW.violet.hex, fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 600, opacity: 0.65 }}>FAST PATH  O(log n)</text>
          <text x={225} y={235} style={{ fill: FLOW.amber.hex,  fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 600, opacity: 0.65 }}>SLOW PATH  O(n)</text>
        </>}
        footer={<>
          <AnimatePresence mode="wait">
            {badge && (
              <motion.div
                key={step.queryType}
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                className={`mt-3 flex items-center gap-3 rounded-xl border px-4 py-2.5 ${badge.bg} ${badge.border}`}
              >
                <span className="select-none">{badge.icon}</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider font-mono" style={{ color: badge.color }}>{badge.label}</p>
                  <p className="text-[11px] font-mono" style={{ color: badge.color, opacity: 0.75 }}>{badge.note}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex, glow: FLOW.violet.glow, label: 'index lookup (fast path)' },
              { color: FLOW.amber.hex,  glow: FLOW.amber.glow,  label: 'table scan / write overhead' },
              { color: FLOW.emerald.hex,glow: FLOW.emerald.glow,label: 'result returned'            },
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
