import { useMemo } from 'react'
import { buildMicroservicesSteps } from './steps'
import { useTtsRunner } from '../../../../hooks/useTtsRunner'
import StepControls from '../../../../components/ui/StepControls'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { FLOW } from '../../../../components/system-design/diagram/colors'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'

// ── Layout constants ──────────────────────────────────────────────────────────
// Three columns:
//   Col 1 (x≈65):  Client
//   Col 2 (x≈205): API Gateway
//   Col 3 (x≈380): Users / Orders / Inventory (services behind the gateway)
//   Col 4 (x≈555): Payments / Queue / Notifications (downstream + async)

const CW = 700
const CH = 430

const NODES = [
  {
    id: 'client', label: 'Client', icon: '👤', dir: 'top',
    cx: 65, cy: 200, w: 100, h: 72,
    sub1: 'browser · mobile', sub2: 'external',
    color: '#94a3b8', glow: 'rgba(148,163,184,0.65)', lc: '#cbd5e1', strip: 'bg-slate-400',
    hasDb: false,
    desc: 'External user — browser, mobile app, or third-party system.',
    note: 'Clients only ever talk to the gateway, never to individual services.',
  },
  {
    id: 'gateway', label: 'API Gateway', icon: '🔀', dir: 'top',
    cx: 205, cy: 200, w: 120, h: 80,
    sub1: 'auth · routing', sub2: 'rate limiting',
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    hasDb: false,
    desc: 'Single entry point — authenticates, rate-limits, and routes to the right service.',
    note: 'Adding or splitting services is invisible to clients.',
  },
  {
    id: 'users', label: 'Users Svc', icon: '🧑', dir: 'top',
    cx: 380, cy: 75, w: 120, h: 68,
    sub1: 'auth · profiles', sub2: 'bounded context',
    color: '#6366f1', glow: 'rgba(99,102,241,0.65)', lc: '#a5b4fc', strip: 'bg-indigo-500',
    hasDb: true,
    desc: 'Owns user identity: registration, login, profiles, sessions.',
    note: 'No other service may query the users table — call this API instead.',
  },
  {
    id: 'orders', label: 'Orders Svc', icon: '📦', dir: 'top',
    cx: 380, cy: 200, w: 120, h: 68,
    sub1: 'lifecycle · status', sub2: 'bounded context',
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    hasDb: true,
    desc: 'Manages the order lifecycle: create, update, cancel, track.',
    note: 'Publishes "order.placed" events rather than calling downstream services directly.',
  },
  {
    id: 'inventory', label: 'Inventory Svc', icon: '🏪', dir: 'bottom',
    cx: 380, cy: 325, w: 120, h: 68,
    sub1: 'stock · reservations', sub2: 'bounded context',
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    hasDb: true,
    desc: 'Tracks stock levels, reserves items on order, releases on cancellation.',
    note: 'Independently scalable — traffic spikes here leave other services unaffected.',
  },
  {
    id: 'payments', label: 'Payments Svc', icon: '💳', dir: 'left',
    cx: 555, cy: 130, w: 120, h: 68,
    sub1: 'charge · refund', sub2: 'sync / gRPC',
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    hasDb: true,
    desc: 'Handles payment charging, refunds, and transaction records.',
    note: 'Called synchronously — Orders waits for the charge result before confirming.',
  },
  {
    id: 'queue', label: 'Message Queue', icon: '📨', dir: 'left',
    cx: 555, cy: 240, w: 130, h: 68,
    sub1: 'Kafka · SQS', sub2: 'async events',
    color: '#f43f5e', glow: 'rgba(244,63,94,0.65)', lc: '#fda4af', strip: 'bg-rose-500',
    hasDb: false,
    desc: 'Durable event bus — producers publish events, consumers subscribe independently.',
    note: 'Decouples services completely. Neither side needs to know the other exists.',
  },
  {
    id: 'notifs', label: 'Notifications', icon: '🔔', dir: 'left',
    cx: 555, cy: 355, w: 130, h: 68,
    sub1: 'email · push · SMS', sub2: 'async consumer',
    color: '#14b8a6', glow: 'rgba(20,184,166,0.65)', lc: '#5eead4', strip: 'bg-teal-500',
    hasDb: false,
    desc: 'Subscribes to events (order.placed, payment.failed) and sends notifications.',
    note: 'Decoupled from Orders — connected only through the event schema.',
  },
]

// Edge endpoints are exact boundary points of their source/target nodes
const EDGES = {
  'client-gateway':    { x1: 115, y1: 200, x2: 145, y2: 200 },
  'gateway-users':     { x1: 205, y1: 160, x2: 320, y2: 75 },
  'gateway-orders':    { x1: 265, y1: 200, x2: 320, y2: 200 },
  'gateway-inventory': { x1: 205, y1: 240, x2: 320, y2: 325 },
  'orders-payments':   { x1: 440, y1: 180, x2: 495, y2: 130 },
  'orders-queue':      { x1: 440, y1: 215, x2: 490, y2: 240 },
  'queue-notifs':      { x1: 555, y1: 274, x2: 555, y2: 321 },
}

const ASYNC_EDGES = new Set(['orders-queue', 'queue-notifs'])

// Sync calls are blue, responses come back green, async events are amber.
const DIR_MAP = {
  request:  { fwd: FLOW.blue },
  response: { bwd: FLOW.emerald, line: FLOW.blue },
  both:     { fwd: FLOW.blue, bwd: FLOW.emerald },
}
const ASYNC_DIR_MAP = {
  request:  { fwd: FLOW.amber },
  response: { bwd: FLOW.emerald, line: FLOW.amber },
  both:     { fwd: FLOW.amber, bwd: FLOW.emerald },
}
const edgeProps = (edgeId, direction) =>
  ASYNC_EDGES.has(edgeId) && direction ? { flow: ASYNC_DIR_MAP[direction] } : null

// ── Edge (SVG line + animated particles) ─────────────────────────────────────

// ── Node block ────────────────────────────────────────────────────────────────

// ── Main component ────────────────────────────────────────────────────────────

export default function MicroservicesDiagram() {
  const steps  = useMemo(() => buildMicroservicesSteps(), [])
  const runner = useTtsRunner(steps, (step) => `${step.message}. ${step.detail}`)
  const { step, index } = runner

  const { nodeState } = useDiagramNodes(steps, index)

  return (
    <div className="space-y-4">

      <DiagramHeader title="Microservices Architecture">
        Step through how services decompose, communicate, and isolate data independently.
      </DiagramHeader>

      {/* Diagram */}
      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIR_MAP} edgeProps={edgeProps} />
        </>}
        footer={<>
          {/* Legend */}
          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px bg-blue-500 rounded-full" style={{ boxShadow: '0 0 4px rgba(59,130,246,0.8)' }} />
              <span className="text-[10px] text-slate-500">sync (HTTP/gRPC)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px bg-amber-500 rounded-full" style={{ boxShadow: '0 0 4px rgba(245,158,11,0.8)' }} />
              <span className="text-[10px] text-slate-500">async (events)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[7px] font-bold border border-white/20 rounded px-1 py-px text-slate-500">DB</span>
              <span className="text-[10px] text-slate-500">owns its database</span>
            </div>
            <span className="text-[10px] text-slate-600 ml-auto hidden sm:inline">tap any service for details</span>
          </div>
        </>}
      >
        {/* Node blocks */}
        {NODES.map((node) => (
          <DiagramNode
            key={node.id}
            node={node}
            {...nodeState(node.id)}
          />
        ))}
      </DiagramCanvas>

      {/* Step message */}
      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
