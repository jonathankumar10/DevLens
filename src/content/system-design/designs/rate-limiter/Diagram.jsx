import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildRateLimiterSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

// ── Layout ─────────────────────────────────────────────────────────────────────
// client (left) → gateway (center-left) → ratelimiter (center)
//                                              ↓
//                                           redis (center-bottom)
// gateway → backend (right, stacked services)
// adminui (top-right)

const CW = 720
const CH = 340

const NODES = [
  {
    id: 'client', label: 'Client', icon: '💻', dir: 'left',
    cx: 68, cy: 170, w: 100, h: 78,
    color: '#94a3b8', glow: 'rgba(148,163,184,0.65)', lc: '#cbd5e1', strip: 'bg-slate-400',
    sub1: 'API consumer', sub2: 'user / service',
    desc: 'Any caller making requests — a browser, mobile app, or third-party service.',
    note: 'Clients should respect X-RateLimit-Remaining and back off before hitting 429.',
  },
  {
    id: 'gateway', label: 'API Gateway', icon: '🚪', dir: 'top',
    cx: 210, cy: 170, w: 114, h: 82,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'entry point', sub2: 'SSL + routing',
    desc: 'Single entry point for all traffic. Extracts identifiers and invokes rate limiter middleware before routing.',
    note: 'All gateway nodes share state via Redis — any node can handle any request without over-counting.',
  },
  {
    id: 'ratelimiter', label: 'Rate Limiter', icon: '🛡️', dir: 'top',
    cx: 380, cy: 155, w: 120, h: 86,
    color: '#7c3aed', glow: 'rgba(124,58,237,0.65)', lc: '#ddd6fe', strip: 'bg-violet-700',
    sub1: 'rule engine', sub2: 'token bucket / sliding window',
    desc: 'Middleware that applies the configured algorithm (token bucket, sliding window, fixed window) for the current user tier.',
    note: 'Runs a Lua script on Redis for atomic check-and-increment — the only correct way to avoid race conditions.',
  },
  {
    id: 'redis', label: 'Redis Cluster', icon: '⚡', dir: 'bottom',
    cx: 380, cy: 285, w: 120, h: 78,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'atomic INCR', sub2: 'rl:{userId}:{window}',
    desc: 'Shared counter store. Lua scripts ensure check-then-increment is atomic across all gateway nodes.',
    note: 'At 1M users × 5 windows the key space is 5M small keys — trivial for Redis, which handles billions.',
  },
  {
    id: 'backend', label: 'Backend Services', icon: '⚙️', dir: 'right',
    cx: 588, cy: 170, w: 118, h: 84,
    color: '#3b82f6', glow: 'rgba(59,130,246,0.65)', lc: '#93c5fd', strip: 'bg-blue-500',
    sub1: 'service-a / service-b', sub2: 'never see 429 traffic',
    desc: 'Downstream services that only receive requests that have passed the rate limiter. They are shielded from abuse.',
    note: 'Backend services should still implement their own resource limits — rate limiting is defense-in-depth, not a complete shield.',
  },
  {
    id: 'adminui', label: 'Admin UI', icon: '🎛️', dir: 'top',
    cx: 588, cy: 52, w: 112, h: 72,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: 'rule management', sub2: 'live updates',
    desc: 'Operators update rate limit rules (limits per tier, per endpoint) without redeploying. Gateways refresh config periodically.',
    note: 'Multi-tier limits combine per-second burst (token bucket) with per-day quota (fixed window) for the same identifier.',
  },
]

const EDGES = {
  'client-gateway':  { x1: 118, y1: 170, x2: 153, y2: 170 },
  'gateway-rl':      { x1: 267, y1: 162, x2: 320, y2: 155 },
  'rl-redis':        { x1: 380, y1: 198, x2: 380, y2: 246 },
  'gateway-backend': { x1: 267, y1: 178, x2: 529, y2: 178 },
  'admin-rl':        { x1: 532, y1: 88,  x2: 440, y2: 112 },
}

// ── Edge connection (SVG particles) ──────────────────────────────────────────

// ── Node block ────────────────────────────────────────────────────────────────

// ── Main component ────────────────────────────────────────────────────────────

export default function RateLimiterDiagram() {
  const steps  = useMemo(() => buildRateLimiterSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  const { nodeState } = useDiagramNodes(steps, index)

  const showRejectBanner = step.type === 'reject-request'
  const showFailOpen     = step.type === 'fail-open'

  return (
    <div className="space-y-4">

      <DiagramHeader title="Rate Limiter — Distributed Design">
        Trace a request from client through the API Gateway, Rate Limiter middleware, and Redis atomic counters.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} />
        </>}
        footer={<>
          <AnimatePresence mode="wait">
            {showRejectBanner && (
              <motion.div
                key="reject"
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="relative mt-3 flex items-center gap-3 rounded-xl border border-rose-500/40 bg-rose-500/[0.07] px-4 py-3 overflow-hidden"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={`rj-${i}`}
                    className="absolute inset-0 rounded-xl border border-rose-400/18 pointer-events-none"
                    initial={{ scale: 0.95, opacity: 0.65 }}
                    animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
                    transition={{ duration: 1.1, delay: i * 0.2, ease: 'easeOut' }}
                  />
                ))}
                <span className="text-xl relative z-10 select-none">🚫</span>
                <div className="relative z-10">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400">HTTP 429 Too Many Requests</p>
                  <p className="text-sm text-white">Retry-After: 47s · X-RateLimit-Remaining: 0 · X-RateLimit-Reset: 1735689600</p>
                </div>
              </motion.div>
            )}
            {showFailOpen && (
              <motion.div
                key="failopen"
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="relative mt-3 flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/[0.07] px-4 py-3 overflow-hidden"
              >
                <span className="text-xl relative z-10 select-none">⚠️</span>
                <div className="relative z-10">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Fail-Open Mode — Redis Unavailable</p>
                  <p className="text-sm text-white">Requests pass through unthrottled. Every bypass is logged for alerting.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,  glow: FLOW.violet.glow,  label: 'request flow'   },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'response / allow' },
              { color: FLOW.red.hex,     glow: FLOW.red.glow,     label: '429 reject'     },
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
