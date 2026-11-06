import { useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildApiDesignSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

const CW = 620
const CH = 310

const NODES = [
  {
    id: 'client', label: 'Client', icon: '📱', dir: 'left',
    cx: 75, cy: 155, w: 106, h: 82,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'HTTP requests', sub2: 'mobile / web',
    desc: 'The API consumer — a mobile app, web frontend, or third-party integration. Clients must handle rate limits, pagination, and errors gracefully.',
    note: 'Treat your own product as an API client — if your team struggles with the API, external developers will too.',
  },
  {
    id: 'gateway', label: 'API Gateway', icon: '🔀', dir: 'top',
    cx: 310, cy: 155, w: 130, h: 88,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'auth · rate limit', sub2: 'routing · versioning',
    desc: 'The API gateway handles cross-cutting concerns: authentication, rate limiting, request validation, versioning routing, and logging.',
    note: 'A gateway lets you change backend services without breaking client contracts — it is the stable surface your API clients depend on.',
  },
  {
    id: 'service-a', label: 'Users Service', icon: '👤', dir: 'top',
    cx: 530, cy: 88, w: 116, h: 78,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'GET /users', sub2: 'idempotent reads',
    desc: 'Handles user-related endpoints. Reads are idempotent — GET /users/42 always returns the same user without side effects.',
    note: 'Design each service around one resource domain. Cross-resource operations go through an orchestration layer or use eventual consistency.',
  },
  {
    id: 'service-b', label: 'Orders Service', icon: '📦', dir: 'top',
    cx: 530, cy: 222, w: 116, h: 78,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: 'POST /orders', sub2: 'idempotency keys',
    desc: 'Handles order creation (POST) and updates (PATCH). POSTs are not idempotent — use Idempotency-Key headers to prevent duplicate orders on retries.',
    note: 'Store the idempotency key + response for 24 hours. Return the stored result on duplicate requests without re-processing.',
  },
]

const EDGES = {
  'client-gateway': { x1: 128, y1: 155, x2: 245, y2: 155 },
  'gateway-a':      { x1: 375, y1: 120, x2: 472, y2: 88 },
  'gateway-b':      { x1: 375, y1: 190, x2: 472, y2: 222 },
}

const DIR_MAP = {
  request:  { fwd: FLOW.violet,  bwd: null       },
  both:     { fwd: FLOW.violet,  bwd: FLOW.emerald  },
  response: { fwd: FLOW.emerald, bwd: null       },
}

const RATE_LIMITED = { text: '429', color: FLOW.red.hex }

export default function ApiDesignDiagram({ onStepChange }) {
  const steps  = useMemo(() => buildApiDesignSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  const { nodeState } = useDiagramNodes(steps, index)

  return (
    <div className="space-y-4">

      <DiagramHeader title="API Design — Gateway, Versioning & Rate Limiting">
        Trace a request from client through the API gateway to backend services. See versioning, pagination, rate limiting, and idempotency in action.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIR_MAP} />
        </>}
        footer={<>
          <AnimatePresence mode="wait">
            {step.rateLimitState === 'limited' && (
              <motion.div
                key="ratelimit"
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                className="mt-3 flex items-center gap-3 rounded-xl border border-rose-500/40 bg-rose-500/[0.07] px-4 py-2.5"
              >
                <span className="text-rose-400 select-none">⛔</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">429 Too Many Requests</p>
                  <p className="text-[11px] font-mono text-rose-300">Retry-After: 30 · X-RateLimit-Remaining: 0</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,  glow: FLOW.violet.glow,  label: 'request' },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'response' },
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
            tone={node.id === 'gateway' && step.rateLimitState === 'limited' ? FLOW.red.hex : null}
            badge={node.id === 'gateway' && step.rateLimitState === 'limited' ? RATE_LIMITED : null}
          />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
