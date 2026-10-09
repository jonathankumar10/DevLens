import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PATTERNS, PATTERN_COLORS } from '../constants/patternsRegistry'

const grid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}
const card = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
}

// ── Pattern SVGs ──────────────────────────────────────────────────────────────

function SvgArrays({ c }) {
  const xs = [4, 15, 26, 37, 48]
  return (
    <svg viewBox="0 0 60 60" width="44" height="44" fill="none">
      {xs.map((x) => (
        <rect key={x} x={x} y="22" width="10" height="10" rx="1.5"
          stroke={c} strokeWidth="1" fill={c} fillOpacity="0.08" />
      ))}
      <motion.rect y="22" width="10" height="10" rx="1.5" fill={c} fillOpacity="0.4"
        animate={{ x: xs }}
        transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.4,
          ease: 'easeInOut', times: [0, 0.25, 0.5, 0.75, 1] }} />
      <motion.line x2="10" y1="37" y2="37" stroke={c} strokeWidth="1.5" strokeLinecap="round"
        animate={{ x1: xs.map(x => x + 1), x2: xs.map(x => x + 9) }}
        transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.4,
          ease: 'easeInOut', times: [0, 0.25, 0.5, 0.75, 1] }} />
    </svg>
  )
}

function SvgHashMap({ c }) {
  return (
    <svg viewBox="0 0 60 60" width="44" height="44" fill="none">
      {/* Key box */}
      <rect x="2" y="20" width="14" height="20" rx="2" stroke={c} strokeWidth="1" fill={c} fillOpacity="0.1" />
      <line x1="6" y1="27" x2="12" y2="27" stroke={c} strokeWidth="1" opacity="0.5" />
      <line x1="6" y1="31" x2="12" y2="31" stroke={c} strokeWidth="1" opacity="0.5" />
      <line x1="6" y1="35" x2="10" y2="35" stroke={c} strokeWidth="1" opacity="0.5" />
      {/* Hash fn box */}
      <rect x="21" y="20" width="16" height="20" rx="2" stroke={c} strokeWidth="1" fill={c} fillOpacity="0.08" />
      <line x1="25" y1="27" x2="33" y2="27" stroke={c} strokeWidth="1" opacity="0.35" />
      <line x1="29" y1="23" x2="29" y2="37" stroke={c} strokeWidth="1" opacity="0.35" />
      {/* Buckets */}
      {[14, 24, 34].map((y, i) => (
        <motion.rect key={y} x="42" y={y} width="16" height="8" rx="1.5"
          stroke={c} strokeWidth="1" fill={c}
          animate={{ fillOpacity: i === 1 ? [0.05, 0.35, 0.05] : [0.05, 0.05, 0.05] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i === 1 ? 1.4 : 0 }} />
      ))}
      {/* Traveling dot */}
      <motion.circle r="3" fill={c}
        animate={{
          cx: [9, 9, 29, 29, 50, 50, 9],
          cy: [30, 30, 30, 30, 22, 22, 30],
          opacity: [0, 1, 1, 1, 1, 0, 0],
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut',
          times: [0, 0.05, 0.35, 0.5, 0.75, 0.9, 1] }} />
    </svg>
  )
}

function SvgStack({ c }) {
  return (
    <svg viewBox="0 0 60 60" width="44" height="44" fill="none">
      {/* Base floor */}
      <line x1="12" y1="52" x2="48" y2="52" stroke={c} strokeWidth="1.2" opacity="0.4" />
      {/* Static items */}
      <rect x="14" y="40" width="32" height="10" rx="1.5" stroke={c} strokeWidth="1" fill={c} fillOpacity="0.12" />
      <rect x="14" y="28" width="32" height="10" rx="1.5" stroke={c} strokeWidth="1" fill={c} fillOpacity="0.18" />
      {/* Animated push/pop item */}
      <motion.rect x="14" width="32" height="10" rx="1.5" stroke={c} strokeWidth="1.3" fill={c}
        animate={{
          y:           [6,  16, 16, 6],
          fillOpacity: [0, 0.4, 0.4, 0],
          opacity:     [0,  1,  1,  0],
        }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut',
          times: [0, 0.3, 0.7, 1] }} />
    </svg>
  )
}

function SvgBinarySearch({ c }) {
  const allXs = [4, 12, 20, 28, 36, 44, 52]
  return (
    <svg viewBox="0 0 64 60" width="48" height="44" fill="none">
      {allXs.map((x) => (
        <rect key={x} x={x} y="22" width="7" height="7" rx="1"
          stroke={c} strokeWidth="0.8" fill={c} fillOpacity="0.07" />
      ))}
      {/* Mid highlight */}
      <motion.rect y="22" width="7" height="7" rx="1" fill={c}
        animate={{ x: [28, 28, 20, 20], fillOpacity: [0.5, 0.5, 0.5, 0.5] }}
        transition={{ duration: 2.6, repeat: Infinity, times: [0, 0.4, 0.7, 1] }} />
      {/* Left boundary */}
      <motion.line y1="34" y2="38" stroke={c} strokeWidth="1.5" strokeLinecap="round"
        animate={{ x1: [4, 4, 20, 20], x2: [4, 4, 20, 20] }}
        transition={{ duration: 2.6, repeat: Infinity, times: [0, 0.4, 0.7, 1] }} />
      {/* Right boundary */}
      <motion.line y1="34" y2="38" stroke={c} strokeWidth="1.5" strokeLinecap="round"
        animate={{ x1: [58, 58, 58, 36], x2: [58, 58, 58, 36] }}
        transition={{ duration: 2.6, repeat: Infinity, times: [0, 0.4, 0.7, 1] }} />
      {/* L label bar */}
      <motion.rect y="33" width="2" height="6" rx="1" fill={c} opacity="0.6"
        animate={{ x: [3, 3, 19, 19] }}
        transition={{ duration: 2.6, repeat: Infinity, times: [0, 0.4, 0.7, 1] }} />
      {/* R label bar */}
      <motion.rect y="33" width="2" height="6" rx="1" fill={c} opacity="0.6"
        animate={{ x: [57, 57, 57, 35] }}
        transition={{ duration: 2.6, repeat: Infinity, times: [0, 0.4, 0.7, 1] }} />
    </svg>
  )
}

function SvgLinkedList({ c }) {
  const nodes = [[10, 30], [30, 30], [50, 30]]
  return (
    <svg viewBox="0 0 60 60" width="44" height="44" fill="none">
      {/* Arrows */}
      {nodes.slice(0, -1).map(([x], i) => (
        <g key={i}>
          <line x1={x + 7} y1="30" x2={nodes[i + 1][0] - 7} y2="30"
            stroke={c} strokeWidth="1" opacity="0.4" />
          <polygon
            points={`${nodes[i+1][0]-7},27 ${nodes[i+1][0]-7},33 ${nodes[i+1][0]-3},30`}
            fill={c} opacity="0.4" />
        </g>
      ))}
      {/* Node circles */}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="6" stroke={c} strokeWidth="1.2" fill={c} fillOpacity="0.1" />
      ))}
      {/* Null pointer */}
      <line x1="57" y1="27" x2="57" y2="33" stroke={c} strokeWidth="1.5" opacity="0.4" />
      {/* Traversal dot */}
      <motion.circle r="4" cy="30" fill={c}
        animate={{ cx: [10, 10, 30, 30, 50, 50, 10], opacity: [0, 1, 1, 1, 1, 0, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut',
          times: [0, 0.05, 0.35, 0.4, 0.7, 0.85, 1] }} />
    </svg>
  )
}

function SvgTrees({ c }) {
  const nodes = [
    [30, 8],          // root
    [16, 24], [44, 24],  // level 1
    [8, 40], [24, 40], [36, 40], [52, 40], // level 2
  ]
  const edges = [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]]
  const pulseDelays = [0, 0.5, 0.5, 1.0, 1.0, 1.0, 1.0]
  return (
    <svg viewBox="0 0 60 52" width="46" height="40" fill="none">
      {edges.map(([a, b], i) => (
        <line key={i}
          x1={nodes[a][0]} y1={nodes[a][1]}
          x2={nodes[b][0]} y2={nodes[b][1]}
          stroke={c} strokeWidth="1" opacity="0.3" />
      ))}
      {nodes.map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r="5" stroke={c} strokeWidth="1.2" fill={c}
          animate={{ fillOpacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: pulseDelays[i] }} />
      ))}
    </svg>
  )
}

function SvgGraphsBfs({ c }) {
  const nodes = [[30, 28], [12, 14], [48, 14], [8, 40], [30, 50], [52, 40]]
  const edges = [[0,1],[0,2],[0,3],[0,4],[1,2],[3,4],[4,5],[2,5]]
  const bfsLevels = [0, 1, 1, 1, 1, 2]
  return (
    <svg viewBox="0 0 60 60" width="44" height="44" fill="none">
      {edges.map(([a, b], i) => (
        <line key={i}
          x1={nodes[a][0]} y1={nodes[a][1]}
          x2={nodes[b][0]} y2={nodes[b][1]}
          stroke={c} strokeWidth="0.8" opacity="0.25" />
      ))}
      {nodes.map(([x, y], i) => (
        <motion.g key={i} style={{ transformOrigin: `${x}px ${y}px` }}>
          <motion.circle cx={x} cy={y} r="5.5" stroke={c} strokeWidth="1.2" fill={c}
            animate={{ fillOpacity: [0.05, 0.5, 0.05], scale: [1, 1.25, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: bfsLevels[i] * 0.55 }} />
          {/* Ripple ring */}
          <motion.circle cx={x} cy={y} r="5.5" stroke={c} strokeWidth="0.8" fill="none"
            animate={{ r: [5.5, 11, 5.5], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: bfsLevels[i] * 0.55 }} />
        </motion.g>
      ))}
    </svg>
  )
}

function SvgTwoPointers({ c }) {
  const xs = [4, 15, 26, 37, 48]
  return (
    <svg viewBox="0 0 60 60" width="44" height="44" fill="none">
      {xs.map((x) => (
        <rect key={x} x={x} y="22" width="10" height="10" rx="1.5"
          stroke={c} strokeWidth="1" fill={c} fillOpacity="0.08" />
      ))}
      {/* Left pointer, closing inward */}
      <motion.rect y="22" width="10" height="10" rx="1.5" fill={c}
        animate={{ x: [4, 4, 15, 15, 26], fillOpacity: [0.4, 0.4, 0.4, 0.4, 0.4] }}
        transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.2, 0.45, 0.65, 1] }} />
      {/* Right pointer, closing inward */}
      <motion.rect y="22" width="10" height="10" rx="1.5" fill={c}
        animate={{ x: [48, 48, 37, 37, 26], fillOpacity: [0.4, 0.4, 0.4, 0.4, 0.4] }}
        transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.2, 0.45, 0.65, 1] }} />
      {/* L / R labels */}
      <motion.text y="18" fontSize="7" fontWeight="bold" fill={c}
        animate={{ x: [5, 5, 16, 16, 27] }}
        transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.2, 0.45, 0.65, 1] }}>L</motion.text>
      <motion.text y="18" fontSize="7" fontWeight="bold" fill={c}
        animate={{ x: [49, 49, 38, 38, 27] }}
        transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.2, 0.45, 0.65, 1] }}>R</motion.text>
    </svg>
  )
}

const PATTERN_SVG = {
  'arrays':        SvgArrays,
  'hash-map':      SvgHashMap,
  'two-pointers':  SvgTwoPointers,
  'stack':         SvgStack,
  'binary-search': SvgBinarySearch,
  'linked-list':   SvgLinkedList,
  'trees':         SvgTrees,
  'graphs-bfs':    SvgGraphsBfs,
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PatternsIndex() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Patterns</h1>
        <p className="mt-2 text-slate-400 max-w-2xl">
          The building blocks behind every interview problem — each with a live interactive illustration, full explanation, and linked problems.
          Recognizing which pattern applies before you write a single line is what separates a clean solution from a scramble.
          Master these {PATTERNS.length} patterns and most interview problems will start to look familiar.
        </p>
      </div>

      <motion.div
        variants={grid}
        initial="hidden"
        animate="show"
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {PATTERNS.map((p, i) => {
          const c = PATTERN_COLORS[p.color]
          const SvgComp = PATTERN_SVG[p.id]
          return (
            <motion.div key={p.id} variants={card} className="glow-card rounded-2xl">
              <Link
                to={`/patterns/${p.id}`}
                className="group block rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200 overflow-hidden"
              >
                <div className={`h-1 w-full ${c.dot}`} />

                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-block rounded border border-white/10 bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-mono font-medium text-slate-400">
                          #{i + 1}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${c.badgeBg} ${c.badgeBorder} ${c.text}`}>
                          {p.algorithms.length} problem{p.algorithms.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-white">{p.title}</h2>
                      <p className={`text-xs font-medium ${c.text}`}>{p.tagline}</p>
                    </div>

                    {SvgComp && (
                      <div className={`shrink-0 flex items-center justify-center w-14 h-14 rounded-xl border ${c.badgeBorder} ${c.badgeBg}`}>
                        <SvgComp c={c.glow} />
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {p.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {p.algorithms.slice(0, 4).map((a) => (
                      <span key={a.id} className="rounded-md bg-white/5 border border-white/8 px-2 py-0.5 text-[10px] text-slate-500">
                        {a.title}
                      </span>
                    ))}
                    {p.algorithms.length > 4 && (
                      <span className="rounded-md bg-white/5 border border-white/8 px-2 py-0.5 text-[10px] text-slate-600">
                        +{p.algorithms.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className={`flex items-center gap-1.5 text-xs font-medium ${c.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    Explore pattern
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
