import { useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildWebsocketsSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

const CW = 620
const CH = 290

const NODES = [
  {
    id: 'client', label: 'Client', icon: '🖥️', dir: 'left',
    cx: 80, cy: 145, w: 110, h: 84,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'WebSocket API', sub2: 'browser / native app',
    desc: 'The WebSocket client. Initiates the HTTP upgrade request. After the upgrade, uses ws.send() to send frames and ws.onmessage to receive them.',
    note: 'ws.onclose triggers on disconnect. Implement exponential backoff reconnection logic here to avoid thundering herds on server restarts.',
  },
  {
    id: 'channel', label: 'WS Channel', icon: '⚡', dir: 'top',
    cx: 310, cy: 145, w: 140, h: 88,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: 'persistent TCP conn', sub2: 'full-duplex frames',
    desc: 'The WebSocket channel reuses the underlying TCP connection established during the HTTP handshake. Frames are lightweight — 2-byte header minimum.',
    note: 'The channel is persistent: no HTTP overhead per message. Binary or text frames. Both sides can write without waiting for the other.',
  },
  {
    id: 'server', label: 'Server', icon: '🖧', dir: 'top',
    cx: 540, cy: 145, w: 110, h: 84,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'push events', sub2: 'connection registry',
    desc: 'The WebSocket server maintains an in-memory map of open connections. On any event (new message, DB change, timer), it pushes to the relevant connections.',
    note: 'Each connection is stateful memory. Horizontal scaling requires sticky sessions or a shared pub/sub layer (Redis) to route cross-node messages.',
  },
]

const EDGES = {
  'client-channel':  { x1: 135, y1: 145, x2: 240, y2: 145 },
  'channel-server':  { x1: 380, y1: 145, x2: 485, y2: 145 },
}

const DIR_MAP = {
  request:    { fwd: FLOW.violet,  bwd: null       },
  both:       { fwd: FLOW.violet,  bwd: FLOW.emerald  },
  response:   { fwd: FLOW.emerald, bwd: null       },
}

const CONNECTION_COLORS = {
  upgrading:    { color: '#f59e0b', label: 'HTTP 101 Upgrading…'   },
  open:         { color: '#10b981', label: 'Connection Open ●'     },
  reconnecting: { color: '#f43f5e', label: 'Reconnecting…'         },
}

const PING = { text: 'PING', color: FLOW.emerald.hex, pulse: true }
// An open socket with nothing in flight: a faint solid green line.
const OPEN_IDLE = { color: '#10b98140', dashed: 'none', width: 1.5 }

export default function WebsocketsDiagram({ onStepChange }) {
  const steps  = useMemo(() => buildWebsocketsSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  const { nodeState } = useDiagramNodes(steps, index)
  const pinging = step.pingState === 'pinging'

  const connInfo = step.connectionState ? CONNECTION_COLORS[step.connectionState] : null

  return (
    <div className="space-y-4">

      <DiagramHeader title="WebSockets — Persistent Bidirectional Connections">
        Watch the HTTP upgrade handshake, persistent channel, server push, heartbeat, and reconnect flow.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIR_MAP} edgeProps={(edgeId, direction) => (step.connectionState === 'open' && !direction ? OPEN_IDLE : null)} />
          <text x={148} y={132} style={{ fill: '#8b5cf685', fontSize: 9, fontFamily: 'ui-monospace,monospace', fontWeight: 600 }}>
            WS frames
          </text>
          <text x={392} y={132} style={{ fill: '#0ea5e985', fontSize: 9, fontFamily: 'ui-monospace,monospace', fontWeight: 600 }}>
            WS frames
          </text>
        </>}
        header={<>
          {/* Connection state badge */}
          <AnimatePresence mode="wait">
            {connInfo && (
              <motion.div
                key={step.connectionState}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 mb-3"
              >
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: connInfo.color }}
                />
                <span className="text-[10px] font-mono font-semibold" style={{ color: connInfo.color }}>
                  {connInfo.label}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </>}
        footer={<>
          <div className="flex items-center gap-5 mt-1 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,  glow: FLOW.violet.glow,  label: 'client → server frame' },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'server → client push'  },
              { color: FLOW.amber.hex,   glow: FLOW.amber.glow,   label: 'persistent channel'    },
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
            tone={pinging && node.id === 'channel' ? FLOW.emerald.hex : null}
            badge={pinging && node.id === 'channel' ? PING : null}
          />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
