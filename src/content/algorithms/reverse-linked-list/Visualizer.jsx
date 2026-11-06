import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildReverseLinkedListSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { InputPanel, StepMessage, VizHeader } from '../../../components/ui/VisualizerKit'

const DEFAULT_VALS = [1, 2, 3, 4, 5]

// ── Arrow direction per gap ───────────────────────────────────────────────────
// Gap numbering:
//   gap 0       = null_left  ↔ nodes[0]
//   gap k       = nodes[k-1] ↔ nodes[k]   for k = 1..n-1
//   gap n       = nodes[n-1] ↔ null_right
//
// Arrow logic driven by processedCount (how many links have been flipped):
//   gap < processedCount → 'bwd'  (link reversed, ← arrow, emerald)
//   gap > processedCount → 'fwd'  (original link, → arrow, slate)
//   gap === processedCount → 'break' (the current cut point — no link here)

function gapDir(gapIndex, n, processedCount) {
  if (gapIndex === 0) {
    return processedCount > 0 ? 'bwd' : 'fwd-null'  // fwd-null = original → null_right
  }
  if (gapIndex === n) {
    return processedCount < n ? 'fwd' : 'break'
  }
  if (gapIndex < processedCount) return 'bwd'
  if (gapIndex > processedCount) return 'fwd'
  return 'break'
}

// ── SVG arrow ─────────────────────────────────────────────────────────────────

function ArrowSVG({ dir }) {
  const isBwd   = dir === 'bwd'
  const color   = isBwd ? '#34d399' : '#64748b'
  // arrowhead: right-pointing for fwd, left-pointing for bwd
  const tip = isBwd
    ? { x1: 38, y1: 10, x2: 4,  y2: 10, poly: '10,5 2,10 10,15' }
    : { x1: 4,  y1: 10, x2: 38, y2: 10, poly: '32,5 40,10 32,15' }

  return (
    <svg width="40" height="20" viewBox="0 0 42 20" fill="none">
      <line x1={tip.x1} y1={tip.y1} x2={tip.x2} y2={tip.y2}
        stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <polygon points={tip.poly} fill={color} />
    </svg>
  )
}

// ── Link arrow ────────────────────────────────────────────────────────────────
// Placed between nodes; animates with a coin-flip when direction changes.

function LinkArrow({ dir, isJustFlipped, gapIndex, stepKey }) {
  if (dir === 'break') {
    return (
      <div className="flex items-center justify-center self-center shrink-0" style={{ width: 44 }}>
        <div className="w-7 border-t-2 border-dashed border-slate-700/50" />
      </div>
    )
  }

  if (dir === 'fwd-null') return null  // gap 0 before any reversal — no left-null arrow

  return (
    <div className="relative flex items-center justify-center self-center shrink-0" style={{ width: 44 }}>
      {/* radial flash when a link is freshly reversed */}
      {isJustFlipped && (
        <motion.div
          key={`flash-${gapIndex}-${stepKey}`}
          className="absolute rounded-full bg-emerald-400/30 pointer-events-none"
          style={{ width: 48, height: 48 }}
          initial={{ scale: 0.3, opacity: 0.9 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={`${gapIndex}-${dir}`}
          /* coin-flip: start edge-on (rotateY -90) then unfold to 0 */
          initial={isJustFlipped
            ? { rotateY: -90, opacity: 0.3 }
            : { opacity: 0 }
          }
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          style={{ perspective: 300 }}
        >
          <ArrowSVG dir={dir} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── Node card ─────────────────────────────────────────────────────────────────

const NODE_STYLE = {
  curr:      { bg: 'bg-sky-900/80',      border: 'border-sky-400',      text: 'text-sky-50',      glow: 'rgba(56,189,248,0.65)'  },
  next:      { bg: 'bg-amber-900/70',    border: 'border-amber-400',    text: 'text-amber-50',    glow: 'rgba(251,191,36,0.55)'  },
  prev:      { bg: 'bg-emerald-900/80',  border: 'border-emerald-400',  text: 'text-emerald-50',  glow: 'rgba(52,211,153,0.65)'  },
  reversed:  { bg: 'bg-emerald-900/30',  border: 'border-emerald-700',  text: 'text-emerald-300', glow: null                     },
  remaining: { bg: 'bg-slate-800/60',    border: 'border-slate-600/70', text: 'text-slate-300',   glow: null                     },
  head:      { bg: 'bg-amber-900/80',    border: 'border-amber-300',    text: 'text-amber-50',    glow: 'rgba(251,191,36,0.75)'  },
}

const PTR_LABEL = {
  curr: { text: 'curr', color: 'text-sky-400',     line: 'bg-sky-500'     },
  next: { text: 'next', color: 'text-amber-400',   line: 'bg-amber-500'   },
  prev: { text: 'prev', color: 'text-emerald-400', line: 'bg-emerald-500' },
  head: { text: 'head', color: 'text-amber-300',   line: 'bg-amber-400'   },
}

function NodeCard({ node, stateKey, ptrKey }) {
  const s   = NODE_STYLE[stateKey] || NODE_STYLE.remaining
  const ptr = ptrKey ? PTR_LABEL[ptrKey] : null
  const pop = stateKey === 'prev' || stateKey === 'head'

  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0 select-none">
      {/* pointer label + connector line */}
      <div className="h-8 flex flex-col items-center justify-end gap-0.5">
        <AnimatePresence mode="wait">
          {ptr && (
            <motion.span
              key={`${node.id}-${ptrKey}`}
              initial={{ opacity: 0, y: -5, scale: 0.75 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{    opacity: 0, y:  4, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              className={`text-[10px] font-black uppercase tracking-widest leading-none ${ptr.color}`}
            >
              {ptr.text}
            </motion.span>
          )}
        </AnimatePresence>
        {ptr && (
          <motion.div
            animate={{ scaleY: [1, 0.3, 1], opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
            className={`w-0.5 h-3 rounded-full ${ptr.line}`}
          />
        )}
      </div>

      {/* box */}
      <motion.div
        key={`${node.id}-${stateKey}`}
        animate={
          pop
            ? { scale: [1, 1.2, 0.9, 1.06, 1], transition: { duration: 0.45, times: [0, 0.2, 0.5, 0.75, 1] } }
            : stateKey === 'curr'
            ? { scale: [1, 1.08, 1],              transition: { duration: 0.28 } }
            : {}
        }
        className={`w-12 h-12 flex items-center justify-center rounded-xl border-2
          font-black text-xl font-mono transition-colors duration-200
          ${s.bg} ${s.border} ${s.text}`}
        style={{
          boxShadow: s.glow
            ? `0 0 24px -4px ${s.glow}, 0 0 52px -12px ${s.glow}`
            : undefined,
        }}
      >
        {node.val}
      </motion.div>
    </div>
  )
}

// ── Null terminal ─────────────────────────────────────────────────────────────

function NullTerminal({ glow }) {
  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0 self-end mb-0.5">
      <div className="h-8" />
      <motion.div
        animate={glow
          ? { boxShadow: ['0 0 0px rgba(52,211,153,0)', '0 0 14px rgba(52,211,153,0.45)', '0 0 0px rgba(52,211,153,0)'] }
          : {}
        }
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        className={`px-2.5 py-1 rounded-md border border-dashed text-[10px] font-bold font-mono
          transition-colors duration-300
          ${glow
            ? 'border-emerald-500/60 text-emerald-400 bg-emerald-900/20'
            : 'border-slate-700/40 text-slate-600'
          }`}
      >
        null
      </motion.div>
    </div>
  )
}

// ── Section background bands ───────────────────────────────────────────────────
// A translucent strip behind the reversed and remaining portions of the row.

function SectionBand({ type, style }) {
  // type: 'reversed' | 'remaining'
  return (
    <motion.div
      layout
      className={`absolute top-8 bottom-0 rounded-xl pointer-events-none
        ${type === 'reversed'
          ? 'bg-emerald-500/[0.07] border border-emerald-500/20'
          : 'bg-slate-500/[0.05]  border border-slate-500/15'
        }`}
      style={style}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
    />
  )
}

// ── Node state derivation ─────────────────────────────────────────────────────

function deriveState(node, step) {
  const { type, currId, prevId, nextId, nodes, processedCount } = step
  const idx = nodes.findIndex((n) => n.id === node.id)

  if (type === 'done') {
    return node.id === prevId ? 'head' : 'reversed'
  }
  // During save-next: currId is the node about to be flipped
  // During flip:      currId is the node that was just flipped (now prev)
  if (type === 'save-next') {
    if (node.id === currId) return 'curr'
    if (nextId !== -1 && node.id === nextId) return 'next'
    if (idx < processedCount) return 'reversed'
    return 'remaining'
  }
  if (type === 'flip') {
    if (node.id === currId) return 'prev'           // just became prev
    if (nextId !== -1 && node.id === nextId) return 'curr'  // now the active curr
    if (idx < processedCount) return 'reversed'
    return 'remaining'
  }
  // init
  if (node.id === currId) return 'curr'
  return 'remaining'
}

function derivePtrKey(stateKey) {
  if (stateKey === 'curr')  return 'curr'
  if (stateKey === 'next')  return 'next'
  if (stateKey === 'prev')  return 'prev'
  if (stateKey === 'head')  return 'head'
  return null
}

// ── Input helpers ─────────────────────────────────────────────────────────────
// ── Main component ────────────────────────────────────────────────────────────

export default function ReverseLinkedListVisualizer({ onStepChange }) {
  const [vals,      setVals]      = useState(DEFAULT_VALS)
  const [draftVals, setDraftVals] = useState(DEFAULT_VALS.join(', '))
  const [error,     setError]     = useState(null)

  const steps  = useMemo(() => buildReverseLinkedListSteps(vals), [vals])
  const runner = useStepRunner(steps)
  const { step, index: stepKey, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function handleRun() {
    const parts  = draftVals.split(',').map((s) => s.trim()).filter(Boolean)
    const parsed = parts.map((s) => parseInt(s, 10))
    if (parsed.some(isNaN) || parts.length === 0 || parts.length > 8) {
      setError('Enter 1–8 integers.'); return
    }
    setError(null)
    setVals(parsed)
    setTimeout(() => reset(), 0)
  }

  const { nodes, processedCount } = step
  const n = nodes.length
  const isDone = step.type === 'done'

  // Which gap just had its link reversed? Only during 'flip' steps.
  const justFlippedGap = step.type === 'flip' ? processedCount - 1 : -1

  // The left-null glows once any link has been reversed
  const leftNullGlow = processedCount > 0

  return (
    <div className="space-y-4">

      <VizHeader
        title="Reverse Linked List"
        subtitle={<>
          Each step flips one arrow from <span className="text-slate-400">→</span> to{' '}
          <span className="text-emerald-400">←</span>. Watch the arrowheads rotate.
        </>}
      />

      {/* Input */}
      <InputPanel
        title="Try your own list"
        fields={[
          { label: 'Comma-separated integers (max 8)', value: draftVals, onChange: setDraftVals, placeholder: 'e.g. 1, 2, 3, 4, 5' },
        ]}
        onRun={handleRun}
        error={error}
        examples={[
          { label: '1, 2, 3, 4, 5', onClick: () => { setDraftVals('1, 2, 3, 4, 5'); setError(null) } },
          { label: '1, 2, 3', onClick: () => { setDraftVals('1, 2, 3');       setError(null) } },
          { label: '7, 3, 9, 1', onClick: () => { setDraftVals('7, 3, 9, 1');    setError(null) } },
        ]}
      />

      {/* Main visualization panel */}
      <div className="rounded-2xl border border-white/10 bg-[#070d1f] px-5 pt-5 pb-5 space-y-5">

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {[
              { node: 'bg-sky-500',     arrow: null,              label: 'curr — about to flip' },
              { node: 'bg-emerald-500', arrow: 'text-emerald-400', label: 'prev — just flipped'  },
              { node: 'bg-amber-500',   arrow: null,              label: 'next'                  },
            ].map(({ node, arrow, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className={`w-2 h-2 rounded-full shrink-0 ${node}`} />
                {arrow && <span className={`font-bold ${arrow} text-xs`}>←</span>}
                {label}
              </span>
            ))}
          </div>

          {/* Step type badge */}
          <AnimatePresence mode="wait">
            <motion.span
              key={step.type}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border
                ${step.type === 'flip'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : step.type === 'save-next'
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : step.type === 'done'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-500/20 border-slate-500/40 text-slate-400'
                }`}
            >
              {step.type === 'save-next' ? 'save next' : step.type}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* ── The linked list ─────────────────────────────────────────────── */}
        <div className="overflow-x-auto pb-1">
          <div className="relative inline-flex items-end gap-0" style={{ minWidth: 'max-content', paddingTop: 36 }}>

            {/* Left null terminal */}
            <NullTerminal
              label="null"
              glow={leftNullGlow}
            />

            {/* gap[0]: null_left ↔ nodes[0] */}
            {n > 0 && (
              <LinkArrow
                dir={gapDir(0, n, processedCount)}
                isJustFlipped={justFlippedGap === 0}
                gapIndex={0}
                stepKey={stepKey}
              />
            )}

            {/* Nodes and inter-node arrows */}
            {nodes.map((node, i) => {
              const stateKey = deriveState(node, step)
              const ptrKey   = derivePtrKey(stateKey)

              return (
                <div key={node.id} className="flex items-end">
                  <NodeCard
                    node={node}
                    stateKey={stateKey}
                    ptrKey={ptrKey}
                    animKey={`${stepKey}-${node.id}`}
                  />

                  {/* gap[i+1]: nodes[i] ↔ nodes[i+1] or nodes[n-1] ↔ null_right */}
                  <LinkArrow
                    dir={gapDir(i + 1, n, processedCount)}
                    isJustFlipped={justFlippedGap === i + 1}
                    gapIndex={i + 1}
                    stepKey={stepKey}
                  />
                </div>
              )
            })}

            {/* Right null terminal */}
            <NullTerminal label="null" glow={false} />
          </div>
        </div>

        {/* ── What this step did ──────────────────────────────────────────── */}
        {step.type === 'flip' && (
          <motion.div
            key={`flip-card-${stepKey}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="flex items-center gap-4 rounded-xl border border-emerald-500/30
              bg-emerald-500/[0.08] px-4 py-3"
          >
            {/* before */}
            <div className="flex items-center gap-1 text-sm font-mono text-slate-400">
              <span className="text-slate-500">
                {step.prevId === -1 ? 'null' : nodes.find(n => n.id === step.prevId)?.val ?? '?'}
              </span>
              <span className="text-slate-600 text-base">→</span>
              <span className="text-sky-300 font-bold">{nodes.find(n => n.id === step.currId)?.val}</span>
            </div>

            {/* rotating arrow indicator */}
            <motion.div
              initial={{ rotateY: -180 }}
              animate={{ rotateY: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 16 }}
              style={{ perspective: 300 }}
              className="text-emerald-400 font-black text-lg"
            >
              ⟲
            </motion.div>

            {/* after */}
            <div className="flex items-center gap-1 text-sm font-mono">
              <span className="text-slate-500">
                {step.prevId === -1 ? 'null' : nodes.find(n => n.id === step.prevId)?.val ?? '?'}
              </span>
              <span className="text-emerald-400 font-black text-base">←</span>
              <span className="text-emerald-200 font-bold">{nodes.find(n => n.id === step.currId)?.val}</span>
            </div>

            <span className="ml-auto text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
              link reversed
            </span>
          </motion.div>
        )}

        {step.type === 'save-next' && (
          <motion.div
            key={`save-card-${stepKey}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="flex items-center gap-3 rounded-xl border border-amber-500/30
              bg-amber-500/[0.06] px-4 py-3 text-sm font-mono"
          >
            <span className="text-amber-400 font-black text-base">!</span>
            <span className="text-slate-400">Save</span>
            <span className="text-amber-300 font-bold">
              next = {step.nextId === -1 ? 'null' : nodes.find(n => n.id === step.nextId)?.val}
            </span>
            <span className="text-slate-500">before we break the link from</span>
            <span className="text-sky-300 font-bold">{nodes.find(n => n.id === step.currId)?.val}</span>
          </motion.div>
        )}
      </div>

      {/* Done banner */}
      <AnimatePresence>
        {isDone && n > 0 && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.88, y: 10 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            className="relative overflow-hidden rounded-xl border border-emerald-500/30
              bg-emerald-500/10 px-5 py-4 flex items-center gap-4"
          >
            {[0, 1, 2].map((i) => (
              <motion.div key={i}
                className="absolute inset-0 rounded-xl border border-emerald-400/30 pointer-events-none"
                initial={{ scale: 0.9, opacity: 0.6 }}
                animate={{ scale: 1.6 + i * 0.25, opacity: 0 }}
                transition={{ duration: 0.9, delay: i * 0.2 }}
              />
            ))}
            <motion.span animate={{ scale: [1, 1.4, 1.1, 1] }} transition={{ duration: 0.55 }}
              className="text-3xl text-emerald-300 relative z-10">✓</motion.span>
            <div className="relative z-10">
              <p className="text-sm font-bold text-emerald-300">
                Reversed! New head ={' '}
                <span className="font-black text-emerald-100 text-base">
                  {nodes.find((nd) => nd.id === step.prevId)?.val}
                </span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                [{[...nodes].reverse().map((nd) => nd.val).join(' → ')}]
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
