import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildConcatenationSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { InputPanel, Legend, StepMessage, VizHeader } from '../../../components/ui/VisualizerKit'

const DEFAULT_NUMS = [1, 2, 1]

// ── Track geometry — must stay in sync with w-10 + gap-2 ─────────────────────
const CELL_W        = 40   // Tailwind w-10
const CELL_GAP      = 8    // Tailwind gap-2
const STRIDE        = CELL_W + CELL_GAP
const MARKER_W      = 28
const MARKER_OFFSET = (CELL_W - MARKER_W) / 2

// ── Input (podium) cell ───────────────────────────────────────────────────────

const INPUT_STYLES = {
  idle:    'bg-slate-700/60  border-slate-600    text-slate-400',
  current: 'bg-amber-500     border-amber-300    text-white',
  past:    'bg-slate-800/60  border-slate-700/40 text-slate-500',
}

function InputCell({ value, state, pressing }) {
  return (
    <div className="relative">
      {/* Press-glow — spreads downward as stamp hits */}
      {pressing && (
        <motion.div
          key={`glow-${value}-${state}`}
          initial={{ opacity: 0.8, scaleX: 1.4, scaleY: 0.4, y: 36 }}
          animate={{ opacity: 0, scaleX: 2.2, scaleY: 0,    y: 44 }}
          transition={{ duration: 0.45 }}
          className="absolute left-1/2 -translate-x-1/2 w-10 h-3 bg-amber-400/50 rounded-full blur-sm pointer-events-none"
        />
      )}
      <motion.div
        animate={{ scale: state === 'current' ? 1.08 : 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
        className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center
          text-sm font-bold select-none transition-colors duration-200
          ${INPUT_STYLES[state] ?? INPUT_STYLES.idle}`}
      >
        {value}
      </motion.div>
    </div>
  )
}

// ── Result cell ───────────────────────────────────────────────────────────────
// Drops in from above when first stamped — both halves animate simultaneously.

const RESULT_STYLES = {
  empty:   'bg-slate-800/60  border-slate-700/40 text-slate-600',
  stamped: 'bg-blue-500    border-blue-300    text-white',
  filled:  'bg-blue-600/50 border-blue-500    text-blue-200',
  done:    'bg-blue-700/40 border-blue-600    text-blue-300',
}

function ResultCell({ value, state, cellKey }) {
  const display = value === null ? '·' : value
  const isStamp = state === 'stamped'

  return (
    <div className="relative flex-shrink-0" style={{ width: CELL_W, height: CELL_W }}>
      {/* Ink splat rings when the stamp lands */}
      {isStamp && [0, 1].map((i) => (
        <motion.div
          key={`ripple-${cellKey}-${i}`}
          initial={{ opacity: 0.8, scale: 0.4 }}
          animate={{ opacity: 0, scale: 2.4 + i * 0.5 }}
          transition={{ duration: 0.48, delay: i * 0.1 }}
          className="absolute inset-0 rounded-xl bg-blue-500/35 pointer-events-none"
        />
      ))}
      <motion.div
        key={cellKey}
        initial={isStamp ? { y: -26, opacity: 0, scale: 0.5 } : false}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={isStamp
          ? { type: 'spring', stiffness: 460, damping: 22 }
          : { duration: 0.15 }
        }
        className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center
          text-sm font-bold select-none transition-colors duration-150
          ${RESULT_STYLES[state] ?? RESULT_STYLES.empty}`}
      >
        {display}
      </motion.div>
    </div>
  )
}

// ── Stamp marker — presses down on each fill ──────────────────────────────────

function StampMarker({ pos, pressing, stepKey }) {
  return (
    <motion.div
      className="absolute flex flex-col items-center pointer-events-none"
      animate={{ x: pos * STRIDE + MARKER_OFFSET }}
      transition={{ type: 'spring', stiffness: 180, damping: 22 }}
      style={{ width: MARKER_W, top: 0 }}
    >
      {/* Stamp body — bounces down when pressing */}
      <motion.div
        key={`stamp-${stepKey}`}
        animate={pressing
          ? { y: [0, 18, 0], scaleY: [1, 0.72, 1], scaleX: [1, 1.15, 1] }
          : { y: 0, scaleY: 1, scaleX: 1 }
        }
        transition={pressing
          ? { duration: 0.36, ease: [0.36, 0, 0.66, -0.56] }
          : { duration: 0.2 }
        }
        className="flex flex-col items-center"
      >
        {/* Handle */}
        <div className="w-4 h-3 rounded-t bg-amber-600 border-t border-x border-amber-500/60" />
        {/* Body */}
        <div className="w-7 h-2 bg-amber-500 border-x border-amber-400/60" />
        {/* Ink pad */}
        <div className="w-7 h-3.5 rounded-b bg-amber-400 flex items-center justify-center shadow-md"
          style={{ boxShadow: pressing ? '0 4px 12px rgba(245,158,11,0.7)' : 'none' }}>
          <div className="w-5 h-1 rounded-sm bg-amber-600/50" />
        </div>
      </motion.div>

      {/* Ink glow when pressing */}
      {pressing && (
        <motion.div
          key={`ink-${stepKey}`}
          initial={{ opacity: 0.8, scaleY: 0.3 }}
          animate={{ opacity: 0, scaleY: 1.5, scaleX: 1.8 }}
          transition={{ duration: 0.35 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-4 bg-amber-400/60 rounded-full blur-md pointer-events-none"
        />
      )}
      {/* Arrow pointing down */}
      <svg width="10" height="7" viewBox="0 0 10 7" fill="#f59e0b" className="mt-0.5">
        <polygon points="5,7 0,0 10,0" />
      </svg>
    </motion.div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInputState(i, step) {
  if (step.type === 'init') return 'idle'
  if (step.type === 'done') return 'past'
  if (i === step.index)     return 'current'
  if (i < step.index)       return 'past'
  return 'idle'
}

function getResultState(i, step) {
  if (step.type === 'init') return 'empty'
  if (step.type === 'done') return 'done'
  if (step.result[i] === null) return 'empty'
  const n = step.result.length / 2
  if (i === step.index || i === step.index + n) return 'stamped'
  return 'filled'
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ConcatenationVisualizer({ onStepChange }) {
  const [nums,     setNums]     = useState(DEFAULT_NUMS)
  const [draftArr, setDraftArr] = useState(DEFAULT_NUMS.join(', '))
  const [error,    setError]    = useState(null)

  const steps  = useMemo(() => buildConcatenationSteps(nums), [nums])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function handleRun() {
    const parts  = draftArr.split(',').map((s) => s.trim()).filter(Boolean)
    const parsed = parts.map((s) => parseInt(s, 10))

    if (parts.length < 1 || parts.length > 6) {
      setError('Enter 1–6 numbers.')
      return
    }
    if (parsed.some((n) => isNaN(n) || n < 0 || n > 99)) {
      setError('Values must be integers 0–99.')
      return
    }

    setError(null)
    setNums(parsed)
    setTimeout(() => reset(), 0)
  }

  const n         = nums.length
  const isDone    = step.type === 'done'
  const isFilling = step.type === 'fill'

  return (
    <div className="space-y-4">
      <VizHeader
        title="Concatenation of Array"
        subtitle={<>
          The stamp presses each value into{' '}
          <span className="text-blue-400">both halves</span> at once.
        </>}
        aside={<Legend items={[['#f59e0b', 'Current'], ['#3b82f6', 'Just stamped'], ['#5b21b6', 'Filled']]} />}
      />

      {/* Input */}
      <InputPanel
        title={<>Try your own values{' '}
          <span className="font-normal text-slate-600">(integers 0–99, up to 6)</span></>}
        fields={[
          { label: 'Array (comma-separated)', value: draftArr, onChange: setDraftArr, placeholder: 'e.g. 1, 2, 1' },
        ]}
        onRun={handleRun}
        error={error}
        examples={[
          { label: '[1,2,1]', onClick: () => { setDraftArr('1, 2, 1'); setError(null) } },
          { label: '[1,3,2,1]', onClick: () => { setDraftArr('1, 3, 2, 1'); setError(null) } },
          { label: '[5,5,5]', onClick: () => { setDraftArr('5, 5, 5'); setError(null) } },
        ]}
      />

      {/* Track */}
      <div className="rounded-2xl border border-white/10 bg-[#070d1f] px-5 pt-5 pb-4 space-y-5">
        <div className="overflow-x-auto">
          <div style={{ minWidth: n * STRIDE + CELL_W }}>

            {/* ── Input (nums) ── */}
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              nums (input)
            </p>

            {/* Stamp marker row */}
            <div className="relative mb-1" style={{ height: 44 }}>
              {isFilling && (
                <StampMarker
                  pos={step.index}
                  pressing={isFilling}
                  stepKey={runner.index}
                />
              )}
            </div>

            {/* Input cells */}
            <div className="flex" style={{ gap: CELL_GAP }}>
              {nums.map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
                  <InputCell
                    value={val}
                    state={getInputState(i, step)}
                    pressing={isFilling && i === step.index}
                  />
                  <span className="text-[10px] font-mono text-slate-600">[{i}]</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Down arrows showing both result slots receive the stamp */}
        <div className="overflow-x-auto">
          <div style={{ minWidth: 2 * n * STRIDE + CELL_W }}>
            <div className="flex" style={{ gap: CELL_GAP }}>
              {Array.from({ length: 2 * n }, (_, i) => (
                <div
                  key={i}
                  style={{ width: CELL_W }}
                  className="flex-shrink-0 flex justify-center"
                >
                  {isFilling && (i === step.index || i === step.index + n) ? (
                    <motion.svg
                      key={`arr-${i}-${runner.index}`}
                      initial={{ opacity: 0, y: -6, scaleY: 0.5 }}
                      animate={{ opacity: 1, y: 0, scaleY: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      width="14" height="18" viewBox="0 0 14 18" fill="none"
                      style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.7))' }}
                    >
                      <path d="M7 1v12M2 10l5 6 5-6" stroke="#93c5fd" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  ) : (
                    <div className="h-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Result (ans) ── */}
        <div className="overflow-x-auto pb-1">
          <div style={{ minWidth: 2 * n * STRIDE + CELL_W }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              result ({2 * n} elements)
            </p>

            <div className="relative flex" style={{ gap: CELL_GAP }}>
              {step.result.map((val, i) => {
                const state   = getResultState(i, step)
                const isStamp = state === 'stamped'
                const cellKey = isStamp ? `r-${i}-${runner.index}` : `r-${i}`
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
                    <ResultCell value={val} state={state} cellKey={cellKey} />
                    <span className="text-[10px] font-mono text-slate-600">[{i}]</span>
                  </div>
                )
              })}

              {/* Divider between first and second half */}
              <div
                className="absolute top-0 h-10 w-px bg-slate-500/50"
                style={{ left: n * STRIDE - CELL_GAP / 2 }}
              />
            </div>

            {/* Half labels */}
            <div className="flex mt-3 text-[10px] text-slate-600">
              <div style={{ width: n * STRIDE - 4 }} className="text-center">
                first copy
              </div>
              <div className="w-px" />
              <div style={{ width: n * STRIDE }} className="text-center">
                second copy
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stamp status */}
      <AnimatePresence>
        {isFilling && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                Stamping
              </p>
              <p className="text-2xl font-black font-mono text-amber-300">{step.value}</p>
            </div>
            <div className="text-right text-xs font-mono text-slate-400 space-y-1">
              <p>result[<span className="text-blue-300">{step.index}</span>] = {step.value}</p>
              <p>result[<span className="text-blue-300">{step.index + n}</span>] = {step.value}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              [{step.result.join(', ')}]
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
