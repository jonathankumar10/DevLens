import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildRemoveElementSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { InputPanel, Legend, StepMessage, VizHeader } from '../../../components/ui/VisualizerKit'

const DEFAULT_NUMS = [3, 2, 2, 3]
const DEFAULT_VAL  = 3

// ─── Track geometry — must stay in sync with w-10 + gap-2 ────────────────────
const CELL_W        = 40   // Tailwind w-10
const CELL_GAP      = 8    // Tailwind gap-2
const STRIDE        = CELL_W + CELL_GAP   // 48 px per cell
const MARKER_W      = 20
const MARKER_OFFSET = (CELL_W - MARKER_W) / 2   // centres marker over its cell

// ─── Cell state ───────────────────────────────────────────────────────────────
// step.k = write pointer AFTER this step; cells [0, k-1] = confirmed result.

function getCellState(j, step) {
  const { type, i, k } = step
  if (type === 'init') return step.nums[j] === step.val ? 'target' : 'idle'
  if (type === 'done') return j < k ? 'result' : 'consumed'
  if (j > i)   return 'idle'
  if (j === i) return type === 'skip' ? 'checking-skip' : 'checking-keep'
  if (j < k)   return 'result'
  return 'consumed'
}

const CELL_CLS = {
  idle:            'bg-slate-700/60   border-slate-600    text-slate-400',
  target:          'bg-rose-500/15    border-rose-500/50  text-rose-300',
  'checking-keep': 'bg-blue-500       border-blue-300     text-white',
  'checking-skip': 'bg-rose-500/80    border-rose-400     text-white',
  result:          'bg-emerald-600/50 border-emerald-500  text-emerald-200',
  consumed:        'bg-slate-800/60   border-slate-700/40 text-slate-600',
}

// ─── TrackCell ────────────────────────────────────────────────────────────────
// isLeaping: cell at i on a 'skip' step → bounce upward and glow rose
// isLanding: cell at k-1 on a 'keep' step → drop in from above, emerald impact

function TrackCell({ value, state, isLeaping, isLanding }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: CELL_W, height: CELL_W }}>
      {/* Leap burst — expands and fades as the runner clears the tile */}
      {isLeaping && [0, 1].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.75, scale: 0.9 }}
          animate={{ opacity: 0, scale: 2.6 + i * 0.6 }}
          transition={{ duration: 0.42, delay: i * 0.12 }}
          className="absolute inset-0 rounded-xl bg-rose-500/35 pointer-events-none"
        />
      ))}

      {/* Land impact shadow — spreads under the tile as it touches down */}
      {isLanding && (
        <motion.div
          initial={{ opacity: 0.9, scaleX: 2.8, scaleY: 0.5 }}
          animate={{ opacity: 0, scaleX: 1, scaleY: 0 }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-emerald-400/45 rounded-full blur-sm pointer-events-none"
        />
      )}

      {/* The tile itself */}
      <motion.div
        initial={
          isLanding ? { y: -32, scale: 0.4, opacity: 0.3 } :
          isLeaping ? { y: 0, scale: 1, rotate: 0 } :
          false
        }
        animate={
          isLeaping ? { y: [0, -52, 0], scale: [1, 0.72, 1], rotate: [0, 18, 0] } :
          isLanding ? { y: 0, scale: 1, opacity: 1 } :
          { y: 0, scale: 1, rotate: 0 }
        }
        transition={
          isLeaping ? { duration: 0.52, ease: [0.36, 0, 0.66, 1] } :
          isLanding ? { type: 'spring', stiffness: 480, damping: 20 } :
          { type: 'spring', stiffness: 340, damping: 28 }
        }
        className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center
          text-sm font-bold select-none transition-colors duration-150
          ${CELL_CLS[state] ?? CELL_CLS.idle}`}
      >
        {value}
      </motion.div>
    </div>
  )
}

// ─── Runner marker ────────────────────────────────────────────────────────────

function RunnerMarker({ label, color, pos, topOffset }) {
  const isReader = label === 'i'
  return (
    <motion.div
      className="absolute flex flex-col items-center gap-0.5 pointer-events-none"
      animate={{ x: pos * STRIDE + MARKER_OFFSET }}
      transition={{ type: 'spring', stiffness: 190, damping: 22 }}
      style={{ width: MARKER_W, top: topOffset }}
    >
      {/* Badge pill */}
      <div
        className="rounded-full px-2 py-0.5 text-[9px] font-black leading-none"
        style={{ backgroundColor: `${color}25`, border: `1px solid ${color}70`, color }}
      >
        {label}
      </div>
      {/* Pulsing dot */}
      <motion.div
        animate={isReader
          ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }
          : { opacity: [0.7, 1, 0.7] }
        }
        transition={{ duration: isReader ? 0.7 : 1.1, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color }}
      />
      {/* Arrow */}
      <svg width="8" height="6" viewBox="0 0 8 6" fill={color}>
        <polygon points="4,6 0,0 8,0" />
      </svg>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RemoveElementVisualizer({ onStepChange }) {
  const [nums,      setNums]      = useState(DEFAULT_NUMS)
  const [val,       setVal]       = useState(DEFAULT_VAL)
  const [draftNums, setDraftNums] = useState(DEFAULT_NUMS.join(', '))
  const [draftVal,  setDraftVal]  = useState(String(DEFAULT_VAL))
  const [error,     setError]     = useState(null)

  const steps  = useMemo(() => buildRemoveElementSteps(nums, val), [nums, val])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function handleRun() {
    const parts  = draftNums.split(',').map((s) => s.trim()).filter(Boolean)
    const parsed = parts.map((s) => parseInt(s, 10))
    const v      = parseInt(draftVal.trim(), 10)

    if (parts.length < 2 || parts.length > 10) { setError('Enter 2–10 numbers.'); return }
    if (parsed.some((n) => isNaN(n) || n < 0 || n > 9)) { setError('Values must be integers 0–9.'); return }
    if (isNaN(v) || v < 0 || v > 9) { setError('val must be 0–9.'); return }

    setError(null)
    setNums(parsed)
    setVal(v)
    setTimeout(() => reset(), 0)
  }

  // Show runners only while actively scanning (not on init or done)
  const showRunners = step.i >= 0

  const isDone = step.type === 'done'

  return (
    <div className="space-y-4">
      <VizHeader
        title="Remove Element"
        subtitle={<>
          Reader <span className="text-amber-400 font-mono">i</span> sprints ahead —
          leaps over <span className="text-rose-400">val</span> tiles, hands the rest
          to writer <span className="text-blue-400 font-mono">k</span>.
        </>}
        aside={
          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            <Legend items={[['#fca5a5', `val = ${step.val}`], ['#3b82f6', 'Handing off'], ['#10b981', 'Placed (result)'], ['#475569', 'Consumed']]} />
          </div>
        }
      />

      {/* Input */}
      <InputPanel
        title={<>Try your own values{' '}
          <span className="font-normal text-slate-600">(integers 0–9)</span></>}
        fields={[
          { label: 'Array (comma-separated)', value: draftNums, onChange: setDraftNums, placeholder: 'e.g. 3, 2, 2, 3' },
          { label: 'val', value: draftVal, onChange: setDraftVal, placeholder: '3', width: 'w-16' },
        ]}
        onRun={handleRun}
        error={error}
        examples={[
          { label: '[3,2,2,3] val=3', onClick: () => { setDraftNums('3, 2, 2, 3'); setDraftVal('3'); setError(null) } },
          { label: '[0,1,2,2,3,0,4,2] val=2', onClick: () => { setDraftNums('0, 1, 2, 2, 3, 0, 4, 2'); setDraftVal('2'); setError(null) } },
          { label: '[4,5] val=4', onClick: () => { setDraftNums('4, 5'); setDraftVal('4'); setError(null) } },
        ]}
      />

      {/* Track */}
      <div className="rounded-2xl border border-white/10 bg-[#070d1f] px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Track
          </p>
          {showRunners && (
            <div className="flex gap-4 text-[11px] font-mono">
              <span className="text-amber-400">i = {step.i}</span>
              <span className="text-blue-400">k = {step.k}</span>
            </div>
          )}
        </div>

        {/* Scrollable so long arrays don't break layout */}
        <div className="overflow-x-auto pb-1">
          <div style={{ minWidth: nums.length * STRIDE + CELL_W }}>

            {/* Runner markers — two rows so they don't collide at same position */}
            <div className="relative mb-1" style={{ height: 40 }}>
              {showRunners && (
                <>
                  <RunnerMarker label="i" color="#f59e0b" pos={step.i} topOffset={0}  />
                  <RunnerMarker label="k" color="#3b82f6" pos={step.k} topOffset={20} />
                </>
              )}
            </div>

            {/* Tiles on the track */}
            <div className="flex" style={{ gap: CELL_GAP }}>
              {step.nums.map((v, j) => {
                const state     = getCellState(j, step)
                const isLeaping = step.type === 'skip' && j === step.i
                const isLanding = step.type === 'keep' && j === step.k - 1
                // Changing key forces Framer Motion to replay initial→animate
                const cellKey   = isLeaping ? `${j}-lp-${runner.index}`
                                : isLanding ? `${j}-ld-${runner.index}`
                                : j
                return (
                  <TrackCell
                    key={cellKey}
                    value={v}
                    state={state}
                    isLeaping={isLeaping}
                    isLanding={isLanding}
                  />
                )
              })}
            </div>

            {/* Index labels */}
            <div className="flex mt-2" style={{ gap: CELL_GAP }}>
              {step.nums.map((_, j) => (
                <div
                  key={j}
                  style={{ width: CELL_W }}
                  className="text-center text-[10px] font-mono text-slate-600"
                >
                  [{j}]
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* k counter */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
            Writer k
          </p>
          <p className="text-2xl font-black font-mono text-blue-300">{step.k}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-slate-500 mb-0.5">Result region</p>
          <p className="text-xs font-mono text-slate-400">
            {step.k === 0 ? 'empty' : `nums[0..${step.k - 1}]`}
          </p>
        </div>
      </div>

      {/* Result banner */}
      <AnimatePresence>
        {isDone && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 flex items-center gap-3"
          >
            <span className="text-2xl font-black font-mono text-emerald-300">
              {step.k}
            </span>
            <span className="text-sm text-slate-400">
              element{step.k === 1 ? '' : 's'} remaining — first {step.k} of the array are the answer
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
