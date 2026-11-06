import { useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildDatabaseReplicationSteps } from './steps'
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
    cx: 72, cy: 155, w: 96, h: 74,
    color: '#94a3b8', glow: 'rgba(148,163,184,0.55)', lc: '#cbd5e1', strip: 'bg-slate-400',
    sub1: 'reads + writes', sub2: 'app / service',
    desc: 'The application making database requests. Writes always go to the primary; reads can be routed to replicas.',
    note: 'A read/write splitting proxy (e.g. ProxySQL) can handle routing transparently.',
  },
  {
    id: 'primary', label: 'Primary', icon: '🗄️', dir: 'top',
    cx: 240, cy: 155, w: 118, h: 88,
    color: '#3b82f6', glow: 'rgba(59,130,246,0.65)', lc: '#93c5fd', strip: 'bg-blue-500',
    sub1: 'all writes', sub2: 'WAL stream',
    desc: 'The single write node. Receives all INSERT/UPDATE/DELETE operations and writes them to the Write-Ahead Log.',
    note: 'Every write is replicated from here. The primary is a SPOF unless failover is configured.',
  },
  {
    id: 'replica-1', label: 'Replica 1', icon: '🗄️', dir: 'right',
    cx: 490, cy: 78, w: 118, h: 78,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'sync replica', sub2: 'zero data loss',
    desc: 'Synchronous replica — the primary waits for this replica to confirm receipt before acknowledging the write.',
    note: 'One sync replica provides zero data loss on primary failure, at the cost of one extra network RTT per write.',
  },
  {
    id: 'replica-2', label: 'Replica 2', icon: '🗄️', dir: 'right',
    cx: 490, cy: 168, w: 118, h: 78,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'async replica', sub2: 'read traffic',
    desc: 'Asynchronous replica — replicates WAL changes in background. Absorbs read traffic to reduce primary load.',
    note: 'Replication lag is typically < 10 ms but can spike under heavy write load.',
  },
  {
    id: 'replica-3', label: 'Replica 3', icon: '🗄️', dir: 'right',
    cx: 490, cy: 258, w: 118, h: 78,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: 'async replica', sub2: 'read traffic',
    desc: 'Second async replica. 1 primary + 3 replicas is a common production configuration for read-heavy workloads.',
    note: 'In a failover, the replica with the least lag is promoted to primary.',
  },
]

const EDGES = {
  'client-primary':   { x1: 120, y1: 155, x2: 181, y2: 155 },
  'client-replica-3': { x1: 120, y1: 172, x2: 431, y2: 250 },
  'primary-replica-1':{ x1: 299, y1: 118, x2: 431, y2: 90 },
  'primary-replica-2':{ x1: 299, y1: 155, x2: 431, y2: 168 },
  'primary-replica-3':{ x1: 299, y1: 192, x2: 431, y2: 248 },
}

const DIR_MAP = {
  request:  { fwd: FLOW.blue,    bwd: null       },
  response: { fwd: FLOW.emerald, bwd: null       },
  both:     { fwd: FLOW.blue,    bwd: FLOW.emerald  },
}

const STATUS_STYLE = {
  synced:   { label: '● SYNCED',   color: '#34d399', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(52,211,153,0.4)'  },
  lagging:  { label: '⟳ LAGGING', color: '#fbbf24', bg: 'rgba(245,158,11,0.10)',  border: 'rgba(251,191,36,0.4)'  },
  promoted: { label: '★ PRIMARY',  color: '#a78bfa', bg: 'rgba(139,92,246,0.14)',  border: 'rgba(167,139,250,0.5)' },
}

// A replica shows its sync status in a pill; once promoted it becomes the new primary.
function ReplicationNode({ node, status, ...state }) {
  const isPromoted = status === 'promoted'
  const shown = isPromoted ? { ...node, icon: '⭐', label: 'New Primary' } : node
  return (
    <DiagramNode
      node={{ ...shown, sub2: node.id === 'primary' ? node.sub2 : null }}
      {...state}
      tone={isPromoted ? '#a78bfa' : null}
    >
      {STATUS_STYLE[status] && <NodePill status={STATUS_STYLE[status]} />}
    </DiagramNode>
  )
}

export default function DatabaseReplicationDiagram({ onStepChange }) {
  const steps  = useMemo(() => buildDatabaseReplicationSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  const { nodeState } = useDiagramNodes(steps, index)

  const isFailover = step.mode === 'failover'
  const isSync     = step.mode === 'sync'

  return (
    <div className="space-y-4">

      <DiagramHeader title="Database Replication — Primary & Replicas">
        Step through WAL streaming, async vs sync replication, read replicas, and automatic failover.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIR_MAP} />
          <text x={310} y={22}
            style={{ fill: isSync ? FLOW.violet.hex : FLOW.blue.hex, fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 700, opacity: 0.7 }}>
            {isSync ? 'SYNCHRONOUS MODE' : isFailover ? 'FAILOVER IN PROGRESS' : 'ASYNC MODE'}
          </text>
        </>}
        footer={<>
          <AnimatePresence mode="wait">
            {isFailover && (
              <motion.div
                key="failover"
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                className="mt-3 flex items-center gap-3 rounded-xl border border-violet-500/40 bg-violet-500/[0.07] px-4 py-2.5"
              >
                <span className="text-violet-400 select-none">⭐</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Failover Initiated</p>
                  <p className="text-[11px] font-mono text-violet-300">Replica 1 promoted to primary · DNS updated · RTO ~30–60 s</p>
                </div>
              </motion.div>
            )}
            {isSync && (
              <motion.div
                key="sync"
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                className="mt-3 flex items-center gap-3 rounded-xl border border-blue-500/40 bg-blue-500/[0.07] px-4 py-2.5"
              >
                <span className="text-blue-400 select-none">🔒</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Synchronous Mode</p>
                  <p className="text-[11px] font-mono text-blue-300">Write blocked until replica confirms · zero data loss · +1 RTT per write</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.blue.hex,    glow: FLOW.blue.glow,    label: 'write / WAL stream' },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'read / acknowledge' },
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
          <ReplicationNode key={node.id} node={node} status={step.replicaStatus?.[node.id]} {...nodeState(node.id)} />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
