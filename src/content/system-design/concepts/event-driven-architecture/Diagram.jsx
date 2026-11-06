import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildEventDrivenArchitectureSteps } from './steps'
import { useTtsRunner } from '../../../../hooks/useTtsRunner'
import StepControls from '../../../../components/ui/StepControls'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { FLOW } from '../../../../components/system-design/diagram/colors'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'

const CW = 700
const CH = 450

// ── Node definitions ──────────────────────────────────────────────────────────

const PRODUCERS = [
  {
    id: 'order-svc', label: 'Order Service', icon: '📦', dir: 'top',
    cx: 85, cy: 155, w: 120, h: 68,
    sub1: 'event producer', sub2: 'OrderPlaced',
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    desc: 'Emits "OrderPlaced" whenever a new order is created — timestamp, items, amount, user.',
    note: 'Producers know nothing about consumers. They own only the event schema.',
  },
  {
    id: 'payment-svc', label: 'Payment Service', icon: '💳', dir: 'bottom',
    cx: 85, cy: 325, w: 120, h: 68,
    sub1: 'event producer', sub2: 'PaymentProcessed',
    color: '#6366f1', glow: 'rgba(99,102,241,0.65)', lc: '#a5b4fc', strip: 'bg-indigo-500',
    desc: 'Emits "PaymentProcessed" or "PaymentFailed" after charging the card.',
    note: 'A service can be both a producer and a consumer — Payment may react to "OrderPlaced" too.',
  },
]

const KAFKA_NODE = {
  id: 'kafka', label: 'Event Broker', icon: '⚡',
  cx: 340, cy: 240, w: 150, h: 90,
  sub1: 'Kafka · Kinesis · Pulsar', sub2: 'partitioned append-only log',
  color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
  partitions: 3,
  desc: 'Partitioned, durable, append-only log. Events are written once, read by any consumer group independently.',
  note: 'Retains events for configurable days — consumers can replay from offset 0 to rebuild any projection.',
}

const CONSUMERS = [
  {
    id: 'inventory-svc', label: 'Inventory', icon: '🏪', dir: 'left',
    cx: 580, cy: 130, w: 120, h: 68,
    sub1: 'event consumer', sub2: 'reserves stock',
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    desc: 'Subscribes to "OrderPlaced" — reserves items and commits its offset.',
    note: 'Consumer groups guarantee exactly-once processing per group even across multiple replicas.',
  },
  {
    id: 'notif-svc', label: 'Notifications', icon: '🔔', dir: 'left',
    cx: 580, cy: 240, w: 120, h: 68,
    sub1: 'event consumer', sub2: 'email · push · SMS',
    color: '#14b8a6', glow: 'rgba(20,184,166,0.65)', lc: '#5eead4', strip: 'bg-teal-500',
    desc: 'Subscribes to "OrderPlaced" and "PaymentProcessed" — sends the appropriate notification.',
    note: 'Added with zero changes to Order Service or Payment Service.',
  },
  {
    id: 'analytics-svc', label: 'Analytics', icon: '📊', dir: 'left',
    cx: 580, cy: 355, w: 120, h: 68,
    sub1: 'event consumer', sub2: 'builds projections',
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    desc: 'Consumes all event types — maintains real-time dashboards and aggregate metrics.',
    note: 'Replays from offset 0 to backfill historical data or build new read projections.',
  },
]

// ── Edge definitions ──────────────────────────────────────────────────────────
// Endpoints sit on the exact boundary of their source / target nodes.

const EDGES = {
  'order-kafka':     { x1: 145, y1: 155, x2: 265, y2: 215 },
  'payment-kafka':   { x1: 145, y1: 325, x2: 265, y2: 267 },
  'kafka-inventory': { x1: 415, y1: 215, x2: 520, y2: 130 },
  'kafka-notifs':    { x1: 415, y1: 240, x2: 520, y2: 240 },
  'kafka-analytics': { x1: 415, y1: 267, x2: 520, y2: 355 },
}

const COLUMN_LABELS = [[85, 'PRODUCERS'], [340, 'EVENT BROKER'], [580, 'CONSUMERS']]

// Every active edge carries amber events forward.
const DIRECTIONS = { request: { fwd: FLOW.amber } }

// ── EdgeConnection ────────────────────────────────────────────────────────────

// ── NodeBlock ─────────────────────────────────────────────────────────────────

// ── KafkaBlock — special visual for the event broker ─────────────────────────

function KafkaBlock({ isActive, wasVisited, isExpanded, onToggle, popKey }) {
  const node = KAFKA_NODE
  const { cx, cy, w, h } = node
  return (
    <div className="absolute" style={{ left: cx - w / 2, top: cy - h / 2, width: w, height: h }}>
      <motion.button
        onClick={onToggle}
        className="relative w-full h-full rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center gap-1 px-3 cursor-pointer focus:outline-none"
        animate={{
          borderColor:     isActive ? node.color : wasVisited ? `${node.color}38` : 'rgba(255,255,255,0.08)',
          backgroundColor: isActive ? `${node.color}12` : wasVisited ? `${node.color}07` : 'rgba(10,18,36,1)',
          boxShadow:       isActive ? `0 0 40px -5px ${node.glow}` : 'none',
        }}
        transition={{ duration: 0.28 }}
      >
        <motion.div
          className={`absolute top-0 left-0 right-0 h-0.5 ${node.strip}`}
          animate={{ opacity: isActive ? 1 : wasVisited ? 0.35 : 0.12 }}
        />

        {[0, 1, 2].map((i) => (
          <motion.div
            key={`${popKey ?? 'i'}-kafka-${i}`}
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

        {/* Partition bars */}
        <div className="flex gap-1 w-full px-1">
          {Array.from({ length: node.partitions }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 h-2 rounded-sm"
              animate={isActive ? {
                backgroundColor: [`${node.color}20`, `${node.color}70`, `${node.color}20`],
                boxShadow:       [`0 0 0 0 ${node.color}00`, `0 0 6px 1px ${node.color}55`, `0 0 0 0 ${node.color}00`],
              } : {
                backgroundColor: wasVisited ? `${node.color}22` : '#1e293b',
                boxShadow:       'none',
              }}
              transition={isActive ? { duration: 0.9, delay: i * 0.24, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
            />
          ))}
        </div>

        <motion.p
          animate={{ color: isActive ? node.color : '#1f2937' }}
          className="text-[8px] font-mono text-center leading-none"
        >
          {node.sub2}
        </motion.p>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            className="absolute z-30 w-56 rounded-xl border bg-slate-900/96 backdrop-blur shadow-2xl p-3 space-y-1.5"
            style={{
              borderColor: `${node.color}40`,
              top: '105%', left: '50%', transform: 'translateX(-50%)',
            }}
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

// ── Main diagram ──────────────────────────────────────────────────────────────

export default function EventDrivenArchitectureDiagram() {
  const steps  = useMemo(() => buildEventDrivenArchitectureSteps(), [])
  const runner = useTtsRunner(steps, (step) => `${step.message}. ${step.detail}`)
  const { step, index } = runner

  const { nodeState } = useDiagramNodes(steps, index)

  return (
    <div className="space-y-4">
      <DiagramHeader title="Event-Driven Architecture">
        Step through how producers emit events, how Kafka brokers them, and how consumers react independently.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          {COLUMN_LABELS.map(([x, text]) => (
            <text key={text} x={x} y="30" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="600" letterSpacing="1.5">{text}</text>
          ))}
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIRECTIONS} />
        </>}
        footer={
          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px bg-amber-500 rounded-full" style={{ boxShadow: '0 0 4px rgba(245,158,11,0.8)' }} />
              <span className="text-[10px] text-slate-500">async event flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-3 h-1.5 rounded-sm bg-amber-500/30 border border-amber-500/40" />
                ))}
              </div>
              <span className="text-[10px] text-slate-500">topic partitions</span>
            </div>
            <span className="text-[10px] text-slate-600 ml-auto hidden sm:inline">tap any node for details</span>
          </div>
        }
      >
        {PRODUCERS.map((node) => <DiagramNode key={node.id} node={node} {...nodeState(node.id)} />)}
        <KafkaBlock {...nodeState('kafka')} />
        {CONSUMERS.map((node) => <DiagramNode key={node.id} node={node} {...nodeState(node.id)} />)}
      </DiagramCanvas>

      {/* Step message */}
      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
