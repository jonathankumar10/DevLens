import { useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildDistributedTracingSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

// ── Layout ────────────────────────────────────────────────────────────────────
// Client (left) → Gateway (center-left) → Service A (center) → Service B (center-right)
// Tracing Backend (right) receives spans from all services

const CW = 680
const CH = 280

const NODES = [
  {
    id: 'client', label: 'Client', icon: '💻', dir: 'bottom',
    cx: 60, cy: 140, w: 96, h: 78,
    color: '#94a3b8', glow: 'rgba(148,163,184,0.65)', lc: '#cbd5e1', strip: 'bg-slate-400',
    sub1: 'browser / app', sub2: 'makes HTTP call',
    desc: 'The end user or external caller making the initial request.',
    note: 'The client has no visibility into which services are involved — tracing gives you that view.',
  },
  {
    id: 'gateway', label: 'API Gateway', icon: '🚪', dir: 'top',
    cx: 190, cy: 140, w: 112, h: 80,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'trace ID born here', sub2: 'root span',
    desc: 'Entry point for all traffic. Generates the trace ID and root span, injects W3C traceparent into outgoing headers.',
    note: 'Every trace starts here. If the gateway drops the trace header, the trace is lost.',
  },
  {
    id: 'serviceA', label: 'Service A', icon: '⚙️', dir: 'top',
    cx: 330, cy: 140, w: 112, h: 80,
    color: '#3b82f6', glow: 'rgba(59,130,246,0.65)', lc: '#93c5fd', strip: 'bg-blue-500',
    sub1: 'child span', sub2: 'propagates context',
    desc: 'Reads the traceparent header, creates a child span, runs its business logic, and injects the header into calls to Service B.',
    note: 'OTel auto-instrumentation handles this transparently for HTTP, gRPC, and database calls.',
  },
  {
    id: 'serviceB', label: 'Service B', icon: '🔧', dir: 'top',
    cx: 470, cy: 140, w: 112, h: 80,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'leaf span', sub2: 'data layer',
    desc: 'The deepest service in the call chain. Creates the leaf span. Any slowness here is directly visible in the trace flame graph.',
    note: 'The bottleneck is always easier to find in a trace than in logs — just look for the widest bar.',
  },
  {
    id: 'tracing', label: 'Jaeger', icon: '🔍', dir: 'left',
    cx: 610, cy: 140, w: 110, h: 80,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'span collector', sub2: 'flame graph UI',
    desc: 'Receives spans from all services, correlates them by trace ID, and renders the full timeline. Also supports dependency graph and service map views.',
    note: 'Jaeger, Zipkin, Honeycomb, and AWS X-Ray all speak OpenTelemetry — swap exporters without re-instrumenting.',
  },
]

const EDGES = {
  'client-gateway':   { x1: 108,  y1: 140, x2: 134,  y2: 140 },
  'gateway-serviceA': { x1: 246,  y1: 140, x2: 274,  y2: 140 },
  'serviceA-serviceB':{ x1: 386,  y1: 140, x2: 414,  y2: 140 },
  'serviceA-tracing': { x1: 386,  y1: 120, x2: 555,  y2: 115 },
  'serviceB-tracing': { x1: 526,  y1: 140, x2: 555,  y2: 140 },
}

// ── Edge connection ───────────────────────────────────────────────────────────

// ── Node block ────────────────────────────────────────────────────────────────

// ── Main component ────────────────────────────────────────────────────────────

export default function DistributedTracingDiagram({ onStepChange }) {
  const steps  = useMemo(() => buildDistributedTracingSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  const { nodeState } = useDiagramNodes(steps, index)

  const showAssembled = step.type === 'full-trace' || step.type === 'bottleneck'
  const showBottleneck = step.type === 'bottleneck'

  return (
    <div className="space-y-4">

      <DiagramHeader title="Distributed Tracing — Span by Span">
        Follow a request through microservices, watch spans propagate, and see how Jaeger assembles the full trace.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} />

          {/* Span label on collector edges */}
          {(step.connections['serviceA-tracing'] || step.connections['serviceB-tracing']) && (
            <>
              <text x={460} y={105} style={{ fill: '#f59e0b', fontSize: 8, fontFamily: 'ui-monospace, monospace', fontWeight: 700, opacity: 0.8 }}>
                span emit
              </text>
            </>
          )}
        </>}
        footer={<>
          {/* Trace assembled / bottleneck banner */}
          <AnimatePresence mode="wait">
            {showAssembled && (
              <motion.div
                key={step.type}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="relative mt-3 flex items-center gap-4 rounded-xl border px-4 py-3 overflow-hidden"
                style={{
                  borderColor: showBottleneck ? 'rgba(251,191,36,0.4)' : 'rgba(16,185,129,0.4)',
                  background:  showBottleneck ? 'rgba(251,191,36,0.06)' : 'rgba(16,185,129,0.06)',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={`br-${step.type}-${i}`}
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ border: `1px solid ${showBottleneck ? 'rgba(251,191,36,0.2)' : 'rgba(16,185,129,0.2)'}` }}
                    initial={{ scale: 0.95, opacity: 0.7 }}
                    animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
                    transition={{ duration: 1.1, delay: i * 0.2, ease: 'easeOut' }}
                  />
                ))}
                <span className="text-xl relative z-10 select-none">{showBottleneck ? '⚠️' : '✅'}</span>
                <div className="relative z-10">
                  {showBottleneck ? (
                    <>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Bottleneck Found</p>
                      <p className="text-sm font-mono text-white">Service B: <span className="text-amber-300 font-bold">420 ms</span> of 450 ms total — 93% of latency</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Trace Assembled</p>
                      <p className="text-sm text-white">All spans correlated by trace ID — full flame graph available in Jaeger UI</p>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,  glow: FLOW.violet.glow,  label: 'request / trace propagation' },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'response'                    },
              { color: FLOW.amber.hex,     glow: FLOW.amber.glow,     label: 'span emission'               },
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
            badge={node.id === 'gateway' && step.badge && step.activeNodes.includes(node.id) ? { text: step.badge, color: '#c4b5fd' } : null}
          />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
