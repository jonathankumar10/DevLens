import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildSocialMediaFeedSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

// ── Layout ─────────────────────────────────────────────────────────────────────
// user (left) → feedservice (center-left, read path)
// user (left) → fanout (center, write path)
// feedservice ↔ feedcache (center-right)
// feedservice ↔ postsdb (right-top)
// fanout ↔ followgraph (right-bottom)
// fanout → feedcache (write into follower feeds)

const CW = 740
const CH = 360

const NODES = [
  {
    id: 'user', label: 'User', icon: '👤', dir: 'left',
    cx: 60, cy: 188, w: 96, h: 78,
    color: '#94a3b8', glow: 'rgba(148,163,184,0.65)', lc: '#cbd5e1', strip: 'bg-slate-400',
    sub1: 'read + write', sub2: 'follower',
    desc: 'Both a content producer (posts) and consumer (reads feed). Both paths go through this single entry point.',
    note: '"Read your own writes" must be guaranteed — the author must see their own post immediately on their own profile.',
  },
  {
    id: 'feedservice', label: 'Feed Service', icon: '📰', dir: 'top',
    cx: 212, cy: 118, w: 116, h: 80,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'read path', sub2: 'hydrate + rank',
    desc: 'Handles feed reads: fetches post IDs from Redis ZSET, hydrates content from Posts DB, returns ranked paginated feed.',
    note: 'Cursor-based pagination — uses the score of the last-seen item, not an offset. Offsets break when new posts are inserted.',
  },
  {
    id: 'fanout', label: 'Fan-out Service', icon: '📡', dir: 'bottom',
    cx: 212, cy: 276, w: 116, h: 80,
    color: '#ec4899', glow: 'rgba(236,72,153,0.65)', lc: '#f9a8d4', strip: 'bg-pink-500',
    sub1: 'write path', sub2: 'push to follower feeds',
    desc: 'Receives post events asynchronously and writes the post ID into each follower\'s feed cache in Redis.',
    note: 'Skips celebrities (> 1M followers) — their followers use fan-out on read instead, merging at load time to avoid 10M writes per tweet.',
  },
  {
    id: 'feedcache', label: 'Feed Cache', icon: '⚡', dir: 'top',
    cx: 420, cy: 188, w: 116, h: 80,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'Redis ZSET', sub2: 'feed:{userId}',
    desc: 'Each user\'s feed is a Redis sorted set of post IDs scored by rank. ZADD inserts; ZRANGE pages. TTL evicts old posts.',
    note: 'Stores only post IDs, not content — the feed cache never needs to be updated when a post is edited or deleted.',
  },
  {
    id: 'postsdb', label: 'Posts DB', icon: '🗄️', dir: 'right',
    cx: 612, cy: 112, w: 112, h: 78,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: 'content store', sub2: 'batched reads',
    desc: 'Stores post content: text, media URLs, author ID, timestamp, engagement counts. Only hit on cache miss or hydration.',
    note: 'View counts use Redis INCR with batch flush to DB — avoids hot-row contention from millions of concurrent increments on viral posts.',
  },
  {
    id: 'followgraph', label: 'Follow Graph', icon: '🔗', dir: 'right',
    cx: 612, cy: 278, w: 112, h: 78,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'adjacency list', sub2: 'follower lookup',
    desc: 'Stores the follower/following relationships. Fan-out service queries this to get the full follower list for a user.',
    note: 'Graph stored as adjacency lists in Redis sets (O(1) member checks) or a graph DB for complex traversals like mutual-follow suggestions.',
  },
]

const EDGES = {
  'user-feedservice':      { x1: 108, y1: 160, x2: 154, y2: 138 },
  'user-fanout':           { x1: 108, y1: 214, x2: 154, y2: 256 },
  'feedservice-feedcache': { x1: 270, y1: 128, x2: 362, y2: 168 },
  'feedservice-postsdb':   { x1: 270, y1: 112, x2: 556, y2: 112 },
  'fanout-feedcache':      { x1: 270, y1: 262, x2: 362, y2: 210 },
  'fanout-followgraph':    { x1: 270, y1: 278, x2: 556, y2: 278 },
}

// ── Edge connection (SVG particles) ──────────────────────────────────────────

// ── Node block ────────────────────────────────────────────────────────────────

// ── Celebrity banner ──────────────────────────────────────────────────────────

function CelebrityBanner({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="relative mt-3 flex items-center gap-3 rounded-xl border border-pink-500/40 bg-pink-500/[0.07] px-4 py-3 overflow-hidden"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`cel-${i}`}
              className="absolute inset-0 rounded-xl border border-pink-400/18 pointer-events-none"
              initial={{ scale: 0.95, opacity: 0.65 }}
              animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
              transition={{ duration: 1.1, delay: i * 0.2, ease: 'easeOut' }}
            />
          ))}
          <span className="text-xl relative z-10 select-none">⭐</span>
          <div className="relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-pink-400">Hybrid Model Active</p>
            <p className="text-sm text-white">Regular users: fan-out on write. Celebrities (&gt; 1M followers): fan-out on read at load time.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SocialMediaFeedDiagram() {
  const steps  = useMemo(() => buildSocialMediaFeedSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  const { nodeState } = useDiagramNodes(steps, index)

  const showCelebBanner = step.type === 'celebrity-problem'

  return (
    <div className="space-y-4">

      <DiagramHeader title="Social Media Feed — Fan-out Architecture">
        Trace the write path (post → fan-out → feed cache) and read path (feed load → hydrate), then see how the hybrid model handles celebrity accounts.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} />

          {/* Lane labels */}
          <text x={130} y={58} style={{ fill: '#8b5cf6', fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 600, opacity: 0.55 }}>
            READ PATH
          </text>
          <text x={130} y={330} style={{ fill: '#ec4899', fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 600, opacity: 0.55 }}>
            WRITE PATH (fan-out)
          </text>
        </>}
        footer={<>
          <CelebrityBanner visible={showCelebBanner} />

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,  glow: FLOW.violet.glow,  label: 'read / request'  },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'response / data' },
              { color: FLOW.pink.hex,    glow: FLOW.pink.glow,    label: 'fan-out write'   },
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
