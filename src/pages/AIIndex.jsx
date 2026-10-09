import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ZoomControls from '../components/ui/ZoomControls'
import { useZoomPan } from '../hooks/useZoomPan'
import { AI_ITEMS } from '../constants/aiRegistry'
import { NAV_SECTIONS } from '../constants/sections'
import Breadcrumb from '../components/layout/Breadcrumb'

// ── Graph constants ───────────────────────────────────────────────────────────

const NODE_W = 110
const NODE_H = 28

const NODE_COLOR = {
  'ai-history':               '#f59e0b',
  'neural-networks':          '#3b82f6',
  'training-and-loss':        '#3b82f6',
  'transformer-architecture': '#8b5cf6',
  'attention-mechanism':      '#8b5cf6',
  'tokenization':             '#8b5cf6',
  'context-windows':          '#8b5cf6',
  'llm-inference':            '#8b5cf6',
  'multimodal-models':        '#8b5cf6',
  'prompt-engineering':       '#14b8a6',
  'rag':                      '#14b8a6',
  'embeddings':               '#14b8a6',
  'function-calling':         '#14b8a6',
  'fine-tuning':              '#14b8a6',
  'guardrails':               '#14b8a6',
  'ai-agents':                '#0ea5e9',
  'multi-agent-systems':      '#0ea5e9',
  'ai-engineer':              '#10b981',
  'llm-evaluation':           '#10b981',
  'ai-observability':         '#10b981',
}

const SHORT_LABELS = {
  'ai-history':               'AI History',
  'neural-networks':          'Neural Nets',
  'training-and-loss':        'Training',
  'transformer-architecture': 'Transformer',
  'attention-mechanism':      'Attention',
  'tokenization':             'Tokenization',
  'context-windows':          'Context Window',
  'llm-inference':            'LLM Inference',
  'multimodal-models':        'Multimodal',
  'prompt-engineering':       'Prompting',
  'rag':                      'RAG',
  'embeddings':               'Embeddings',
  'function-calling':         'Tool Use',
  'fine-tuning':              'Fine-Tuning',
  'guardrails':               'Guardrails',
  'ai-agents':                'Agents',
  'multi-agent-systems':      'Multi-Agent',
  'ai-engineer':              'AI Engineer',
  'llm-evaluation':           'Evaluation',
  'ai-observability':         'Observability',
}

// cx/cy = center of each node box. Tiers are by dependency depth (longest
// path from a root) so a node sits right after its prerequisites, then
// ordered within a tier (barycenter sweep) so connected/same-category nodes
// land close together vertically.
const NODES = [
  // Tier 0 — History
  { id: 'ai-history',               cx: 65,   cy: 220 },
  // Tier 1 — Core ML
  { id: 'training-and-loss',        cx: 215,  cy: 178 },
  { id: 'neural-networks',          cx: 215,  cy: 263 },
  // Tier 2 — Transformer / early fine-tuning
  { id: 'fine-tuning',              cx: 365,  cy: 178 },
  { id: 'transformer-architecture', cx: 365,  cy: 263 },
  // Tier 3 — LLM Internals
  { id: 'attention-mechanism',      cx: 515,  cy: 50  },
  { id: 'context-windows',          cx: 515,  cy: 135 },
  { id: 'llm-inference',            cx: 515,  cy: 220 },
  { id: 'tokenization',             cx: 515,  cy: 305 },
  { id: 'embeddings',               cx: 515,  cy: 390 },
  // Tier 4 — Outputs + Workflows
  { id: 'multimodal-models',        cx: 665,  cy: 135 },
  { id: 'prompt-engineering',       cx: 665,  cy: 220 },
  { id: 'rag',                      cx: 665,  cy: 305 },
  // Tier 5 — Applied Workflows
  { id: 'function-calling',         cx: 815,  cy: 178 },
  { id: 'guardrails',               cx: 815,  cy: 263 },
  // Tier 6 — Agents
  { id: 'ai-agents',                cx: 965,  cy: 220 },
  // Tier 7 — Multi-agent
  { id: 'multi-agent-systems',      cx: 1115, cy: 220 },
  // Tier 8 — Production
  { id: 'ai-engineer',              cx: 1265, cy: 220 },
  // Tier 9 — Evaluation
  { id: 'llm-evaluation',           cx: 1415, cy: 220 },
  // Tier 10 — Observability
  { id: 'ai-observability',         cx: 1565, cy: 220 },
]

const EDGES = [
  ['ai-history',               'neural-networks'],
  ['ai-history',               'training-and-loss'],
  ['neural-networks',          'transformer-architecture'],
  ['training-and-loss',        'transformer-architecture'],
  ['training-and-loss',        'fine-tuning'],
  ['transformer-architecture', 'attention-mechanism'],
  ['transformer-architecture', 'tokenization'],
  ['transformer-architecture', 'context-windows'],
  ['transformer-architecture', 'llm-inference'],
  ['transformer-architecture', 'embeddings'],
  ['attention-mechanism',      'multimodal-models'],
  ['context-windows',          'multimodal-models'],
  ['tokenization',             'prompt-engineering'],
  ['context-windows',          'prompt-engineering'],
  ['llm-inference',            'prompt-engineering'],
  ['embeddings',               'rag'],
  ['prompt-engineering',       'function-calling'],
  ['prompt-engineering',       'guardrails'],
  ['rag',                      'guardrails'],
  ['rag',                      'ai-agents'],
  ['function-calling',         'ai-agents'],
  ['ai-agents',                'multi-agent-systems'],
  ['ai-agents',                'ai-engineer'],
  ['multi-agent-systems',      'ai-engineer'],
  ['ai-engineer',              'llm-evaluation'],
  ['fine-tuning',              'llm-evaluation'],
  ['ai-engineer',              'ai-observability'],
  ['llm-evaluation',           'ai-observability'],
]

const LIVE_CODING_HEX = '#6366f1'

// ── Graph sub-components ──────────────────────────────────────────────────────

const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]))

function EdgePath({ from, to, isActive, hasHover }) {
  const color = NODE_COLOR[from]
  const f = nodeMap[from]
  const t = nodeMap[to]
  const x1 = f.cx + NODE_W / 2
  const y1 = f.cy
  const x2 = t.cx - NODE_W / 2
  const y2 = t.cy
  const mx = (x1 + x2) / 2
  const d = `M ${x1},${y1} C ${mx},${y1} ${mx},${y2} ${x2},${y2}`
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeDasharray={isActive ? '6 3' : '0'}
      animate={{
        strokeOpacity:    isActive ? 0.88 : hasHover ? 0.07 : 0.18,
        strokeWidth:      isActive ? 1.6  : 0.8,
        strokeDashoffset: isActive ? [0, -18] : [0],
      }}
      transition={{
        strokeOpacity:    { duration: 0.18, ease: 'easeInOut' },
        strokeWidth:      { duration: 0.18, ease: 'easeInOut' },
        strokeDashoffset: isActive
          ? { duration: 0.55, repeat: Infinity, ease: 'linear' }
          : { duration: 0 },
      }}
    />
  )
}

function NodeRect({ id, hovered, onHover }) {
  const navigate = useNavigate()
  const { cx, cy } = nodeMap[id]
  const color = NODE_COLOR[id]
  const isHov = hovered === id
  return (
    <g
      onClick={() => navigate(`/ai/${id}`)}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: 'pointer' }}
    >
      <motion.rect
        x={cx - NODE_W / 2} y={cy - NODE_H / 2}
        width={NODE_W} height={NODE_H}
        rx={6}
        fill={color}
        stroke={color}
        animate={{
          fillOpacity:   isHov ? 0.22 : 0.08,
          strokeOpacity: isHov ? 0.9  : 0.35,
          strokeWidth:   isHov ? 1.4  : 0.8,
        }}
        transition={{ duration: 0.15 }}
      />
      <text
        x={cx} y={cy + 4}
        textAnchor="middle"
        fill={color}
        fontSize="10"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
        style={{ pointerEvents: 'none', userSelect: 'none', opacity: isHov ? 1 : 0.75 }}
      >
        {SHORT_LABELS[id]}
      </text>
    </g>
  )
}

function DependencyGraph() {
  const [hovered, setHovered] = useState(null)
  const { svgRef, zoom, pan, dragging, isPanning, viewBox, onMouseDown, onClickCapture, zoomIn, zoomOut, reset } = useZoomPan(1645, 440)

  const activeEdgeSet = useMemo(() => {
    if (!hovered) return new Set()
    const s = new Set()
    EDGES.forEach(([from, to]) => {
      if (from === hovered || to === hovered) s.add(`${from}→${to}`)
    })
    return s
  }, [hovered])

  return (
    <div className="relative w-full overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-6">
      <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={reset} isZoomed={zoom !== 1} />
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full"
        style={{ minWidth: 640, maxHeight: 380, cursor: dragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default' }}
        onMouseDown={onMouseDown}
        onClickCapture={onClickCapture}
      >
        <g>
          {EDGES.map(([from, to]) => {
            const key = `${from}→${to}`
            return (
              <EdgePath
                key={key}
                from={from}
                to={to}
                isActive={activeEdgeSet.has(key)}
                hasHover={!!hovered}
              />
            )
          })}
        </g>
        <g>
          {NODES.map(({ id }) => (
            <NodeRect key={id} id={id} hovered={hovered} onHover={setHovered} />
          ))}
        </g>
        {isPanning && <rect x={pan.x} y={pan.y} width={1645 / zoom} height={440 / zoom} fill="transparent" style={{ cursor: 'grabbing' }} />}
      </svg>
    </div>
  )
}

// ── Live coding tier ──────────────────────────────────────────────────────────

function SvgLiveCoding({ c }) {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
      <rect x="3" y="6" width="34" height="28" rx="2" stroke={c} strokeWidth="1" fill={c} fillOpacity="0.05" />
      <rect x="3" y="6" width="34" height="6" rx="2" fill={c} fillOpacity="0.12" />
      {[7, 8.5, 10].map((x, i) => (
        <circle key={i} cx={x} cy="9" r="1.2" fill={c} opacity={0.7 - i * 0.15} />
      ))}
      <motion.polyline points="7,20 11,17 15,22 19,16 23,19 27,15"
        fill="none" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
        animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.8, repeat: Infinity }} />
      <motion.rect x="27" y="16" width="1.2" height="6" rx="0.5" fill={c}
        animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.7, repeat: Infinity }} />
      <line x1="7" y1="27" x2="22" y2="27" stroke={c} strokeWidth="0.8" opacity="0.3" />
    </svg>
  )
}

function LiveCodingNode({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.04, type: 'spring', stiffness: 260, damping: 22 }}
      whileHover={{ y: -4 }}
    >
      <Link
        to={`/ai/${item.id}`}
        className="group flex items-center gap-3 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.06] hover:bg-indigo-500/[0.11] hover:border-indigo-500/45 p-3.5 transition-colors h-full"
      >
        <div className="w-10 h-10 rounded-xl border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center shrink-0">
          <SvgLiveCoding c={LIVE_CODING_HEX} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white leading-snug group-hover:text-indigo-200 transition-colors line-clamp-1">
            {item.title}
          </p>
          {item.tagline && (
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-1">{item.tagline}</p>
          )}
          {item.duration && (
            <span className="inline-block mt-1 text-[10px] rounded-full px-2 py-0.5 font-medium bg-indigo-500/15 text-indigo-300">
              {item.duration}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

function LiveCodingTier({ items }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-indigo-500/30 px-5 py-5 sm:px-6 sm:py-6"
      style={{ background: `${LIVE_CODING_HEX}08` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-400">Live Coding</h2>
        <div className="flex-1 h-px bg-indigo-500/20" />
        <span className="text-[10px] rounded-full px-2 py-0.5 font-medium bg-indigo-500/15 text-indigo-300">
          {items.length} challenges
        </span>
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed mb-5 max-w-lg">
        Put it all together in timed AI engineering challenges — build real AI-powered features from scratch under interview conditions.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <LiveCodingNode key={item.id} item={item} index={i} />
        ))}
      </div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AIIndex() {
  const liveCodingItems = useMemo(
    () => AI_ITEMS.filter((item) => item.category === 'live-coding'),
    []
  )

  return (
    <div className="space-y-6">
      <Breadcrumb trail={[
        { label: 'Home', to: '/' },
        { label: NAV_SECTIONS.ai.label },
      ]} />

      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Artificial Intelligence</h1>
        <p className="mt-2 text-slate-400 max-w-2xl">
          A dependency graph of AI concepts — from foundational ideas to production systems.
          Hover a node to trace its prerequisites and dependents. Click to dive in.
        </p>
      </div>

      <DependencyGraph />

      <LiveCodingTier items={liveCodingItems} />
    </div>
  )
}
