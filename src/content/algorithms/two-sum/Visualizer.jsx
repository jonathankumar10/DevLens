import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildTwoSumSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { VizHeader, InputPanel, Legend, StepMessage } from '../../../components/ui/VisualizerKit'
import { parseIntList } from '../../../lib/vizHelpers'

const DEFAULT_NUMS   = [2, 7, 11, 15, 3, 6]
const DEFAULT_TARGET = 9

const STATUS_COLORS = {
  idle:       { liquid: '#4f46e5', wave: '#818cf8', cap: '#312e81', border: 'rgba(99,102,241,0.35)',  glow: null       },
  stored:     { liquid: '#2563eb', wave: '#60a5fa', cap: '#1e3a8a', border: 'rgba(59,130,246,0.5)',   glow: '#3b82f6'  },
  active:     { liquid: '#3b82f6', wave: '#c4b5fd', cap: '#4c1d95', border: 'rgba(59,130,246,1)',     glow: '#3b82f6'  },
  complement: { liquid: '#f97316', wave: '#fcd34d', cap: '#7c2d12', border: 'rgba(249,115,22,1)',     glow: '#f97316'  },
  found:      { liquid: '#22c55e', wave: '#86efac', cap: '#14532d', border: 'rgba(34,197,94,1)',      glow: '#22c55e'  },
}

const VW = 72, VH = 200
const B = { x: 6,  w: 60, top: 110, bot: 172 }
const N = { x: 27, w: 18, top: 52,  bot: 110 }
const C = { x: 25, w: 22, top: 33,  bot: 52  }

function bottlePath(forClip = false) {
  const ins = forClip ? 2 : 0
  const bL = B.x + ins, bR = B.x + B.w - ins
  const nL = N.x + ins, nR = N.x + N.w - ins
  const bot = B.bot
  const neckTop = forClip ? 0 : N.top
  return [
    `M ${bL + 5} ${bot}`, `Q ${bL} ${bot} ${bL} ${bot - 5}`,
    `L ${bL} ${B.top}`, `L ${nL} ${N.bot}`, `L ${nL} ${neckTop}`,
    `L ${nR} ${neckTop}`, `L ${nR} ${N.bot}`, `L ${bR} ${B.top}`,
    `L ${bR} ${bot - 5}`, `Q ${bR} ${bot} ${bR - 5} ${bot}`,
    `Q ${VW / 2} ${bot + 6} ${bL + 5} ${bot}`, `Z`,
  ].join(' ')
}

const VISUAL_PATH = bottlePath(false)
const CLIP_PATH   = bottlePath(true)

// ── Bottle ─────────────────────────────────────────────────────────────────────
// Hover → tooltip showing value + complement needed.
// Found → celebration: frantic bob + expanding green rings + ✓ badge.
// Active → pulsing scanner dot above neck.
// Complement → orange glow + faster wave (the matching bottle).

function Bottle({ value, maxVal, status, idx, target }) {
  const c    = STATUS_COLORS[status] ?? STATUS_COLORS.idle
  const fill = Math.min(value / maxVal, 1)
  const surfaceY = B.bot - fill * (B.bot - N.top)
  const clipId   = `bc-${idx}`
  const [hovered, setHovered] = useState(false)

  const isFound      = status === 'found'
  const isActive     = status === 'active'
  const isComplement = status === 'complement'
  const complement   = target - value

  return (
    <motion.div
      className="relative flex-shrink-0 cursor-pointer"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={
        isFound
          ? { y: [0, -18, -3, -14, 0], transition: { duration: 0.65, times: [0, 0.2, 0.42, 0.65, 1], repeat: Infinity, repeatDelay: 0.25 } }
          : isComplement
          ? { y: [0, -6, 0], transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } }
          : { y: 0 }
      }
    >
      {/* Expanding rings — found celebration */}
      {isFound && [0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 58, height: 58,
            left: 0, bottom: 8,
            border: '2px solid rgba(34,197,94,0.9)',
          }}
          initial={{ scale: 0.6, opacity: 0.9 }}
          animate={{ scale: 3.2, opacity: 0 }}
          transition={{ duration: 1.1, delay: i * 0.38, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}

      {/* ✓ badge above found bottles */}
      {isFound && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.3, 1], opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          className="absolute -top-7 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-emerald-500
            flex items-center justify-center text-[10px] font-black text-white z-10 shadow-lg shadow-emerald-500/50"
        >
          ✓
        </motion.div>
      )}

      {/* Scanning dot + triangle pointer when active */}
      {isActive && (
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5"
          animate={{ y: [0, -4, 0], opacity: [1, 0.6, 1] }}
          transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-lg shadow-blue-400/70" />
          <div style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '5px solid #3b82f6' }} />
        </motion.div>
      )}

      {/* Orange pulsing ring — complement bottle */}
      {isComplement && (
        <motion.div
          className="absolute pointer-events-none rounded-full"
          style={{ width: 58, height: 58, left: 0, bottom: 8, border: '2px solid rgba(249,115,22,0.9)' }}
          animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      {/* Hover tooltip */}
      <AnimatePresence>
        {hovered && !isFound && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-800/98 border border-white/20
              rounded-lg px-2.5 py-1.5 z-30 shadow-xl pointer-events-none"
            style={{ whiteSpace: 'nowrap' }}
          >
            <p className="text-[10px] font-mono text-slate-300">val: <span className="text-white font-bold">{value}</span></p>
            <p className="text-[10px] font-mono text-slate-300">need: <span className="text-blue-300 font-bold">{complement}</span></p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glow aura */}
      {c.glow && (
        <div
          className="absolute pointer-events-none"
          style={{
            inset: -14,
            background: `radial-gradient(ellipse at 50% 65%, ${c.glow}50 0%, transparent 65%)`,
            filter: 'blur(12px)',
          }}
        />
      )}

      <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: 58, height: 160, display: 'block' }}>
        <defs>
          <clipPath id={clipId}>
            <path d={CLIP_PATH} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <motion.rect
            x={0} width={VW}
            initial={{ y: B.bot, height: 0 }}
            animate={{ y: surfaceY, height: VH - surfaceY }}
            transition={{ duration: 0.9, ease: [0.34, 1.1, 0.64, 1] }}
            fill={c.liquid} opacity={0.92}
          />
          {fill > 0.02 && (
            <motion.path
              key={`w-${idx}-${Math.round(surfaceY)}`}
              fill={c.wave}
              opacity={isFound ? 0.8 : 0.5}
              animate={{
                d: [
                  `M 0 ${surfaceY} C 18 ${surfaceY - 7} 36 ${surfaceY + 7} ${VW} ${surfaceY} L ${VW} ${VH} L 0 ${VH} Z`,
                  `M 0 ${surfaceY} C 18 ${surfaceY + 7} 36 ${surfaceY - 7} ${VW} ${surfaceY} L ${VW} ${VH} L 0 ${VH} Z`,
                ],
              }}
              transition={{
                duration: isFound ? 0.55 : isComplement ? 0.9 : 1.8,
                repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut',
              }}
            />
          )}
        </g>
        <path d={VISUAL_PATH} fill="rgba(224,231,255,0.04)" stroke={c.border} strokeWidth={1.8} />
        <line x1={B.x + 9} y1={B.top + 10} x2={B.x + 9} y2={B.bot - 12}
          stroke="rgba(255,255,255,0.18)" strokeWidth={3} strokeLinecap="round" />
        <line x1={N.x + 4} y1={N.top + 6} x2={N.x + 4} y2={N.bot - 4}
          stroke="rgba(255,255,255,0.12)" strokeWidth={2} strokeLinecap="round" />
        <rect x={C.x} y={C.top} width={C.w} height={C.bot - C.top} rx={5} fill={c.cap} />
        <rect x={C.x + 4} y={C.top + 4} width={C.w - 8} height={4} rx={2} fill="rgba(255,255,255,0.18)" />
      </svg>
    </motion.div>
  )
}

// ── Hash map entry chip ────────────────────────────────────────────────────────
// Flips in like a card being slapped on the table.
// Complement chip pulses orange when we're searching for it.
// Found chip turns green when it's the match that solves the problem.

function MapChip({ val, idx, isComplementChip, isFoundChip }) {
  return (
    <motion.span
      initial={{ opacity: 0, scaleY: 0.2, y: -10 }}
      animate={{ opacity: 1, scaleY: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 520, damping: 24 }}
      className={`relative rounded-md px-2.5 py-1 text-xs font-mono border select-none
        ${isFoundChip
          ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
          : isComplementChip
          ? 'bg-orange-500/20 border-orange-500/60 text-orange-300'
          : 'bg-indigo-500/15 border-indigo-500/20 text-indigo-300'
        }`}
    >
      {/* Pulsing ring on the chip being searched */}
      {isComplementChip && (
        <motion.span
          className="absolute inset-0 rounded-md border-2 border-orange-400 pointer-events-none"
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.06, 1] }}
          transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {isFoundChip && (
        <motion.span
          className="absolute inset-0 rounded-md border-2 border-emerald-400 pointer-events-none"
          animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
          transition={{ duration: 0.7, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      {val} <span className="text-slate-500">→</span> idx {idx}
    </motion.span>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function TwoSumVisualizer({ onStepChange }) {
  const [nums,        setNums]        = useState(DEFAULT_NUMS)
  const [target,      setTarget]      = useState(DEFAULT_TARGET)
  const [draftNums,   setDraftNums]   = useState(DEFAULT_NUMS.join(', '))
  const [draftTarget, setDraftTarget] = useState(String(DEFAULT_TARGET))
  const [error,       setError]       = useState(null)

  const steps  = useMemo(() => buildTwoSumSteps(nums, target), [nums, target])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function handleRun() {
    const parsed = parseIntList(draftNums, { min: 2, max: 10 })
    if (parsed.error) { setError(parsed.error); return }
    const t = Number(draftTarget.trim())
    if (draftTarget.trim() === '' || !Number.isInteger(t)) { setError('Target must be an integer.'); return }
    setError(null)
    setNums(parsed.value)
    setTarget(t)
    setTimeout(() => reset(), 0)
  }

  const example = (numsText, targetText) => ({
    label: `${numsText.replaceAll(' ', '')} → ${targetText}`,
    onClick: () => { setDraftNums(numsText); setDraftTarget(targetText); setError(null) },
  })

  function getStatus(i) {
    if (step.foundPair?.includes(i)) return 'found'
    if (i === step.activeIndex)      return 'active'
    if (i === step.complementIndex)  return 'complement'
    if (step.map?.[nums[i]] === i)   return 'stored'
    return 'idle'
  }

  const statuses = nums.map((_, i) => getStatus(i))
  const maxVal   = Math.max(...nums, 1)

  // Which map chip is the complement we're currently looking for
  const complementVal = (step.type === 'check' || step.type === 'found') && step.activeIndex !== null
    ? String(target - nums[step.activeIndex])
    : null

  const isFound = step.type === 'found'

  return (
    <div className="space-y-4">
      <VizHeader
        title="Two Sum"
        subtitle={<>
          Target: <span className="font-mono text-blue-400 font-bold">{target}</span>
          <span className="text-slate-600 ml-2 text-xs">— hover a bottle to see what it needs</span>
        </>}
        aside={<Legend items={[['#3b82f6', 'Checking'], ['#f97316', 'Complement'], ['#3b82f6', 'In table'], ['#22c55e', 'Found!']]} />}
      />

      <InputPanel
        title="Try your own values"
        fields={[
          { label: 'Array (comma-separated)', value: draftNums, onChange: setDraftNums, placeholder: 'e.g. 2, 7, 11, 15' },
          { label: 'Target', value: draftTarget, onChange: setDraftTarget, placeholder: 'e.g. 9', grow: false },
        ]}
        onRun={handleRun}
        error={error}
        examples={[example('2, 7, 11, 15', '9'), example('3, 2, 4', '6'), example('5, 1, 9, 2, 7', '11')]}
      />

      {/* Bottles */}
      <div className="rounded-2xl border border-white/10 bg-[#070d1f] px-4 pt-6 pb-3">
        <div className="flex items-end justify-around gap-1 flex-wrap">
          {nums.map((val, i) => {
            const c = STATUS_COLORS[statuses[i]] ?? STATUS_COLORS.idle
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <Bottle value={val} maxVal={maxVal} status={statuses[i]} idx={i} target={target} />
                <span className="text-sm font-bold font-mono" style={{ color: c.glow ?? '#64748b', transition: 'color 0.3s' }}>
                  {val}
                </span>
                <span className="text-[10px] font-mono text-slate-600">[{i}]</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Hash map */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Lookup table <span className="text-slate-600 font-normal normal-case">(value → index)</span>
        </p>
        <div className="flex flex-wrap gap-2 min-h-7 items-center">
          {Object.entries(step.map ?? {}).length === 0 ? (
            <span className="text-xs text-slate-600 italic">empty</span>
          ) : (
            Object.entries(step.map).map(([val, idx]) => {
              const isComplementChip = complementVal === val
              const isFoundChip = isFound && step.complementIndex !== null && step.map?.[val] === step.complementIndex
              return (
                <MapChip
                  key={val}
                  val={val}
                  idx={idx}
                  isComplementChip={isComplementChip && !isFoundChip}
                  isFoundChip={isFoundChip}
                />
              )
            })
          )}
        </div>
      </div>

      {/* Found celebration banner */}
      <AnimatePresence>
        {isFound && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-3">
              Found the pair!
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-center">
                <p className="text-[10px] text-slate-500 mb-0.5">idx {step.complementIndex}</p>
                <motion.p
                  initial={{ scale: 0.4 }} animate={{ scale: [0.4, 1.2, 1] }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className="text-3xl font-black font-mono text-emerald-300"
                >
                  {nums[step.complementIndex]}
                </motion.p>
              </div>
              <span className="text-xl text-slate-400 font-bold">+</span>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 mb-0.5">idx {step.activeIndex}</p>
                <motion.p
                  initial={{ scale: 0.4 }} animate={{ scale: [0.4, 1.2, 1] }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.08 }}
                  className="text-3xl font-black font-mono text-emerald-300"
                >
                  {nums[step.activeIndex]}
                </motion.p>
              </div>
              <span className="text-xl text-slate-400 font-bold">=</span>
              <motion.p
                initial={{ scale: 0.4 }} animate={{ scale: [0.4, 1.25, 1] }}
                transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.16 }}
                className="text-3xl font-black font-mono text-white"
              >
                {target}
              </motion.p>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-mono">
              return [{step.complementIndex}, {step.activeIndex}]
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <StepMessage message={step.message} />

      <StepControls runner={runner} />
    </div>
  )
}
