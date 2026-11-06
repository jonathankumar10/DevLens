import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildContainsDuplicateSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { InputPanel, Legend, StepMessage, VizHeader } from '../../../components/ui/VisualizerKit'

const DEFAULT_NUMS = [3, 1, 4, 1, 5]

// ── Coin geometry ─────────────────────────────────────────────────────────────

const CX      = 31
const COIN_RX = 26
const COIN_RY = 8
const DEPTH   = 5
const COIN_H  = 12
const BASE_Y  = 143
const SVG_W   = 62
const SVG_H   = 158

const COIN_COLORS = {
  idle:      { face: '#fbbf24', side: '#92400e', rim: '#b45309', shine: '#fef3c7', text: '#1c0a00' },
  checking:  { face: '#fde68a', side: '#78350f', rim: '#fbbf24', shine: '#fffbeb', text: '#1c0a00' },
  seen:      { face: '#818cf8', side: '#312e81', rim: '#6366f1', shine: '#e0e7ff', text: '#eef2ff' },
  duplicate: { face: '#f87171', side: '#7f1d1d', rim: '#ef4444', shine: '#fee2e2', text: '#fff1f2' },
}

// ── Coin stack ────────────────────────────────────────────────────────────────
// Duplicate: higher + wider bounce, rotate wobble, collision burst, MATCH badge.
// Checking: magnifying spotlight glow beneath.

function CoinStack({ value, status, idx }) {
  const colors  = COIN_COLORS[status] ?? COIN_COLORS.idle
  const count   = Math.min(Math.max(value, 1), 9)
  const coinYs  = Array.from({ length: count }, (_, i) => BASE_Y - i * COIN_H)
  const topY    = coinYs[count - 1]
  const isDup   = status === 'duplicate'
  const isCheck = status === 'checking'

  return (
    <motion.div
      className="relative flex flex-col items-center gap-1"
      animate={
        isDup
          ? { y: [0, -18, 0, -12, 0], rotate: [0, -4, 4, -3, 0], transition: { duration: 0.7, repeat: Infinity, repeatDelay: 0.15 } }
          : { y: 0, rotate: 0 }
      }
    >
      {/* MATCH! badge */}
      {isDup && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 6 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 600, damping: 18 }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-rose-600 text-white
            text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap z-10 shadow-lg shadow-rose-600/50"
        >
          MATCH!
        </motion.div>
      )}

      {/* Collision burst rings */}
      {isDup && [0, 1].map((i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none"
          style={{ width: SVG_W, height: SVG_W, left: 0, bottom: 8, borderRadius: '50%', border: '2px solid rgba(248,113,113,0.8)' }}
          initial={{ scale: 0.7, opacity: 0.9 }}
          animate={{ scale: 2.8, opacity: 0 }}
          transition={{ duration: 0.7, delay: i * 0.3, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}

      {/* Checking magnifier glow */}
      {isCheck && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: 20, left: '50%', transform: 'translateX(-50%)',
            width: 68, height: 60,
            background: 'radial-gradient(ellipse at 50% 100%, rgba(251,191,36,0.6) 0%, transparent 72%)',
            filter: 'blur(10px)',
          }}
        />
      )}

      {/* Checking scanner line */}
      {isCheck && (
        <motion.div
          className="absolute pointer-events-none bg-amber-300/30 rounded-full"
          style={{ width: SVG_W, height: 3, left: 0 }}
          animate={{ y: [BASE_Y, BASE_Y - count * COIN_H - 8, BASE_Y] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Duplicate radial glow */}
      {isDup && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            bottom: 20, left: '50%', transform: 'translateX(-50%)',
            width: 80, height: 68,
            background: 'radial-gradient(ellipse at 50% 100%, rgba(248,113,113,0.7) 0%, transparent 70%)',
            filter: 'blur(14px)',
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}

      <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
        {/* Phase 1: sides */}
        {coinYs.map((y, i) => (
          <ellipse key={`s${i}`} cx={CX} cy={y + DEPTH} rx={COIN_RX} ry={COIN_RY} fill={colors.side} />
        ))}
        {/* Phase 2: faces */}
        {coinYs.map((y, i) => (
          <g key={`f${i}`}>
            <ellipse cx={CX} cy={y} rx={COIN_RX} ry={COIN_RY} fill={colors.face} />
            <ellipse cx={CX} cy={y} rx={COIN_RX} ry={COIN_RY} fill="none" stroke={colors.rim} strokeWidth={0.8} opacity={0.65} />
            <ellipse cx={CX - 8} cy={y - 2.5} rx={8} ry={2.5} fill={colors.shine} opacity={0.5} />
          </g>
        ))}
        <text x={CX} y={topY + 4.5} textAnchor="middle" fontSize="11" fontWeight="800" fill={colors.text} className="select-none pointer-events-none">
          {value}
        </text>
      </svg>

      <span className="text-[10px] font-mono text-slate-600">[{idx}]</span>
    </motion.div>
  )
}

// ── Set coin ──────────────────────────────────────────────────────────────────
// Enters with a rotateY flip — like a coin tossed into a collection bowl.
// When it's the duplicate match, shakes hard and glows red.

function SetCoin({ value, isMatch }) {
  return (
    <motion.div
      initial={{ rotateY: 90, scale: 0.5, opacity: 0 }}
      animate={{
        rotateY: 0,
        scale: 1,
        opacity: 1,
        x: isMatch ? [0, -14, 14, -10, 10, -6, 6, 0] : 0,
      }}
      transition={{
        rotateY: { type: 'spring', stiffness: 340, damping: 22 },
        scale:   { type: 'spring', stiffness: 400, damping: 22 },
        opacity: { duration: 0.15 },
        x:       { duration: 0.55, ease: 'easeInOut' },
      }}
      style={{ perspective: 300 }}
      className="relative flex items-center justify-center flex-shrink-0"
      style2={{ width: 38, height: 38 }}
    >
      <div className="relative flex items-center justify-center" style={{ width: 38, height: 38 }}>
        {/* Match pulsing rings */}
        {isMatch && [0, 1].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 pointer-events-none"
            style={{ borderRadius: '50%', border: '2px solid rgba(248,113,113,0.9)' }}
            initial={{ scale: 0.8, opacity: 0.9 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.65, delay: i * 0.28, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}

        <svg width={38} height={38} viewBox="0 0 38 38">
          <ellipse cx={19} cy={22} rx={15} ry={6} fill={isMatch ? '#7f1d1d' : '#92400e'} />
          <ellipse cx={19} cy={17} rx={15} ry={8} fill={isMatch ? '#f87171' : '#fbbf24'} />
          <ellipse cx={19} cy={17} rx={15} ry={8} fill="none" stroke={isMatch ? '#ef4444' : '#d97706'} strokeWidth={1} opacity={0.7} />
          <ellipse cx={13} cy={13} rx={5} ry={2.5} fill="white" opacity={0.32} />
        </svg>
        <span
          className="absolute font-bold font-mono text-xs select-none"
          style={{ color: isMatch ? '#fee2e2' : '#1c0a00', top: 9, left: '50%', transform: 'translateX(-50%)' }}
        >
          {value}
        </span>
      </div>
    </motion.div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ContainsDuplicateVisualizer({ onStepChange }) {
  const [nums,      setNums]      = useState(DEFAULT_NUMS)
  const [draftNums, setDraftNums] = useState(DEFAULT_NUMS.join(', '))
  const [error,     setError]     = useState(null)

  const steps  = useMemo(() => buildContainsDuplicateSteps(nums), [nums])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function handleRun() {
    const parts  = draftNums.split(',').map((s) => s.trim()).filter(Boolean)
    const parsed = parts.map((s) => parseInt(s, 10))
    if (parts.length < 2 || parts.length > 9) { setError('Enter 2–9 numbers.'); return }
    if (parsed.some((n) => isNaN(n) || n < 1 || n > 9)) { setError('Values must be integers between 1 and 9.'); return }
    setError(null)
    setNums(parsed)
    setTimeout(() => reset(), 0)
  }

  function getStatus(i) {
    const { type, currentIndex, set, duplicateValue } = step
    if (type === 'duplicate' && nums[i] === duplicateValue) return 'duplicate'
    if (i === currentIndex && type === 'check')             return 'checking'
    if (set?.has(nums[i]))                                  return 'seen'
    return 'idle'
  }

  const isDone     = step.type === 'done' || step.type === 'duplicate'
  const resultTrue = step.result === true

  return (
    <div className="space-y-4">
      <VizHeader
        title="Contains Duplicate"
        subtitle="Coin piles — toss each height into the bowl; if it's already there, it's a match."
        aside={<Legend items={[['#fbbf24', 'Unchecked'], ['#fde68a', 'Checking'], ['#818cf8', 'In bowl'], ['#f87171', 'Duplicate!']]} />}
      />

      {/* Input */}
      <InputPanel
        title={<>Try your own values <span className="font-normal text-slate-600">(integers 1–9)</span></>}
        fields={[
          { label: 'Array (comma-separated)', value: draftNums, onChange: setDraftNums, placeholder: 'e.g. 3, 1, 4, 1, 5' },
        ]}
        onRun={handleRun}
        error={error}
        examples={[
          { label: 'has duplicate', onClick: () => { setDraftNums('3, 1, 4, 1, 5'); setError(null) } },
          { label: 'no duplicate', onClick: () => { setDraftNums('1, 2, 3, 4, 5'); setError(null) } },
          { label: 'longer array', onClick: () => { setDraftNums('5, 3, 1, 2, 4, 6, 7, 3'); setError(null) } },
        ]}
      />

      {/* Coin stacks */}
      <div className="rounded-2xl border border-white/10 bg-[#070d1f] px-4 pt-5 pb-3">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Coin piles</p>
        <div className="flex items-end justify-around gap-1 flex-wrap" style={{ minHeight: SVG_H + 24 }}>
          {nums.map((val, i) => (
            <CoinStack key={i} value={val} status={getStatus(i)} idx={i} />
          ))}
        </div>
      </div>

      {/* HashSet bowl */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Collection bowl <span className="text-slate-600 font-normal normal-case">— heights seen so far</span>
        </p>
        <p className="text-[10px] text-slate-600 mb-3 italic">Coins flip in as they're tossed — if it lands on one already there, it's a duplicate.</p>
        <div className="flex flex-wrap gap-3 min-h-10 items-center">
          {step.set?.size === 0 ? (
            <span className="text-xs text-slate-600 italic">empty bowl</span>
          ) : (
            [...(step.set ?? [])].map((val) => (
              <SetCoin
                key={val}
                value={val}
                isMatch={step.type === 'duplicate' && val === step.duplicateValue}
                runnerIndex={runner.index}
              />
            ))
          )}
        </div>
      </div>

      {/* Result banner */}
      <AnimatePresence>
        {isDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            className={`rounded-xl border px-5 py-4 flex items-center gap-4 ${
              resultTrue
                ? 'bg-rose-500/10 border-rose-500/30'
                : 'bg-emerald-500/10 border-emerald-500/30'
            }`}
          >
            <motion.span
              initial={{ scale: 0.3 }} animate={{ scale: [0.3, 1.3, 1] }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className={`text-3xl font-black font-mono ${resultTrue ? 'text-rose-300' : 'text-emerald-300'}`}
            >
              {resultTrue ? 'true' : 'false'}
            </motion.span>
            <span className="text-sm text-slate-400">
              {resultTrue
                ? `Pile height ${step.duplicateValue} appeared twice — duplicate found.`
                : 'All pile heights are unique.'}
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
