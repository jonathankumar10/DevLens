import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildSearchAutocompleteSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

// ── Layout ─────────────────────────────────────────────────────────────────────
// user (left) → frontend → cache (above frontend) → autocomplete → trie → ranking (right)
// pipeline (bottom-center) → trie (offline write path)

const CW = 740
const CH = 350

const NODES = [
  {
    id: 'user', label: 'User', icon: '🔍', dir: 'left',
    cx: 58, cy: 175, w: 90, h: 74,
    color: '#94a3b8', glow: 'rgba(148,163,184,0.65)', lc: '#cbd5e1', strip: 'bg-slate-400',
    sub1: 'typing "te…"', sub2: 'keyboard input',
    desc: 'The person typing a search query character by character.',
    note: 'Users expect suggestions to appear within 100ms of each keystroke — any slower feels broken.',
  },
  {
    id: 'frontend', label: 'Search Frontend', icon: '💻', dir: 'top',
    cx: 178, cy: 175, w: 114, h: 80,
    color: '#06b6d4', glow: 'rgba(6,182,212,0.65)', lc: '#67e8f9', strip: 'bg-cyan-500',
    sub1: 'debounce 150ms', sub2: 'cancel in-flight',
    desc: 'Debounces keystrokes and cancels stale in-flight requests when a newer prefix arrives.',
    note: 'Browser-side LRU cache stores session results — back-navigating to a previous prefix is instant without a network call.',
  },
  {
    id: 'cache', label: 'Redis Cache', icon: '⚡', dir: 'top',
    cx: 178, cy: 68, w: 110, h: 72,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'top 1,000 prefixes', sub2: 'TTL: minutes',
    desc: 'Caches pre-ranked suggestions for the 1,000 most popular prefixes. These cover the vast majority of all traffic.',
    note: 'Cache miss rate < 5% means the Trie service only ever handles the novel long tail — keeps it small and fast.',
  },
  {
    id: 'autocomplete', label: 'Autocomplete Svc', icon: '🔄', dir: 'top',
    cx: 358, cy: 175, w: 124, h: 80,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'orchestrates lookup', sub2: 'writes cache on miss',
    desc: 'Orchestrates the lookup: cache → trie → ranking → cache write. Returns suggestions to the frontend.',
    note: 'On a cache miss, the result is written back to Redis so the next identical prefix is served from cache.',
  },
  {
    id: 'trie', label: 'Trie Service', icon: '🌲', dir: 'top',
    cx: 530, cy: 175, w: 110, h: 80,
    color: '#7c3aed', glow: 'rgba(124,58,237,0.65)', lc: '#ddd6fe', strip: 'bg-violet-700',
    sub1: 'O(prefix) lookup', sub2: 'pre-computed top-K',
    desc: 'Prefix tree where each node stores the pre-computed top-5 completions. Lookup is O(prefix_length) — no sorting at query time.',
    note: 'The live trie is read-only. Updates happen via atomic swap — a new version is built offline and traffic is redirected.',
  },
  {
    id: 'ranking', label: 'Ranking Service', icon: '📊', dir: 'right',
    cx: 668, cy: 175, w: 110, h: 80,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: 'popularity + recency', sub2: 'optional personalization',
    desc: 'Blends global frequency with recency signals. A query spiking in the last hour (breaking news) outranks historically popular stale queries.',
    note: 'Personalization (per-user query history) can be blended here — but must add ≤ 10ms to keep the total response under 100ms.',
  },
  {
    id: 'pipeline', label: 'Data Pipeline', icon: '🏭', dir: 'bottom',
    cx: 530, cy: 295, w: 116, h: 74,
    color: '#64748b', glow: 'rgba(100,116,139,0.65)', lc: '#94a3b8', strip: 'bg-slate-500',
    sub1: 'MapReduce / Spark', sub2: 'hourly refresh',
    desc: 'Aggregates search logs to compute query frequencies. Builds a new trie version offline and atomically swaps traffic to it.',
    note: 'Atomic trie swap is critical: never mutate a live trie mid-query — partial top-K updates corrupt suggestions for in-flight requests.',
  },
]

const EDGES = {
  'user-frontend':       { x1: 103, y1: 175, x2: 121, y2: 175 },
  'frontend-cache':      { x1: 178, y1: 135, x2: 178, y2: 104 },
  'cache-autocomplete':  { x1: 233, y1: 68,  x2: 296, y2: 135 },
  'autocomplete-trie':   { x1: 420, y1: 175, x2: 475, y2: 175 },
  'trie-ranking':        { x1: 585, y1: 175, x2: 613, y2: 175 },
  'pipeline-trie':       { x1: 530, y1: 258, x2: 530, y2: 215 },
}

// ── Edge connection (SVG particles) ──────────────────────────────────────────

// ── Node block ────────────────────────────────────────────────────────────────

// ── Suggestion preview badge ──────────────────────────────────────────────────

const SUGGESTIONS = ['technology', 'template', 'tensorflow', 'test driven', 'terraform']

function SuggestionPreview({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="mt-3 rounded-xl border border-violet-500/30 bg-violet-500/[0.07] px-4 py-3"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-400 mb-2">
            Top 5 Suggestions for "te"
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 360, damping: 22 }}
                className="text-[11px] font-mono text-violet-200 bg-violet-500/15 border border-violet-500/25 rounded px-2 py-0.5"
              >
                <span className="text-violet-400 font-bold">te</span>{s.slice(2)}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SearchAutocompleteDiagram() {
  const steps  = useMemo(() => buildSearchAutocompleteSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  const { nodeState } = useDiagramNodes(steps, index)

  const showSuggestions = step.type === 'response-returned' || step.type === 'cache-hit' || step.type === 'full-system'

  return (
    <div className="space-y-4">

      <DiagramHeader title="Search Autocomplete — Typeahead System">
        Trace a query from keystroke through debounce, cache lookup, trie traversal, and ranking — then see how the offline pipeline keeps suggestions fresh.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} />

          {/* Lane labels */}
          <text x={310} y={40} style={{ fill: '#8b5cf6', fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 600, opacity: 0.55 }}>
            READ PATH  (sub-100ms)
          </text>
          <text x={440} y={320} style={{ fill: '#64748b', fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 600, opacity: 0.55 }}>
            OFFLINE WRITE PATH
          </text>
        </>}
        footer={<>
          <SuggestionPreview visible={showSuggestions} />

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,  glow: FLOW.violet.glow,  label: 'query request'    },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'suggestions back' },
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
