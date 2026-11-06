import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildMergeSortedListsSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { InputPanel, StepMessage, VizHeader } from '../../../components/ui/VisualizerKit'

const DEFAULT_L1 = [1, 2, 4]
const DEFAULT_L2 = [1, 3, 4]

// ── Node card ─────────────────────────────────────────────────────────────────
// State: 'active' | 'pointer' | 'consumed' | 'just-picked' | 'merged-l1' | 'merged-l2' | 'merged-drain'

const THEME = {
  // List1 nodes
  'l1-active':    { bg: 'bg-sky-900/40',   border: 'border-sky-600/50',  text: 'text-sky-200'     },
  'l1-pointer':   { bg: 'bg-sky-800/70',   border: 'border-sky-400',     text: 'text-sky-50'      },
  'l1-consumed':  { bg: 'bg-slate-900/40', border: 'border-slate-700/40',text: 'text-slate-600'   },
  'l1-picked':    { bg: 'bg-sky-700/80',   border: 'border-sky-300',     text: 'text-white'       },
  // List2 nodes
  'l2-active':    { bg: 'bg-blue-900/40',border: 'border-blue-600/50',text: 'text-blue-200' },
  'l2-pointer':   { bg: 'bg-blue-800/70',border: 'border-blue-400',  text: 'text-white'   },
  'l2-consumed':  { bg: 'bg-slate-900/40', border: 'border-slate-700/40',text: 'text-slate-600'   },
  'l2-picked':    { bg: 'bg-blue-700/80',border: 'border-blue-300',  text: 'text-white'       },
  // Merged nodes
  'merged-l1':    { bg: 'bg-sky-900/50',   border: 'border-sky-500',     text: 'text-sky-100'     },
  'merged-l2':    { bg: 'bg-blue-900/50',border: 'border-blue-500',  text: 'text-blue-100'  },
  'merged-drain': { bg: 'bg-emerald-900/50',border:'border-emerald-500', text: 'text-emerald-100' },
  'done':         { bg: 'bg-emerald-900/30',border:'border-emerald-600', text: 'text-emerald-200' },
}

function NodeCard({ node, themeKey, size = 'normal', isNew = false }) {
  const t = THEME[themeKey] || THEME['l1-active']
  const dim = size === 'small' ? 'w-10 h-10 text-base' : 'w-11 h-11 text-lg'

  return (
    <motion.div
      layout
      initial={isNew ? { scale: 0.4, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={isNew
        ? { type: 'spring', stiffness: 460, damping: 22 }
        : { duration: 0.18 }
      }
      className={`flex items-center justify-center rounded-xl border-2 font-black font-mono
        select-none shrink-0 transition-colors duration-200 ${dim} ${t.bg} ${t.border} ${t.text}`}
      style={{
        boxShadow: themeKey.includes('pointer') || themeKey.includes('picked')
          ? `0 0 14px -3px ${themeKey.startsWith('l1') ? 'rgba(56,189,248,0.5)' : 'rgba(167,139,250,0.5)'}`
          : undefined,
      }}
    >
      {node.val}
    </motion.div>
  )
}

// ── Arrow connector between nodes ─────────────────────────────────────────────

function ChainArrow({ color = 'text-slate-600' }) {
  return <span className={`text-xs font-bold select-none shrink-0 ${color}`}>→</span>
}

// ── ListRow — renders one of the input lists ──────────────────────────────────

function ListRow({ nodes, pointer, chosen, stepType, list, drainFrom }) {
  const prefix = list === 1 ? 'l1' : 'l2'
  const ptrColor = list === 1 ? 'text-sky-400' : 'text-blue-400'
  const arrowColor = list === 1 ? 'text-sky-800' : 'text-blue-800'
  const label = list === 1 ? 'list1' : 'list2'
  const exhausted = pointer >= nodes.length
  const isDrained = stepType === 'drain' && drainFrom === list

  function getThemeKey(i) {
    if (i < pointer) return `${prefix}-consumed`
    if (i === pointer) {
      if ((stepType === 'pick' || stepType === 'drain') && chosen === list) return `${prefix}-picked`
      return `${prefix}-pointer`
    }
    return `${prefix}-active`
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${ptrColor}`}>{label}</span>
        {exhausted && (
          <motion.span
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] text-slate-500 font-mono"
          >
            (exhausted)
          </motion.span>
        )}
        {isDrained && !exhausted && (
          <motion.span
            key={`drain-${pointer}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] text-emerald-400 font-semibold"
          >
            draining →
          </motion.span>
        )}
      </div>

      {nodes.length === 0 ? (
        <div className="text-xs text-slate-600 font-mono italic">empty</div>
      ) : (
        <div className="flex items-center gap-1.5 flex-wrap">
          {nodes.map((node, i) => (
            <div key={node.id} className="flex items-center gap-1.5">
              <div className="flex flex-col items-center gap-0.5">
                {/* Pointer label */}
                <div className="h-4 flex items-end justify-center">
                  {i === pointer && !exhausted && (
                    <motion.span
                      key={`ptr-${pointer}`}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-[9px] font-bold uppercase tracking-widest ${ptrColor}`}
                    >
                      p{list}
                    </motion.span>
                  )}
                </div>
                <NodeCard node={node} themeKey={getThemeKey(i)} />
              </div>
              {i < nodes.length - 1 && <ChainArrow color={arrowColor} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Comparison badge ──────────────────────────────────────────────────────────

function ComparisonBadge({ step }) {
  const { type, chosen, comparison, list1, list2, p1, p2 } = step
  if (type !== 'pick') return null

  // The comparison used the values BEFORE advancing
  const leftVal  = chosen === 1 ? list1[p1 - 1]?.val : list1[p1]?.val
  const rightVal = chosen === 2 ? list2[p2 - 1]?.val : list2[p2]?.val

  const color = comparison === '='
    ? { bg: 'bg-slate-500/15', border: 'border-slate-500/40', text: 'text-slate-300', sym: 'text-white' }
    : chosen === 1
    ? { bg: 'bg-sky-500/15',     border: 'border-sky-500/40',     text: 'text-sky-300',     sym: 'text-sky-200'     }
    : { bg: 'bg-blue-500/15', border: 'border-blue-500/40', text: 'text-blue-300', sym: 'text-blue-200' }

  return (
    <motion.div
      key={`${p1}-${p2}`}
      initial={{ opacity: 0, scale: 0.82, y: -6 }}
      animate={{ opacity: 1, scale: 1,    y: 0  }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className={`flex items-center gap-4 rounded-xl border px-5 py-3 ${color.bg} ${color.border}`}
    >
      <div className="text-center">
        <div className="text-[10px] text-slate-500 font-mono mb-0.5">list1</div>
        <div className={`text-2xl font-black font-mono ${color.sym}`}>{leftVal}</div>
      </div>

      <motion.div
        animate={{ scale: [1, 1.4, 1.1, 1] }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={`text-xl font-black ${color.sym}`}
      >
        {comparison}
      </motion.div>

      <div className="text-center">
        <div className="text-[10px] text-slate-500 font-mono mb-0.5">list2</div>
        <div className={`text-2xl font-black font-mono ${color.sym}`}>{rightVal}</div>
      </div>

      <div className={`ml-2 text-sm font-bold ${color.text}`}>
        {chosen === 1
          ? `pick ${leftVal} from list1`
          : `pick ${rightVal} from list2`}
      </div>
    </motion.div>
  )
}

// ── Input helpers ─────────────────────────────────────────────────────────────

function parseList(str) {
  if (!str.trim()) return []
  const parts  = str.split(',').map((s) => s.trim()).filter(Boolean)
  const parsed = parts.map((s) => parseInt(s, 10))
  if (parsed.some(isNaN)) return null
  for (let i = 1; i < parsed.length; i++) {
    if (parsed[i] < parsed[i - 1]) return null  // not sorted
  }
  return parsed
}
// ── Merged row ────────────────────────────────────────────────────────────────

function MergedRow({ merged, step }) {
  const isDone = step.type === 'done'
  const lastId = merged.length > 0 ? merged[merged.length - 1].id : null

  function getMergedTheme(node) {
    if (isDone) return 'done'
    if (node.id === lastId) {
      return step.type === 'drain' ? 'merged-drain' : `merged-${node.fromList === 1 ? 'l1' : 'l2'}`
    }
    return `merged-${node.fromList === 1 ? 'l1' : 'l2'}`
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">merged</span>
        <span className="text-[10px] text-slate-600 font-mono">{merged.length} node{merged.length !== 1 ? 's' : ''}</span>
      </div>

      {merged.length === 0 ? (
        <div className="flex items-center justify-center h-11 rounded-xl border border-dashed border-slate-700/40 text-xs text-slate-600">
          empty
        </div>
      ) : (
        <div className="flex items-center gap-1.5 flex-wrap">
          <AnimatePresence initial={false}>
            {merged.map((node, i) => (
              <motion.div key={node.id} className="flex items-center gap-1.5">
                <NodeCard
                  node={node}
                  themeKey={getMergedTheme(node)}
                  isNew={node.id === lastId && step.type !== 'init' && step.type !== 'done'}
                />
                {i < merged.length - 1 && <ChainArrow color={isDone ? 'text-emerald-800' : 'text-slate-600'} />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MergeSortedListsVisualizer({ onStepChange }) {
  const [l1,      setL1]      = useState(DEFAULT_L1)
  const [l2,      setL2]      = useState(DEFAULT_L2)
  const [draftL1, setDraftL1] = useState(DEFAULT_L1.join(', '))
  const [draftL2, setDraftL2] = useState(DEFAULT_L2.join(', '))
  const [error,   setError]   = useState(null)

  const steps  = useMemo(() => buildMergeSortedListsSteps(l1, l2), [l1, l2])
  const runner = useStepRunner(steps)
  const { step, index: runnerIndex, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function handleRun() {
    const parsed1 = parseList(draftL1)
    const parsed2 = parseList(draftL2)
    if (parsed1 === null || parsed1.length > 8) {
      setError('list1: enter up to 8 sorted integers (comma-separated).'); return
    }
    if (parsed2 === null || parsed2.length > 8) {
      setError('list2: enter up to 8 sorted integers (comma-separated).'); return
    }
    setError(null)
    setL1(parsed1)
    setL2(parsed2)
    setTimeout(() => reset(), 0)
  }

  const { list1, list2, merged, p1, p2, type, chosen, drainFrom } = step
  const isDone = type === 'done'

  return (
    <div className="space-y-4">

      <VizHeader
        title="Merge Two Sorted Lists"
        subtitle="Two pointers walk the sorted lists — always pick the smaller front node and advance that pointer."
      />

      {/* Input */}
      <InputPanel
        title="Try your own lists"
        fields={[
          { label: 'list1 (sorted, max 8)', value: draftL1, onChange: setDraftL1, placeholder: 'e.g. 1, 2, 4', width: 'flex-1 min-w-[140px]' },
          { label: 'list2 (sorted, max 8)', value: draftL2, onChange: setDraftL2, placeholder: 'e.g. 1, 3, 4', width: 'flex-1 min-w-[140px]' },
        ]}
        onRun={handleRun}
        error={error}
        examples={[
          { label: '[1,2,4] + [1,3,4]', onClick: () => { setDraftL1('1, 2, 4'); setDraftL2('1, 3, 4'); setError(null) } },
          { label: '[1,3,5] + [2,4,6]', onClick: () => { setDraftL1('1, 3, 5'); setDraftL2('2, 4, 6'); setError(null) } },
          { label: '[] + [1]', onClick: () => { setDraftL1('');        setDraftL2('1');       setError(null) } },
        ]}
      />

      {/* Main panel */}
      <div className="rounded-2xl border border-white/10 bg-[#070d1f] px-5 pt-5 pb-4 space-y-5">

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {[
            { color: 'bg-sky-700',      label: 'list1 node' },
            { color: 'bg-blue-700',   label: 'list2 node' },
            { color: 'bg-emerald-700',  label: 'merged'     },
            { color: 'bg-slate-700/50', label: 'consumed'   },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              {label}
            </span>
          ))}
        </div>

        {/* List1 */}
        <ListRow
          nodes={list1}
          pointer={p1}
          chosen={chosen}
          stepType={type}
          list={1}
          drainFrom={drainFrom}
        />

        {/* Divider */}
        <div className="w-full h-px bg-white/5" />

        {/* List2 */}
        <ListRow
          nodes={list2}
          pointer={p2}
          chosen={chosen}
          stepType={type}
          list={2}
          drainFrom={drainFrom}
        />

        {/* Divider */}
        <div className="w-full h-px bg-white/5" />

        {/* Merged */}
        <MergedRow merged={merged} step={step} />
      </div>

      {/* Comparison badge */}
      <AnimatePresence mode="wait">
        {type === 'pick' && (
          <ComparisonBadge key={`cmp-${runnerIndex}`} step={step} />
        )}
      </AnimatePresence>

      {/* Done banner */}
      <AnimatePresence>
        {isDone && (
          <motion.div
            key="done-banner"
            initial={{ opacity: 0, scale: 0.88, y: 10 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 flex items-center gap-4"
          >
            <motion.span
              animate={{ scale: [1, 1.4, 1.1, 1], rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.6 }}
              className="text-3xl text-emerald-300"
            >
              ✓
            </motion.span>
            <div>
              <p className="text-sm font-bold text-emerald-300">
                Merged — {merged.length} node{merged.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                [{merged.map((n) => n.val).join(' → ')}]
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step message */}
      <StepMessage message={step.message} />

      <StepControls runner={runner} />
    </div>
  )
}
