import { motion } from 'framer-motion'
import { usePatternAnimation } from '../../../hooks/usePatternAnimation'
import AnimationControls from '../../../components/ui/AnimationControls'

const WORD = 'racecar'

const PHASES = [
  { left: 0, right: 6, type: 'init',  msg: 'Start: left=0, right=6' },
  { left: 0, right: 6, type: 'match', msg: "s[0]='r' = s[6]='r' → match" },
  { left: 1, right: 5, type: 'match', msg: "s[1]='a' = s[5]='a' → match" },
  { left: 2, right: 4, type: 'match', msg: "s[2]='c' = s[4]='c' → match" },
  { left: 3, right: 3, type: 'done',  msg: 'left ≥ right → palindrome ✓' },
  { left: 3, right: 3, type: 'done',  msg: 'left ≥ right → palindrome ✓' },
]
const DURATIONS = [900, 1100, 1100, 1100, 1500, 900]

const CELL = 34
const GAP  = 6
const STRIDE = CELL + GAP

export default function TwoPointersAnimation() {
  const { phase, isPlaying, speed, setSpeed, togglePlay } = usePatternAnimation(DURATIONS)
  const { left, right, type, msg } = PHASES[phase]

  function cellState(i) {
    if (type === 'init') return 'pending'
    if (i < left || i > right) return 'matched'
    if (i === left || i === right) return type === 'done' ? 'matched' : 'active'
    return 'pending'
  }

  const trackW = WORD.length * STRIDE - GAP

  return (
    <div className="space-y-5 py-2">
      <p className="text-[11px] text-center uppercase tracking-wider text-slate-600">
        Two Pointers — O(n) — checking "{WORD}"
      </p>

      <div className="overflow-x-auto">
        <div className="mx-auto px-4" style={{ width: trackW + 48, paddingTop: 30 }}>
          <div className="relative" style={{ height: CELL }}>

            {type !== 'init' && (
              <motion.div
                animate={{ x: left * STRIDE + CELL / 2 }}
                transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                className="absolute top-0 pointer-events-none flex flex-col items-center"
                style={{ width: 0, marginTop: -22 }}
              >
                <div className="text-[9px] font-black text-blue-400 -translate-x-1/2">L</div>
                <svg width="8" height="6" viewBox="0 0 8 6" fill="#3b82f6" className="-translate-x-1/2">
                  <polygon points="4,6 0,0 8,0" />
                </svg>
              </motion.div>
            )}

            {type !== 'init' && (
              <motion.div
                animate={{ x: right * STRIDE + CELL / 2 }}
                transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                className="absolute top-0 pointer-events-none flex flex-col items-center"
                style={{ width: 0, marginTop: -22 }}
              >
                <div className="text-[9px] font-black text-pink-400 -translate-x-1/2">R</div>
                <svg width="8" height="6" viewBox="0 0 8 6" fill="#ec4899" className="-translate-x-1/2">
                  <polygon points="4,6 0,0 8,0" />
                </svg>
              </motion.div>
            )}

            <div className="absolute inset-0 flex" style={{ gap: GAP }}>
              {WORD.split('').map((ch, i) => {
                const state = cellState(i)
                return (
                  <motion.div
                    key={i}
                    animate={{
                      backgroundColor:
                        state === 'matched' ? 'rgba(16,185,129,0.18)' :
                        state === 'active'  ? 'rgba(6,182,212,0.18)'  :
                        'rgba(51,65,85,0.5)',
                      borderColor:
                        state === 'matched' ? 'rgba(52,211,153,0.8)' :
                        state === 'active'  ? 'rgba(34,211,238,0.85)' :
                        'rgba(100,116,139,0.6)',
                      scale: state === 'active' ? 1.08 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    style={{ width: CELL, height: CELL }}
                    className="rounded-lg border-2 flex items-center justify-center font-black text-sm font-mono text-white shrink-0"
                  >
                    {ch}
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div className="flex mt-1.5" style={{ gap: GAP }}>
            {WORD.split('').map((_, i) => (
              <div key={i} style={{ width: CELL }} className="text-center text-[9px] font-mono text-slate-700">
                {i}
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        key={msg}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center text-xs font-mono px-4 py-2 rounded-lg ${
          type === 'done' ? 'text-emerald-300 bg-emerald-500/8' : 'text-slate-400 bg-white/[0.03]'
        }`}
      >
        {msg}
      </motion.div>

      <AnimationControls isPlaying={isPlaying} speed={speed} onToggle={togglePlay} onSpeed={setSpeed} />
    </div>
  )
}
