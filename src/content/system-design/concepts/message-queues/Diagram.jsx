import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildMessageQueuesSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

const CW = 660
const CH = 320

const NODES = [
  {
    id: 'producer', label: 'Producer', icon: '📤', dir: 'left',
    cx: 80, cy: 155, w: 112, h: 78,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'publishes & moves on', sub2: 'Order / Payment Svc',
    desc: 'The producer generates work and publishes messages to the queue. It does not wait for the work to be processed — it publishes and immediately returns to its next task.',
    note: 'Producers and consumers are completely independent. They can be written in different languages, deployed separately, and scaled independently.',
  },
  {
    id: 'queue', label: 'Queue / Broker', icon: '📨', dir: 'top',
    cx: 310, cy: 155, w: 132, h: 88,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: 'Kafka · SQS · RabbitMQ', sub2: 'durable buffer',
    desc: 'The message broker durably persists messages. Messages survive broker restarts. Consumers must explicitly acknowledge receipt — unacknowledged messages are redelivered.',
    note: 'Kafka retains messages for days/weeks — consumers can replay. SQS/RabbitMQ delete on ACK. Choose based on whether replay and event sourcing matter for your use case.',
  },
  {
    id: 'consumer-a', label: 'Consumer A', icon: '📥', dir: 'right',
    cx: 560, cy: 95, w: 116, h: 74,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'processes messages', sub2: 'email / notification',
    desc: 'Consumer A subscribes to the queue and processes messages at its own pace. It must be idempotent — processing the same message twice must produce the same result.',
    note: 'Scale consumers horizontally: add more Consumer A instances to increase throughput. Each instance competes for messages from the same queue.',
  },
  {
    id: 'consumer-b', label: 'Consumer B', icon: '📥', dir: 'right',
    cx: 560, cy: 215, w: 116, h: 74,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'independent group', sub2: 'analytics / warehouse',
    desc: 'Consumer B belongs to a different consumer group (pub/sub) or competes with Consumer A for the same messages (point-to-point). Both receive messages from the same queue.',
    note: 'Kafka consumer groups: each group gets its own copy of every message (pub/sub fan-out). SQS competing consumers: each message delivered to exactly one consumer.',
  },
  {
    id: 'dlq', label: 'Dead Letter', icon: '💀', dir: 'bottom',
    cx: 560, cy: 285, w: 116, h: 60,
    color: '#f43f5e', glow: 'rgba(244,63,94,0.65)', lc: '#fda4af', strip: 'bg-rose-500',
    sub1: 'failed messages', sub2: 'inspect + replay',
    desc: 'The Dead Letter Queue captures messages that fail processing after N retry attempts. Manual inspection reveals whether the message is malformed, the consumer has a bug, or the dependency is unavailable.',
    note: 'Without a DLQ, a poison-pill message blocks all consumers permanently. DLQs are mandatory in production — configure them before your first deployment.',
  },
]

const EDGES = {
  'producer-queue': { x1: 136, y1: 155, x2: 244, y2: 155 },
  'queue-ca':       { x1: 376, y1: 128, x2: 502, y2: 108 },
  'queue-cb':       { x1: 376, y1: 182, x2: 502, y2: 202 },
  'queue-dlq':      { x1: 376, y1: 196, x2: 502, y2: 268 },
}

const DIR_MAP = {
  request:  { fwd: FLOW.violet },
  response: { fwd: FLOW.emerald },
  both:     { fwd: FLOW.amber, bwd: FLOW.emerald },
}

// Failed messages go to the dead letter queue on a red dashed line.
const DEAD_LETTER = { flow: { fwd: FLOW.red }, dashed: '5 3' }
const edgeProps = (edgeId, direction) => (edgeId === 'queue-dlq' && direction ? DEAD_LETTER : null)

const MAX_DEPTH_DISPLAY = 6

function QueueBlock({ isActive, wasVisited, isExpanded, onToggle, popKey, queueDepth }) {
  const node = NODES.find((n) => n.id === 'queue')
  const { cx, cy, w, h } = node
  const bars = Math.min(queueDepth, MAX_DEPTH_DISPLAY)

  return (
    <div className="absolute" style={{ left: cx - w / 2, top: cy - h / 2, width: w, height: h }}>
      <motion.button
        onClick={onToggle}
        className="relative w-full h-full rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center gap-1 px-2 cursor-pointer focus:outline-none"
        animate={{
          borderColor:     isActive ? node.color : wasVisited ? `${node.color}38` : 'rgba(255,255,255,0.08)',
          backgroundColor: isActive ? `${node.color}12` : wasVisited ? `${node.color}07` : 'rgba(10,18,36,1)',
          boxShadow:       isActive ? `0 0 36px -5px ${node.glow}` : 'none',
        }}
        transition={{ duration: 0.28 }}
      >
        <motion.div className={`absolute top-0 left-0 right-0 h-0.5 ${node.strip}`}
          animate={{ opacity: isActive ? 1 : wasVisited ? 0.35 : 0.12 }} />

        {[0, 1, 2].map((i) => (
          <motion.div
            key={`${popKey ?? 'i'}-queue-${i}`}
            className="absolute inset-0 rounded-xl border-2 pointer-events-none"
            style={{ borderColor: node.color }}
            initial={{ scale: 1, opacity: popKey != null ? 0.65 : 0 }}
            animate={{ scale: 2.0 + i * 0.35, opacity: 0 }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: 'easeOut' }}
          />
        ))}

        <div className="flex items-center gap-1.5">
          <motion.span
            key={`ic-${popKey ?? 0}`}
            animate={popKey != null ? { scale: [1, 1.4, 0.88, 1.06, 1] } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
            className="text-base leading-none select-none"
          >
            {node.icon}
          </motion.span>
          <motion.p
            animate={{ color: isActive ? node.lc : wasVisited ? '#94a3b8' : '#475569' }}
            className="text-[10px] font-bold leading-none"
          >
            {node.label}
          </motion.p>
        </div>

        {/* Queue depth bars */}
        <div className="flex items-end gap-0.5 h-4 w-full px-2">
          {Array.from({ length: MAX_DEPTH_DISPLAY }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-sm"
              animate={{
                height:          i < bars ? '100%' : '15%',
                backgroundColor: i < bars
                  ? (isActive ? node.color : `${node.color}55`)
                  : '#1e293b',
                boxShadow: i < bars && isActive ? `0 0 4px 1px ${node.glow}` : 'none',
              }}
              transition={{ duration: 0.35, delay: i < bars ? i * 0.05 : 0 }}
            />
          ))}
        </div>

        <motion.p animate={{ color: isActive ? node.color : '#1f2937' }} className="text-[8px] font-mono">
          {queueDepth} msg{queueDepth !== 1 ? 's' : ''} queued
        </motion.p>
        <p className="text-[8px] text-slate-700">{node.sub1}</p>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            className="absolute z-30 w-56 rounded-xl border bg-slate-900/96 backdrop-blur shadow-2xl p-3 space-y-1.5"
            style={{ borderColor: `${node.color}40`, top: '105%', left: '50%', transform: 'translateX(-50%)' }}
          >
            <p className="text-[11px] font-bold" style={{ color: node.lc }}>{node.label}</p>
            <p className="text-[10px] text-slate-400 leading-relaxed">{node.desc}</p>
            <p className="text-[10px] italic" style={{ color: node.color }}>{node.note}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function MessageQueuesDiagram() {
  const steps  = useMemo(() => buildMessageQueuesSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  const { nodeState } = useDiagramNodes(steps, index)

  const nonQueueNodes = NODES.filter((n) => n.id !== 'queue')

  const showDlqBanner = step.connections['queue-dlq']
  const showBackpressure = step.queueDepth >= 4

  return (
    <div className="space-y-4">
      <DiagramHeader title="Message Queues">
        Step through async decoupling, backpressure absorption, dead letter queues, pub/sub, and delivery guarantees.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <text x="80"  y="22" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="600" letterSpacing="1.5">PRODUCER</text>
          <text x="310" y="22" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="600" letterSpacing="1.5">QUEUE / BROKER</text>
          <text x="560" y="22" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="600" letterSpacing="1.5">CONSUMERS</text>

          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIR_MAP} edgeProps={edgeProps} />
        </>}
        footer={<>
          <AnimatePresence>
            {showBackpressure && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/[0.07] px-4 py-2"
              >
                <span className="text-amber-400 text-lg select-none">📈</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Backpressure Building</p>
                  <p className="text-[11px] font-mono text-amber-300">Queue depth: {step.queueDepth} · consumers processing slower than producer rate</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showDlqBanner && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 flex items-center gap-3 rounded-xl border border-rose-500/40 bg-rose-500/[0.07] px-4 py-2"
              >
                <span className="text-rose-400 text-lg select-none">💀</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Dead Letter Queue — Poison Pill Quarantined</p>
                  <p className="text-[11px] font-mono text-rose-300">Message failed after 3 attempts · moved to DLQ for inspection · queue unblocked</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px rounded-full" style={{ background: FLOW.violet.hex, boxShadow: `0 0 4px ${FLOW.violet.glow}` }} />
              <span className="text-[10px] text-slate-500">publish</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px rounded-full" style={{ background: FLOW.amber.hex, boxShadow: `0 0 4px ${FLOW.amber.glow}` }} />
              <span className="text-[10px] text-slate-500">deliver</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px rounded-full" style={{ background: FLOW.emerald.hex, boxShadow: `0 0 4px ${FLOW.emerald.glow}` }} />
              <span className="text-[10px] text-slate-500">acknowledge</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px rounded-full" style={{ background: FLOW.red.hex, boxShadow: `0 0 4px ${FLOW.red.glow}` }} />
              <span className="text-[10px] text-slate-500">dead letter</span>
            </div>
            <span className="text-[10px] text-slate-600 ml-auto hidden sm:inline">tap any node for details</span>
          </div>
        </>}
      >
        <QueueBlock {...nodeState('queue')} queueDepth={step.queueDepth} />

        {nonQueueNodes.map((node) => (
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
