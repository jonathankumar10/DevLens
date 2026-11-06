import { useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildDatabaseShardingSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import DiagramNode, { NodePill } from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

const CW = 640
const CH = 310

const NODES = [
  {
    id: 'client', label: 'Client', icon: '💻', dir: 'left',
    cx: 68, cy: 78, w: 96, h: 72,
    color: '#94a3b8', glow: 'rgba(148,163,184,0.55)', lc: '#cbd5e1', strip: 'bg-slate-400',
    sub1: 'app layer', sub2: 'sends queries',
    desc: 'The application layer. Must include the shard key in every write so the router can determine the target shard.',
    note: 'Application code must be shard-aware — foreign key lookups across shards require explicit fan-out logic.',
  },
  {
    id: 'router', label: 'Shard Router', icon: '🔀', dir: 'top',
    cx: 240, cy: 78, w: 118, h: 80,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'hash(shard_key)', sub2: 'routes to shard',
    desc: 'Computes hash(shard_key) % N to determine the target shard, then forwards the query. May be a library, proxy (Vitess, ProxySQL), or application logic.',
    note: 'The router is stateless — it needs no knowledge of the data, only the shard mapping.',
  },
  {
    id: 'shard-1', label: 'Shard 1', icon: '🗄️', dir: 'right',
    cx: 480, cy: 78, w: 122, h: 84,
    color: '#3b82f6', glow: 'rgba(59,130,246,0.65)', lc: '#93c5fd', strip: 'bg-blue-500',
    sub1: 'user_id 0–999K', sub2: 'range partition',
    desc: 'Holds all rows where user_id hashes to shard 0. Independently queryable — reads and writes are local.',
    note: 'Each shard is a full independent database with its own replication, backups, and failover.',
  },
  {
    id: 'shard-2', label: 'Shard 2', icon: '🗄️', dir: 'right',
    cx: 480, cy: 175, w: 122, h: 84,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'user_id 1M–1.99M', sub2: 'range partition',
    desc: 'Holds rows mapping to shard 1. Can be on a different physical machine, data centre, or cloud region.',
    note: 'Shards can be sized differently — important users can be isolated to a dedicated shard.',
  },
  {
    id: 'shard-3', label: 'Shard 3', icon: '🗄️', dir: 'right',
    cx: 480, cy: 268, w: 122, h: 84,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: 'user_id 2M+', sub2: 'range partition',
    desc: 'Third shard. Overflow writes from shard 2 can be moved here during resharding with minimal disruption.',
    note: 'Range-based sharding (not hash) allows hot ranges to be split and rebalanced more precisely.',
  },
]

const EDGES = {
  'client-router':   { x1: 116, y1: 78,  x2: 181, y2: 78 },
  'router-shard-1':  { x1: 299, y1: 78,  x2: 419, y2: 78 },
  'router-shard-2':  { x1: 299, y1: 95,  x2: 419, y2: 165 },
  'router-shard-3':  { x1: 299, y1: 105, x2: 419, y2: 256 },
}

const LOAD_STYLE = {
  normal:     null,
  overloaded: { label: '🔴 OVERLOADED', color: FLOW.red.hex,   bg: 'rgba(244,63,94,0.10)',   border: 'rgba(244,63,94,0.4)'   },
}

export default function DatabaseShardingDiagram({ onStepChange }) {
  const steps  = useMemo(() => buildDatabaseShardingSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  const { nodeState } = useDiagramNodes(steps, index)

  const isCrossShard = step.type === 'cross-shard-query'
  const isHotShard   = step.type === 'hot-shard'

  return (
    <div className="space-y-4">

      <DiagramHeader title="Database Sharding — Horizontal Partitioning">
        See how a shard router distributes writes, the cost of cross-shard queries, and the hot shard problem.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} />
        </>}
        footer={<>
          <AnimatePresence mode="wait">
            {isCrossShard && (
              <motion.div
                key="cross-shard"
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                className="mt-3 flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/[0.07] px-4 py-2.5"
              >
                <span className="text-amber-400 select-none">⚠️</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Cross-Shard Fan-Out</p>
                  <p className="text-[11px] font-mono text-amber-300">All 3 shards queried · results merged in application memory · O(N shards)</p>
                </div>
              </motion.div>
            )}
            {isHotShard && (
              <motion.div
                key="hot-shard"
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                className="mt-3 flex items-center gap-3 rounded-xl border border-red-500/40 bg-red-500/[0.07] px-4 py-2.5"
              >
                <span className="text-red-400 select-none">🔥</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">Hot Shard Detected</p>
                  <p className="text-[11px] font-mono text-red-300">Celebrity user drives 100× normal traffic to Shard 1 · others underutilised</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,  glow: FLOW.violet.glow,  label: 'routed write' },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'response'     },
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
        {NODES.map((node) => {
          const load = node.id.startsWith('shard') ? LOAD_STYLE[step.shardLoads?.[node.id] ?? 'normal'] : null
          return (
            <DiagramNode
              key={node.id}
              node={{ ...node, sub2: null }}
              {...nodeState(node.id)}
              tone={load ? FLOW.red.hex : null}
            >
              {load && <NodePill status={load} className="absolute bottom-1" />}
            </DiagramNode>
          )
        })}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
