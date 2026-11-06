import { useMemo, useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildBaseballGameSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { InputPanel, StepMessage, VizHeader } from '../../../components/ui/VisualizerKit'

const DEFAULT_OPS = ['5', '2', 'C', 'D', '+']

// ── Card source styles ────────────────────────────────────────────────────────

const SOURCE = {
  num: {
    card:     'bg-white/95 border-slate-200/60',
    text:     'text-slate-800',
    label:    'Score',
    labelCls: 'text-slate-400',
    dot:      'bg-blue-500',
    glow:     'rgba(59,130,246,0.35)',
    badge:    'bg-blue-600 text-white',
    badgeTxt: (v) => `+${v}`,
  },
  double: {
    card:     'bg-amber-50/95 border-amber-300/60',
    text:     'text-amber-900',
    label:    '× 2',
    labelCls: 'text-amber-500',
    dot:      'bg-amber-500',
    glow:     'rgba(245,158,11,0.4)',
    badge:    'bg-amber-500 text-white',
    badgeTxt: (v) => `×2 = ${v}`,
  },
  plus: {
    card:     'bg-emerald-50/95 border-emerald-300/60',
    text:     'text-emerald-900',
    label:    'Sum',
    labelCls: 'text-emerald-500',
    dot:      'bg-emerald-500',
    glow:     'rgba(16,185,129,0.4)',
    badge:    'bg-emerald-600 text-white',
    badgeTxt: (v) => `= ${v}`,
  },
}

// ── Op chip ───────────────────────────────────────────────────────────────────

const OP_STYLE = {
  '+': { base: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10', active: 'border-emerald-400 text-white bg-emerald-500/60', ring: 'border-emerald-400/50' },
  'C': { base: 'border-rose-500/40    text-rose-300    bg-rose-500/10',    active: 'border-rose-400    text-white bg-rose-500/60',    ring: 'border-rose-400/50'    },
  'D': { base: 'border-amber-500/40   text-amber-300   bg-amber-500/10',   active: 'border-amber-400   text-white bg-amber-500/60',   ring: 'border-amber-400/50'   },
}

function OpChip({ op, active, done }) {
  const s = OP_STYLE[op] ?? {
    base:   'border-slate-600 text-slate-400 bg-slate-700/40',
    active: 'border-blue-400 text-white bg-blue-500/60',
    ring:   'border-blue-400/50',
  }
  return (
    <motion.div
      animate={
        active && op === 'C'
          ? { x: [0, -7, 7, -5, 5, -3, 3, 0], transition: { duration: 0.45 } }
          : active && op === '+'
          ? { scale: [1, 1.18, 1.08], y: [0, -3, 0], transition: { duration: 0.35 } }
          : active
          ? { scale: [1, 1.12, 1.08], transition: { duration: 0.28 } }
          : {}
      }
      className={`relative rounded-xl border-2 min-w-[46px] px-3.5 py-2.5
        text-center text-sm font-bold font-mono select-none transition-colors duration-200
        ${active ? s.active : done ? 'border-slate-700/30 text-slate-600 bg-slate-800/20' : s.base}`}
    >
      {active && (
        <motion.div
          animate={{ scale: [1, 1.75], opacity: [0.6, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeOut' }}
          className={`absolute inset-0 rounded-xl border-2 pointer-events-none ${s.ring}`}
        />
      )}
      {op}
    </motion.div>
  )
}

// ── Physical scorecard ────────────────────────────────────────────────────────
// Drop-in (squash-bounce), crumple-off on cancel, light card on dark panel.

function StackCard({ item, isTop, runnerIndex }) {
  const src = SOURCE[item.source] ?? SOURCE.num
  return (
    <motion.div
      layout
      initial={{ y: -110, scaleY: 0.7, scaleX: 0.85, rotate: -6, opacity: 0 }}
      animate={{ y: 0,    scaleY: 1,   scaleX: 1,    rotate: 0,  opacity: 1 }}
      exit={{
        scaleX: 0.08, scaleY: 0.08,
        rotate: 45, x: 28, y: -60,
        opacity: 0,
        transition: { duration: 0.32, ease: [0.5, 0, 1, 0.6] },
      }}
      transition={{
        y:      { type: 'spring', stiffness: 520, damping: 28 },
        scaleY: { type: 'spring', stiffness: 420, damping: 14 },
        scaleX: { type: 'spring', stiffness: 420, damping: 22 },
        rotate: { type: 'spring', stiffness: 400, damping: 22 },
        opacity:{ duration: 0.1 },
      }}
      className={`relative rounded-2xl border-2 px-5 py-3.5 select-none ${src.card} shadow-xl`}
      style={{
        boxShadow: isTop
          ? `0 12px 36px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), 0 0 28px -4px ${src.glow}`
          : '0 4px 12px -4px rgba(0,0,0,0.4)',
      }}
    >
      {/* Landing impact ripple */}
      {isTop && (
        <motion.div
          key={`${item.id}-${runnerIndex}-impact`}
          initial={{ scaleX: 2.6, scaleY: 0.6, opacity: 0.55 }}
          animate={{ scaleX: 1,   scaleY: 0,   opacity: 0    }}
          transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-full h-4
            bg-black/25 rounded-full blur-lg pointer-events-none"
        />
      )}

      <div className="flex items-center justify-between gap-6">
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${src.labelCls}`}>{src.label}</p>
          <p className={`text-3xl font-black leading-none ${src.text}`}>{item.value}</p>
        </div>
        {isTop && (
          <div className="flex flex-col items-center gap-1.5">
            <span className={`text-[9px] font-bold uppercase tracking-widest ${src.labelCls}`}>TOP</span>
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              className={`w-2.5 h-2.5 rounded-full ${src.dot}`}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Floating badge (delta or cancel amount) ───────────────────────────────────

function FloatingBadge({ step, runnerIndex }) {
  const isPush   = step.type === 'num' || step.type === 'double' || step.type === 'plus'
  const isCancel = step.type === 'cancel'
  if (!isPush && !isCancel) return null

  const src  = isPush ? (SOURCE[step.type] ?? SOURCE.num) : null
  const cls  = isPush ? src.badge : 'bg-rose-600 text-white'
  const text = isPush ? src.badgeTxt(step.newValue) : `− ${step.removedValue}`

  return (
    <AnimatePresence>
      <motion.div
        key={runnerIndex}
        initial={{ opacity: 1, y: 0, scale: 0.8 }}
        animate={{ opacity: 0, y: -48, scale: 1.05 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className={`absolute top-0 left-1/2 -translate-x-1/2 z-10
          rounded-full px-3 py-1 text-xs font-bold shadow-lg pointer-events-none ${cls}`}
      >
        {text}
      </motion.div>
    </AnimatePresence>
  )
}

// ── Plus equation badge — floats briefly above the stack on "+" steps ─────────
// Shows "A + B = C" from the two cards that were combined.

function PlusBadge({ step, runnerIndex }) {
  if (step.type !== 'plus') return null
  const stack = step.stack
  // After push: new card at top (length-1), addends at length-2 and length-3
  const addendA = stack[stack.length - 2]?.value
  const addendB = stack[stack.length - 3]?.value
  if (addendA === undefined || addendB === undefined) return null

  return (
    <AnimatePresence>
      <motion.div
        key={`plus-${runnerIndex}`}
        initial={{ opacity: 0, y: 12, scale: 0.75 }}
        animate={{ opacity: [0, 1, 1, 0], y: [12, 0, 0, -28], scale: [0.75, 1, 1, 0.9] }}
        transition={{ duration: 0.95, times: [0, 0.2, 0.65, 1] }}
        className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
      >
        <div className="bg-emerald-700/90 border border-emerald-400/60 text-emerald-100
          text-[11px] font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
          {addendB} + {addendA} = {step.newValue}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Stack depth ghosts ────────────────────────────────────────────────────────

function DepthGhosts({ count }) {
  if (count < 2) return null
  return (
    <>
      <div className="absolute inset-x-4 top-2 bottom-0 rounded-2xl bg-white/8 border border-white/8 -z-10" />
      {count >= 3 && (
        <div className="absolute inset-x-8 top-4 bottom-0 rounded-2xl bg-white/5 border border-white/5 -z-20" />
      )}
    </>
  )
}

// ── Count-up hook ──────────────────────────────────────────────────────────────

function useCountUp(target, active) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!active) return
    let startTime = null
    const duration = Math.min(900, Math.max(300, Math.abs(target) * 30))

    function tick(ts) {
      if (!startTime) startTime = ts
      const t = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(target * eased))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, active])

  return active ? display : 0
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function BaseballGameVisualizer({ onStepChange }) {
  const [ops,      setOps]      = useState(DEFAULT_OPS)
  const [draftOps, setDraftOps] = useState(DEFAULT_OPS.join(', '))
  const [error,    setError]    = useState(null)

  const steps  = useMemo(() => buildBaseballGameSteps(ops), [ops])
  const runner = useStepRunner(steps)
  const { step, index: runnerIndex, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function handleRun() {
    const parts = draftOps.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length === 0 || parts.length > 12) { setError('Enter 1–12 operations.'); return }
    for (const p of parts) {
      if (p !== '+' && p !== 'C' && p !== 'D' && !/^-?\d+$/.test(p)) {
        setError(`"${p}" is not valid. Use integers, "+", "C", or "D".`); return
      }
    }
    setError(null)
    setOps(parts)
    setTimeout(() => reset(), 0)
  }

  const isSum   = step.type === 'sum'
  const stack   = step.stack
  const allDone = isSum

  const displayTotal = useCountUp(step.total ?? 0, isSum)

  return (
    <div className="space-y-4">
      <VizHeader
        title="Baseball Game"
        subtitle="Scorecards on a table — drop a card, double it, sum the top two, or crumple the top."
      />

      {/* Input */}
      <InputPanel
        title="Try your own operations"
        fields={[
          { label: 'Comma-separated (integers, +, C, D)', value: draftOps, onChange: setDraftOps, placeholder: 'e.g. 5, 2, C, D, +' },
        ]}
        onRun={handleRun}
        error={error}
        examples={[
          { label: '5,2,C,D,+', onClick: () => { setDraftOps('5, 2, C, D, +');          setError(null) } },
          { label: '5,-2,4,C,D,9,+,+', onClick: () => { setDraftOps('5, -2, 4, C, D, 9, +, +'); setError(null) } },
          { label: '1,C', onClick: () => { setDraftOps('1, C');                    setError(null) } },
        ]}
      />

      {/* Main panel */}
      <div className="rounded-2xl border border-white/10 bg-[#070d1f] px-5 pt-5 pb-4 space-y-5">

        {/* Operations row */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
            Operations
          </p>
          <div className="flex flex-wrap gap-2">
            {ops.map((op, i) => (
              <OpChip
                key={i}
                op={op}
                active={i === step.opIndex}
                done={allDone || (step.opIndex > -1 && i < step.opIndex)}
              />
            ))}
          </div>
        </div>

        {/* Scorecard stack */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Scorecard stack
            </p>
            <span className="text-[11px] font-mono text-slate-500">
              {stack.length} card{stack.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="relative">
            <FloatingBadge step={step} runnerIndex={runnerIndex} />
            <PlusBadge step={step} runnerIndex={runnerIndex} />

            <div className="relative flex flex-col gap-2 min-h-[72px]">
              {stack.length === 0 ? (
                <div className="flex items-center justify-center h-[72px] rounded-2xl border border-dashed border-slate-700/60 text-slate-600 text-sm">
                  empty
                </div>
              ) : (
                <>
                  <DepthGhosts count={stack.length} />
                  <AnimatePresence initial={false}>
                    {[...stack].reverse().map((item, idx) => (
                      <StackCard
                        key={item.id}
                        item={item}
                        isTop={idx === 0}
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

      {/* Total banner with count-up */}
      <AnimatePresence>
        {isSum && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1,   y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 flex items-center gap-4"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Final Score</p>
              <motion.span
                className="text-4xl font-black font-mono text-emerald-200 tabular-nums"
                initial={{ scale: 0.5 }}
                animate={{ scale: [0.5, 1.12, 1] }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              >
                {displayTotal}
              </motion.span>
            </div>
            <div className="text-xs font-mono text-slate-500">
              {stack.map((s) => s.value).join(' + ')} = {step.total}
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
