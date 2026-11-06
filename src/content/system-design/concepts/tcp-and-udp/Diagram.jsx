import { useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { buildTcpAndUdpSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

const CW = 620
const CH = 290

const NODES = [
  {
    id: 'sender', label: 'Sender', icon: '🖥️', dir: 'left',
    cx: 80, cy: 145, w: 110, h: 82,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'initiates connection', sub2: 'client / source',
    desc: 'The initiating side of the connection. In TCP, it sends the first SYN. In UDP, it fires datagrams immediately with no setup.',
    note: 'In TCP, the sender tracks unacknowledged segments and retransmits on timeout. In UDP, lost packets are simply gone.',
  },
  {
    id: 'network', label: 'Network', icon: '☁️', dir: 'top',
    cx: 310, cy: 145, w: 140, h: 88,
    color: '#64748b', glow: 'rgba(100,116,139,0.65)', lc: '#94a3b8', strip: 'bg-slate-500',
    sub1: 'IP routing', sub2: 'best-effort delivery',
    desc: 'The IP layer routes packets independently. Packets can arrive out of order, be duplicated, or be dropped. TCP fixes this; UDP accepts it.',
    note: 'IP provides no delivery guarantees — it is a best-effort service. All reliability must be implemented at the transport layer (TCP) or application layer (QUIC).',
  },
  {
    id: 'receiver', label: 'Receiver', icon: '📻', dir: 'top',
    cx: 540, cy: 145, w: 110, h: 82,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'accepts connections', sub2: 'server / destination',
    desc: 'The receiving side. In TCP, it sends SYN-ACK during the handshake and buffers out-of-order segments for ordered delivery.',
    note: 'TCP receive window advertises how much buffer space the receiver has — this is how flow control prevents the sender from overwhelming a slow receiver.',
  },
]

const EDGES = {
  'sender-network':  { x1: 135, y1: 145, x2: 240, y2: 145 },
  'network-receiver':{ x1: 380, y1: 145, x2: 485, y2: 145 },
}

const DIR_MAP = {
  request:  { fwd: FLOW.violet,  bwd: null       },
  both:     { fwd: FLOW.violet,  bwd: FLOW.emerald  },
  response: { fwd: FLOW.emerald, bwd: null       },
}

const HANDSHAKE_LABELS = {
  syn:         { color: '#f59e0b', text: 'SYN →',            sub: 'seq=0' },
  'syn-ack':   { color: '#0ea5e9', text: '← SYN-ACK',        sub: 'ack=1 seq=0' },
  established: { color: '#10b981', text: 'ACK → ESTABLISHED', sub: '3-way complete' },
  closing:     { color: '#f43f5e', text: 'FIN → teardown',    sub: '4-way close' },
}

export default function TcpAndUdpDiagram({ onStepChange }) {
  const steps  = useMemo(() => buildTcpAndUdpSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  const { nodeState } = useDiagramNodes(steps, index)

  const hs = step.handshakeState ? HANDSHAKE_LABELS[step.handshakeState] : null
  const isUdp = step.protocolMode === 'udp'

  return (
    <div className="space-y-4">

      <DiagramHeader title="TCP and UDP — Transport Layer Protocols">
        Watch the TCP 3-way handshake, flow control, and teardown. Then compare with UDP's zero-overhead fire-and-forget model.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIR_MAP} />
          <text x={148} y={132} style={{ fill: '#8b5cf685', fontSize: 9, fontFamily: 'ui-monospace,monospace', fontWeight: 600 }}>
            {isUdp ? 'datagram (no ack)' : 'segments + ACK'}
          </text>
          <text x={390} y={132} style={{ fill: '#0ea5e985', fontSize: 9, fontFamily: 'ui-monospace,monospace', fontWeight: 600 }}>
            {isUdp ? 'datagram (no ack)' : 'ordered delivery'}
          </text>
        </>}
        header={<>
          {/* Protocol mode badge */}
          <div className="flex items-center gap-2 mb-3">
            <motion.span
              animate={{
                color:       isUdp ? '#f59e0b' : '#8b5cf6',
                borderColor: isUdp ? 'rgba(245,158,11,0.4)' : 'rgba(139,92,246,0.4)',
                background:  isUdp ? 'rgba(245,158,11,0.08)' : 'rgba(139,92,246,0.08)',
              }}
              transition={{ duration: 0.3 }}
              className="rounded-full border px-3 py-0.5 text-[10px] font-bold font-mono"
            >
              {isUdp ? 'UDP MODE' : 'TCP MODE'}
            </motion.span>
            {hs && (
              <motion.span
                key={hs.text}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] font-mono"
                style={{ color: hs.color }}
              >
                {hs.text} <span className="opacity-60">{hs.sub}</span>
              </motion.span>
            )}
          </div>
        </>}
        footer={<>
          <div className="flex items-center gap-5 mt-1 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,  glow: FLOW.violet.glow,  label: isUdp ? 'datagram (no setup)' : 'TCP segment / SYN' },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: isUdp ? 'received (no ACK)'   : 'ACK / response'    },
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
            tone={isUdp && node.id === 'network' ? FLOW.amber.hex : null}
          />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
