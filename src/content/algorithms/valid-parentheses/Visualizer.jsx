import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildValidParenthesesSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { InputPanel, StepMessage, VizHeader } from '../../../components/ui/VisualizerKit'

const DEFAULT_S = '()[]{}'

// ── Bracket colour tokens ─────────────────────────────────────────────────────

const BRACKET = {
  '(': {
    strip:    'bg-sky-400',
    bg:       'bg-sky-50/98',
    border:   'border-sky-300/70',
    text:     'text-sky-900',
    dot:      'bg-sky-500',
    glow:     'rgba(14,165,233,0.45)',
    chipBase: 'bg-sky-500/10 border-sky-500/40 text-sky-300',
    chipGlow: 'bg-sky-500/55 border-sky-400   text-white',
    ring:     'border-sky-400/60',
  },
  '[': {
    strip:    'bg-amber-400',
    bg:       'bg-amber-50/98',
    border:   'border-amber-300/70',
    text:     'text-amber-900',
    dot:      'bg-amber-500',
    glow:     'rgba(245,158,11,0.45)',
    chipBase: 'bg-amber-500/10 border-amber-500/40 text-amber-300',
    chipGlow: 'bg-amber-500/55 border-amber-400   text-white',
    ring:     'border-amber-400/60',
  },
  '{': {
    strip:    'bg-blue-400',
    bg:       'bg-blue-50/98',
    border:   'border-blue-300/70',
    text:     'text-blue-900',
    dot:      'bg-blue-500',
    glow:     'rgba(59,130,246,0.45)',
    chipBase: 'bg-blue-500/10 border-blue-500/40 text-blue-300',
    chipGlow: 'bg-blue-500/55 border-blue-400   text-white',
    ring:     'border-blue-400/60',
  },
}
const CLOSE_MAP = { ')': '(', ']': '[', '}': '{' }
const bStyle = (c) => BRACKET[c] ?? BRACKET[CLOSE_MAP[c]] ?? BRACKET['(']

// ── Ticket stub card ──────────────────────────────────────────────────────────
// Looks like a physical stub: colour strip + perforation holes on the left.
// Entrance: tossed from high, squash on landing.
// Match exit: pops upward — snatched away.
// Mismatch: shakes hard + turns rose-red.

function TicketCard({ item, state, runnerIndex }) {
  const s          = bStyle(item.char)
  const isMismatch = state === 'mismatch'
  const isUnclosed = state === 'unclosed'
  const isTop      = state === 'top' || isMismatch

  const bgCls     = (isMismatch || isUnclosed) ? 'bg-rose-50/98'  : s.bg
  const borderCls = (isMismatch || isUnclosed) ? 'border-rose-300/70' : s.border
  const stripCls  = (isMismatch || isUnclosed) ? 'bg-rose-400'    : s.strip
  const textCls   = (isMismatch || isUnclosed) ? 'text-rose-800'  : s.text

  return (
    <motion.div
      layout
      // Entrance: tossed from above, slight tilt, underdamped scaleY for squash
      initial={{ y: -120, scaleY: 0.6, scaleX: 0.75, rotate: -7, opacity: 0 }}
      animate={{
        y: 0, scaleY: 1, scaleX: 1, rotate: 0, opacity: 1,
        x: (isMismatch || isUnclosed) ? [0, -11, 11, -9, 9, -6, 6, -3, 3, 0] : 0,
      }}
      exit={{
        // Match: pops up — snatched away like an accepted stub
        scale: [1, 1.35, 0.05],
        y:     [0, -28, -10],
        rotate:[0, 10, -20],
        opacity: [1, 1, 0],
        transition: { duration: 0.42, times: [0, 0.22, 1], ease: 'easeIn' },
      }}
      transition={{
        y:      { type: 'spring', stiffness: 510, damping: 27 },
        scaleY: { type: 'spring', stiffness: 390, damping: 12 },
        scaleX: { type: 'spring', stiffness: 390, damping: 20 },
        rotate: { type: 'spring', stiffness: 370, damping: 20 },
        opacity:{ duration: 0.1 },
        x:      { duration: 0.5, ease: 'easeInOut' },
      }}
      className={`relative rounded-2xl border-2 overflow-hidden select-none shadow-xl ${bgCls} ${borderCls}`}
      style={{
        boxShadow: isTop
          ? `0 12px 36px -8px rgba(0,0,0,0.5), 0 0 28px -4px ${isMismatch ? 'rgba(239,68,68,0.5)' : s.glow}`
          : '0 4px 14px -4px rgba(0,0,0,0.35)',
      }}
    >
      {/* Landing impact shadow */}
      {isTop && !isMismatch && !isUnclosed && (
        <motion.div
          key={`${item.id}-${runnerIndex}-land`}
          initial={{ scaleX: 2.8, scaleY: 0.55, opacity: 0.55 }}
          animate={{ scaleX: 1,   scaleY: 0,    opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.07 }}
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-full h-4
            bg-black/20 rounded-full blur-xl pointer-events-none"
        />
      )}

      {/* Left colour strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${stripCls}`} />

      {/* Perforation holes */}
      <div className="absolute left-3.5 top-0 bottom-0 flex flex-col justify-around py-2.5 pointer-events-none">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-black/10" />
        ))}
      </div>

      {/* Card body */}
      <div className="ml-9 px-4 py-3.5 flex items-center justify-between gap-5">
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${textCls} opacity-50`}>
            {isMismatch ? 'Mismatch!' : isUnclosed ? 'Unclosed' : 'Gate stub'}
          </p>
          <p className={`text-3xl font-black leading-none font-mono ${textCls}`}>
            {item.char}
          </p>
        </div>

        {isTop && !isMismatch && !isUnclosed && (
          <div className="flex flex-col items-center gap-1.5">
            <span className={`text-[9px] font-bold uppercase tracking-widest ${textCls} opacity-40`}>
              TOP
            </span>
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className={`w-2.5 h-2.5 rounded-full ${s.dot}`}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Input gate chip ───────────────────────────────────────────────────────────
// The "gate" the walker passes through. Coloured by bracket type.
// Active states trigger distinct animations.

function GateChip({ char, state, runnerIndex }) {
  const s      = bStyle(char)
  const isBad  = state === 'active-mismatch' || state === 'active-orphan'
  const isGood = state === 'active-match'
  const isPush = state === 'active-push'
  const isActive = isBad || isGood || isPush

  return (
    <motion.div
      animate={
        isBad
          ? { x: [0, -6, 6, -5, 5, -3, 3, 0], scale: [1, 1.05, 1], transition: { duration: 0.4 } }
          : (isPush || isGood)
          ? { scale: [1, 1.22, 1.1], transition: { duration: 0.28 } }
          : {}
      }
      className={`relative rounded-xl border-2 w-10 h-10 flex items-center justify-center
        text-base font-black font-mono select-none transition-colors duration-200
        ${isBad  ? 'bg-rose-500/55    border-rose-400   text-white shadow-lg shadow-rose-500/30' :
          isGood ? 'bg-emerald-500/55 border-emerald-400 text-white shadow-lg shadow-emerald-500/30' :
          isPush ? s.chipGlow + ' shadow-lg' :
          state === 'done' ? 'border-slate-700/30 text-slate-600 bg-slate-800/20' :
          s.chipBase
        }`}
    >
      {char}

      {/* Scanner sweep line — slides down over active chip */}
      {isActive && (
        <motion.div
          key={`${runnerIndex}-scan`}
          initial={{ scaleY: 0, opacity: 0.7 }}
          animate={{ scaleY: [0, 1, 1, 0.3], opacity: [0.7, 0.5, 0.5, 0] }}
          transition={{ duration: 0.45, times: [0, 0.3, 0.7, 1], ease: 'easeInOut' }}
          className="absolute inset-0 rounded-xl bg-white/40 pointer-events-none"
          style={{ transformOrigin: 'top' }}
        />
      )}

      {/* Pulsing ring */}
      {(isPush || isGood) && (
        <motion.div
          key={`${runnerIndex}-ring`}
          animate={{ scale: [1, 1.9], opacity: [0.55, 0] }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className={`absolute inset-0 rounded-xl border-2 pointer-events-none ${s.ring}`}
        />
      )}

      {/* Status badge */}
      {isBad && (
        <motion.div
          key={`${runnerIndex}-x`}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: [0.3, 1.3, 1], opacity: [0, 1, 1] }}
          transition={{ duration: 0.35, times: [0, 0.5, 1] }}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600
            flex items-center justify-center text-[9px] font-black text-white pointer-events-none"
        >
          ✕
        </motion.div>
      )}
      {isGood && (
        <motion.div
          key={`${runnerIndex}-ok`}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: [0.3, 1.3, 1], opacity: [0, 1, 1] }}
          transition={{ duration: 0.35, times: [0, 0.5, 1] }}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-600
            flex items-center justify-center text-[9px] font-black text-white pointer-events-none"
        >
          ✓
        </motion.div>
      )}
    </motion.div>
  )
}

// ── Match stamp overlay (sits at top-of-stack while the accepted stub pops away) ──

function MatchStamp({ step, runnerIndex }) {
  if (step.type !== 'match') return null
  return (
    <motion.div
      key={runnerIndex}
      initial={{ opacity: 0, scale: 0.45, rotate: -18 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.45, 1.1, 1.05, 0.85], rotate: [-18, -12, -12, -10] }}
      transition={{ duration: 0.65, times: [0, 0.18, 0.7, 1] }}
      className="absolute top-2 left-0 right-0 flex justify-center z-20 pointer-events-none"
    >
      <span className="inline-block border-4 border-emerald-500/80 text-emerald-600 font-black
        text-sm tracking-widest px-3 py-1 rounded-lg uppercase -rotate-12 bg-white/80 shadow-lg">
        ACCEPTED ✓
      </span>
    </motion.div>
  )
}

// ── Rejection overlay ──────────────────────────────────────────────────────────

function RejectStamp({ step, runnerIndex }) {
  if (step.type !== 'mismatch' && step.type !== 'orphan') return null
  return (
    <motion.div
      key={runnerIndex}
      initial={{ opacity: 0, scale: 0.45, rotate: 18 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.45, 1.1, 1.05, 0.9], rotate: [18, 12, 12, 10] }}
      transition={{ duration: 0.65, times: [0, 0.18, 0.7, 1] }}
      className="absolute top-2 left-0 right-0 flex justify-center z-20 pointer-events-none"
    >
      <span className="inline-block border-4 border-rose-500/80 text-rose-600 font-black
        text-sm tracking-widest px-3 py-1 rounded-lg uppercase rotate-12 bg-white/80 shadow-lg">
        REJECTED ✗
      </span>
    </motion.div>
  )
}

// ── Stack depth ghosts ─────────────────────────────────────────────────────────

function DepthGhosts({ count }) {
  if (count < 2) return null
  return (
    <>
      <div className="absolute inset-x-4 top-2 bottom-0 rounded-2xl bg-white/7 border border-white/8 -z-10" />
      {count >= 3 && (
        <div className="absolute inset-x-8 top-4 bottom-0 rounded-2xl bg-white/4 border border-white/5 -z-20" />
      )}
    </>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCharState(idx, step) {
  const { type, charIndex, cause } = step
  if (type === 'init') return 'pending'
  if (type === 'valid' || (type === 'invalid' && cause === 'unclosed')) return 'done'
  if (charIndex === -1) return 'done'
  if (idx < charIndex) return 'done'
  if (idx > charIndex) return 'pending'
  if (type === 'push')     return 'active-push'
  if (type === 'match')    return 'active-match'
  if (type === 'mismatch' || (type === 'invalid' && cause === 'mismatch')) return 'active-mismatch'
  if (type === 'orphan'   || (type === 'invalid' && cause === 'orphan'))   return 'active-orphan'
  return 'done'
}

function getCardState(item, idx, step) {
  const { type, cause, topId } = step
  if (type === 'mismatch' && item.id === topId)                            return 'mismatch'
  if (type === 'invalid'  && cause === 'mismatch' && item.id === topId)    return 'mismatch'
  if (type === 'invalid'  && cause === 'unclosed')                         return 'unclosed'
  if (idx === 0)                                                            return 'top'
  return 'normal'
}
// ── Main component ─────────────────────────────────────────────────────────────

export default function ValidParenthesesVisualizer({ onStepChange }) {
  const [input, setInput] = useState(DEFAULT_S)
  const [draft, setDraft] = useState(DEFAULT_S)
  const [error, setError] = useState(null)

  const steps  = useMemo(() => buildValidParenthesesSteps(input), [input])
  const runner = useStepRunner(steps)
  const { step, index: runnerIndex, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function handleRun() {
    const t = draft.trim()
    if (!t || t.length > 20)           { setError('Enter 1–20 characters.'); return }
    if (!/^[()[\]{}]+$/.test(t))       { setError('Only ( ) [ ] { } allowed.'); return }
    setError(null)
    setInput(t)
    setTimeout(() => reset(), 0)
  }

  const isValid   = step.type === 'valid'
  const isInvalid = step.type === 'invalid'
  const stack     = step.stack
  const chars     = input.split('')

  return (
    <div className="space-y-4">

      <VizHeader
        title="Valid Parentheses"
        subtitle="Stub-checker at nested gates — present the matching stub or get rejected."
      />

      {/* Input */}
      <InputPanel
        title="Try your own string"
        fields={[
          { label: `Brackets only — ( ) [ ] ${'{ }'}`, value: draft, onChange: setDraft, placeholder: 'e.g. ()[]{}' },
        ]}
        onRun={handleRun}
        error={error}
        examples={[
          { label: '()[]{}', onClick: () => { setDraft('()[]{}');   setError(null) } },
          { label: '([{}])', onClick: () => { setDraft('([{}])');   setError(null) } },
          { label: '(]', onClick: () => { setDraft('(]');       setError(null) } },
          { label: '{[}]', onClick: () => { setDraft('{[}]');     setError(null) } },
          { label: '(((', onClick: () => { setDraft('(((');      setError(null) } },
        ]}
      />

      {/* Main panel */}
      <div className="rounded-2xl border border-white/10 bg-[#070d1f] px-5 pt-5 pb-4 space-y-5">

        {/* Gates (input string) */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
            Gates
          </p>
          <div className="flex flex-wrap gap-1.5">
            {chars.map((c, i) => (
              <GateChip
                key={i}
                char={c}
                state={getCharState(i, step)}
                runnerIndex={runnerIndex}
              />
            ))}
          </div>
        </div>

        {/* Stub stack */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Stub stack
            </p>
            <span className="text-[11px] font-mono text-slate-500">
              {stack.length} stub{stack.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="relative">
            {/* Stamp overlays */}
            <MatchStamp  step={step} runnerIndex={runnerIndex} />
            <RejectStamp step={step} runnerIndex={runnerIndex} />

            <div className="relative flex flex-col gap-2 min-h-[72px]">
              {stack.length === 0 ? (
                <div className={`flex items-center justify-center h-[72px] rounded-2xl border border-dashed text-sm font-medium transition-colors
                  ${isValid
                    ? 'border-emerald-500/50 text-emerald-400'
                    : 'border-slate-700/50 text-slate-600'
                  }`}>
                  {isValid ? '✓ empty — all stubs matched' : 'empty'}
                </div>
              ) : (
                <>
                  <DepthGhosts count={stack.length} />
                  <AnimatePresence initial={false}>
                    {[...stack].reverse().map((item, idx) => (
                      <TicketCard
                        key={item.id}
                        item={item}
                        state={getCardState(item, idx, step)}
                        runnerIndex={runnerIndex}
                      />
                    ))}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Result banner */}
      <AnimatePresence>
        {(isValid || isInvalid) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 14 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            className={`relative overflow-hidden rounded-xl border px-5 py-4 flex items-center gap-4
              ${isValid
                ? 'border-emerald-500/40 bg-emerald-500/10'
                : 'border-rose-500/40    bg-rose-500/10'
              }`}
          >
            {/* Celebration ripples on valid */}
            {isValid && [0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-xl border-2 border-emerald-400/50 pointer-events-none"
                initial={{ scale: 0.85, opacity: 0.7 }}
                animate={{ scale: 1.8 + i * 0.3, opacity: 0 }}
                transition={{ duration: 1.0, delay: i * 0.28, ease: 'easeOut' }}
              />
            ))}

            <motion.span
              initial={{ scale: 0.2, rotate: isValid ? -40 : 40 }}
              animate={{ scale: [0.2, 1.4, 1], rotate: 0 }}
              transition={{ type: 'spring', stiffness: 520, damping: 18 }}
              className={`text-4xl font-black relative z-10 ${isValid ? 'text-emerald-300' : 'text-rose-300'}`}
            >
              {isValid ? '✓' : '✗'}
            </motion.span>
            <div className="relative z-10">
              <p className={`text-sm font-bold ${isValid ? 'text-emerald-300' : 'text-rose-300'}`}>
                {isValid ? 'Valid — all gates cleared!' : 'Invalid'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{step.message}</p>
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
