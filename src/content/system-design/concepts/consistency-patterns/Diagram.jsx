import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildConsistencyPatternsSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

const CW = 640
const CH = 310

const NODES = [
  {
    id: 'writer', label: 'Writer', icon: '✍️', dir: 'left',
    cx: 72, cy: 155, w: 104, h: 74,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'writes x=1', sub2: 'client / app server',
    desc: 'The writer sends a write operation to the primary. The consistency model determines how quickly and how reliably that write becomes visible to subsequent readers.',
    note: 'In a well-designed system, the writer\'s consistency requirement (strong, eventual, etc.) is set per-operation based on the business need — not globally for the entire service.',
  },
  {
    id: 'primary', label: 'Primary DB', icon: '🗄️', dir: 'top',
    cx: 280, cy: 155, w: 122, h: 80,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'receives writes', sub2: 'source of truth',
    desc: 'The primary database node that receives all write operations. The consistency level determines how many replicas must confirm before the primary acknowledges the write.',
    note: 'Strong consistency: waits for quorum ACK before replying. Eventual consistency: acknowledges immediately and replicates asynchronously.',
  },
  {
    id: 'replica-a', label: 'Replica A', icon: '💾', dir: 'right',
    cx: 490, cy: 95, w: 116, h: 74,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'sync / async copy', sub2: 'serves reads',
    desc: 'A read replica that receives replication from the primary. In strong consistency, the primary waits for this replica to confirm before acknowledging the write.',
    note: 'Read replicas handle 80-95% of traffic in read-heavy systems. The consistency level per read determines whether you hit the replica or the primary.',
  },
  {
    id: 'replica-b', label: 'Replica B', icon: '💾', dir: 'right',
    cx: 490, cy: 225, w: 116, h: 74,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: 'async copy', sub2: 'may lag behind',
    desc: 'A second read replica, potentially in a different availability zone or region. May be slightly behind Replica A due to replication lag differences.',
    note: 'Without monotonic reads, a user can see data from Replica A (fast) then stale data from Replica B (lagging) on the next request — the time-travel anti-pattern.',
  },
]

const EDGES = {
  'writer-primary': { x1: 124, y1: 155, x2: 219, y2: 155 },
  'primary-ra':     { x1: 341, y1: 128, x2: 432, y2: 108 },
  'primary-rb':     { x1: 341, y1: 182, x2: 432, y2: 212 },
}

const CONSISTENCY_INFO = {
  strong:           { label: 'Strong Consistency',      color: 'sky',     sub: 'Quorum write confirmed before ACK — every reader sees the latest write' },
  eventual:         { label: 'Eventual Consistency',    color: 'amber',   sub: 'Write acknowledged immediately — replicas sync asynchronously in ms–s' },
  weak:             { label: 'Weak Consistency',        color: 'rose',    sub: 'No timing guarantee — reads may miss the write indefinitely' },
  'read-your-writes': { label: 'Read-Your-Writes',      color: 'violet',  sub: 'You always see your own writes — others may briefly see stale data' },
  'monotonic-reads':  { label: 'Monotonic Reads',       color: 'emerald', sub: 'Once you see version V, you never see an older version on any read' },
  causal:           { label: 'Causal Consistency',      color: 'sky',     sub: 'Causally related writes appear in order — independent writes may reorder' },
  session:          { label: 'Session Consistency',     color: 'violet',  sub: 'Read-your-writes + monotonic reads within your session' },
}

const COLOR_MAP = {
  sky:     { bg: 'bg-sky-500/10',     border: 'border-sky-500/40',     text: 'text-sky-400'     },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/40',   text: 'text-amber-400'   },
  rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/40',    text: 'text-rose-400'    },
  violet:  { bg: 'bg-violet-500/10',  border: 'border-violet-500/40',  text: 'text-violet-400'  },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-400' },
}

const STALE = { text: 'STALE', color: FLOW.amber.hex }

// Under eventual consistency the primary → replica B link is asynchronous.
const { x1: RB_X1, y1: RB_Y1, x2: RB_X2, y2: RB_Y2 } = EDGES['primary-rb']
const ASYNC_LABEL = (
  <text x={(RB_X1 + RB_X2) / 2 - 8} y={(RB_Y1 + RB_Y2) / 2 - 6} fill={FLOW.amber.hex} fontSize="7" fontWeight="600"
    style={{ filter: `drop-shadow(0 0 3px ${FLOW.amber.glow})` }}>
    async
  </text>
)
const asyncReplication = (direction) => ({ dashed: '6 4', children: direction ? ASYNC_LABEL : null })

export default function ConsistencyPatternsDiagram() {
  const steps  = useMemo(() => buildConsistencyPatternsSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  const { nodeState } = useDiagramNodes(steps, index)

  const consistencyInfo = step.consistency ? CONSISTENCY_INFO[step.consistency] : null
  const colorStyle = consistencyInfo ? COLOR_MAP[consistencyInfo.color] : null

  const showStaleBadge = step.consistency === 'eventual' || step.consistency === 'weak'

  return (
    <div className="space-y-4">
      <DiagramHeader title="Consistency Patterns">
        Step through strong, eventual, weak, read-your-writes, monotonic, and causal consistency. See what each guarantees — and what it costs.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <text x="72"  y="22" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="600" letterSpacing="1.5">WRITER</text>
          <text x="280" y="22" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="600" letterSpacing="1.5">PRIMARY</text>
          <text x="490" y="22" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="600" letterSpacing="1.5">REPLICAS</text>

          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} edgeProps={(edgeId, direction) => (step.consistency === 'eventual' && edgeId === 'primary-rb' ? asyncReplication(direction) : null)} />
        </>}
        footer={<>
          <AnimatePresence mode="wait">
            {consistencyInfo && colorStyle && (
              <motion.div
                key={step.consistency}
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className={`mt-3 flex items-center gap-3 rounded-xl border px-4 py-2.5 ${colorStyle.bg} ${colorStyle.border}`}
              >
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${colorStyle.text}`}>{consistencyInfo.label}</p>
                  <p className={`text-[11px] font-mono ${colorStyle.text} opacity-80`}>{consistencyInfo.sub}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px rounded-full" style={{ background: FLOW.violet.hex, boxShadow: `0 0 4px ${FLOW.violet.glow}` }} />
              <span className="text-[10px] text-slate-500">write / request</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px rounded-full" style={{ background: FLOW.emerald.hex, boxShadow: `0 0 4px ${FLOW.emerald.glow}` }} />
              <span className="text-[10px] text-slate-500">replication / response</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-2 border-b-2 border-dashed rounded-full" style={{ borderColor: FLOW.amber.hex }} />
              <span className="text-[10px] text-slate-500">async / eventual</span>
            </div>
            <span className="text-[10px] text-slate-600 ml-auto hidden sm:inline">tap any node for details</span>
          </div>
        </>}
      >
        {NODES.map((node) => (
          <DiagramNode
            key={node.id}
            node={node}
            {...nodeState(node.id)}
            badge={showStaleBadge && node.id === 'replica-b' && step.activeNodes.includes('replica-a') ? STALE : null}
          />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
