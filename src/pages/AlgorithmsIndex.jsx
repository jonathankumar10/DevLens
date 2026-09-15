import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ZoomControls from '../components/ui/ZoomControls'
import LeetCodeBadge from '../components/ui/LeetCodeBadge'
import { useZoomPan } from '../hooks/useZoomPan'
import { ALGORITHMS, CATEGORY_LABELS, DIFFICULTY_COLOR } from '../constants/algorithmRegistry'

// ── Labels ────────────────────────────────────────────────────────────────────

const SHORT_LABELS = {
  'arrays-hashing':      'Arrays & Hash',
  'two-pointers':        'Two Pointers',
  'stack':               'Stack',
  'binary-search':       'Binary Search',
  'sliding-window':      'Sliding Window',
  'linked-list':         'Linked List',
  'trees':               'Trees',
  'tries':               'Tries',
  'backtracking':        'Backtracking',
  'heap-priority-queue': 'Heap / PQ',
  'graphs':              'Graphs',
  'advanced-graphs':     'Adv. Graphs',
  '1d-dp':               '1-D DP',
  '2d-dp':               '2-D DP',
  'greedy':              'Greedy',
  'intervals':           'Intervals',
  'bit-manipulation':    'Bit Manip.',
  'math-geometry':       'Math & Geo',
}

// ── Node colors (by conceptual group) ────────────────────────────────────────

const NODE_COLOR = {
  'arrays-hashing':      '#3b82f6',
  'bit-manipulation':    '#3b82f6',
  'math-geometry':       '#3b82f6',
  'two-pointers':        '#06b6d4',
  'sliding-window':      '#06b6d4',
  'stack':               '#8b5cf6',
  'binary-search':       '#8b5cf6',
  'backtracking':        '#8b5cf6',
  'linked-list':         '#14b8a6',
  'trees':               '#10b981',
  'tries':               '#10b981',
  'graphs':              '#0ea5e9',
  'advanced-graphs':     '#0ea5e9',
  'heap-priority-queue': '#f59e0b',
  'greedy':              '#f59e0b',
  '1d-dp':               '#a78bfa',
  '2d-dp':               '#a78bfa',
  'intervals':           '#f97316',
}

// ── Graph definition ──────────────────────────────────────────────────────────
// x, y = center of node in the SVG viewBox (0 0 1040 470)

const NODES = {
  'arrays-hashing':      { x: 70,  y: 235 },
  'bit-manipulation':    { x: 250, y: 50  },
  'two-pointers':        { x: 250, y: 145 },
  'stack':               { x: 250, y: 240 },
  'binary-search':       { x: 250, y: 340 },
  'math-geometry':       { x: 250, y: 430 },
  'sliding-window':      { x: 430, y: 75  },
  'linked-list':         { x: 430, y: 195 },
  'backtracking':        { x: 430, y: 325 },
  'trees':               { x: 610, y: 145 },
  '1d-dp':               { x: 610, y: 370 },
  'tries':               { x: 790, y: 60  },
  'graphs':              { x: 790, y: 180 },
  'heap-priority-queue': { x: 790, y: 300 },
  '2d-dp':               { x: 790, y: 420 },
  'advanced-graphs':     { x: 970, y: 110 },
  'greedy':              { x: 970, y: 260 },
  'intervals':           { x: 970, y: 385 },
}

// Edges: [prerequisite, unlocks]
const EDGES = [
  ['arrays-hashing', 'bit-manipulation'],
  ['arrays-hashing', 'two-pointers'],
  ['arrays-hashing', 'stack'],
  ['arrays-hashing', 'binary-search'],
  ['arrays-hashing', 'math-geometry'],
  ['two-pointers',   'sliding-window'],
  ['two-pointers',   'linked-list'],
  ['stack',          'backtracking'],
  ['linked-list',    'trees'],
  ['backtracking',   '1d-dp'],
  ['trees',          'tries'],
  ['trees',          'graphs'],
  ['trees',          'heap-priority-queue'],
  ['1d-dp',          '2d-dp'],
  ['graphs',         'advanced-graphs'],
  ['heap-priority-queue', 'advanced-graphs'],
  ['heap-priority-queue', 'greedy'],
  ['greedy',         'intervals'],
  ['sliding-window', 'intervals'],    // cross-edge — the "web"
]

const NODE_W = 116
const NODE_H = 36

// Nodes with no incoming edge — entry points into the roadmap.
const ROOT_IDS = new Set(
  Object.keys(NODES).filter((id) => !EDGES.some(([, to]) => to === id))
)

// ── SVG sub-components ────────────────────────────────────────────────────────

// Right-angle "org chart" connector with rounded corners, NeetCode-roadmap style.
function elbowPath(x1, y1, x2, y2, r = 10) {
  if (y1 === y2) return `M ${x1},${y1} L ${x2},${y2}`
  const midX = (x1 + x2) / 2
  const vDir = y2 > y1 ? 1 : -1
  return [
    `M ${x1},${y1}`,
    `L ${midX - r},${y1}`,
    `Q ${midX},${y1} ${midX},${y1 + r * vDir}`,
    `L ${midX},${y2 - r * vDir}`,
    `Q ${midX},${y2} ${midX + r},${y2}`,
    `L ${x2},${y2}`,
  ].join(' ')
}

function EdgePath({ from, to, isActive, hasHover }) {
  const src = NODES[from]
  const tgt = NODES[to]
  const x1 = src.x + NODE_W / 2
  const y1 = src.y
  const x2 = tgt.x - NODE_W / 2
  const y2 = tgt.y
  const d = elbowPath(x1, y1, x2, y2)
  const color = isActive ? NODE_COLOR[from] : '#475569'

  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      animate={{
        strokeOpacity: isActive ? 0.95 : hasHover ? 0.12 : 0.4,
        strokeWidth:   isActive ? 2.2  : 1.4,
      }}
      transition={{ duration: 0.18, ease: 'easeInOut' }}
    />
  )
}

function NodeRect({ id, selected, hovered, hasProblems, count, onSelect, onHover }) {
  const { x, y } = NODES[id]
  const color = NODE_COLOR[id]
  const isSelected = selected === id
  const isHovered = hovered === id
  const isActive = isSelected || isHovered
  const isRoot = ROOT_IDS.has(id)

  return (
    <g
      transform={`translate(${x - NODE_W / 2}, ${y - NODE_H / 2})`}
      onClick={hasProblems ? () => onSelect(id) : undefined}
      onMouseEnter={hasProblems ? () => onHover(id) : undefined}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: hasProblems ? 'pointer' : 'default' }}
    >
      {isRoot && (
        <g transform={`translate(${NODE_W / 2}, -13)`}>
          <rect x="-22" y="-9" width="44" height="16" rx="8" fill={color} />
          <text
            x="0" y="0.5" dominantBaseline="middle" textAnchor="middle"
            fill="white" fontSize="8" fontWeight="800" letterSpacing="0.4"
          >
            START
          </text>
        </g>
      )}
      {isSelected && (
        <rect
          x="-3" y="-3" width={NODE_W + 6} height={NODE_H + 6} rx="11"
          fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.9"
        />
      )}
      {hasProblems ? (
        // Flat, solid-fill box — matches NeetCode roadmap's "unlocked" node style
        <rect
          width={NODE_W} height={NODE_H} rx="8"
          fill={color} fillOpacity={isActive ? 1 : 0.88}
          style={{ filter: isActive ? `drop-shadow(0 0 8px ${color}99)` : 'none' }}
        />
      ) : (
        // Dashed, grayed-out box — "on the roadmap" / not yet built
        <rect
          width={NODE_W} height={NODE_H} rx="8"
          fill="#1e293b" fillOpacity="0.5"
          stroke="#475569" strokeWidth="1.2" strokeDasharray="4 3"
        />
      )}
      <text
        x={NODE_W / 2} y={NODE_H / 2}
        dominantBaseline="middle" textAnchor="middle"
        fill={hasProblems ? '#f8fafc' : '#64748b'}
        fontSize="10.5" fontFamily="system-ui, 'Segoe UI', sans-serif"
        fontWeight={hasProblems ? '700' : '500'}
      >
        {SHORT_LABELS[id]}
      </text>
      {hasProblems && count > 0 && (
        <g transform={`translate(${NODE_W}, 0)`}>
          <circle r="8" fill="#0f172a" stroke={color} strokeWidth="1.5" />
          <text
            x="0" y="0" dominantBaseline="middle" textAnchor="middle"
            fill="white" fontSize="7.5" fontWeight="700"
          >
            {count}
          </text>
        </g>
      )}
    </g>
  )
}

function DependencyGraph({ selected, onSelect, problemCounts }) {
  const [hovered, setHovered] = useState(null)
  const { svgRef, zoom, pan, dragging, isPanning, viewBox, onMouseDown, onClickCapture, zoomIn, zoomOut, reset } = useZoomPan(1040, 470)

  const activeEdgeSet = useMemo(() => {
    const active = selected || hovered
    if (!active) return new Set()
    return new Set(
      EDGES.filter(([f, t]) => f === active || t === active).map(([f, t]) => `${f}→${t}`)
    )
  }, [selected, hovered])

  return (
    <div className="relative w-full overflow-x-auto rounded-2xl border border-white/10 bg-[#0b1220]">
      <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={reset} isZoomed={zoom !== 1} />
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full min-w-[640px]"
        style={{ display: 'block', cursor: dragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default' }}
        onMouseDown={onMouseDown}
        onClickCapture={onClickCapture}
      >
        {/* Edges — render before nodes so nodes sit on top */}
        {EDGES.map(([from, to]) => {
          const key = `${from}→${to}`
          return (
            <EdgePath
              key={key}
              from={from}
              to={to}
              isActive={activeEdgeSet.has(key)}
              hasHover={!!(selected || hovered)}
            />
          )
        })}

        {/* Nodes */}
        {Object.keys(NODES).map((id) => (
          <NodeRect
            key={id}
            id={id}
            selected={selected}
            hovered={hovered}
            hasProblems={(problemCounts[id] || 0) > 0}
            count={problemCounts[id] || 0}
            onSelect={(id) => onSelect(id)}
            onHover={setHovered}
          />
        ))}

        {/* Transparent overlay during drag — captures pointer events and enforces grabbing cursor */}
        {isPanning && <rect x={pan.x} y={pan.y} width={1040 / zoom} height={470 / zoom} fill="transparent" style={{ cursor: 'grabbing' }} />}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-5 pb-4 pt-1">
        {[
          { color: '#3b82f6', label: 'Sequences' },
          { color: '#06b6d4', label: 'Pointers' },
          { color: '#8b5cf6', label: 'Stack / Search' },
          { color: '#14b8a6', label: 'Linked List' },
          { color: '#10b981', label: 'Trees' },
          { color: '#0ea5e9', label: 'Graphs' },
          { color: '#f59e0b', label: 'Heap / Greedy' },
          { color: '#a78bfa', label: 'DP' },
          { color: '#f97316', label: 'Intervals' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[3px]" style={{ background: color }} />
            <span className="text-[10px] text-slate-500">{label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-[3px] border border-dashed border-slate-600 bg-slate-800/50" />
          <span className="text-[10px] text-slate-600">not yet built</span>
        </div>
      </div>
    </div>
  )
}

// ── Problems drawer ───────────────────────────────────────────────────────────

const rowVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
}
const rowVariant = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 28 } },
}

const VisualizerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
)

function ProblemsDrawer({ algorithms, label, isEmpty, onClose, onClearSearch }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-x-0 bottom-0 z-[40] bg-black/50"
        style={{ top: 'var(--navbar-h, 4rem)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="fixed right-0 bottom-0 z-[41] flex w-full sm:w-[600px] lg:w-[720px] flex-col border-l border-t border-white/10 bg-[#0b0f19] shadow-2xl"
        style={{ top: 'var(--navbar-h, 4rem)' }}
      >
        <div className="shrink-0 border-b border-white/10 px-6 py-5">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeftIcon />
            Back to graph
          </button>
          <div className="mt-4 text-center">
            <h2 className="text-xl font-bold text-white">{label}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {algorithms.length} problem{algorithms.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isEmpty ? (
            <div className="space-y-3 py-16 text-center">
              <p className="font-medium text-slate-400">No matching problems</p>
              <p className="text-sm text-slate-600">
                Try a different search or{' '}
                <button onClick={onClearSearch}
                  className="text-blue-400 underline underline-offset-2 transition-colors hover:text-blue-300">
                  clear
                </button>
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-2 text-left font-medium">Problem</th>
                  <th className="py-2 pr-2 text-left font-medium">Difficulty</th>
                  <th className="w-10 py-2 text-right font-medium">Visualizer</th>
                </tr>
              </thead>
              <motion.tbody variants={rowVariants} initial="hidden" animate="show">
                {algorithms.map((algo) => (
                  <motion.tr
                    key={algo.id}
                    variants={rowVariant}
                    className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200">{algo.title}</span>
                        <LeetCodeBadge url={algo.problemUrl} label={algo.problemLabel} />
                      </div>
                    </td>
                    <td className="py-3 pr-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${DIFFICULTY_COLOR[algo.difficulty]}`}>
                        {algo.difficulty}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={algo.path}
                        title="View interactive visualizer"
                        className="inline-flex text-slate-500 transition-colors hover:text-blue-400"
                      >
                        <VisualizerIcon />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          )}
        </div>
      </motion.div>
    </>,
    document.body
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AlgorithmsIndex() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [query, setQuery] = useState('')

  const problemCounts = useMemo(() => {
    const counts = {}
    ALGORITHMS.forEach((a) => { counts[a.category] = (counts[a.category] || 0) + 1 })
    return counts
  }, [])

  const shownAlgorithms = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q) {
      return ALGORITHMS.filter((a) =>
        a.title.toLowerCase().includes(q) ||
        a.pattern.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    if (selectedCategory) return ALGORITHMS.filter((a) => a.category === selectedCategory)
    return []
  }, [query, selectedCategory])

  const handleSelect = (id) => {
    setQuery('')
    setSelectedCategory((prev) => (prev === id ? null : id))
  }

  const handleSearch = (val) => {
    setQuery(val)
    if (val.trim()) setSelectedCategory(null)
  }

  const handleCloseDrawer = () => {
    setSelectedCategory(null)
    setQuery('')
  }

  const panelLabel = query.trim()
    ? `Results for "${query.trim()}"`
    : CATEGORY_LABELS[selectedCategory] ?? ''

  const drawerOpen = Boolean(selectedCategory) || query.trim().length > 0

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Algorithms</h1>
          <p className="mt-2 text-slate-400 max-w-2xl">
            {ALGORITHMS.length} interactive visualizers. Patterns connect to the patterns they unlock —
            click any node to see solved problems. Dimmed nodes are on the roadmap.
          </p>
        </div>
        <div className="relative w-full sm:w-72 shrink-0">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name, pattern or tag…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-500/60 transition-colors"
          />
          {query && (
            <button onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Dependency graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <DependencyGraph
          selected={selectedCategory}
          onSelect={handleSelect}
          problemCounts={problemCounts}
        />
      </motion.div>

      {/* Problems drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <ProblemsDrawer
            key="drawer"
            algorithms={shownAlgorithms}
            label={panelLabel}
            isEmpty={shownAlgorithms.length === 0}
            onClose={handleCloseDrawer}
            onClearSearch={() => handleSearch('')}
          />
        )}
      </AnimatePresence>

    </div>
  )
}
