import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildAvailabilityPatternsSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

const CW = 620
const CH = 310

const NODES = [
  {
    id: 'client', label: 'Client', icon: '💻', dir: 'left',
    cx: 72, cy: 155, w: 100, h: 72,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'sends requests', sub2: 'browser / app',
    desc: 'The end user\'s browser or mobile app sending requests to the system. During failover, the client may receive errors or timeouts — the goal is to minimize this window.',
    note: 'Health check intervals determine the failover detection time. 30s interval means up to 30s of errors before failover begins.',
  },
  {
    id: 'lb', label: 'Load Balancer', icon: '⚖️', dir: 'top',
    cx: 240, cy: 155, w: 120, h: 80,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'health checks', sub2: 'auto failover',
    desc: 'Routes requests to healthy servers. Probes each server on /health every few seconds. Removes unresponsive servers from rotation automatically.',
    note: 'The load balancer is itself a potential SPOF — production setups use active-active load balancers with anycast or floating IPs for redundancy.',
  },
  {
    id: 'primary', label: 'Primary', icon: '🖥️', dir: 'top',
    cx: 430, cy: 90, w: 118, h: 78,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'handles traffic', sub2: 'active server',
    desc: 'The primary server handling all production traffic. Continuously replicates state to the standby. Health checks from the load balancer ensure it is responsive.',
    note: 'In active-passive, the primary is the only node serving traffic. In active-active, both primary and standby serve traffic simultaneously.',
  },
  {
    id: 'standby', label: 'Standby', icon: '🖥️', dir: 'bottom',
    cx: 430, cy: 230, w: 118, h: 78,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: 'warm standby', sub2: 'ready to promote',
    desc: 'A synchronized hot standby. Receives continuous replication from the primary and can be promoted within seconds. Not serving traffic in active-passive mode.',
    note: 'Hot standby (in sync) vs warm standby (periodic sync) vs cold standby (manual setup). Hotter = faster failover, higher cost.',
  },
]

const EDGES = {
  'client-lb':       { x1: 122, y1: 155, x2: 180, y2: 155 },
  'lb-primary':      { x1: 300, y1: 130, x2: 371, y2: 101 },
  'lb-standby':      { x1: 300, y1: 178, x2: 371, y2: 218 },
  'primary-standby': { x1: 430, y1: 129, x2: 430, y2: 191 },
}

const FAIL_BANNERS = {
  'primary-down':  { icon: '⚠️', color: 'rose',   label: 'Primary Down — Failover Initiated', sub: 'Load balancer removing primary from rotation · promoting standby' },
  'circuit-open':  { icon: '🔴', color: 'rose',   label: 'Circuit Breaker Open — Fast Failing', sub: 'No requests reaching downstream · returning cached fallback immediately' },
  'degraded':      { icon: '🟡', color: 'amber',  label: 'Degraded Mode — Core Features Serving', sub: 'Non-critical features disabled · recommendations, ML services unavailable' },
}

const FAILED = { text: 'FAILED', color: FLOW.red.hex }
// The load balancer's link to a dead primary: red, dashed, no traffic.
const BROKEN_LINK = { flow: null, color: FLOW.red.hex, dashed: '4 3' }

export default function AvailabilityPatternsDiagram() {
  const steps  = useMemo(() => buildAvailabilityPatternsSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  const { nodeState } = useDiagramNodes(steps, index)
  const primaryDown = step.failState === 'primary-down'

  const failBanner = step.failState ? FAIL_BANNERS[step.failState] : null

  return (
    <div className="space-y-4">
      <DiagramHeader title="Availability Patterns">
        Step through active-active, active-passive failover, health checks, circuit breakers, and graceful degradation.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <text x="72"  y="22" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="600" letterSpacing="1.5">CLIENT</text>
          <text x="240" y="22" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="600" letterSpacing="1.5">LOAD BALANCER</text>
          <text x="430" y="22" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="600" letterSpacing="1.5">SERVERS</text>

          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} edgeProps={(edgeId) => (primaryDown && edgeId === 'lb-primary' ? BROKEN_LINK : null)} />
        </>}
        footer={<>
          <AnimatePresence mode="wait">
            {failBanner && (
              <motion.div
                key={step.failState}
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className={`mt-3 flex items-center gap-3 rounded-xl border px-4 py-2.5 ${
                  failBanner.color === 'rose'
                  ? 'border-rose-500/40 bg-rose-500/[0.07]'
                  : 'border-amber-500/40 bg-amber-500/[0.07]'
                }`}
              >
                <span className="text-xl select-none">{failBanner.icon}</span>
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${failBanner.color === 'rose' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {failBanner.label}
                  </p>
                  <p className={`text-[11px] font-mono ${failBanner.color === 'rose' ? 'text-rose-300' : 'text-amber-300'}`}>
                    {failBanner.sub}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px rounded-full" style={{ background: FLOW.violet.hex, boxShadow: `0 0 4px ${FLOW.violet.glow}` }} />
              <span className="text-[10px] text-slate-500">request</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px rounded-full" style={{ background: FLOW.emerald.hex, boxShadow: `0 0 4px ${FLOW.emerald.glow}` }} />
              <span className="text-[10px] text-slate-500">response / replication</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px rounded-full" style={{ background: FLOW.red.hex, boxShadow: `0 0 4px ${FLOW.red.glow}`, strokeDasharray: '4 3' }} />
              <span className="text-[10px] text-slate-500">failed connection</span>
            </div>
            <span className="text-[10px] text-slate-600 ml-auto hidden sm:inline">tap any node for details</span>
          </div>
        </>}
      >
        {NODES.map((node) => (
          <DiagramNode
            key={node.id}
            {...nodeState(node.id)}
            node={primaryDown && node.id === 'primary' ? { ...node, sub1: 'DOWN' } : node}
            tone={primaryDown && node.id === 'primary' ? FLOW.red.hex : null}
            badge={primaryDown && node.id === 'primary' ? FAILED : null}
          />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
