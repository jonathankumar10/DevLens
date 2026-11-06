import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildRateLimitingSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { FLOW } from '../../../../components/system-design/diagram/colors'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'

const CW = 680
const CH = 285

const NODES = [
  {
    id: 'client', label: 'API Client', icon: '💻', dir: 'right',
    cx: 72,  cy: 145, w: 100, h: 78,
    color: '#94a3b8', glow: 'rgba(148,163,184,0.65)', lc: '#cbd5e1', strip: 'bg-slate-400',
    sub1: 'sends requests', sub2: 'reads headers',
    desc: 'Any caller making API requests — a web app, mobile client, or another service.',
    note: 'Well-behaved clients read X-RateLimit-Remaining and self-throttle before hitting zero.',
  },
  {
    id: 'limiter', label: 'Rate Limiter', icon: '🛡️', dir: 'top',
    cx: 265, cy: 108, w: 118, h: 84,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'token bucket', sub2: 'check + decrement',
    desc: 'The gateway that intercepts every request and decides allow or reject based on the current token count.',
    note: 'Uses an atomic Lua script in Redis — check-and-decrement in one round trip, no race conditions.',
  },
  {
    id: 'api', label: 'API Server', icon: '🖥️', dir: 'left',
    cx: 490, cy: 108, w: 118, h: 84,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'business logic', sub2: 'sees allowed only',
    desc: 'The backend service. It only ever receives requests that have passed the rate limiter.',
    note: 'Protected from bursts and DDoS — the limiter absorbs all rejection logic upstream.',
  },
  {
    id: 'redis', label: 'Redis Counter', icon: '⚡', dir: 'bottom',
    cx: 265, cy: 248, w: 118, h: 70,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: 'INCR + EXPIRE', sub2: 'shared counter',
    desc: 'Stores the token count atomically. All gateway nodes share this single source of truth.',
    note: 'Without Redis each node would have its own counter — users could multiply their limit by hitting N servers.',
  },
]

const EDGES = {
  'client-limiter': { x1: 122, y1: 145, x2: 206, y2: 118 },
  'limiter-api':    { x1: 324, y1: 108, x2: 431, y2: 108 },
  'limiter-redis':  { x1: 265, y1: 150, x2: 265, y2: 213 },
}

const DIR_MAP = {
  request:  { fwd: FLOW.violet },
  response: { fwd: FLOW.emerald },
  both:     { fwd: FLOW.violet, bwd: FLOW.emerald },
  rejected: { fwd: FLOW.red, bwd: FLOW.red },
  refill:   { fwd: FLOW.amber, bwd: FLOW.amber },
}

// ── Edge connection ───────────────────────────────────────────────────────────

// ── Node block ────────────────────────────────────────────────────────────────

// ── Token bucket ──────────────────────────────────────────────────────────────

const MAX_TOKENS = 5

function TokenBucket({ tokens }) {
  return (
    <div className="flex flex-col items-center gap-2 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">Token Bucket</p>
      <div className="flex items-center gap-2.5">
        {Array.from({ length: MAX_TOKENS }).map((_, i) => (
          <motion.div
            key={i}
            className="w-7 h-7 rounded-full border-2"
            animate={{
              backgroundColor: i < tokens ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.02)',
              borderColor:     i < tokens ? '#7c3aed'               : 'rgba(255,255,255,0.08)',
              boxShadow:       i < tokens ? '0 0 10px 2px rgba(139,92,246,0.55)' : 'none',
            }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          />
        ))}
      </div>
      <motion.p
        key={tokens}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1,    opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 18 }}
        className="text-[12px] font-mono font-bold"
        style={{ color: tokens === 0 ? '#f43f5e' : tokens <= 1 ? '#f59e0b' : '#a78bfa' }}
      >
        {tokens} / {MAX_TOKENS} tokens
      </motion.p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RateLimitingDiagram() {
  const steps  = useMemo(() => buildRateLimitingSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  const { nodeState } = useDiagramNodes(steps, index)

  return (
    <div className="space-y-4">

      <DiagramHeader title="Rate Limiting — Token Bucket">
        Step through how a token bucket rate limiter allows bursts, enforces sustained limits, and rejects excess traffic.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIR_MAP} />
        </>}
        footer={<>
          {/* Token bucket + status */}
          <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
            <TokenBucket tokens={step.tokens} />

            {/* Status badge */}
            <AnimatePresence mode="wait">
              {step.status === 'allowed' && (
                <motion.div
                  key="allowed"
                  initial={{ opacity: 0, scale: 0.85, y: 6 }}
                  animate={{ opacity: 1, scale: 1,    y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                  className="relative flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-500/[0.08] px-4 py-2.5 overflow-hidden"
                >
                  {[0, 1].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-xl border border-emerald-400/25 pointer-events-none"
                      initial={{ scale: 0.95, opacity: 0.7 }}
                      animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
                      transition={{ duration: 0.9, delay: i * 0.18, ease: 'easeOut' }}
                    />
                  ))}
                  <span className="text-emerald-400 text-base relative z-10 select-none">✓</span>
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Request Allowed</p>
                    <p className="text-[11px] text-emerald-300 font-mono">HTTP 200 · forwarded to API</p>
                  </div>
                </motion.div>
              )}
              {step.status === 'rejected' && (
                <motion.div
                  key="rejected"
                  initial={{ opacity: 0, scale: 0.85, y: 6 }}
                  animate={{ opacity: 1, scale: 1,    y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                  className="relative flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/[0.08] px-4 py-2.5 overflow-hidden"
                >
                  {[0, 1].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-xl border border-rose-400/25 pointer-events-none"
                      initial={{ scale: 0.95, opacity: 0.7 }}
                      animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
                      transition={{ duration: 0.9, delay: i * 0.18, ease: 'easeOut' }}
                    />
                  ))}
                  <span className="text-rose-400 text-base relative z-10 select-none">✕</span>
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Request Rejected</p>
                    <p className="text-[11px] text-rose-300 font-mono">HTTP 429 · Retry-After header set</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,  glow: FLOW.violet.glow,  label: 'request' },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'allowed' },
              { color: FLOW.red.hex, glow: FLOW.red.glow, label: 'rejected (429)' },
              { color: FLOW.amber.hex,   glow: FLOW.amber.glow,   label: 'token refill' },
            ].map(({ color, glow, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-5 h-px rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 4px ${glow}` }} />
                <span className="text-[10px] text-slate-500">{label}</span>
              </div>
            ))}
            <span className="text-[10px] text-slate-600 ml-auto hidden sm:inline">tap any component for details</span>
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

      {/* Step message */}
      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
