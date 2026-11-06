import { useMemo } from 'react'
import { buildAcidAndBaseSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { DiagramCanvas, DiagramHeader, FlowLegend, OutcomeBanner, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

const CW = 620
const CH = 280

const NODES = [
  {
    id: 'client', label: 'Client', icon: '💻', dir: 'left',
    cx: 80, cy: 100, w: 108, h: 80,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'initiates tx', sub2: 'awaits ACK',
    desc: 'The application client that initiates transactions — a banking app, an order service, or an ORM layer issuing SQL statements.',
    note: 'The client receives a commit confirmation only after all ACID guarantees are satisfied — including WAL flush to disk.',
  },
  {
    id: 'tx-manager', label: 'Tx Manager', icon: '🔒', dir: 'top',
    cx: 280, cy: 100, w: 118, h: 80,
    color: '#6366f1', glow: 'rgba(99,102,241,0.65)', lc: '#a5b4fc', strip: 'bg-indigo-500',
    sub1: 'ACID enforcer', sub2: 'WAL + locks',
    desc: 'Coordinates atomicity, isolation, and durability. Manages the Write-Ahead Log (WAL), row locks, and the two-phase commit protocol.',
    note: 'On crash, the Tx Manager replays the WAL — committed transactions are recovered, uncommitted ones are rolled back.',
  },
  {
    id: 'database', label: 'Database', icon: '🗄️', dir: 'right',
    cx: 470, cy: 100, w: 118, h: 80,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'PostgreSQL / MySQL', sub2: 'disk + buffer pool',
    desc: 'The persistent data store. The buffer pool holds recently accessed pages in memory; the WAL ensures changes survive crashes before they reach the data files.',
    note: 'ACID databases flush the WAL to disk (fsync) before confirming COMMIT — this is what makes durability real, not just a promise.',
  },
  {
    id: 'replica', label: 'BASE Replica', icon: '🔄', dir: 'right',
    cx: 470, cy: 210, w: 118, h: 72,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'async replication', sub2: 'eventually consistent',
    desc: 'In a BASE system, the primary acknowledges writes immediately and propagates to replicas asynchronously. Readers on this replica may briefly see stale values.',
    note: 'Convergence window is typically milliseconds to seconds — "eventually" does not mean "might be wrong forever".',
  },
]

const EDGES = {
  'client-tx':  { x1: 134, y1: 100, x2: 221, y2: 100 },
  'tx-db':      { x1: 339, y1: 100, x2: 411, y2: 100 },
  'client-db':  { x1: 134, y1: 115, x2: 411, y2: 115 },
  'db-replica': { x1: 470, y1: 140, x2: 470, y2: 174 },
}

const TX_STATE_LABELS = {
  open:        { text: 'IN PROGRESS',  color: '#6366f1' },
  writing:     { text: 'WRITING',      color: '#0ea5e9' },
  committed:   { text: 'COMMITTED ✓', color: '#10b981' },
  'rolled-back': { text: 'ROLLBACK ✗', color: '#f43f5e' },
  isolating:   { text: 'ISOLATED',     color: '#8b5cf6' },
  base:        { text: 'BASE MODE',    color: '#10b981' },
  converging:  { text: 'CONVERGING',   color: '#10b981' },
}

const COLUMN_LABELS = [[80, 'CLIENT'], [280, 'TX MANAGER'], [470, 'DATA LAYER']]

const OUTCOMES = {
  committed: {
    tone: 'good', icon: '✓', title: 'Transaction Committed — all writes durable',
    detail: 'WAL flushed · both writes visible · atomicity + durability delivered',
  },
  'rolled-back': {
    tone: 'bad', icon: '✗', title: 'Transaction Rolled Back — no partial state',
    detail: 'Both writes undone · constraints preserved · atomicity + consistency delivered',
  },
}

export default function AcidAndBaseDiagram() {
  const steps  = useMemo(() => buildAcidAndBaseSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner
  const { nodeState } = useDiagramNodes(steps, index)

  const txLabel = step.transactionState ? TX_STATE_LABELS[step.transactionState] : null

  return (
    <div className="space-y-4">
      <DiagramHeader title="ACID Transactions & BASE Consistency">
        Step through a bank transfer — from BEGIN to COMMIT or ROLLBACK — then see how BASE trades correctness for availability.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          {COLUMN_LABELS.map(([x, text]) => (
            <text key={text} x={x} y="22" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="600" letterSpacing="1.5">{text}</text>
          ))}
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} />
        </>}
        footer={<>
          <OutcomeBanner outcome={OUTCOMES[step.transactionState] ?? null} />
          <FlowLegend items={[[FLOW.violet, 'request / write'], [FLOW.emerald, 'response / ack']]} />
        </>}
      >
        {NODES.map((node) => (
          <DiagramNode
            key={node.id}
            node={node}
            {...nodeState(node.id)}
            badge={node.id === 'tx-manager' ? txLabel : null}
          />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />
      <StepControls runner={runner} />
    </div>
  )
}
