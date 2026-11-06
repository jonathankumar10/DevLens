import { useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildSqlSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

const CW = 620
const CH = 300

const NODES = [
  {
    id: 'client', label: 'Client', icon: '💻', dir: 'left',
    cx: 80, cy: 150, w: 110, h: 82,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'SQL queries', sub2: 'application layer',
    desc: 'The application issuing SQL queries — a web server, background job, or analytics tool.',
    note: 'Connection pooling is essential: each DB connection is expensive. Use PgBouncer or HikariCP to reuse connections.',
  },
  {
    id: 'db', label: 'SQL Database', icon: '🗄️', dir: 'top',
    cx: 340, cy: 150, w: 140, h: 88,
    color: '#3b82f6', glow: 'rgba(59,130,246,0.65)', lc: '#93c5fd', strip: 'bg-blue-500',
    sub1: 'ACID transactions', sub2: 'query planner',
    desc: 'The relational database engine (PostgreSQL, MySQL, SQLite). Parses SQL, plans execution, manages transactions.',
    note: 'The query planner uses table statistics (ANALYZE) to choose between index scan, full scan, and join strategies.',
  },
  {
    id: 'index', label: 'B-tree Index', icon: '🌲', dir: 'top',
    cx: 540, cy: 150, w: 120, h: 82,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'O(log n) lookup', sub2: 'sorted pages',
    desc: 'A B-tree index stores column values in a balanced tree. Lookups traverse ~log₂(n) nodes regardless of table size.',
    note: 'Composite indexes (a, b) serve queries on both columns. CREATE INDEX CONCURRENTLY avoids table locks on PostgreSQL.',
  },
]

const EDGES = {
  'client-db':  { x1: 135, y1: 150, x2: 270, y2: 150 },
  'db-index':   { x1: 410, y1: 150, x2: 480, y2: 150 },
}

const DIR_MAP = {
  request:  { fwd: FLOW.violet,  bwd: null       },
  both:     { fwd: FLOW.violet,  bwd: FLOW.emerald  },
  response: { fwd: FLOW.emerald, bwd: null       },
}

const TX_BADGES = {
  active:    { text: 'TX ACTIVE', color: '#fbbf24', tone: FLOW.amber.hex },
  committed: { text: 'COMMITTED', color: '#34d399', tone: FLOW.emerald.hex },
}

export default function SqlDiagram({ onStepChange }) {
  const steps  = useMemo(() => buildSqlSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  const { nodeState } = useDiagramNodes(steps, index)

  return (
    <div className="space-y-4">

      <DiagramHeader title="SQL — Queries, Indexes & Transactions">
        Step through how SQL queries flow from client to database, how B-tree indexes accelerate lookups, and how ACID transactions guarantee correctness.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIR_MAP} />
          <text x={175} y={138} style={{ fill: '#8b5cf685', fontSize: 9, fontFamily: 'ui-monospace,monospace', fontWeight: 600 }}>
            SQL query
          </text>
          <text x={420} y={138} style={{ fill: '#10b98185', fontSize: 9, fontFamily: 'ui-monospace,monospace', fontWeight: 600 }}>
            index scan
          </text>
        </>}
        footer={<>
          {/* ACID badge */}
          <AnimatePresence>
            {step.transactionState === 'committed' && (
              <motion.div
                key="acid"
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/[0.07] px-4 py-2.5"
              >
                <span className="text-emerald-400 select-none">✓</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Transaction Committed — ACID guaranteed</p>
                  <p className="text-[11px] font-mono text-emerald-300">Durable write to WAL · all-or-nothing atomicity</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,  glow: FLOW.violet.glow,  label: 'query / request'  },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'result / response' },
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
            tone={node.id === 'db' ? TX_BADGES[step.transactionState]?.tone : null}
            badge={node.id === 'db' ? TX_BADGES[step.transactionState] ?? null : null}
          />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
