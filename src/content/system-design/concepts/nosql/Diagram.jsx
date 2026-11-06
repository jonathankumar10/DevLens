import { useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildNoSqlSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

const CW = 640
const CH = 295

const NODES = [
  {
    id: 'client', label: 'Client', icon: '💻', dir: 'left',
    cx: 68, cy: 148, w: 96, h: 76,
    color: '#94a3b8', glow: 'rgba(148,163,184,0.55)', lc: '#cbd5e1', strip: 'bg-slate-400',
    sub1: 'app layer', sub2: 'any access pattern',
    desc: 'The application. NoSQL lets you model data to match exactly how the app reads it — one document per page load instead of multiple JOINs.',
    note: 'Drive schema design from your access patterns, not normalisation rules.',
  },
  {
    id: 'nosql', label: 'NoSQL DB', icon: '🗂️', dir: 'top',
    cx: 300, cy: 148, w: 130, h: 90,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'document store', sub2: 'MongoDB / Firestore',
    desc: 'Document store — each record is a schema-free JSON document. Fields vary between documents. Nested objects and arrays allowed. No ALTER TABLE.',
    note: 'Other NoSQL types: key-value (Redis), wide-column (Cassandra), graph (Neo4j).',
  },
  {
    id: 'node-1', label: 'Node 1', icon: '🖥️', dir: 'top',
    cx: 520, cy: 68, w: 108, h: 74,
    color: '#3b82f6', glow: 'rgba(59,130,246,0.65)', lc: '#93c5fd', strip: 'bg-blue-500',
    sub1: 'shard A + replica', sub2: 'us-east-1',
    desc: 'Holds one shard of the dataset plus replica copies of other shards. Reads for its shard are handled locally.',
    note: 'Adding this node increases both storage and write throughput — true horizontal scaling.',
  },
  {
    id: 'node-2', label: 'Node 2', icon: '🖥️', dir: 'top',
    cx: 520, cy: 157, w: 108, h: 74,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'shard B + replica', sub2: 'us-west-2',
    desc: 'A second physical node holding a different shard. Cross-shard queries fan out to all nodes and merge results.',
    note: 'Eventual consistency: a write to Node 2 propagates to Node 1 within milliseconds.',
  },
  {
    id: 'node-3', label: 'Node 3', icon: '🖥️', dir: 'bottom',
    cx: 520, cy: 245, w: 108, h: 74,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: 'shard C + replica', sub2: 'eu-west-1',
    desc: 'Third node in a different region. Geo-distributed replication enables low-latency reads worldwide.',
    note: 'Cassandra and DynamoDB replicate across regions automatically — no application changes needed.',
  },
]

const EDGES = {
  'client-nosql':  { x1: 116, y1: 148, x2: 235, y2: 148 },
  'nosql-node-1':  { x1: 365, y1: 113, x2: 466, y2: 80 },
  'nosql-node-2':  { x1: 365, y1: 148, x2: 466, y2: 157 },
  'nosql-node-3':  { x1: 365, y1: 183, x2: 466, y2: 235 },
}

const DB_MODE_BADGE = {
  document: { label: 'DOCUMENT STORE',       color: FLOW.violet.hex, bg: 'bg-violet-500/[0.08]',  border: 'border-violet-500/40',  icon: '🗂️',  note: 'schema-free JSON · nested objects · no migration' },
  eventual: { label: 'EVENTUAL CONSISTENCY',  color: FLOW.amber.hex,  bg: 'bg-amber-500/[0.08]',   border: 'border-amber-500/40',   icon: '⏱️',  note: 'writes propagate to replicas within milliseconds' },
  base:     { label: 'BASE SEMANTICS',        color: FLOW.blue.hex,   bg: 'bg-blue-500/[0.08]',    border: 'border-blue-500/40',    icon: '⚖️',  note: 'Basically Available · Soft state · Eventually consistent' },
}

export default function NoSqlDiagram({ onStepChange }) {
  const steps  = useMemo(() => buildNoSqlSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  const { nodeState } = useDiagramNodes(steps, index)

  const badge = step.dbMode ? DB_MODE_BADGE[step.dbMode] : null

  return (
    <div className="space-y-4">

      <DiagramHeader title="NoSQL — Horizontal Scale & Flexible Schemas">
        Step through document storage, horizontal scaling, eventual consistency, and BASE semantics to know when to choose NoSQL.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} />
        </>}
        footer={<>
          <AnimatePresence mode="wait">
            {badge && (
              <motion.div
                key={step.dbMode}
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
              { color: FLOW.violet.hex,  glow: FLOW.violet.glow,  label: 'request / write' },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'response / replication' },
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
