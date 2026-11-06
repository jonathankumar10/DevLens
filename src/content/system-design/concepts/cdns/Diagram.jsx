import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildCdnsSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import DiagramNode, { NodePill } from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

// ── Layout ────────────────────────────────────────────────────────────────────
// Two users (upper-left US, lower-left EU) each connect to their nearest edge.
// Both edges reach back to the single origin on the right.

const CW = 620
const CH = 295

const NODES = [
  {
    id: 'user-a', label: 'US User', icon: '👤', dir: 'left',
    cx: 68,  cy: 80,  w: 96, h: 70,
    color: '#94a3b8', glow: 'rgba(148,163,184,0.55)', lc: '#cbd5e1', strip: 'bg-slate-400',
    sub1: 'browser', sub2: '~US region',
    desc: 'End user in North America. DNS resolves the CDN hostname to the nearest US edge node.',
    note: 'Anycast routing directs the user to the closest edge automatically.',
  },
  {
    id: 'user-b', label: 'EU User', icon: '👤', dir: 'left',
    cx: 68,  cy: 220, w: 96, h: 70,
    color: '#94a3b8', glow: 'rgba(148,163,184,0.55)', lc: '#cbd5e1', strip: 'bg-slate-400',
    sub1: 'browser', sub2: '~EU region',
    desc: 'End user in Europe. Their DNS query resolves to the nearest EU edge node.',
    note: "Without a CDN they'd reach the US-based origin — 150–200 ms away.",
  },
  {
    id: 'us-edge', label: 'US Edge', icon: '🌐', dir: 'top',
    cx: 265, cy: 80,  w: 120, h: 76,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'PoP: North America', sub2: 'cold / warm cache',
    desc: 'A CDN Point of Presence (PoP) in North America. Stores cached copies of origin content.',
    note: 'Once warm, US requests never reach the origin — served entirely from this edge.',
  },
  {
    id: 'eu-edge', label: 'EU Edge', icon: '🌐', dir: 'top',
    cx: 265, cy: 220, w: 120, h: 76,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'PoP: Europe', sub2: 'cold / warm cache',
    desc: 'A CDN Point of Presence in Europe. Independently caches the same origin content.',
    note: 'Each PoP maintains its own cache — a miss at one edge never affects another.',
  },
  {
    id: 'origin', label: 'Origin Server', icon: '🖥️', dir: 'left',
    cx: 510, cy: 150, w: 122, h: 84,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'source of truth', sub2: 'CDN shield',
    desc: 'Your actual server. Only receives traffic when an edge has a cache miss.',
    note: 'With a warm CDN the origin handles a tiny fraction of total requests — often < 5%.',
  },
]

const EDGES = {
  'ua-edge':    { x1: 116, y1: 80,  x2: 205, y2: 80 },
  'ub-edge':    { x1: 116, y1: 220, x2: 205, y2: 220 },
  'us-origin':  { x1: 325, y1: 80,  x2: 449, y2: 132 },
  'eu-origin':  { x1: 325, y1: 220, x2: 449, y2: 170 },
}

const DIR_MAP = {
  request: { fwd: FLOW.violet,  bwd: null       },
  both:    { fwd: FLOW.violet,  bwd: FLOW.emerald  },
  response:{ fwd: FLOW.emerald, bwd: null       },
}

// ── Edge connection ───────────────────────────────────────────────────────────

// ── Node block ────────────────────────────────────────────────────────────────

// ── Main component ────────────────────────────────────────────────────────────

const CACHE_WARM = { label: '● WARM', color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(52,211,153,0.4)' }
const CACHE_COLD = { label: '○ COLD', color: '#475569', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.08)' }

export default function CdnsDiagram() {
  const steps  = useMemo(() => buildCdnsSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  const { nodeState } = useDiagramNodes(steps, index)

  const { hitResult } = step

  return (
    <div className="space-y-4">

      <DiagramHeader title="CDN — Edge Cache Hit vs Miss">
        Watch content propagate from origin to edge nodes. Each user is served from the nearest cache — not the origin.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIR_MAP} />
        </>}
        footer={<>
          {/* Hit / miss banner */}
          <AnimatePresence mode="wait">
            {hitResult?.type === 'hit' && (
              <motion.div
                key="hit"
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/[0.07] px-4 py-2.5"
              >
                <span className="text-emerald-400 select-none">⚡</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Edge Cache HIT</p>
                  <p className="text-[11px] font-mono text-emerald-300">&lt; 20 ms · origin not contacted</p>
                </div>
              </motion.div>
            )}
            {hitResult?.type === 'miss' && (
              <motion.div
                key="miss"
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                className="mt-3 flex items-center gap-3 rounded-xl border border-rose-500/40 bg-rose-500/[0.07] px-4 py-2.5"
              >
                <span className="text-rose-400 select-none">✕</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Edge Cache MISS</p>
                  <p className="text-[11px] font-mono text-rose-300">fetching from origin · populating edge cache</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,  glow: FLOW.violet.glow,  label: 'request' },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'response / serve from edge' },
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
        {NODES.map((node) => {
          const isEdge = node.id === 'us-edge' || node.id === 'eu-edge'
          const isWarm = isEdge && step.edgeCache[node.id] === 'warm'
          return (
            <DiagramNode
              key={node.id}
              node={{ ...node, sub2: null }}
              {...nodeState(node.id)}
              tone={isWarm ? FLOW.emerald.hex : null}
            >
              {isEdge && <NodePill status={isWarm ? CACHE_WARM : CACHE_COLD} />}
            </DiagramNode>
          )
        })}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
