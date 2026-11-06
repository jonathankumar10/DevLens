import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildGuessNumberSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { InputPanel, Legend, StepMessage, VizHeader } from '../../../components/ui/VisualizerKit'

const DEFAULT_N      = 10
const DEFAULT_PICKED = 7

const CELL_W   = 48
const CELL_H   = 64
const CELL_GAP = 8
const STRIDE   = CELL_W + CELL_GAP

// Returns the visual state of tile `num` at the current step.
function getTileState(num, step) {
  const { type, left, right, mid } = step
  if (type === 'init') return 'active'
  if (num === mid && type === 'found')  return 'found'
  if (num === mid && type === 'guess')  return 'guessing'
  if (num < left || num > right)        return 'eliminated'
  return 'active'
}

// ─── DoorTile ─────────────────────────────────────────────────────────────────
function DoorTile({ num, state, animKey }) {
  const isGuessing = state === 'guessing'
  const isFound    = state === 'found'
  const isElim     = state === 'eliminated'

  return (
    <div className="relative flex-shrink-0 select-none" style={{ width: CELL_W, height: CELL_H }}>

      {/* Found: burst rings */}
      {isFound && [0, 1, 2, 3].map((i) => (
        <motion.div
          key={`burst-${animKey}-${i}`}
          initial={{ opacity: 0.85, scale: 0.5 }}
          animate={{ opacity: 0, scale: 3.0 + i * 0.45 }}
          transition={{ duration: 0.7, delay: i * 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 rounded-2xl bg-emerald-400/35 pointer-events-none"
        />
      ))}

      {/* Guessing: breathing halo */}
      {isGuessing && (
        <motion.div
          key={`halo-${animKey}`}
          animate={{ opacity: [0.6, 0.15, 0.6], scale: [1, 1.6, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-2xl bg-blue-500/40 pointer-events-none"
        />
      )}

      {/* Tile shell */}
      <motion.div
        animate={
          isElim     ? { scaleY: 0.88, opacity: 0.28 } :
          isFound    ? { scale: [1, 1.1, 1], opacity: 1 } :
          isGuessing ? { scale: [1, 1.06, 1] } :
          { scaleY: 1, opacity: 1 }
        }
        transition={
          isElim     ? { duration: 0.28, ease: [0.36, 0, 0.66, 1] } :
          isFound    ? { type: 'spring', stiffness: 300, damping: 14 } :
          isGuessing ? { duration: 0.4, ease: 'easeOut' } :
          { duration: 0.2 }
        }
        className={`absolute inset-0 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 ${
          isFound    ? 'border-emerald-300 bg-emerald-600/30 shadow-[0_0_26px_6px_rgba(16,185,129,0.6)]' :
          isGuessing ? 'border-blue-300 bg-[#070d1f] shadow-[0_0_18px_4px_rgba(59,130,246,0.55)]' :
          isElim     ? 'border-slate-700/30 bg-slate-800/20' :
          'border-slate-600 bg-slate-700/70'
        }`}
      >
        <span className={`font-black font-mono ${
          isFound    ? 'text-base text-emerald-100' :
          isGuessing ? 'text-base text-blue-100' :
          isElim     ? 'text-sm text-slate-700' :
          'text-sm text-slate-300'
        }`}>
          {num}
        </span>
        {isGuessing && (
          <span className="text-[8px] text-blue-400 font-mono leading-none">guess?</span>
        )}
        {isFound && (
          <span className="text-[8px] text-emerald-400 font-mono leading-none">found!</span>
        )}
      </motion.div>
    </div>
  )
}

// ─── WallMarker — L/R walls squeeze in, M probe descends from above ───────────
function WallMarker({ label, pos, color }) {
  const isR = label === 'R'
  const isM = label === 'M'

  return (
    <motion.div
      className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center"
      animate={{ x: (pos - 1) * STRIDE + (isR ? CELL_W : 0) }}
      transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      style={{ width: 0 }}
    >
      {isM ? (
        <div className="flex flex-col items-center" style={{ marginTop: -28 }}>
          <div
            className="rounded-full px-2 py-0.5 text-[9px] font-black leading-none mb-0.5"
            style={{ backgroundColor: `${color}25`, border: `1px solid ${color}80`, color }}
          >
            M
          </div>
          <svg width="8" height="6" viewBox="0 0 8 6" fill={color}>
            <polygon points="4,6 0,0 8,0" />
          </svg>
        </div>
      ) : (
        <motion.div
          animate={{ scaleY: [1, 1.08, 1] }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            width: 3,
            height: CELL_H,
            borderRadius: 2,
            backgroundColor: color,
            boxShadow: `0 0 10px 3px ${color}55`,
            marginLeft: isR ? -3 : 0,
          }}
        />
      )}
    </motion.div>
  )
}

// ─── API Response badge ────────────────────────────────────────────────────────
function ApiResponseBadge({ step, animKey }) {
  const { type, mid, guessResult } = step
  if (!['guess', 'too-high', 'too-low', 'found'].includes(type)) return null

  const config =
    guessResult === 0  ? { label: 'Correct!',             sym: '0',  color: 'emerald' } :
    guessResult === -1 ? { label: 'Too High! ← Go left',  sym: '-1', color: 'amber'   } :
                         { label: 'Too Low!  Go right →',  sym: '1',  color: 'sky'     }

  const colors = {
    emerald: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-300', sym: 'text-emerald-200' },
    amber:   { bg: 'bg-amber-500/15',   border: 'border-amber-500/40',   text: 'text-amber-300',   sym: 'text-amber-200'   },
    sky:     { bg: 'bg-sky-500/15',     border: 'border-sky-500/40',     text: 'text-sky-300',     sym: 'text-sky-200'     },
  }
  const c = colors[config.color]

  return (
    <motion.div
      key={animKey}
      initial={{ opacity: 0, scale: 0.75, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className={`flex items-center gap-4 rounded-xl border ${c.bg} ${c.border} px-5 py-3`}
    >
      <div className="text-center">
        <div className="text-[10px] text-slate-500 font-mono mb-0.5">guess({mid})</div>
        <div className={`text-2xl font-black font-mono ${c.sym}`}>{config.sym}</div>
      </div>

      <motion.div
        animate={
          guessResult === 0  ? { scale: [1, 1.5, 1.2, 1], rotate: [0, -10, 10, 0] } :
          guessResult === -1 ? { x: [0, -6, 0] } :
                               { x: [0,  6, 0] }
        }
        transition={{ duration: 0.5, delay: 0.15 }}
        className={`text-xl font-black ${c.sym}`}
      >
        →
      </motion.div>

      <div className={`text-sm font-bold ${c.text}`}>{config.label}</div>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GuessNumberVisualizer({ onStepChange }) {
  const [n,         setN]         = useState(DEFAULT_N)
  const [picked,    setPicked]    = useState(DEFAULT_PICKED)
  const [draftN,    setDraftN]    = useState(String(DEFAULT_N))
  const [draftPick, setDraftPick] = useState(String(DEFAULT_PICKED))
  const [error,     setError]     = useState(null)

  const steps  = useMemo(() => buildGuessNumberSteps(n, picked), [n, picked])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function handleRun() {
    const parsedN    = parseInt(draftN.trim(), 10)
    const parsedPick = parseInt(draftPick.trim(), 10)

    if (isNaN(parsedN) || parsedN < 2 || parsedN > 20) {
      setError('n must be between 2 and 20.'); return
    }
    if (isNaN(parsedPick) || parsedPick < 1 || parsedPick > parsedN) {
      setError(`Picked number must be between 1 and ${parsedN}.`); return
    }

    setError(null)
    setN(parsedN)
    setPicked(parsedPick)
    setTimeout(() => reset(), 0)
  }

  function applyPreset(nVal, pickVal) {
    setDraftN(String(nVal))
    setDraftPick(String(pickVal))
    setError(null)
  }

  const { type, left, right, mid, result } = step
  const isFound = type === 'found'
  const stepKey = runner.index

  const showL = type !== 'init'
  const showR = type !== 'init'
  const showM = mid >= 0 && type !== 'init'

  const trackWidth = n * STRIDE - CELL_GAP

  return (
    <div className="space-y-4">

      <VizHeader
        title="Guess Number Higher or Lower"
        subtitle={<>
          A secret number hides in [1..n]. Each{' '}
          <span className="text-blue-400 font-mono">guess(mid)</span> returns −1 (too high),
          1 (too low), or 0 (correct). Binary search finds it in O(log n) calls.
        </>}
        aside={
          <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
            <Legend items={[['#3b82f6', 'Guessing (mid)'], ['#475569', 'Active'], ['#1e293b', 'Eliminated'], ['#10b981', 'Found!']]} />
          </div>
        }
      />

      {/* Input */}
      <InputPanel
        title="Try your own values"
        fields={[
          { label: 'n (range 1..n)', value: draftN, onChange: setDraftN, placeholder: '10', grow: false },
          { label: 'Secret number (1..n)', value: draftPick, onChange: setDraftPick, placeholder: '7', width: 'w-36' },
        ]}
        onRun={handleRun}
        error={error}
        examplesLabel="Presets"
        examples={[
          { label: 'n=10, pick=7', onClick: () => applyPreset(10, 7) },
          { label: 'n=10, pick=1 (leftmost)', onClick: () => applyPreset(10, 1) },
          { label: 'n=10, pick=10 (rightmost)', onClick: () => applyPreset(10, 10) },
          { label: 'n=20, pick=13', onClick: () => applyPreset(20, 13) },
        ]}
      />

      {/* Number hall */}
      <div className="rounded-2xl border border-white/10 bg-[#070d1f] px-5 pt-6 pb-5 space-y-5">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Number Hall — 1 to {n}
          </p>
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="text-slate-500">secret</span>
            <motion.span
              key={picked}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 18 }}
              className="rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-200 px-3 py-0.5 font-black text-sm"
            >
              {picked}
            </motion.span>
            {type !== 'init' && (
              <div className="flex gap-3">
                {[
                  { lbl: 'L', val: left,  color: 'text-blue-400' },
                  { lbl: 'R', val: right, color: 'text-pink-400' },
                  ...(showM ? [{ lbl: 'M', val: mid, color: 'text-white' }] : []),
                ].map(({ lbl, val, color }) => (
                  <span key={lbl}>
                    <span className="text-slate-600">{lbl}=</span>
                    <motion.span
                      key={val}
                      initial={{ y: -6, opacity: 0 }}
                      animate={{ y: 0,  opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                      className={`${color} font-bold`}
                    >
                      {val}
                    </motion.span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tile row */}
        <div className="overflow-x-auto pb-2">
          <div style={{ minWidth: trackWidth + 40, paddingTop: 36, paddingBottom: 4 }}>

            {/* Wall + tile layer */}
            <div className="relative" style={{ height: CELL_H, width: trackWidth }}>
              {showL && <WallMarker label="L" pos={left}  color="#3b82f6" />}
              {showR && <WallMarker label="R" pos={right} color="#ec4899" />}
              {showM && <WallMarker key={`M-${mid}`} label="M" pos={mid} color="#ffffff" />}

              <div className="absolute inset-0 flex" style={{ gap: CELL_GAP }}>
                {Array.from({ length: n }, (_, i) => i + 1).map((num) => (
                  <DoorTile
                    key={num}
                    num={num}
                    state={getTileState(num, step)}
                    animKey={`${stepKey}-${num}`}
                  />
                ))}
              </div>
            </div>

            {/* Number labels */}
            <div className="flex mt-2" style={{ gap: CELL_GAP }}>
              {Array.from({ length: n }, (_, i) => i + 1).map((num) => (
                <div key={num} style={{ width: CELL_W }} className="text-center text-[10px] font-mono text-slate-600">
                  {num}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* API response badge */}
      <AnimatePresence mode="wait">
        {['guess', 'too-high', 'too-low', 'found'].includes(type) && (
          <ApiResponseBadge key={`api-${stepKey}`} step={step} animKey={stepKey} />
        )}
      </AnimatePresence>

      {/* Result banner */}
      <AnimatePresence>
        {isFound && (
          <motion.div
            initial={{ opacity: 0, scale: 0.82, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 18 }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 flex items-center gap-4"
          >
            <motion.div
              animate={{ scale: [1, 1.45, 1.1, 1], rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.65, delay: 0.12 }}
              className="text-4xl text-emerald-300"
            >
              ✓
            </motion.div>
            <div>
              <p className="text-emerald-200 font-bold">
                Found! The secret number is{' '}
                <span className="font-black text-emerald-100 text-lg">{result}</span>
              </p>
              <p className="text-slate-400 text-xs mt-0.5 font-mono">
                guess({result}) = 0  →  return {result}
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
