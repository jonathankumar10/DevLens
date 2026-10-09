import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildValidPalindromeSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'

const DEFAULT_S = 'A man, a plan, a canal: Panama'
const MAX_LEN = 40

// ─── Sizing tiers ─────────────────────────────────────────────────────────────
// Cells are flexible (flex-1, min-w-0, capped by max-width) so the row always
// fills — and never overflows — its container. These tiers just shrink the
// cell height/font as the string gets longer, so dense strings stay legible
// instead of turning into razor-thin slivers.
function sizeTier(n) {
  if (n <= 12) return { h: 'h-11', text: 'text-base', showIndex: true }
  if (n <= 20) return { h: 'h-10', text: 'text-sm',   showIndex: true }
  if (n <= 28) return { h: 'h-9',  text: 'text-xs',   showIndex: true }
  return          { h: 'h-8',  text: 'text-[10px]', showIndex: false }
}

// ─── Cell state ───────────────────────────────────────────────────────────────
function getCellState(idx, step) {
  const { resolved, left, right, type } = step
  if (resolved[idx]) return resolved[idx]
  if (type === 'init') return 'pending'
  if (idx === left)  return 'active-left'
  if (idx === right) return 'active-right'
  return 'pending'
}

function getPointerLabel(idx, step) {
  if (step.type === 'init' || step.type === 'valid') return null
  const isL = idx === step.left
  const isR = idx === step.right
  if (isL && isR) return 'L·R'
  if (isL) return 'L'
  if (isR) return 'R'
  return null
}

function CharCell({ ch, state, pointerLabel, tier }) {
  const isSpace = ch === ' '

  const styles = {
    pending:        'border-slate-700 bg-slate-800/60 text-slate-300',
    'active-left':  'border-blue-400  bg-blue-500/20  text-white shadow-[0_0_10px_1px_rgba(59,130,246,0.5)]',
    'active-right': 'border-pink-400  bg-pink-500/20  text-white shadow-[0_0_10px_1px_rgba(236,72,153,0.5)]',
    skip:           'border-slate-800 bg-slate-800/20 text-slate-600',
    match:          'border-emerald-400 bg-emerald-500/20 text-emerald-200',
    mismatch:       'border-rose-400  bg-rose-500/25  text-rose-100 shadow-[0_0_10px_1px_rgba(244,63,94,0.55)]',
  }

  const pointerStyle =
    pointerLabel === 'R'   ? 'text-pink-300 border-pink-400/60 bg-pink-500/15' :
    pointerLabel === 'L·R' ? 'text-white    border-white/50   bg-white/15'    :
                              'text-blue-300 border-blue-400/60 bg-blue-500/15'

  return (
    <div className="relative flex-1 min-w-0 max-w-[40px]">
      {pointerLabel && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute -top-5 left-1/2 -translate-x-1/2 rounded-full border px-1.5 text-[9px] font-black leading-[14px] whitespace-nowrap ${pointerStyle}`}
        >
          {pointerLabel}
        </motion.div>
      )}
      <motion.div
        layout
        animate={
          state === 'mismatch' ? { x: [0, -3, 3, -2, 2, 0], scale: [1, 1.08, 1] } :
          state === 'match'    ? { scale: [1, 1.15, 1] } :
          state === 'skip'     ? { scale: [1, 0.9, 0.82], opacity: [1, 0.6, 0.4] } :
          { scale: 1 }
        }
        transition={{ duration: 0.32 }}
        className={`w-full ${tier.h} rounded-lg border-2 flex items-center justify-center font-mono font-bold ${tier.text} select-none transition-colors ${styles[state]}`}
      >
        {isSpace ? '·' : ch}
      </motion.div>
    </div>
  )
}

// ─── Comparison badge ─────────────────────────────────────────────────────────
function ComparisonBadge({ step, animKey }) {
  const { type, s, left, right } = step
  if (!['match', 'mismatch'].includes(type)) return null

  const isMatch = type === 'match'
  const c = isMatch
    ? { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-300', sym: 'text-emerald-200' }
    : { bg: 'bg-rose-500/15',    border: 'border-rose-500/40',    text: 'text-rose-300',    sym: 'text-rose-200'    }

  return (
    <motion.div
      key={animKey}
      initial={{ opacity: 0, scale: 0.75, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className={`flex items-center gap-3 rounded-xl border ${c.bg} ${c.border} px-5 py-3`}
    >
      <div className="text-center">
        <div className="text-[10px] text-slate-500 font-mono mb-0.5">s[{left}]</div>
        <div className={`text-2xl font-black font-mono ${c.sym}`}>{s[left]}</div>
      </div>
      <motion.div
        animate={isMatch ? { scale: [1, 1.5, 1.2, 1] } : { x: [0, -6, 6, 0] }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className={`text-3xl font-black ${c.sym}`}
      >
        {isMatch ? '=' : '≠'}
      </motion.div>
      <div className="text-center">
        <div className="text-[10px] text-slate-500 font-mono mb-0.5">s[{right}]</div>
        <div className={`text-2xl font-black font-mono ${c.sym}`}>{s[right]}</div>
      </div>
      <div className={`ml-2 text-sm font-bold ${c.text}`}>{isMatch ? 'Match!' : 'Mismatch!'}</div>
    </motion.div>
  )
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

function ExBtn({ label, onClick }) {
  return (
    <button
      className="text-slate-400 hover:text-white underline underline-offset-2 transition-colors"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ValidPalindromeVisualizer({ onStepChange }) {
  const [input, setInput] = useState(DEFAULT_S)
  const [draft, setDraft] = useState(DEFAULT_S)
  const [error, setError] = useState(null)

  const steps  = useMemo(() => buildValidPalindromeSteps(input), [input])
  const runner = useStepRunner(steps)
  const { step, index: runnerIndex, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function handleRun() {
    const t = draft
    if (t.length > MAX_LEN) { setError(`Keep it under ${MAX_LEN} characters.`); return }
    setError(null)
    setInput(t)
    setTimeout(() => reset(), 0)
  }

  const isValid    = step.type === 'valid'
  const isMismatch = step.type === 'mismatch'
  const chars      = input.split('')
  const tier       = sizeTier(chars.length)

  return (
    <div className="space-y-4">

      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white">Valid Palindrome</h2>
        <p className="text-sm text-slate-400">
          Two readers close in from opposite ends — skipping punctuation, comparing letters.
        </p>
      </div>

      {/* Input */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Try your own string
        </p>
        <div className="flex gap-2 items-start flex-wrap">
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-[11px] text-slate-500">Up to {MAX_LEN} characters</label>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRun()}
              placeholder="A man, a plan, a canal: Panama"
              className="rounded-md bg-slate-800 border border-white/10 px-3 py-1.5 text-xs font-mono text-slate-100 outline-none focus:border-blue-500 transition-colors w-full"
            />
          </div>
          <div className="flex flex-col gap-1 justify-end">
            <label className="text-[11px] text-transparent select-none">Run</label>
            <button onClick={handleRun}
              className="rounded-md bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white transition-colors">
              Run
            </button>
          </div>
        </div>
        {error && <p className="text-[11px] text-red-400">{error}</p>}
        <p className="text-[11px] text-slate-600">
          Examples —{' '}
          <ExBtn label="A man, a plan, a canal: Panama" onClick={() => { setDraft('A man, a plan, a canal: Panama'); setError(null) }} />{' · '}
          <ExBtn label="Was it a car or a cat I saw?"    onClick={() => { setDraft('Was it a car or a cat I saw?'); setError(null) }} />{' · '}
          <ExBtn label="race a car"                      onClick={() => { setDraft('race a car'); setError(null) }} />{' · '}
          <ExBtn label="(empty string)"                  onClick={() => { setDraft(''); setError(null) }} />
        </p>
      </div>

      {/* Main panel */}
      <div className="rounded-2xl border border-white/10 bg-[#070d1f] px-5 pt-6 pb-5 space-y-5">

        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Characters
          </p>
          <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
            <Legend color="#3b82f6" label="left" />
            <Legend color="#ec4899" label="right" />
            <Legend color="#10b981" label="Match" />
            <Legend color="#f43f5e" label="Mismatch" />
            <Legend color="#334155" label="Skipped" />
          </div>
        </div>

        {chars.length === 0 ? (
          <div className="flex items-center justify-center h-[44px] rounded-lg border border-dashed border-slate-700/50 text-sm text-slate-600">
            empty string
          </div>
        ) : (
          <div style={{ paddingTop: 22 }}>
            <div className="flex gap-1">
              {chars.map((ch, idx) => (
                <CharCell
                  key={idx}
                  ch={ch}
                  state={getCellState(idx, step)}
                  pointerLabel={getPointerLabel(idx, step)}
                  tier={tier}
                />
              ))}
            </div>

            {tier.showIndex && (
              <div className="flex gap-1 mt-1.5">
                {chars.map((_, idx) => (
                  <div key={idx} className="flex-1 min-w-0 max-w-[40px] text-center text-[9px] font-mono text-slate-600 truncate">
                    {idx}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comparison badge */}
      <AnimatePresence mode="wait">
        {['match', 'mismatch'].includes(step.type) && (
          <ComparisonBadge key={`cmp-${runnerIndex}`} step={step} animKey={runnerIndex} />
        )}
      </AnimatePresence>

      {/* Result banners */}
      <AnimatePresence>
        {isValid && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
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
              <p className="text-emerald-200 font-bold">It's a palindrome — return true</p>
              <p className="text-slate-400 text-xs mt-0.5">Every letter/digit pair matched from the outside in.</p>
            </div>
          </motion.div>
        )}

        {isMismatch && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 18 }}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 flex items-center gap-4"
          >
            <motion.div
              animate={{ rotate: [0, -18, 18, -10, 10, 0] }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-4xl text-rose-300"
            >
              ✗
            </motion.div>
            <div>
              <p className="text-rose-200 font-bold">Not a palindrome — return false</p>
              <p className="text-slate-400 text-xs mt-0.5">
                Stopped as soon as one pair mismatched — no need to check the rest.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.message}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-slate-300 font-mono"
        >
          {step.message}
        </motion.div>
      </AnimatePresence>

      <StepControls runner={runner} />
    </div>
  )
}
