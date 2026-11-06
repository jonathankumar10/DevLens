import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildMinStackSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { InputPanel, StepMessage, VizHeader } from '../../../components/ui/VisualizerKit'

const DEFAULT_OPS = ['push -2', 'push 0', 'push -3', 'getMin', 'pop', 'top', 'getMin']

// ── Op chip styles ────────────────────────────────────────────────────────────

const OP_STYLE = {
  push:   { base: 'border-blue-500/40 text-blue-300 bg-blue-500/10', active: 'border-blue-400 text-white bg-blue-500/55', ring: 'border-blue-400/50' },
  pop:    { base: 'border-rose-500/40   text-rose-300   bg-rose-500/10',   active: 'border-rose-400   text-white bg-rose-500/55',   ring: 'border-rose-400/50'   },
  top:    { base: 'border-sky-500/40    text-sky-300    bg-sky-500/10',    active: 'border-sky-400    text-white bg-sky-500/55',    ring: 'border-sky-400/50'    },
  getmin: { base: 'border-teal-500/40  text-teal-300  bg-teal-500/10',   active: 'border-teal-400  text-white bg-teal-500/55',   ring: 'border-teal-400/50'   },
}

function opKey(op) {
  const l = op.toLowerCase()
  if (l.startsWith('push')) return 'push'
  if (l === 'pop')          return 'pop'
  if (l === 'top')          return 'top'
  return 'getmin'
}

function opLabel(op) {
  const l = op.toLowerCase()
  if (l.startsWith('push')) return `push(${l.split(/\s+/)[1]})`
  if (l === 'pop')    return 'pop()'
  if (l === 'top')    return 'top()'
  return 'getMin()'
}

function OpChip({ op, active, done }) {
  const key = opKey(op)
  const s   = OP_STYLE[key]
  return (
    <motion.div
      animate={
        active && key === 'pop'
          ? { x: [0, -6, 6, -5, 5, -3, 3, 0], transition: { duration: 0.45 } }
          : active
          ? { scale: [1, 1.12, 1.06], transition: { duration: 0.28 } }
          : {}
      }
      className={`relative rounded-xl border-2 px-3 py-2 text-xs font-bold font-mono
        select-none transition-colors duration-200 whitespace-nowrap
        ${active ? s.active : done ? 'border-slate-700/30 text-slate-600 bg-slate-800/20' : s.base}`}
    >
      {active && (
        <motion.div
          animate={{ scale: [1, 1.85], opacity: [0.6, 0] }}
          transition={{ duration: 0.85, repeat: Infinity, ease: 'easeOut' }}
          className={`absolute inset-0 rounded-xl border-2 pointer-events-none ${s.ring}`}
        />
      )}
      {opLabel(op)}
    </motion.div>
  )
}

// ── Box card ──────────────────────────────────────────────────────────────────
// Looks like a physical box on a shelf:
//   - Left colour strip (violet for main, teal for min, amber for new record)
//   - Bold value label
//   - Entry: drops from above with squash-bounce landing + shadow ripple
//   - Exit (pop): grabbed upward — scale up slightly, then fly off the top
//   - newRecord state: golden strip + pulsing trophy badge
//   - queried state: spotlight glow + radiating rings

const BOX = {
  main: {
    bg: 'bg-[#18102a]', strip: 'bg-blue-500',
    border: 'border-blue-700/50', borderTop: 'border-blue-500/70', borderQuery: 'border-blue-400',
    text: 'text-white', sublabel: 'text-blue-500',
    glow: 'rgba(59,130,246,0.6)', dot: 'bg-blue-400',
    ringCls: 'border-blue-400',
  },
  min: {
    bg: 'bg-[#091c1c]', strip: 'bg-teal-500',
    border: 'border-teal-800/50', borderTop: 'border-teal-500/70', borderQuery: 'border-teal-400',
    text: 'text-teal-50', sublabel: 'text-teal-500',
    glow: 'rgba(20,184,166,0.6)', dot: 'bg-teal-400',
    ringCls: 'border-teal-400',
  },
  newRecord: {
    bg: 'bg-[#1c1500]', strip: 'bg-amber-400',
    border: 'border-amber-500/60', borderTop: 'border-amber-400', borderQuery: 'border-amber-300',
    text: 'text-amber-50', sublabel: 'text-amber-500',
    glow: 'rgba(251,191,36,0.7)', dot: 'bg-amber-400',
    ringCls: 'border-amber-400',
  },
}

function ValueCard({ item, state, variant, runnerIndex }) {
  const isNewRecord = state === 'newRecord'
  const isQueried   = state === 'queried'
  const isTop       = state === 'top' || isQueried || isNewRecord

  const theme = isNewRecord ? BOX.newRecord : BOX[variant]
  const border = isQueried ? theme.borderQuery : isTop ? theme.borderTop : theme.border

  return (
    <motion.div
      layout
      // Entry: box dropped from above — falls fast, squash on landing (underdamped scaleY)
      initial={{ y: -100, scaleY: 0.55, scaleX: 0.8, rotate: variant === 'main' ? -4 : 4, opacity: 0 }}
      animate={{ y: 0, scaleY: 1, scaleX: 1, rotate: 0, opacity: 1 }}
      exit={{
        // Grabbed upward: brief scale-up (being lifted), then shoots off the top
        scaleY: [1, 1.12, 0.06],
        scaleX: [1, 1.06, 0.12],
        y:      [0, -18, -130],
        rotate: [0, variant === 'main' ? 12 : -12, variant === 'main' ? 30 : -30],
        opacity:[1, 1, 0],
        transition: { duration: 0.38, times: [0, 0.2, 1], ease: 'easeIn' },
      }}
      transition={{
        y:      { type: 'spring', stiffness: 540, damping: 24 },
        scaleY: { type: 'spring', stiffness: 400, damping: 11 }, // underdamped → bounce
        scaleX: { type: 'spring', stiffness: 400, damping: 20 },
        rotate: { type: 'spring', stiffness: 380, damping: 22 },
        opacity:{ duration: 0.08 },
      }}
      className={`relative rounded-2xl border-2 overflow-hidden select-none shadow-xl
        ${theme.bg} ${border}`}
      style={{
        boxShadow: isQueried || isNewRecord
          ? `0 0 32px -4px ${theme.glow}, 0 8px 28px -8px rgba(0,0,0,0.6)`
          : isTop
          ? '0 10px 28px -6px rgba(0,0,0,0.55)'
          : '0 3px 10px -3px rgba(0,0,0,0.45)',
      }}
    >
      {/* Landing shadow ripple — spreads out and collapses on arrival */}
      {isTop && (
        <motion.div
          key={`${item.id}-${runnerIndex}-ripple`}
          initial={{ scaleX: 2.8, scaleY: 0.6, opacity: 0.5 }}
          animate={{ scaleX: 1,   scaleY: 0,   opacity: 0   }}
          transition={{ duration: 0.5, delay: 0.06, ease: 'easeOut' }}
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-full h-4
            bg-black/25 rounded-full blur-xl pointer-events-none"
        />
      )}

      {/* Spotlight rings — pulse outward when queried */}
      {isQueried && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`${runnerIndex}-ring-${i}`}
              initial={{ scale: 0.85, opacity: 0.7 }}
              animate={{ scale: 2.2,  opacity: 0   }}
              transition={{ duration: 1.1, delay: i * 0.22, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.4 }}
              className={`absolute inset-0 rounded-2xl border-2 pointer-events-none ${theme.ringCls}`}
            />
          ))}
        </>
      )}

      {/* Left colour strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.strip}`} />

      {/* Perforation holes along the strip */}
      <div className="absolute left-3.5 top-0 bottom-0 flex flex-col justify-around py-2.5 pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-black/12" />
        ))}
      </div>

      {/* Card body */}
      <div className="ml-9 px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${theme.sublabel}`}>
            {isNewRecord ? 'New Record!' : variant === 'min' ? 'Record low' : 'Shelf slot'}
          </p>
          <p className={`text-2xl font-black leading-none font-mono ${theme.text}`}>
            {item.val}
          </p>
        </div>

        <div className="flex flex-col items-center gap-1.5 shrink-0">
          {isNewRecord && (
            <motion.div
              initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
              animate={{ scale: [0.3, 1.3, 1], rotate: [-20, 8, 0], opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              className="text-base"
            >
              ★
            </motion.div>
          )}
          {isTop && !isQueried && !isNewRecord && (
            <>
              <span className={`text-[8px] font-bold uppercase tracking-widest ${theme.sublabel}`}>
                TOP
              </span>
              <motion.div
                animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                className={`w-2 h-2 rounded-full ${theme.dot}`}
              />
            </>
          )}
          {isQueried && (
            <motion.span
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-[9px] font-black uppercase tracking-wider
                ${variant === 'min' ? 'text-teal-300' : 'text-sky-300'}`}
            >
              ← result
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── "Min unchanged" badge — floats up and fades when push skips min stack ─────

function MinUnchangedBadge({ step, runnerIndex }) {
  const show = step.type === 'push' && !step.pushedToMin
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={runnerIndex}
          initial={{ opacity: 1, y: 0, scale: 0.85 }}
          animate={{ opacity: 0, y: -36, scale: 1 }}
          exit={{}}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute top-0 left-1/2 -translate-x-1/2 z-10 pointer-events-none
            rounded-full px-3 py-1 text-[10px] font-bold
            bg-slate-700/80 border border-slate-600/50 text-slate-400 whitespace-nowrap"
        >
          unchanged
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Depth ghosts (stacked shelf silhouettes) ──────────────────────────────────

function DepthGhosts({ count, variant }) {
  if (count < 2) return null
  const g1 = variant === 'main' ? 'bg-blue-900/15 border-blue-700/15' : 'bg-teal-900/15 border-teal-700/15'
  const g2 = variant === 'main' ? 'bg-blue-900/8  border-blue-700/8'  : 'bg-teal-900/8  border-teal-700/8'
  return (
    <>
      <div className={`absolute inset-x-3 top-2 bottom-0 rounded-2xl border -z-10 ${g1}`} />
      {count >= 3 && (
        <div className={`absolute inset-x-6 top-4 bottom-0 rounded-2xl border -z-20 ${g2}`} />
      )}
    </>
  )
}

// ── Stack column ──────────────────────────────────────────────────────────────

function StackColumn({ label, sublabel, items, step, variant, runnerIndex }) {
  const isMain   = variant === 'main'
  const isMin    = variant === 'min'
  const reversed = [...items].reverse()

  function getState(item, idx) {
    if (isMain && step.type === 'top'    && idx === 0) return 'queried'
    if (isMin  && step.type === 'getmin' && idx === 0) return 'queried'
    if (isMin  && step.type === 'push'   && step.pushedToMin && idx === 0) return 'newRecord'
    if (idx === 0) return 'top'
    return 'normal'
  }

  const headerColor = isMain ? 'text-blue-400' : 'text-teal-400'
  const countColor  = isMain ? 'text-blue-700' : 'text-teal-800'
  const emptyBorder = isMain
    ? 'border-blue-800/30 text-blue-800'
    : 'border-teal-800/30 text-teal-900'

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <p className={`text-[11px] font-semibold uppercase tracking-wider ${headerColor}`}>
            {label}
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5">{sublabel}</p>
        </div>
        <span className={`text-[11px] font-mono ${countColor}`}>
          {items.length} box{items.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* Shelf surface */}
      <div className={`w-full h-px mb-1.5 ${isMain ? 'bg-blue-800/40' : 'bg-teal-800/40'}`} />

      <div className="relative flex flex-col gap-1.5 min-h-[76px]">
        {/* Min-unchanged badge floats above the min column */}
        {isMin && <MinUnchangedBadge step={step} runnerIndex={runnerIndex} />}

        {items.length === 0 ? (
          <div className={`flex items-center justify-center h-[76px] rounded-2xl border border-dashed text-xs ${emptyBorder}`}>
            empty shelf
          </div>
        ) : (
          <>
            <DepthGhosts count={items.length} variant={variant} />
            <AnimatePresence initial={false}>
              {reversed.map((item, idx) => (
                <ValueCard
                  key={item.id}
                  item={item}
                  state={getState(item, idx)}
                  variant={variant}
                  runnerIndex={runnerIndex}
                />
              ))}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  )
}

// ── Shelf divider between the two columns ─────────────────────────────────────

function ShelfDivider() {
  return (
    <div className="flex flex-col items-center justify-start pt-8 gap-1 opacity-20">
      <div className="w-px h-full min-h-[120px] bg-slate-600" />
    </div>
  )
}

// ── Helper ─────────────────────────────────────────────────────────────────────

// ── Main component ────────────────────────────────────────────────────────────

export default function MinStackVisualizer({ onStepChange }) {
  const [ops,      setOps]      = useState(DEFAULT_OPS)
  const [draftOps, setDraftOps] = useState(DEFAULT_OPS.join(', '))
  const [error,    setError]    = useState(null)

  const steps  = useMemo(() => buildMinStackSteps(ops), [ops])
  const runner = useStepRunner(steps)
  const { step, index: runnerIndex, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function handleRun() {
    const parts = draftOps.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length === 0 || parts.length > 14) {
      setError('Enter 1–14 operations.'); return
    }
    const valid = /^(push\s+-?\d+|pop|top|getmin)$/i
    for (const p of parts) {
      if (!valid.test(p.trim())) {
        setError(`"${p}" is not valid. Use push N, pop, top, or getMin.`); return
      }
    }
    setError(null)
    setOps(parts)
    setTimeout(() => reset(), 0)
  }

  const isTop      = step.type === 'top'
  const isGetMin   = step.type === 'getmin'
  const showResult = (isTop || isGetMin) && step.val !== null

  return (
    <div className="space-y-4">

      <VizHeader
        title="Min Stack"
        subtitle="Two shelves — left holds every box, right shelf only gets a box when it sets a new record low."
      />

      {/* Input */}
      <InputPanel
        title="Try your own operations"
        fields={[
          { label: 'Comma-separated (push N, pop, top, getMin)', value: draftOps, onChange: setDraftOps, placeholder: 'e.g. push -2, push 0, push -3, getMin, pop, top, getMin' },
        ]}
        onRun={handleRun}
        error={error}
        examples={[
          { label: 'push -2, push 0, push -3, getMin, pop, top, getMin', onClick: () => { setDraftOps('push -2, push 0, push -3, getMin, pop, top, getMin'); setError(null) } },
          { label: 'push 5, push 3, push 7, getMin, pop, getMin', onClick: () => { setDraftOps('push 5, push 3, push 7, getMin, pop, getMin'); setError(null) } },
          { label: 'push 1, push 1, getMin, pop, getMin', onClick: () => { setDraftOps('push 1, push 1, getMin, pop, getMin'); setError(null) } },
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
                done={step.opIndex > -1 && i < step.opIndex}
              />
            ))}
          </div>
        </div>

        {/* Two shelves */}
        <div className="flex gap-3">
          <StackColumn
            label="Main Shelf"
            sublabel="stores everything"
            items={step.stack}
            step={step}
            variant="main"
            runnerIndex={runnerIndex}
          />
          <ShelfDivider />
          <StackColumn
            label="Champion Shelf"
            sublabel="record lows only"
            items={step.minStack}
            step={step}
            variant="min"
            runnerIndex={runnerIndex}
          />
        </div>
      </div>

      {/* Result banner */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            key={`${runnerIndex}-result`}
            initial={{ opacity: 0, scale: 0.88, y: 10 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
            className={`rounded-xl border px-5 py-4 flex items-center gap-4
              ${isGetMin
                ? 'border-teal-500/30 bg-teal-500/10'
                : 'border-sky-500/30  bg-sky-500/10'
              }`}
          >
            <motion.span
              initial={{ scale: 0.3, rotate: isGetMin ? -20 : 20 }}
              animate={{ scale: [0.3, 1.25, 1], rotate: 0 }}
              transition={{ type: 'spring', stiffness: 520, damping: 20 }}
              className={`text-3xl font-black font-mono
                ${isGetMin ? 'text-teal-200' : 'text-sky-200'}`}
            >
              {step.val}
            </motion.span>
            <div>
              <p className={`text-sm font-bold ${isGetMin ? 'text-teal-300' : 'text-sky-300'}`}>
                {isGetMin ? 'getMin() — peeked champion shelf top' : 'top() — peeked main shelf top'}
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
