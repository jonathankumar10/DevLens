import { useMemo } from 'react'
import { buildChatSystemSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import StepBanner from '../../../../components/ui/StepBanner'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

// ── Layout ────────────────────────────────────────────────────────────────────
// Left column:  userA
// Center-left:  gateway (API Gateway)
// Center:       chatSvc (Chat Service), sequencer (ID Gen), presence (Presence)
// Center-right: mq (Message Queue), cassandra (Cassandra DB)
// Right:        userB, pushSvc

const CW = 740
const CH = 360

const NODES = [
  {
    id: 'userA', label: 'User A', icon: '👤', dir: 'left',
    cx: 56, cy: 130, w: 92, h: 72,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'WebSocket', sub2: 'online',
    desc: 'The message sender. Holds a persistent WebSocket connection to a Chat Server via the API Gateway.',
    note: 'WebSocket lets the server push to this client without polling.',
  },
  {
    id: 'gateway', label: 'API Gateway', icon: '🔀', dir: 'top',
    cx: 190, cy: 130, w: 106, h: 72,
    color: '#6366f1', glow: 'rgba(99,102,241,0.65)', lc: '#a5b4fc', strip: 'bg-indigo-500',
    sub1: 'WS + REST', sub2: 'auth / routing',
    desc: 'Handles WebSocket upgrades, authenticates connections, and routes to the correct Chat Server.',
    note: 'Sticky sessions or a connection map ensures each user lands on one server.',
  },
  {
    id: 'chatSvc', label: 'Chat Service', icon: '💬', dir: 'top',
    cx: 340, cy: 100, w: 112, h: 76,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'stateless', sub2: 'fan-out logic',
    desc: 'Core message handler. Receives messages, assigns IDs, persists to Cassandra, and fans out to recipients.',
    note: 'Stateless — any server can handle any message because state lives in Redis/Cassandra.',
  },
  {
    id: 'sequencer', label: 'ID Generator', icon: '🔢', dir: 'top',
    cx: 340, cy: 210, w: 112, h: 68,
    color: '#a855f7', glow: 'rgba(168,85,247,0.65)', lc: '#d8b4fe', strip: 'bg-purple-500',
    sub1: 'Snowflake', sub2: 'monotonic 64-bit',
    desc: 'Generates globally ordered 64-bit IDs encoding timestamp + machine ID + sequence number.',
    note: 'Never use wall-clock timestamps for message ordering — clocks drift and skew across servers.',
  },
  {
    id: 'presence', label: 'Presence', icon: '📡', dir: 'bottom',
    cx: 340, cy: 310, w: 104, h: 66,
    color: '#7c3aed', glow: 'rgba(124,58,237,0.65)', lc: '#c4b5fd', strip: 'bg-violet-700',
    sub1: 'Redis TTL', sub2: 'heartbeat 5s',
    desc: 'Tracks online/offline status. Maps user_id → {server_id, last_seen} with short TTL.',
    note: 'Presence fan-out for large groups is expensive — cap group sizes or use coarse presence.',
  },
  {
    id: 'cassandra', label: 'Cassandra', icon: '🗄️', dir: 'top',
    cx: 510, cy: 130, w: 112, h: 72,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'conv_id + msg_id', sub2: 'append-only',
    desc: 'Message store. Partition key = conversation_id, clustering key = message_id (desc). Range scans for history pagination.',
    note: 'Relational DBs cannot handle the write throughput of millions of concurrent conversations.',
  },
  {
    id: 'mq', label: 'Message Queue', icon: '📨', dir: 'top',
    cx: 510, cy: 240, w: 112, h: 68,
    color: '#06b6d4', glow: 'rgba(6,182,212,0.65)', lc: '#67e8f9', strip: 'bg-cyan-500',
    sub1: 'Kafka / Redis', sub2: 'pub-sub',
    desc: 'Decouples the sender\'s Chat Server from the recipient\'s. Each server subscribes to its own channel.',
    note: 'Pub/Sub prevents direct server-to-server calls — the sender does not need to know where the recipient is connected.',
  },
  {
    id: 'pushSvc', label: 'Push Service', icon: '🔔', dir: 'right',
    cx: 672, cy: 230, w: 104, h: 68,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: 'APNs / FCM', sub2: 'offline only',
    desc: 'Delivers push notifications to offline users via Apple APNs (iOS) or Google FCM (Android).',
    note: 'Push carries only a "you have a message" alert — full content is fetched on reconnect to avoid storing sensitive data on provider servers.',
  },
  {
    id: 'userB', label: 'User B', icon: '👥', dir: 'right',
    cx: 672, cy: 115, w: 92, h: 72,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'recipient', sub2: 'online / offline',
    desc: 'The message recipient. May be online (WebSocket delivery) or offline (push notification fallback).',
    note: 'On reconnect, the client requests all messages after its last known sequence ID — a full replay, not a summary.',
  },
]

const EDGES = {
  'userA-gateway':      { x1: 102,  y1: 130, x2: 137,  y2: 130 },
  'gateway-chatSvc':    { x1: 243,  y1: 120, x2: 284,  y2: 108 },
  'chatSvc-sequencer':  { x1: 340,  y1: 138, x2: 340,  y2: 176 },
  'chatSvc-cassandra':  { x1: 396,  y1: 115, x2: 454,  y2: 127 },
  'chatSvc-presence':   { x1: 340,  y1: 138, x2: 340,  y2: 277 },
  'chatSvc-mq':         { x1: 396,  y1: 128, x2: 454,  y2: 228 },
  'mq-chatSvc':         { x1: 454,  y1: 244, x2: 396,  y2: 130 },
  'chatSvc-userB':      { x1: 396,  y1: 100, x2: 626,  y2: 113 },
  'chatSvc-pushSvc':    { x1: 396,  y1: 120, x2: 620,  y2: 218 },
  'pushSvc-userB':      { x1: 672,  y1: 196, x2: 672,  y2: 151 },
  'userB-gateway':      { x1: 626,  y1: 120, x2: 243,  y2: 125 },
}

const DIR_MAP = {
  request:  { fwd: FLOW.violet,  bwd: null },
  response: { fwd: FLOW.emerald, bwd: null },
  both:     { fwd: FLOW.violet,  bwd: FLOW.emerald },
  push:     { fwd: FLOW.amber,     bwd: null },
  sync:     { fwd: FLOW.cyan,     bwd: null },
}

// ── Edge connection ───────────────────────────────────────────────────────────

// ── Node block ────────────────────────────────────────────────────────────────

// ── Main component ────────────────────────────────────────────────────────────

export default function ChatSystemDiagram() {
  const steps  = useMemo(() => buildChatSystemSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  const { nodeState } = useDiagramNodes(steps, index)


  return (
    <div className="space-y-4">

      <DiagramHeader title="Chat System Architecture">
        From WebSocket connection to message delivery — trace every hop including offline fallback and group fan-out.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIR_MAP} />
          {/* Section labels */}
          <text x={14} y={20} style={{ fill: '#4c1d95', fontSize: 8, fontFamily: 'monospace', fontWeight: 700, opacity: 0.7 }}>CLIENTS</text>
          <text x={148} y={20} style={{ fill: '#3730a3', fontSize: 8, fontFamily: 'monospace', fontWeight: 700, opacity: 0.7 }}>GATEWAY</text>
          <text x={292} y={20} style={{ fill: '#6d28d9', fontSize: 8, fontFamily: 'monospace', fontWeight: 700, opacity: 0.7 }}>CHAT SERVICES</text>
          <text x={456} y={20} style={{ fill: '#0c4a6e', fontSize: 8, fontFamily: 'monospace', fontWeight: 700, opacity: 0.7 }}>STORAGE / QUEUE</text>
          <text x={634} y={20} style={{ fill: '#064e3b', fontSize: 8, fontFamily: 'monospace', fontWeight: 700, opacity: 0.7 }}>DELIVERY</text>
        </>}
        footer={<>
          <StepBanner banner={step.banner} />

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,  glow: FLOW.violet.glow,  label: 'request / send' },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'delivery / response' },
              { color: FLOW.amber.hex,     glow: FLOW.amber.glow,     label: 'push notification' },
              { color: FLOW.cyan.hex,     glow: FLOW.cyan.glow,     label: 'sync / queue' },
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
