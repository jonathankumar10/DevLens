import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildCapTheoremSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

const CW = 620
const CH = 300

const NODES = [
  {
    id: 'client', label: 'Client', icon: '💻', dir: 'top',
    cx: 310, cy: 55, w: 108, h: 72,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'reads & writes', sub2: 'any node',
    desc: 'The application client that reads and writes to the distributed system. During a partition, the client\'s experience reveals the CP vs AP trade-off.',
    note: 'CP: client sees an error during partition. AP: client sees stale data during partition. Neither is universally "better" — it depends on your use case.',
  },
  {
    id: 'node-a', label: 'Node A', icon: '🖥️', dir: 'left',
    cx: 120, cy: 200, w: 118, h: 80,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'primary / leader', sub2: 'serves reads + writes',
    desc: 'Node A — often the primary or leader in CP systems, one of many peers in AP systems. Replicates state to Node B when the network is healthy.',
    note: 'In CP systems, Node A may refuse to accept writes during a partition if it cannot confirm a quorum. In AP systems, Node A keeps serving regardless.',
  },
  {
    id: 'node-b', label: 'Node B', icon: '🖥️', dir: 'right',
    cx: 500, cy: 200, w: 118, h: 80,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'replica / peer', sub2: 'serves reads',
    desc: 'Node B — a replica that stays synchronized with Node A when the network is healthy. During a partition, its behavior depends on the CP vs AP choice.',
    note: 'ZooKeeper (CP): Node B stops serving to avoid returning stale data. Cassandra (AP): Node B keeps serving from whatever state it has.',
  },
]

const EDGES = {
  'client-a': { x1: 256, y1: 91,  x2: 179, y2: 160 },
  'client-b': { x1: 364, y1: 91,  x2: 441, y2: 160 },
  'a-b':      { x1: 238, y1: 200, x2: 441, y2: 200 },
}

const CAP_BADGE = {
  CP: { bg: 'bg-sky-500/10',    border: 'border-sky-500/40',    text: 'text-sky-400',    label: 'CP — Consistent + Partition Tolerant',    sub: 'Refuses requests during partition to guarantee correctness' },
  AP: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-400', label: 'AP — Available + Partition Tolerant', sub: 'Serves stale data during partition to guarantee availability' },
  CA: { bg: 'bg-violet-500/10', border: 'border-violet-500/40', text: 'text-violet-400', label: 'CA — Consistent + Available (single node)', sub: 'Not partition-tolerant — only possible without distribution' },
}

const UNAVAILABLE = { text: 'UNAVAIL', color: FLOW.red.hex }

// The a–b link during a network partition: a gap marked with a pulsing red X.
function PartitionMark({ x1, y1, x2, y2 }) {
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2
  const glow = { filter: `drop-shadow(0 0 5px ${FLOW.red.glow})` }
  return (
    <>
      <line x1={x1} y1={y1} x2={midX - 14} y2={midY} stroke="#374151" strokeWidth={1} strokeDasharray="5 4" />
      <line x1={midX + 14} y1={midY} x2={x2} y2={y2} stroke="#374151" strokeWidth={1} strokeDasharray="5 4" />
      <motion.g animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>
        <line x1={midX - 12} y1={midY - 12} x2={midX + 12} y2={midY + 12} stroke={FLOW.red.hex} strokeWidth={2.5} style={glow} />
        <line x1={midX + 12} y1={midY - 12} x2={midX - 12} y2={midY + 12} stroke={FLOW.red.hex} strokeWidth={2.5} style={glow} />
      </motion.g>
      <text x={midX} y={midY + 22} textAnchor="middle" fill={FLOW.red.hex} fontSize="8" fontWeight="700" style={glow}>
        PARTITION
      </text>
    </>
  )
}
const PARTITIONED = { hidden: true, children: <PartitionMark {...EDGES['a-b']} /> }

export default function CapTheoremDiagram() {
  const steps  = useMemo(() => buildCapTheoremSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  const { nodeState } = useDiagramNodes(steps, index)
  // In CP mode a partitioned node refuses requests rather than answer stale.
  const refusing = step.capChoice === 'CP' && step.partition

  const capBadge = step.capChoice ? CAP_BADGE[step.capChoice] : null

  return (
    <div className="space-y-4">
      <DiagramHeader title="CAP Theorem">
        Watch a network partition split two nodes and force the system to choose between consistency (CP) and availability (AP).
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} edgeProps={(edgeId) => (step.partition && edgeId === 'a-b' ? PARTITIONED : null)} />
        </>}
        footer={<>
          <AnimatePresence mode="wait">
            {capBadge && (
              <motion.div
                key={step.capChoice}
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className={`mt-3 flex items-center gap-3 rounded-xl border px-4 py-2.5 ${capBadge.bg} ${capBadge.border}`}
              >
                <span className={`text-xl font-black ${capBadge.text} select-none`}>{step.capChoice}</span>
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${capBadge.text}`}>{capBadge.label}</p>
                  <p className={`text-[11px] font-mono ${capBadge.text} opacity-80`}>{capBadge.sub}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px rounded-full" style={{ background: FLOW.violet.hex, boxShadow: `0 0 4px ${FLOW.violet.glow}` }} />
              <span className="text-[10px] text-slate-500">request / write</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px rounded-full" style={{ background: FLOW.emerald.hex, boxShadow: `0 0 4px ${FLOW.emerald.glow}` }} />
              <span className="text-[10px] text-slate-500">response / replication</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px rounded-full" style={{ background: FLOW.red.hex, boxShadow: `0 0 4px ${FLOW.red.glow}` }} />
              <span className="text-[10px] text-slate-500">network partition</span>
            </div>
            <span className="text-[10px] text-slate-600 ml-auto hidden sm:inline">tap any node for details</span>
          </div>
        </>}
      >
        {NODES.map((node) => (
          <DiagramNode
            key={node.id}
            {...nodeState(node.id)}
            node={refusing && node.id === 'node-a' ? { ...node, sub1: 'REFUSING' } : node}
            tone={refusing && node.id === 'node-a' ? FLOW.red.hex : null}
            badge={refusing && node.id === 'node-a' ? UNAVAILABLE : null}
          />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
