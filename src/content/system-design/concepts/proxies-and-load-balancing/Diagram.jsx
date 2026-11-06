import { useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildProxiesAndLoadBalancingSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

// ── Layout ────────────────────────────────────────────────────────────────────
// Client (left) → Load Balancer (center) → Server 1/2/3 (right, stacked)

const CW = 640
const CH = 300

const NODES = [
  {
    id: 'client', label: 'Client', icon: '💻', dir: 'bottom',
    cx: 72, cy: 150, w: 100, h: 78,
    color: '#94a3b8', glow: 'rgba(148,163,184,0.65)', lc: '#cbd5e1', strip: 'bg-slate-400',
    sub1: 'browser / app', sub2: 'end user',
    desc: 'Makes HTTP requests. The client sees only one IP address — the load balancer. Backend topology is completely hidden.',
    note: 'The load balancer is the only public-facing component. Backend servers live in a private subnet.',
  },
  {
    id: 'lb', label: 'Load Balancer', icon: '⚖️', dir: 'top',
    cx: 290, cy: 150, w: 128, h: 86,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'L7 routing', sub2: 'SSL termination',
    desc: 'Distributes traffic, terminates TLS, performs health checks, and can route by path/header. AWS ALB, nginx, and HAProxy are common choices.',
    note: 'The load balancer is a SPOF itself — use an active-active pair of LBs with anycast IP or AWS Route53 for true HA.',
  },
  {
    id: 'server1', label: 'Server 1', icon: '🖥️', dir: 'right',
    cx: 545, cy: 80, w: 106, h: 72,
    color: '#3b82f6', glow: 'rgba(59,130,246,0.65)', lc: '#93c5fd', strip: 'bg-blue-500',
    sub1: 'healthy', sub2: 'stateless',
    desc: 'Stateless application server. Handles any request sent to it — no user-specific in-memory state.',
    note: 'Stateless servers are the key to horizontal scaling. Shared state lives in Redis or the database.',
  },
  {
    id: 'server2', label: 'Server 2', icon: '🖥️', dir: 'right',
    cx: 545, cy: 155, w: 106, h: 72,
    color: '#3b82f6', glow: 'rgba(59,130,246,0.65)', lc: '#93c5fd', strip: 'bg-blue-500',
    sub1: 'healthy', sub2: 'stateless',
    desc: 'Second application server. Round-robin means every third request goes here.',
    note: 'Adding a server is the primary scaling action. The load balancer auto-discovers it (e.g., via EC2 Auto Scaling Group).',
  },
  {
    id: 'server3', label: 'Server 3', icon: '🖥️', dir: 'right',
    cx: 545, cy: 230, w: 106, h: 72,
    color: '#3b82f6', glow: 'rgba(59,130,246,0.65)', lc: '#93c5fd', strip: 'bg-blue-500',
    sub1: 'healthy', sub2: 'stateless',
    desc: 'Third application server. Health checks keep it in rotation only when it responds to GET /health.',
    note: 'Health check failure threshold: 2 consecutive failures → removed. 3 consecutive successes → re-added.',
  },
]

const EDGES = {
  'client-lb':   { x1: 122, y1: 150, x2: 226, y2: 150 },
  'lb-server1':  { x1: 354, y1: 118, x2: 492, y2: 92 },
  'lb-server2':  { x1: 354, y1: 150, x2: 492, y2: 155 },
  'lb-server3':  { x1: 354, y1: 182, x2: 492, y2: 218 },
}

const DIR_MAP = {
  request:  { fwd: FLOW.violet },
  response: { fwd: FLOW.emerald },
  both:     { fwd: FLOW.blue, bwd: FLOW.emerald },
  health:   { fwd: FLOW.amber },
}

// ── Edge connection ───────────────────────────────────────────────────────────

// ── Node block ────────────────────────────────────────────────────────────────

// ── Main component ────────────────────────────────────────────────────────────

const PINNED = { text: 'PINNED', color: '#fcd34d' }

// The load balancer's link to an unhealthy server: dimmed, dashed, crossed out.
const removedLink = (edgeId) => {
  const { x1, y1, x2, y2 } = EDGES[edgeId]
  return {
    flow: null, color: '#3f1f1f', dashed: '4 4', width: 1,
    children: (
      <text x={(x1 + x2) / 2 - 5} y={(y1 + y2) / 2 + 4} style={{ fill: '#f43f5e', fontSize: 12, fontWeight: 700, opacity: 0.9 }}>✕</text>
    ),
  }
}

export default function ProxiesAndLoadBalancingDiagram({ onStepChange }) {
  const steps  = useMemo(() => buildProxiesAndLoadBalancingSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  const { nodeState } = useDiagramNodes(steps, index)

  const failedServer  = step.failedServer ?? null
  const stickyServer  = step.type === 'sticky-sessions' ? 'server1' : null
  const showL7Banner  = step.type === 'l4-vs-l7'
  const showAABanner  = step.type === 'active-active'

  return (
    <div className="space-y-4">

      <DiagramHeader title="Load Balancing — Distributing Traffic at Scale">
        From a single overloaded server to round-robin, health checks, sticky sessions, and active-active HA.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIR_MAP} edgeProps={(edgeId) => (failedServer && edgeId === `lb-${failedServer}` ? removedLink(edgeId) : null)} />

          {/* Round-robin indicator arrow labels */}
          {step.type === 'round-robin' && (
            <>
              <text x={390} y={78}  style={{ fill: '#8b5cf6', fontSize: 8, fontFamily: 'ui-monospace, monospace', fontWeight: 600, opacity: 0.75 }}>req 1</text>
              <text x={390} y={154} style={{ fill: '#8b5cf6', fontSize: 8, fontFamily: 'ui-monospace, monospace', fontWeight: 600, opacity: 0.75 }}>req 2</text>
              <text x={390} y={225} style={{ fill: '#8b5cf6', fontSize: 8, fontFamily: 'ui-monospace, monospace', fontWeight: 600, opacity: 0.75 }}>req 3</text>
            </>
          )}
        </>}
        footer={<>
          {/* Informational banners */}
          <AnimatePresence mode="wait">
            {failedServer && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="relative mt-3 flex items-center gap-4 rounded-xl border border-rose-500/40 bg-rose-500/[0.06] px-4 py-3 overflow-hidden"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={`br-${i}`}
                    className="absolute inset-0 rounded-xl pointer-events-none border border-rose-400/20"
                    initial={{ scale: 0.95, opacity: 0.7 }}
                    animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
                    transition={{ duration: 1.1, delay: i * 0.2, ease: 'easeOut' }}
                  />
                ))}
                <span className="text-xl relative z-10 select-none">🔴</span>
                <div className="relative z-10">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Server 3 Removed from Pool</p>
                  <p className="text-sm text-white">2 consecutive health check failures — traffic shifted to Server 1 &amp; 2 automatically</p>
                </div>
              </motion.div>
            )}
            {showL7Banner && (
              <motion.div
                key="l7"
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="relative mt-3 rounded-xl border border-violet-500/40 bg-violet-500/[0.06] px-4 py-3"
              >
                <p className="text-[11px] font-bold uppercase tracking-wider text-violet-400 mb-1.5">L4 vs L7 Comparison</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-300">L4 (TCP/IP)</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Routes by IP + port. Fast, low CPU. No HTTP visibility. Good for raw TCP protocols.</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-300">L7 (HTTP)</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">Reads headers, paths, cookies. Path-based routing, A/B testing, canary deploys. Slight overhead.</p>
                  </div>
                </div>
              </motion.div>
            )}
            {showAABanner && (
              <motion.div
                key="aa"
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="relative mt-3 flex items-center gap-4 rounded-xl border border-violet-500/40 bg-violet-500/[0.06] px-4 py-3 overflow-hidden"
              >
                <span className="text-xl relative z-10 select-none">⚡</span>
                <div className="relative z-10">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-violet-400">Active-Active — All Servers Handling Traffic</p>
                  <p className="text-sm text-white">Maximum throughput + instant failover. Requires stateless servers with shared session store (Redis).</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,  glow: FLOW.violet.glow,  label: 'request'              },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'response'              },
              { color: FLOW.blue.hex,     glow: FLOW.blue.glow,     label: 'bidirectional traffic' },
              { color: FLOW.amber.hex,   glow: FLOW.amber.glow,   label: 'health check'          },
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
            {...nodeState(node.id)}
            node={failedServer === node.id ? { ...node, icon: '💀', sub1: 'UNHEALTHY', sub2: 'removed from pool' } : node}
            tone={failedServer === node.id ? FLOW.red.hex : null}
            badge={stickyServer === node.id ? PINNED : null}
          />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
