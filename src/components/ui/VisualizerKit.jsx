import { motion, AnimatePresence } from 'framer-motion'
import { treeHeight, CELL_STYLES } from '../../lib/vizHelpers'

/**
 * Shared building blocks for algorithm visualizers: header, input panel,
 * legend, array row, binary tree, linked list, step message and result banner.
 * Each visualizer still owns its own steps + layout; these just keep the
 * look consistent and avoid re-implementing the same chrome every time.
 */

// ─── Chrome ───────────────────────────────────────────────────────────────────
export function VizHeader({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="text-sm text-slate-400">{subtitle}</p>
    </div>
  )
}

/**
 * fields: [{ label, value, onChange, placeholder, grow? }]
 * examples: [{ label, onClick }]
 */
export function InputPanel({ title = 'Try your own input', fields, onRun, error, examples = [] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      <div className="flex gap-2 items-start flex-wrap">
        {fields.map((f) => (
          <div key={f.label} className={`flex flex-col gap-1 ${f.grow === false ? 'w-24' : 'flex-1 min-w-[160px]'}`}>
            <label className="text-[11px] text-slate-500">{f.label}</label>
            <input
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onRun()}
              placeholder={f.placeholder}
              className="rounded-md bg-slate-800 border border-white/10 px-3 py-1.5 text-xs font-mono text-slate-100 outline-none focus:border-blue-500 transition-colors w-full"
            />
          </div>
        ))}
        <div className="flex flex-col gap-1 justify-end">
          <label className="text-[11px] text-transparent select-none">Run</label>
          <button
            onClick={onRun}
            className="rounded-md bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white transition-colors"
          >
            Run
          </button>
        </div>
      </div>
      {error && <p className="text-[11px] text-red-400">{error}</p>}
      {examples.length > 0 && (
        <p className="text-[11px] text-slate-600">
          Examples —{' '}
          {examples.map((ex, i) => (
            <span key={ex.label}>
              {i > 0 && ' · '}
              <button
                className="text-slate-400 hover:text-white underline underline-offset-2 transition-colors"
                onClick={ex.onClick}
              >
                {ex.label}
              </button>
            </span>
          ))}
        </p>
      )}
    </div>
  )
}

export function Legend({ items }) {
  return (
    <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
      {items.map(([color, label]) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </span>
      ))}
    </div>
  )
}

export function Panel({ title, legend, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#070d1f] px-5 pt-5 pb-5 space-y-4 ${className}`}>
      {(title || legend) && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          {title && <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</p>}
          {legend && <Legend items={legend} />}
        </div>
      )}
      {children}
    </div>
  )
}

/** Small "label: value" stat chips, e.g. [['maxSum', 6], ['currSum', 4]]. */
export function Stats({ items }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(([label, value, tone]) => (
        <div
          key={label}
          className={`rounded-lg border px-3 py-1.5 font-mono text-xs ${STAT_TONES[tone ?? 'default']}`}
        >
          <span className="text-slate-500">{label} = </span>
          <span className="font-bold">{String(value)}</span>
        </div>
      ))}
    </div>
  )
}

const STAT_TONES = {
  default: 'border-white/10 bg-white/[0.03] text-slate-200',
  blue:    'border-blue-500/30 bg-blue-500/10 text-blue-200',
  pink:    'border-pink-500/30 bg-pink-500/10 text-pink-200',
  amber:   'border-amber-500/30 bg-amber-500/10 text-amber-200',
  emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  rose:    'border-rose-500/30 bg-rose-500/10 text-rose-200',
  violet:  'border-violet-500/30 bg-violet-500/10 text-violet-200',
}

export function StepMessage({ message }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={message}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-slate-300 font-mono"
      >
        {message}
      </motion.div>
    </AnimatePresence>
  )
}

export function ResultBanner({ show, ok = true, title, detail }) {
  const c = ok
    ? { box: 'border-emerald-500/30 bg-emerald-500/10', icon: 'text-emerald-300', title: 'text-emerald-200', sym: '✓' }
    : { box: 'border-rose-500/30 bg-rose-500/10',       icon: 'text-rose-300',    title: 'text-rose-200',    sym: '✗' }
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 340, damping: 18 }}
          className={`rounded-xl border px-5 py-4 flex items-center gap-4 ${c.box}`}
        >
          <motion.div
            animate={ok ? { scale: [1, 1.45, 1.1, 1], rotate: [0, -10, 10, 0] } : { rotate: [0, -18, 18, -10, 10, 0] }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className={`text-4xl ${c.icon}`}
          >
            {c.sym}
          </motion.div>
          <div>
            <p className={`font-bold ${c.title}`}>{title}</p>
            {detail && <p className="text-slate-400 text-xs mt-0.5">{detail}</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Cell + pointer styles ────────────────────────────────────────────────────

const POINTER_STYLES = {
  blue:    'text-blue-300 border-blue-400/60 bg-blue-500/15',
  pink:    'text-pink-300 border-pink-400/60 bg-pink-500/15',
  amber:   'text-amber-300 border-amber-400/60 bg-amber-500/15',
  emerald: 'text-emerald-300 border-emerald-400/60 bg-emerald-500/15',
  violet:  'text-violet-300 border-violet-400/60 bg-violet-500/15',
  white:   'text-white border-white/50 bg-white/15',
}

function PointerTags({ tags }) {
  if (!tags?.length) return null
  return (
    <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex gap-0.5">
      {tags.map((t) => (
        <motion.div
          key={t.text}
          layout
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-full border px-1.5 text-[9px] font-black leading-[14px] whitespace-nowrap ${POINTER_STYLES[t.color ?? 'blue']}`}
        >
          {t.text}
        </motion.div>
      ))}
    </div>
  )
}

// ─── Array row ────────────────────────────────────────────────────────────────
/**
 * values      — array of displayable values
 * getState    — (i) => key of CELL_STYLES
 * getTags     — (i) => [{ text, color }] pointer tags shown above the cell
 * getSub      — (i) => optional small caption shown under the index
 */
export function ArrayRow({ values, getState, getTags, getSub, showIndex = true, maxCell = 48 }) {
  if (values.length === 0) {
    return (
      <div className="flex items-center justify-center h-[44px] rounded-lg border border-dashed border-slate-700/50 text-sm text-slate-600">
        empty
      </div>
    )
  }
  const h = values.length <= 10 ? 'h-11 text-base' : values.length <= 16 ? 'h-10 text-sm' : 'h-9 text-xs'
  return (
    <div style={{ paddingTop: 22 }}>
      <div className="flex gap-1">
        {values.map((v, i) => {
          const state = getState?.(i) ?? 'pending'
          return (
            <div key={i} className="relative flex-1 min-w-0" style={{ maxWidth: maxCell }}>
              <PointerTags tags={getTags?.(i)} />
              <motion.div
                layout
                animate={
                  state === 'bad'   ? { x: [0, -3, 3, -2, 2, 0] } :
                  state === 'found' ? { scale: [1, 1.15, 1] } :
                  { scale: 1 }
                }
                transition={{ duration: 0.32 }}
                className={`w-full ${h} rounded-lg border-2 flex items-center justify-center font-mono font-bold select-none transition-colors ${CELL_STYLES[state]}`}
              >
                {v}
              </motion.div>
            </div>
          )
        })}
      </div>
      {(showIndex || getSub) && (
        <div className="flex gap-1 mt-1.5">
          {values.map((_, i) => (
            <div key={i} className="flex-1 min-w-0 text-center" style={{ maxWidth: maxCell }}>
              {showIndex && <div className="text-[9px] font-mono text-slate-600 truncate">{i}</div>}
              {getSub && <div className="text-[10px] font-mono text-slate-400 truncate">{getSub(i)}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Binary tree ──────────────────────────────────────────────────────────────
const NODE_FILL = {
  pending: { fill: '#1e293b', stroke: '#334155', text: '#94a3b8' },
  active:  { fill: '#2563eb', stroke: '#93c5fd', text: '#fff' },
  mid:     { fill: '#92400e', stroke: '#f59e0b', text: '#fff' },
  done:    { fill: '#065f46', stroke: '#10b981', text: '#fff' },
  bad:     { fill: '#9f1239', stroke: '#fb7185', text: '#fff' },
  violet:  { fill: '#5b21b6', stroke: '#a78bfa', text: '#fff' },
}

function layoutTree(node, depth, xMin, xMax, out, parentKey) {
  if (!node) return
  const x = (xMin + xMax) / 2
  out.push({ key: node.key, val: node.val, x, y: depth * 80 + 40, parentKey })
  layoutTree(node.left,  depth + 1, xMin, x, out, node.key)
  layoutTree(node.right, depth + 1, x, xMax, out, node.key)
}

/**
 * tree      — root of { key, val, left, right }
 * getState  — (key) => key of NODE_FILL
 * getBadge  — (key) => optional short string drawn under the node
 */
export function TreeView({ tree, getState, getBadge }) {
  if (!tree) {
    return (
      <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-slate-700/50 text-sm text-slate-600">
        empty tree
      </div>
    )
  }
  const nodes = []
  layoutTree(tree, 0, 0, 600, nodes, null)
  const byKey = Object.fromEntries(nodes.map((n) => [n.key, n]))
  const height = treeHeight(tree) * 80 + 30

  return (
    <svg viewBox={`0 0 600 ${height}`} className="w-full" style={{ maxHeight: 400 }}>
      {nodes.filter((n) => n.parentKey).map((n) => {
        const p = byKey[n.parentKey]
        return (
          <motion.line
            key={`e-${n.key}`}
            initial={false}
            animate={{ x1: p.x, y1: p.y + 20, x2: n.x, y2: n.y - 20 }}
            transition={{ duration: 0.45 }}
            stroke="#334155"
            strokeWidth={1.5}
          />
        )
      })}
      {nodes.map((n) => {
        const c = NODE_FILL[getState?.(n.key) ?? 'pending']
        const badge = getBadge?.(n.key)
        return (
          <motion.g key={n.key} initial={false} animate={{ x: n.x, y: n.y }} transition={{ duration: 0.45 }}>
            <motion.circle r={20} initial={false} animate={{ fill: c.fill, stroke: c.stroke }} strokeWidth={2} />
            <text y={5} textAnchor="middle" fontSize="13" fontWeight="700" fill={c.text} className="pointer-events-none select-none">
              {n.val}
            </text>
            {badge != null && (
              <text x={24} y={-14} fontSize="11" fontWeight="700" fill="#fbbf24" className="pointer-events-none select-none font-mono">
                {badge}
              </text>
            )}
          </motion.g>
        )
      })}
    </svg>
  )
}

// ─── Linked list ──────────────────────────────────────────────────────────────
/**
 * nodes     — [{ key, val }] in display order
 * getState  — (key) => key of CELL_STYLES
 * getTags   — (key) => [{ text, color }]
 * terminal  — text after the last arrow (e.g. 'null'); false for none
 * cycleTo   — index the last node points back to (draws a return arc)
 * arrow     — link glyph between nodes ('→' singly, '⇄' doubly linked)
 */
export function ListRow({ nodes, getState, getTags, terminal = 'null', cycleTo = null, arrow = '→' }) {
  return (
    <div className="overflow-x-auto">
      <div className="flex items-center gap-1 min-w-max" style={{ paddingTop: 24, paddingBottom: cycleTo != null ? 22 : 4 }}>
        {nodes.map((n, i) => (
          <div key={n.key} className="flex items-center gap-1">
            <div className="relative">
              <PointerTags tags={getTags?.(n.key)} />
              <motion.div
                layout
                className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-mono font-bold text-sm transition-colors ${CELL_STYLES[getState?.(n.key) ?? 'pending']}`}
              >
                {n.val}
              </motion.div>
              {cycleTo === i && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-300 whitespace-nowrap">↑ cycle</div>
              )}
              {cycleTo != null && i === nodes.length - 1 && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-300 whitespace-nowrap">↩ to {cycleTo}</div>
              )}
            </div>
            {(i < nodes.length - 1 || terminal !== false) && <span className="text-slate-600 text-sm">{arrow}</span>}
          </div>
        ))}
        {terminal !== false && cycleTo == null && (
          <span className="text-[11px] font-mono text-slate-600">{terminal}</span>
        )}
      </div>
    </div>
  )
}
