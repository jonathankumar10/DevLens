import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildCachingSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

// ── Layout ────────────────────────────────────────────────────────────────────
// Server (left) branches upward to Cache and downward to DB.
// Two paths visualised simultaneously: fast (server↔cache) and slow (server↔db).

const CW = 580
const CH = 270

const NODES = [
  {
    id: 'server', label: 'App Server', icon: '🖥️', dir: 'left',
    cx: 90,  cy: 135, w: 110, h: 82,
    color: '#3b82f6', glow: 'rgba(59,130,246,0.65)', lc: '#93c5fd', strip: 'bg-blue-500',
    sub1: 'queries cache first', sub2: 'falls back to DB',
    desc: 'The application server. It always checks the cache before going to the database.',
    note: 'On a miss it queries the DB, then populates the cache so the next request is a hit.',
  },
  {
    id: 'cache', label: 'Cache', icon: '⚡', dir: 'top',
    cx: 345, cy: 70,  w: 120, h: 80,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: '< 1 ms', sub2: 'Redis / Memcached',
    desc: 'In-memory key-value store. Returns data in microseconds — no disk I/O, no SQL parsing.',
    note: 'Hit rate is the key metric. 99% hit rate = 100× less DB load.',
  },
  {
    id: 'db', label: 'Database', icon: '🗄️', dir: 'top',
    cx: 345, cy: 215, w: 120, h: 80,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: '1–10 ms', sub2: 'persistent',
    desc: 'The source of truth. Every write lands here; reads happen only on cache misses.',
    note: 'At 99% cache hit rate the DB sees 1% of read traffic — the cache is the real workhorse.',
  },
]

const EDGES = {
  'server-cache': { x1: 145, y1: 118, x2: 285, y2: 82 },
  'server-db':    { x1: 145, y1: 152, x2: 285, y2: 200 },
}

// direction → { fwd, bwd }  (null = no particles in that direction)
const DIR_MAP = {
  both:     { fwd: FLOW.blue,    bwd: FLOW.emerald },
  miss:     { fwd: FLOW.blue,    bwd: FLOW.red     },
  write:    { fwd: FLOW.amber,   bwd: null       },
  response: { fwd: FLOW.emerald, bwd: null       },
}

// ── Edge connection ───────────────────────────────────────────────────────────

// ── Node block ────────────────────────────────────────────────────────────────

// ── Path labels ───────────────────────────────────────────────────────────────

function PathLabel({ x, y, label, color }) {
  return (
    <text x={x} y={y} className="select-none"
      style={{ fill: color, fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 600, opacity: 0.65 }}>
      {label}
    </text>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const CACHE_BADGES = {
  expired:  { text: 'EXPIRED',  color: FLOW.amber.hex },
  evicting: { text: 'EVICTING', color: FLOW.amber.hex },
}

export default function CachingDiagram() {
  const steps  = useMemo(() => buildCachingSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  const { nodeState } = useDiagramNodes(steps, index)

  return (
    <div className="space-y-4">

      <DiagramHeader title="Caching — Hit vs Miss">
        Step through the cache hit, miss, and populate cycle. See why hit rate is the number that matters.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIR_MAP} />
          <PathLabel x={200} y={68}  label="FAST PATH  ~1 ms"  color={FLOW.emerald.hex} />
          <PathLabel x={200} y={222} label="SLOW PATH  ~10 ms" color={FLOW.amber.hex}   />
        </>}
        footer={<>
          {/* Hit / miss result badge */}
          <AnimatePresence mode="wait">
            {step.hitResult === 'hit' && (
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
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Cache HIT</p>
                  <p className="text-[11px] font-mono text-emerald-300">~1 ms response · database not touched</p>
                </div>
              </motion.div>
            )}
            {step.hitResult === 'miss' && (
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
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Cache MISS</p>
                  <p className="text-[11px] font-mono text-rose-300">~10 ms · falls back to database</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.blue.hex,    glow: FLOW.blue.glow,    label: 'request (check cache / DB)' },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'response (hit / DB result)'  },
              { color: FLOW.red.hex,     glow: FLOW.red.glow,     label: 'cache miss'                  },
              { color: FLOW.amber.hex,   glow: FLOW.amber.glow,   label: 'write / populate'             },
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
            tone={node.id === 'cache' && CACHE_BADGES[step.cacheState] ? FLOW.amber.hex : null}
            badge={node.id === 'cache' ? CACHE_BADGES[step.cacheState] ?? null : null}
          />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
