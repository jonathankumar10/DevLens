import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildBinarySearchSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { InputPanel, Legend, StepMessage, VizHeader } from '../../../components/ui/VisualizerKit'

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_NUMS   = [-1, 0, 3, 5, 9, 12]
const DEFAULT_TARGET = 9

// ─── Layout constants ─────────────────────────────────────────────────────────
const CELL_W  = 56
const CELL_H  = 72
const CELL_GAP = 8
const STRIDE   = CELL_W + CELL_GAP

// ─── Cell state ───────────────────────────────────────────────────────────────
function getCellState(idx, step) {
  const { type, left, right, mid } = step
  if (type === 'init')       return 'active'
  if (type === 'not-found')  return 'eliminated'
  if (idx === mid)           return type === 'found' ? 'found' : 'open'
  if (idx < left || idx > right) return 'eliminated'
  return 'active'
}

// ─── LockerCell ───────────────────────────────────────────────────────────────
// The door sweeps open to reveal the number inside.
// Eliminated lockers go dark and squash slightly.
function LockerCell({ value, state, animKey }) {
  const isOpen  = state === 'open'
  const isFound = state === 'found'
  const isElim  = state === 'eliminated'
  const doorOpen = isOpen || isFound

  return (
    <div
      className="relative flex-shrink-0 select-none"
      style={{ width: CELL_W, height: CELL_H }}
    >
      {/* ── Found: water-drop burst rings ───────────────────────── */}
      {isFound && [0, 1, 2, 3].map((i) => (
        <motion.div
          key={`burst-${animKey}-${i}`}
          initial={{ opacity: 0.85, scale: 0.5 }}
          animate={{ opacity: 0, scale: 3.0 + i * 0.45 }}
          transition={{ duration: 0.7, delay: i * 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 rounded-2xl bg-emerald-400/35 pointer-events-none"
        />
      ))}

      {/* ── Open: breathing halo ────────────────────────────────── */}
      {isOpen && (
        <motion.div
          key={`halo-${animKey}`}
          animate={{ opacity: [0.6, 0.15, 0.6], scale: [1, 1.6, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-2xl bg-blue-500/40 pointer-events-none"
        />
      )}

      {/* ── Locker shell ────────────────────────────────────────── */}
      <motion.div
        animate={
          isElim ? { scaleY: 0.88, opacity: 0.3 } :
          isFound ? { scale: [1, 1.1, 1], opacity: 1 } :
          { scaleY: 1, opacity: 1 }
        }
        transition={
          isElim  ? { duration: 0.28, ease: [0.36, 0, 0.66, 1] } :
          isFound ? { type: 'spring', stiffness: 300, damping: 14 } :
          { duration: 0.2 }
        }
        className={`absolute inset-0 rounded-2xl border-2 overflow-hidden ${
          isFound ? 'border-emerald-300 bg-emerald-600/30 shadow-[0_0_26px_6px_rgba(16,185,129,0.6)]' :
          isOpen  ? 'border-blue-300 bg-[#070d1f] shadow-[0_0_18px_4px_rgba(59,130,246,0.55)]' :
          isElim  ? 'border-slate-700/30 bg-slate-800/20' :
          'border-slate-600 bg-slate-700/70'
        }`}
      >
        {/* Interior — number revealed when door is open */}
        <div className={`absolute inset-0 flex items-center justify-center font-black text-lg font-mono transition-opacity duration-150 ${
          doorOpen ? 'opacity-100' : 'opacity-0'
        } ${isFound ? 'text-emerald-100' : 'text-white'}`}>
          {value}
        </div>

        {/* Door face — sweeps open to the left on originX=0 */}
        <motion.div
          key={`door-${animKey}-${doorOpen}`}
          initial={doorOpen ? { scaleX: 1 } : false}
          animate={{ scaleX: doorOpen ? 0 : 1 }}
          transition={
            doorOpen
              ? { duration: 0.38, ease: [0.22, 1, 0.36, 1] }
              : { duration: 0.22, ease: [0.36, 0, 0.66, 1] }
          }
          style={{ originX: 0 }}
          className={`absolute inset-0 rounded-xl flex flex-col justify-between py-2 px-2 ${
            isElim
              ? 'bg-slate-800/70'
              : 'bg-slate-700'
          }`}
        >
          {/* Locker number (index) shown on door face */}
          {!isElim && (
            <div className="text-[9px] font-mono text-slate-500 text-right leading-none">
              [{/* rendered by parent */}]
            </div>
          )}

          {/* Vent slots */}
          <div className="flex flex-col gap-1 px-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-0.5 rounded-full ${isElim ? 'bg-slate-700/50' : 'bg-slate-600/70'}`}
              />
            ))}
          </div>

          {/* Handle */}
          <div className="flex justify-end pr-1">
            <div className={`w-1.5 h-4 rounded-full ${isElim ? 'bg-slate-700' : 'bg-slate-500'}`} />
          </div>

          {/* Value peeking at bottom when active (not open) */}
          {!doorOpen && !isElim && (
            <div className="text-center text-[10px] font-bold font-mono text-slate-500 -mt-1 pb-0.5">
              {value}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

// ─── Wall markers — L and R squeeze inward, M probes from above ───────────────
function WallMarker({ label, pos, color }) {
  const isR = label === 'R'
  const isM = label === 'M'

  return (
    <motion.div
      className="absolute top-0 bottom-0 pointer-events-none flex flex-col items-center"
      animate={{ x: pos * STRIDE + (isR ? CELL_W : 0) }}
      transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      style={{ width: 0 }}
    >
      {isM ? (
        // Mid probe: triangle above + dotted vertical line
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
        // L / R: a thick vertical wall bar
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
            marginTop: 0,
          }}
        />
      )}
    </motion.div>
  )
}

// ─── Comparison badge ─────────────────────────────────────────────────────────
function ComparisonBadge({ step, animKey }) {
  const { type, midVal, target } = step
  if (!['inspect', 'go-right', 'go-left', 'found'].includes(type)) return null

  const comparison =
    type === 'found'    ? { sym: '=',  label: 'Match!',        color: 'emerald' } :
    type === 'go-right' ? { sym: '<',  label: 'Go right →',   color: 'amber'   } :
                          { sym: '>',  label: '← Go left',    color: 'sky'     }

  const colors = {
    emerald: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-300', sym: 'text-emerald-200' },
    amber:   { bg: 'bg-amber-500/15',   border: 'border-amber-500/40',   text: 'text-amber-300',   sym: 'text-amber-200'   },
    sky:     { bg: 'bg-sky-500/15',     border: 'border-sky-500/40',     text: 'text-sky-300',     sym: 'text-sky-200'     },
  }
  const c = colors[comparison.color]

  return (
    <motion.div
      key={animKey}
      initial={{ opacity: 0, scale: 0.75, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className={`flex items-center gap-3 rounded-xl border ${c.bg} ${c.border} px-5 py-3`}
    >
      {/* Left side: nums[mid] */}
      <div className="text-center">
        <div className="text-[10px] text-slate-500 font-mono mb-0.5">nums[{step.mid}]</div>
        <div className={`text-2xl font-black font-mono ${c.sym}`}>{midVal}</div>
      </div>

      {/* Symbol */}
      <motion.div
        animate={type === 'found'
          ? { scale: [1, 1.5, 1.2, 1], rotate: [0, -10, 10, 0] }
          : { x: type === 'go-right' ? [0, 6, 0] : [0, -6, 0] }
        }
        transition={{ duration: 0.5, delay: 0.15 }}
        className={`text-3xl font-black ${c.sym}`}
      >
        {comparison.sym}
      </motion.div>

      {/* Right side: target */}
      <div className="text-center">
        <div className="text-[10px] text-slate-500 font-mono mb-0.5">target</div>
        <div className="text-2xl font-black font-mono text-white">{target}</div>
      </div>

      {/* Label */}
      <div className={`ml-2 text-sm font-bold ${c.text}`}>{comparison.label}</div>
    </motion.div>
  )
}

// ─── Input helpers ────────────────────────────────────────────────────────────
function parseNums(str) {
  const parts  = str.split(',').map((s) => s.trim()).filter(Boolean)
  const parsed = parts.map((s) => parseInt(s, 10))
  if (parsed.some(isNaN)) return null
  return parsed
}

function isSorted(arr) {
  for (let i = 1; i < arr.length; i++) if (arr[i] <= arr[i - 1]) return false
  return true
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BinarySearchVisualizer({ onStepChange }) {
  const [nums,      setNums]      = useState(DEFAULT_NUMS)
  const [target,    setTarget]    = useState(DEFAULT_TARGET)
  const [draftNums, setDraftNums] = useState(DEFAULT_NUMS.join(', '))
  const [draftTgt,  setDraftTgt]  = useState(String(DEFAULT_TARGET))
  const [error,     setError]     = useState(null)

  const steps  = useMemo(() => buildBinarySearchSteps(nums, target), [nums, target])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function handleRun() {
    const parsed = parseNums(draftNums)
    const tgt    = parseInt(draftTgt.trim(), 10)

    if (!parsed || parsed.length < 2 || parsed.length > 12) {
      setError('Enter 2–12 integers.'); return
    }
    if (!isSorted(parsed)) {
      setError('Array must be strictly sorted in ascending order.'); return
    }
    if (isNaN(tgt)) {
      setError('Target must be an integer.'); return
    }

    setError(null)
    setNums(parsed)
    setTarget(tgt)
    setTimeout(() => reset(), 0)
  }

  function applyPreset(numsArr, tgt) {
    setDraftNums(numsArr.join(', '))
    setDraftTgt(String(tgt))
    setError(null)
  }

  const { type, left, right, mid, result } = step
  const isFound    = type === 'found'
  const isNotFound = type === 'not-found'
  const stepKey    = runner.index

  const showL = type !== 'init'
  const showR = type !== 'init'
  const showM = mid >= 0 && !['init', 'not-found'].includes(type)

  const trackWidth = nums.length * STRIDE - CELL_GAP

  return (
    <div className="space-y-4">

      <VizHeader
        title="Binary Search"
        subtitle={<>
          A row of lockers, sorted. Two walls squeeze inward — crack open the{' '}
          <span className="text-blue-400 font-mono">mid</span> locker each round.
          Wrong half? That wall jumps past it and the lockers go dark.
        </>}
        aside={
          <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
            <Legend items={[['#3b82f6', 'Opened (mid)'], ['#475569', 'Active'], ['#1e293b', 'Eliminated'], ['#10b981', 'Found!']]} />
          </div>
        }
      />

      {/* Input */}
      <InputPanel
        title="Try your own values"
        fields={[
          { label: 'Sorted array (comma-separated)', value: draftNums, onChange: setDraftNums, placeholder: '-1, 0, 3, 5, 9, 12', width: 'flex-1 min-w-[200px]' },
          { label: 'Target', value: draftTgt, onChange: setDraftTgt, width: 'w-20' },
        ]}
        onRun={handleRun}
        error={error}
        examplesLabel="Presets"
        examples={[
          { label: 'target found (9)', onClick: () => applyPreset([-1, 0, 3, 5, 9, 12], 9) },
          { label: 'target missing (2)', onClick: () => applyPreset([-1, 0, 3, 5, 9, 12], 2) },
          { label: 'leftmost (1)', onClick: () => applyPreset([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 1) },
          { label: 'rightmost (19)', onClick: () => applyPreset([1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 19) },
        ]}
      />

      {/* Locker hall */}
      <div className="rounded-2xl border border-white/10 bg-[#070d1f] px-5 pt-6 pb-5 space-y-5">

        {/* Target + pointer state */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Locker hall
          </p>
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="text-slate-500">target</span>
            <motion.span
              key={target}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 18 }}
              className="rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-200 px-3 py-0.5 font-black text-sm"
            >
              {target}
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

        {/* The lockers row */}
        <div className="overflow-x-auto pb-2">
          <div style={{ minWidth: trackWidth + 40, paddingTop: 36, paddingBottom: 4 }}>

            {/* Wall markers layer */}
            <div className="relative" style={{ height: CELL_H, width: trackWidth }}>
              {showL && (
                <WallMarker key="L" label="L" pos={left}  color="#3b82f6" totalCells={nums.length} />
              )}
              {showR && (
                <WallMarker key="R" label="R" pos={right} color="#ec4899" totalCells={nums.length} />
              )}
              {showM && (
                <WallMarker key={`M-${mid}`} label="M" pos={mid} color="#ffffff" totalCells={nums.length} />
              )}

              {/* Locker cells */}
              <div className="absolute inset-0 flex" style={{ gap: CELL_GAP }}>
                {nums.map((val, idx) => (
                  <LockerCell
                    key={idx}
                    value={val}
                    state={getCellState(idx, step)}
                    animKey={`${stepKey}-${idx}`}
                  />
                ))}
              </div>
            </div>

            {/* Index labels */}
            <div className="flex mt-2" style={{ gap: CELL_GAP }}>
              {nums.map((_, idx) => (
                <div
                  key={idx}
                  style={{ width: CELL_W }}
                  className="text-center text-[10px] font-mono text-slate-600"
                >
                  [{idx}]
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison badge */}
      <AnimatePresence mode="wait">
        {['inspect', 'go-right', 'go-left', 'found'].includes(type) && (
          <ComparisonBadge key={`cmp-${stepKey}`} step={step} animKey={stepKey} />
        )}
      </AnimatePresence>

      {/* Result banners */}
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
                Found at index{' '}
                <span className="font-black text-emerald-100 text-lg">{result}</span>
              </p>
              <p className="text-slate-400 text-xs mt-0.5 font-mono">
                nums[{result}] = {step.midVal}  →  return {result}
              </p>
            </div>
          </motion.div>
        )}

        {isNotFound && (
          <motion.div
            initial={{ opacity: 0, scale: 0.82, y: 12 }}
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
              <p className="text-rose-200 font-bold">
                Target <span className="font-black text-rose-100">{target}</span> not in array
              </p>
              <p className="text-slate-400 text-xs mt-0.5 font-mono">
                All lockers eliminated — return <span className="text-rose-300">-1</span>
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
