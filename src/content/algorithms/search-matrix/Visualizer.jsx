import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildSearchMatrixSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { InputPanel, Legend, StepMessage, VizHeader } from '../../../components/ui/VisualizerKit'

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_MATRIX = [
  [1,  3,  5,  7],
  [10, 11, 16, 20],
  [23, 30, 34, 60],
]
const DEFAULT_TARGET = 3

// ─── Cell state ───────────────────────────────────────────────────────────────
function getCellState(row, col, step) {
  const { type, midRow, midCol, left, right, cols } = step
  const flatIdx = row * cols + col
  const isMid   = row === midRow && col === midCol
  const inRange = flatIdx >= left && flatIdx <= right

  if (type === 'init')       return 'active'
  if (type === 'not-found')  return 'eliminated'
  if (type === 'found' && isMid) return 'found'
  if (isMid)    return 'mid'
  if (inRange)  return 'active'
  return 'eliminated'
}

// ─── MatrixCell — locker door style ──────────────────────────────────────────
// Door sweeps open from the left to reveal the number inside, same as the
// 1-D binary search visualizer. Eliminated cells go dark and squash.
function MatrixCell({ value, state, animKey }) {
  const isOpen  = state === 'mid'
  const isFound = state === 'found'
  const isElim  = state === 'eliminated'
  const doorOpen = isOpen || isFound

  return (
    <div className="relative select-none" style={{ width: CELL_SIZE, height: CELL_SIZE }}>
      {/* Found: water-drop burst rings */}
      {isFound && [0, 1, 2, 3].map((i) => (
        <motion.div
          key={`burst-${animKey}-${i}`}
          initial={{ opacity: 0.85, scale: 0.5 }}
          animate={{ opacity: 0, scale: 3.0 + i * 0.45 }}
          transition={{ duration: 0.7, delay: i * 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 rounded-2xl bg-emerald-400/35 pointer-events-none"
        />
      ))}

      {/* Open: breathing violet halo */}
      {isOpen && (
        <motion.div
          key={`halo-${animKey}`}
          animate={{ opacity: [0.6, 0.15, 0.6], scale: [1, 1.65, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-2xl bg-blue-500/40 pointer-events-none"
        />
      )}

      {/* Locker shell */}
      <motion.div
        animate={
          isElim  ? { scaleY: 0.88, opacity: 0.28 } :
          isFound ? { scale: [1, 1.1, 1], opacity: 1 } :
          { scaleY: 1, opacity: 1 }
        }
        transition={
          isElim  ? { duration: 0.26, ease: [0.36, 0, 0.66, 1] } :
          isFound ? { type: 'spring', stiffness: 300, damping: 14 } :
          { duration: 0.2 }
        }
        className={`absolute inset-0 rounded-2xl border-2 overflow-hidden ${
          isFound ? 'border-emerald-300 bg-emerald-600/30 shadow-[0_0_24px_6px_rgba(16,185,129,0.6)]' :
          isOpen  ? 'border-blue-300 bg-[#070d1f] shadow-[0_0_16px_4px_rgba(59,130,246,0.55)]' :
          isElim  ? 'border-slate-700/30 bg-slate-800/20' :
          'border-slate-600 bg-slate-700/70'
        }`}
      >
        {/* Interior number — visible only when door is open */}
        <div className={`absolute inset-0 flex items-center justify-center font-black text-sm font-mono transition-opacity duration-150 ${
          doorOpen ? 'opacity-100' : 'opacity-0'
        } ${isFound ? 'text-emerald-100' : 'text-white'}`}>
          {value}
        </div>

        {/* Door face — sweeps open to the left */}
        <motion.div
          key={`door-${animKey}-${doorOpen}`}
          initial={doorOpen ? { scaleX: 1 } : false}
          animate={{ scaleX: doorOpen ? 0 : 1 }}
          transition={
            doorOpen
              ? { duration: 0.36, ease: [0.22, 1, 0.36, 1] }
              : { duration: 0.2,  ease: [0.36, 0, 0.66, 1] }
          }
          style={{ originX: 0 }}
          className={`absolute inset-0 rounded-xl flex flex-col justify-between py-1.5 px-1.5 ${
            isElim ? 'bg-slate-800/70' : 'bg-slate-700'
          }`}
        >
          {/* Vent slots */}
          <div className="flex flex-col gap-1 px-0.5 mt-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`h-0.5 rounded-full ${isElim ? 'bg-slate-700/50' : 'bg-slate-600/70'}`} />
            ))}
          </div>
          {/* Handle + value hint */}
          <div className="flex items-end justify-between px-0.5 pb-0.5">
            <div className={`text-[9px] font-mono font-bold ${isElim ? 'text-slate-700' : 'text-slate-500'}`}>
              {!doorOpen && !isElim ? value : ''}
            </div>
            <div className={`w-1 h-3 rounded-full ${isElim ? 'bg-slate-700' : 'bg-slate-500'}`} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

// ─── Sweeping crosshair ───────────────────────────────────────────────────────
// Row bar slides in from left, col bar drops from top — like crosshairs locking on
function Crosshair({ midRow, midCol, cellSize, gap }) {
  const stride = cellSize + gap
  return (
    <>
      {/* Row sweep — slides in from the left edge */}
      <motion.div
        key={`row-${midRow}`}
        initial={{ scaleX: 0, originX: 0, opacity: 0.9 }}
        animate={{ scaleX: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute rounded-xl bg-blue-500/15 pointer-events-none"
        style={{
          top:    midRow * stride,
          left:   0,
          right:  0,
          height: cellSize,
        }}
      />
      {/* Col drop — falls from the top */}
      <motion.div
        key={`col-${midCol}`}
        initial={{ scaleY: 0, originY: 0, opacity: 0.9 }}
        animate={{ scaleY: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className="absolute rounded-xl bg-blue-500/15 pointer-events-none"
        style={{
          left:   midCol * stride,
          top:    0,
          bottom: 0,
          width:  cellSize,
        }}
      />
    </>
  )
}

// ─── Ribbon strip ─────────────────────────────────────────────────────────────
// The metaphor core: the matrix flattened into a single row of cells.
// A "pinch" (M) slides along it; L and R close in like closing jaws.
function RibbonStrip({ step }) {
  const total  = step.rows * step.cols
  const { left, right, mid, type, matrix, cols } = step
  const hasMid = mid >= 0 && type !== 'init' && type !== 'not-found'

  const cells = Array.from({ length: total }, (_, i) => {
    const r   = Math.floor(i / cols)
    const c   = i % cols
    const val = matrix[r][c]
    const isLeft  = i < left
    const isRight = i > right
    const isMid   = i === mid && hasMid
    const isActive = !isLeft && !isRight

    let bg = ''
    if (isMid)         bg = 'bg-blue-500 border-blue-300 text-white shadow-[0_0_10px_3px_rgba(59,130,246,0.6)]'
    else if (isActive) bg = 'bg-slate-700/80 border-slate-600 text-slate-300'
    else               bg = 'bg-slate-800/30 border-slate-700/20 text-slate-700 opacity-30'

    return { i, val, isMid, isActive, isLeft, isRight, bg }
  })

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        Ribbon (unfolded) &nbsp;
        <span className="font-normal text-slate-600">0 … {total - 1}</span>
      </p>

      {/* Cells row */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-1.5 relative">
          {/* Active range bracket — moves like a jaw closing */}
          {type !== 'init' && type !== 'not-found' && (
            <motion.div
              className="absolute -top-1 -bottom-1 rounded-xl border border-blue-500/40 bg-blue-500/8 pointer-events-none"
              animate={{
                left:  `${(left / (total - 1 || 1)) * 100}%`,
                right: `${((total - 1 - right) / (total - 1 || 1)) * 100}%`,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            />
          )}

          {cells.map(({ i, val, isMid, bg }) => (
            <div key={i} className="relative flex-shrink-0" style={{ width: 28, height: 28 }}>
              {/* Pinch burst on mid */}
              {isMid && (
                <motion.div
                  key={`pinch-${step.mid}`}
                  initial={{ opacity: 0.8, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 2.4 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 rounded-lg bg-blue-400/40 pointer-events-none"
                />
              )}

              <motion.div
                animate={isMid ? { y: [0, -7, 0], scale: [1, 1.15, 1] } : {}}
                transition={isMid ? { duration: 0.45, type: 'spring', stiffness: 380 } : {}}
                className={`w-full h-full rounded-lg border flex items-center justify-center text-[10px] font-bold select-none transition-colors duration-200 ${bg}`}
              >
                {val}
              </motion.div>

              {/* M / L / R labels */}
              {isMid && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-black text-blue-300"
                >
                  M
                </motion.div>
              )}
              {i === left && !isMid && type !== 'init' && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-black text-blue-400 opacity-60">L</div>
              )}
              {i === right && i !== left && !isMid && type !== 'init' && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-black text-pink-400 opacity-60">R</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Formula derivation panel ─────────────────────────────────────────────────
// Shows mid → row → col → value in a lively animated sequence
function FormulaPanel({ step, animKey }) {
  const { mid, midRow, midCol, midVal, left, right, cols, type } = step

  const valColor =
    type === 'found'    ? 'text-emerald-300' :
    type === 'go-right' ? 'text-rose-300' :
    type === 'go-left'  ? 'text-rose-300' :
    'text-white'

  const parts = [
    { label: 'mid',  val: String(mid),    note: `${left} + (${right}−${left})÷2`, color: 'text-blue-300' },
    { label: 'row',  val: String(midRow), note: `${mid} ÷ ${cols}`,               color: 'text-amber-300' },
    { label: 'col',  val: String(midCol), note: `${mid} % ${cols}`,               color: 'text-sky-300' },
    { label: 'val',  val: String(midVal), note: `matrix[${midRow}][${midCol}]`,   color: valColor },
  ]

  return (
    <motion.div
      key={animKey}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="rounded-xl border border-white/10 bg-[#070d1f] px-5 py-3"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2">
        Coordinate derivation
      </p>
      <div className="flex flex-wrap gap-4">
        {parts.map(({ label, val, note, color }, idx) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="flex items-baseline gap-1.5 font-mono text-xs"
          >
            <span className="text-slate-500">{label}</span>
            <span className={`text-base font-black ${color}`}>{val}</span>
            <span className="text-slate-600 text-[10px]">({note})</span>
          </motion.div>
        ))}
      </div>

      {/* Comparison arrow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-2 flex items-center gap-2 text-xs font-mono"
      >
        <span className="text-slate-500">matrix[{midRow}][{midCol}]</span>
        <span className={`font-black ${valColor}`}>{midVal}</span>
        <span className="text-slate-600">
          {type === 'found'    && <span className="text-emerald-400">== {step.target} ✓ found!</span>}
          {type === 'go-right' && <span className="text-rose-400">&lt; {step.target} → search right</span>}
          {type === 'go-left'  && <span className="text-rose-400">&gt; {step.target} → search left</span>}
          {type === 'inspect'  && <span className="text-slate-500">compared to target {step.target}</span>}
        </span>
      </motion.div>
    </motion.div>
  )
}

// ─── Input helpers ────────────────────────────────────────────────────────────
function parseMatrix(flat, rows, cols) {
  const nums = flat.split(',').map((s) => parseInt(s.trim(), 10))
  if (nums.some(isNaN)) return null
  if (nums.length !== rows * cols) return null
  const mat = []
  for (let r = 0; r < rows; r++) mat.push(nums.slice(r * cols, r * cols + cols))
  return mat
}

// ─── Main component ───────────────────────────────────────────────────────────
const CELL_SIZE = 54
const CELL_GAP  = 8

export default function SearchMatrixVisualizer({ onStepChange }) {
  const [matrix,    setMatrix]    = useState(DEFAULT_MATRIX)
  const [target,    setTarget]    = useState(DEFAULT_TARGET)
  const [draftFlat, setDraftFlat] = useState(DEFAULT_MATRIX.flat().join(', '))
  const [draftRows, setDraftRows] = useState(String(DEFAULT_MATRIX.length))
  const [draftCols, setDraftCols] = useState(String(DEFAULT_MATRIX[0].length))
  const [draftTgt,  setDraftTgt]  = useState(String(DEFAULT_TARGET))
  const [error,     setError]     = useState(null)

  const steps  = useMemo(() => buildSearchMatrixSteps(matrix, target), [matrix, target])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function handleRun() {
    const rows = parseInt(draftRows, 10)
    const cols = parseInt(draftCols, 10)
    const tgt  = parseInt(draftTgt.trim(), 10)

    if (isNaN(rows) || rows < 1 || rows > 6) { setError('Rows must be 1–6.'); return }
    if (isNaN(cols) || cols < 1 || cols > 6) { setError('Cols must be 1–6.'); return }
    if (isNaN(tgt))                           { setError('Target must be an integer.'); return }

    const mat = parseMatrix(draftFlat, rows, cols)
    if (!mat) { setError(`Need exactly ${rows * cols} comma-separated integers.`); return }

    for (let r = 0; r < rows; r++) {
      for (let c = 1; c < cols; c++) {
        if (mat[r][c] <= mat[r][c - 1]) { setError('Each row must be strictly increasing.'); return }
      }
      if (r > 0 && mat[r][0] <= mat[r - 1][cols - 1]) {
        setError('First element of each row must exceed the last of the previous.'); return
      }
    }

    setError(null)
    setMatrix(mat)
    setTarget(tgt)
    setTimeout(() => reset(), 0)
  }

  function applyPreset(flat, rows, cols, tgt) {
    setDraftFlat(flat); setDraftRows(String(rows)); setDraftCols(String(cols))
    setDraftTgt(String(tgt)); setError(null)
  }

  const { type, midRow, midCol, rows, cols } = step
  const showCrosshair = ['inspect', 'found', 'go-right', 'go-left'].includes(type)
  const showFormula   = showCrosshair
  const isFound       = type === 'found'
  const isNotFound    = type === 'not-found'
  const stepKey       = runner.index

  const gridW = cols * CELL_SIZE + (cols - 1) * CELL_GAP
  const gridH = rows * CELL_SIZE + (rows - 1) * CELL_GAP

  return (
    <div className="space-y-4">

      <VizHeader
        title="Search a 2D Matrix"
        subtitle={<>
          Imagine the matrix as a sorted paper ribbon folded into rows.{' '}
          Binary search <em>pinches</em> the midpoint, maps it back to a grid cell,
          then folds away the half that can't contain the target.
        </>}
        aside={
          <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
            <Legend items={[['#3b82f6', 'Pinched mid'], ['#475569', 'Active range'], ['#1e293b', 'Folded away'], ['#10b981', 'Found!']]} />
          </div>
        }
      />

      {/* Input */}
      <InputPanel
        title="Try your own matrix"
        fields={[
          { label: 'Values (row-major, comma-separated)', value: draftFlat, onChange: setDraftFlat, placeholder: '1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60', width: 'flex-1 min-w-[180px]' },
          { label: 'Rows', value: draftRows, onChange: setDraftRows, width: 'w-14' },
          { label: 'Cols', value: draftCols, onChange: setDraftCols, width: 'w-14' },
          { label: 'Target', value: draftTgt, onChange: setDraftTgt, width: 'w-16' },
        ]}
        onRun={handleRun}
        error={error}
        examplesLabel="Presets"
        examples={[
          { label: '3×4, target=3 (found)', onClick: () => applyPreset('1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60', 3, 4, 3) },
          { label: '3×4, target=13 (miss)', onClick: () => applyPreset('1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60', 3, 4, 13) },
          { label: 'Fibonacci 4×4, target=55', onClick: () => applyPreset('1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987', 4, 4, 55) },
        ]}
      />

      {/* Main visual panel */}
      <div className="rounded-2xl border border-white/10 bg-[#070d1f] px-5 pt-5 pb-5 space-y-6">

        {/* Target badge */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Folded ribbon grid
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono">searching for</span>
            <motion.div
              key={target}
              initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 360, damping: 20 }}
              className="rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-200 px-3 py-0.5 text-sm font-black font-mono"
            >
              {target}
            </motion.div>
          </div>
        </div>

        {/* Matrix grid — absolute positioning so crosshair layers cleanly */}
        <div className="overflow-x-auto">
          <div className="relative mx-auto" style={{ width: gridW + 24, height: gridH + 20, paddingTop: 14, paddingLeft: 20 }}>

            {/* Crosshair (under cells) */}
            <AnimatePresence>
              {showCrosshair && (
                <Crosshair
                  key={`ch-${midRow}-${midCol}`}
                  midRow={midRow}
                  midCol={midCol}
                  cellSize={CELL_SIZE}
                  gap={CELL_GAP}
                />
              )}
            </AnimatePresence>

            {/* Cells */}
            {step.matrix.map((rowArr, r) =>
              rowArr.map((val, c) => (
                <div
                  key={`${r}-${c}`}
                  className="absolute"
                  style={{
                    left: c * (CELL_SIZE + CELL_GAP),
                    top:  r * (CELL_SIZE + CELL_GAP),
                  }}
                >
                  <MatrixCell
                    value={val}
                    state={getCellState(r, c, step)}
                    animKey={`${stepKey}-${r}-${c}`}
                  />
                </div>
              ))
            )}

            {/* Column index labels */}
            {Array.from({ length: cols }, (_, c) => (
              <div
                key={c}
                className="absolute text-[9px] font-mono text-slate-600 text-center"
                style={{ left: c * (CELL_SIZE + CELL_GAP), top: -14, width: CELL_SIZE }}
              >
                [{c}]
              </div>
            ))}
            {/* Row index labels */}
            {Array.from({ length: rows }, (_, r) => (
              <div
                key={r}
                className="absolute text-[9px] font-mono text-slate-600 text-right"
                style={{ top: r * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2 - 7, left: -18, width: 14 }}
              >
                [{r}]
              </div>
            ))}
          </div>
        </div>

        {/* Ribbon strip — the metaphor's unfolded view */}
        <RibbonStrip step={step} />
      </div>

      {/* Formula panel */}
      <AnimatePresence mode="wait">
        {showFormula && (
          <FormulaPanel key={`f-${stepKey}`} step={step} animKey={stepKey} />
        )}
      </AnimatePresence>

      {/* L / M / R counter bar */}
      {type !== 'init' && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 flex flex-wrap gap-6 text-xs font-mono items-center">
          {[
            { label: 'L', val: step.left,  color: 'text-blue-300' },
            { label: 'R', val: step.right, color: 'text-pink-300' },
            ...(step.mid >= 0 ? [{ label: 'M', val: step.mid, color: 'text-white' }] : []),
          ].map(({ label, val, color }) => (
            <span key={label}>
              <span className="text-slate-500 mr-1">{label}</span>
              <motion.span
                key={val}
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={`${color} font-black text-base`}
              >
                {val}
              </motion.span>
            </span>
          ))}
          {type === 'not-found' && (
            <span className="text-rose-400 text-[11px]">L &gt; R — search space exhausted</span>
          )}
        </div>
      )}

      {/* Result banners */}
      <AnimatePresence>
        {isFound && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 18 }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 flex items-center gap-4"
          >
            {/* Checkmark with spring pop */}
            <motion.div
              animate={{ scale: [1, 1.5, 1.2, 1], rotate: [0, -12, 12, 0] }}
              transition={{ duration: 0.65, delay: 0.15 }}
              className="text-3xl text-emerald-300 select-none"
            >
              ✓
            </motion.div>
            <div>
              <p className="text-emerald-200 font-bold">
                Found — target <span className="font-black text-emerald-100">{target}</span> at [
                <span className="text-amber-300">{step.midRow}</span>][
                <span className="text-sky-300">{step.midCol}</span>]
              </p>
              <p className="text-slate-400 text-xs mt-0.5 font-mono">
                flat index {step.mid} in the ribbon → row={step.midRow}, col={step.midCol}
              </p>
            </div>
          </motion.div>
        )}

        {isNotFound && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 18 }}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 flex items-center gap-4"
          >
            <motion.div
              animate={{ rotate: [0, -18, 18, -10, 10, 0] }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="text-3xl text-rose-300 select-none"
            >
              ✗
            </motion.div>
            <div>
              <p className="text-rose-200 font-bold">
                Target <span className="font-black text-rose-100">{target}</span> not in matrix
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                The ribbon was fully folded away — return <span className="font-mono text-rose-300">false</span>
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
