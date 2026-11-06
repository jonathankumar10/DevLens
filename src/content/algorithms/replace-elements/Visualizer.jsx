import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildReplaceElementsSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { InputPanel, Legend, StepMessage, VizHeader } from '../../../components/ui/VisualizerKit'

const DEFAULT_ARR = [17, 18, 5, 4, 6, 1]

// ── Track geometry — must stay in sync with w-12 + gap-2 ─────────────────────
const CELL_W        = 48   // Tailwind w-12
const CELL_GAP      = 8    // Tailwind gap-2
const STRIDE        = CELL_W + CELL_GAP
const MARKER_W      = 24
const MARKER_OFFSET = (CELL_W - MARKER_W) / 2

// ── Podium cell (input array) ─────────────────────────────────────────────────
// past  = walker already passed this podium (to its right)
// current = walker is standing here now
// idle  = not yet reached (to walker's left)

const PODIUM_STYLES = {
  idle:    'bg-slate-700/60  border-slate-600    text-slate-400',
  current: 'bg-amber-500     border-amber-300    text-white',
  past:    'bg-slate-800/60  border-slate-700/40 text-slate-500',
}

function PodiumCell({ value, state }) {
  return (
    <motion.div
      animate={{ scale: state === 'current' ? 1.1 : 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center
        text-sm font-bold select-none transition-colors duration-200
        ${PODIUM_STYLES[state] ?? PODIUM_STYLES.idle}`}
    >
      {value}
    </motion.div>
  )
}

// ── Result cell ───────────────────────────────────────────────────────────────
// Drops in from above when first written — simulating the walker
// placing the trophy value down onto the slot.

const RESULT_STYLES = {
  empty:  'bg-slate-800/60  border-slate-700/40 text-slate-600',
  placed: 'bg-blue-500    border-blue-300    text-white',
  filled: 'bg-blue-600/50 border-blue-500    text-blue-200',
  done:   'bg-blue-700/40 border-blue-600    text-blue-300',
}

function ResultCell({ value, state, cellKey }) {
  const display = value === null ? '·' : value === -1 ? '−1' : value
  const isDropping = state === 'placed'

  return (
    <div className="relative" style={{ width: CELL_W, height: CELL_W }}>
      {/* Impact ripple when the value lands */}
      {isDropping && (
        <motion.div
          key={`ripple-${cellKey}`}
          initial={{ opacity: 0.7, scale: 0.6 }}
          animate={{ opacity: 0, scale: 2.2 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 rounded-xl bg-blue-500/30 pointer-events-none"
        />
      )}

      <motion.div
        key={cellKey}
        initial={isDropping ? { y: -28, opacity: 0, scale: 0.55 } : false}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={isDropping
          ? { type: 'spring', stiffness: 440, damping: 20 }
          : { duration: 0.15 }
        }
        className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center
          text-sm font-bold select-none transition-colors duration-150
          ${RESULT_STYLES[state] ?? RESULT_STYLES.empty}`}
      >
        {display}
      </motion.div>
    </div>
  )
}

// ── Walker marker — slides right-to-left carrying the trophy ──────────────────

function WalkerMarker({ pos }) {
  return (
    <motion.div
      className="absolute flex flex-col items-center pointer-events-none"
      animate={{ x: pos * STRIDE + MARKER_OFFSET }}
      transition={{ type: 'spring', stiffness: 150, damping: 22 }}
      style={{ width: MARKER_W, top: 0 }}
    >
      <span className="text-base leading-none select-none">🏆</span>
      <svg width="10" height="7" viewBox="0 0 10 7" fill="#f59e0b" className="mt-0.5">
        <polygon points="5,7 0,0 10,0" />
      </svg>
    </motion.div>
  )
}

// ── Trophy badge — shows the value the walker is currently holding ─────────────

function TrophyBadge({ value, upgraded, stepKey }) {
  return (
    <div className={`rounded-xl border px-5 py-3 flex items-center gap-4 transition-colors duration-300
      ${upgraded ? 'border-amber-400/60 bg-amber-400/15' : 'border-amber-500/30 bg-amber-500/10'}`}
    >
      <motion.span
        key={`icon-${stepKey}`}
        animate={upgraded ? { rotate: [0, -18, 18, -12, 12, 0], scale: [1, 1.35, 1] } : {}}
        transition={{ duration: 0.55 }}
        className="text-2xl select-none"
      >
        🏆
      </motion.span>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
          Trophy — highest seen
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={`val-${value}`}
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{   y:  14, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            className="text-3xl font-black font-mono text-amber-300 leading-none"
          >
            {value === -1 ? '−1' : value}
          </motion.p>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {upgraded && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="ml-auto text-xs text-amber-400 font-semibold"
          >
            New best!
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPodiumState(i, step) {
  if (step.type === 'init') return 'idle'
  if (step.type === 'done') return 'past'
  if (i === step.index)     return 'current'
  if (i >  step.index)      return 'past'   // walker has already passed these
  return 'idle'                              // walker hasn't reached these yet
}

function getResultState(i, step) {
  if (step.type === 'init') return 'empty'
  if (step.type === 'done') return 'done'
  if (step.result[i] === null) return 'empty'
  if (i === step.index)        return 'placed'  // just written this step
  return 'filled'
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ReplaceElementsVisualizer({ onStepChange }) {
  const [arr,      setArr]      = useState(DEFAULT_ARR)
  const [draftArr, setDraftArr] = useState(DEFAULT_ARR.join(', '))
  const [error,    setError]    = useState(null)

  const steps  = useMemo(() => buildReplaceElementsSteps(arr), [arr])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function handleRun() {
    const parts  = draftArr.split(',').map((s) => s.trim()).filter(Boolean)
    const parsed = parts.map((s) => parseInt(s, 10))

    if (parts.length < 1 || parts.length > 10) {
      setError('Enter 1–10 numbers.')
      return
    }
    if (parsed.some((n) => isNaN(n) || n < 0 || n > 99)) {
      setError('Values must be integers 0–99.')
      return
    }

    setError(null)
    setArr(parsed)
    setTimeout(() => reset(), 0)
  }

  const isDone     = step.type === 'done'
  const isScanning = step.type === 'scan'
  const upgraded   = isScanning && step.newMax !== step.maxValue

  // Trophy shows the value the walker holds AFTER this step (newMax)
  const trophyValue = step.type === 'init' ? -1 : (step.newMax ?? step.maxValue)

  // Walker is visible only while actively scanning
  const showWalker = isScanning

  return (
    <div className="space-y-4">
      <VizHeader
        title="Replace Elements"
        subtitle={<>
          Walker carries the{' '}
          <span className="text-amber-400">🏆 trophy</span> right-to-left —
          places its value down, then upgrades if the podium beats it.
        </>}
        aside={<Legend items={[['#f59e0b', 'Current podium'], ['#3b82f6', 'Result placed'], ['#475569', 'Visited']]} />}
      />

      {/* Input */}
      <InputPanel
        title={<>Try your own values{' '}
          <span className="font-normal text-slate-600">(integers 0–99)</span></>}
        fields={[
          { label: 'Array (comma-separated)', value: draftArr, onChange: setDraftArr, placeholder: 'e.g. 17, 18, 5, 4, 6, 1' },
        ]}
        onRun={handleRun}
        error={error}
        examples={[
          { label: '[17,18,5,4,6,1]', onClick: () => { setDraftArr('17, 18, 5, 4, 6, 1'); setError(null) } },
          { label: '[400]', onClick: () => { setDraftArr('400'); setError(null) } },
          { label: 'ascending [1…5]', onClick: () => { setDraftArr('1, 2, 3, 4, 5'); setError(null) } },
        ]}
      />

      {/* Track */}
      <div className="rounded-2xl border border-white/10 bg-[#070d1f] px-5 pt-5 pb-4 space-y-4">
        <div className="overflow-x-auto pb-1">
          <div style={{ minWidth: arr.length * STRIDE + CELL_W }}>

            {/* ── Podiums (input) ── */}
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Podiums
            </p>

            {/* Walker marker row */}
            <div className="relative mb-1" style={{ height: 38 }}>
              {showWalker && <WalkerMarker pos={step.index} />}
            </div>

            {/* Podium cells */}
            <div className="flex" style={{ gap: CELL_GAP }}>
              {arr.map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
                  <PodiumCell value={val} state={getPodiumState(i, step)} />
                  <span className="text-[10px] font-mono text-slate-600">[{i}]</span>
                </div>
              ))}
            </div>

            {/* Direction hint */}
            <div className="flex items-center gap-1.5 mt-3 mb-1">
              <svg width="60" height="10" viewBox="0 0 60 10" fill="none">
                <path d="M58 5H2M2 5l6-4M2 5l6 4" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-[10px] text-slate-600 italic">walker moves right → left</span>
            </div>

            {/* ── Result cells ── */}
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2 mt-3">
              Result (trophy value placed at each stop)
            </p>

            <div className="flex" style={{ gap: CELL_GAP }}>
              {step.result.map((val, i) => {
                const state   = getResultState(i, step)
                const isDropping = state === 'placed'
                const cellKey = isDropping ? `r-${i}-drop-${runner.index}` : `r-${i}`
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
                    <ResultCell value={val} state={state} cellKey={cellKey} />
                    <span className="text-[10px] font-mono text-slate-600">[{i}]</span>
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Trophy badge */}
      <TrophyBadge value={trophyValue} upgraded={upgraded} stepKey={runner.index} />

      {/* Result banner */}
      <AnimatePresence>
        {isDone && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 flex items-center gap-3"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 shrink-0">
              Result
            </span>
            <span className="text-sm font-mono text-blue-300">
              [{step.result.map((v) => (v === -1 ? '−1' : v)).join(', ')}]
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step message */}
      <StepMessage message={step.message} />

      <StepControls runner={runner} />
    </div>
  )
}
