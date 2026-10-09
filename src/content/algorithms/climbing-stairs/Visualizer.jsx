import { useMemo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { buildClimbingStairsSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { VizHeader, InputPanel, Panel, Stats, StepMessage, ResultBanner } from '../../../components/ui/VisualizerKit'
import { CELL_STYLES } from '../../../lib/vizHelpers'

const DEFAULT_N = 6
const MAX_N = 15

export default function ClimbingStairsVisualizer({ onStepChange }) {
  const [n,     setN]     = useState(DEFAULT_N)
  const [draft, setDraft] = useState(String(DEFAULT_N))
  const [error, setError] = useState(null)

  const steps  = useMemo(() => buildClimbingStairsSteps(n), [n])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function run(text) {
    const v = Number(text)
    if (!Number.isInteger(v) || v < 1 || v > MAX_N) { setError(`n must be between 1 and ${MAX_N}.`); return }
    setError(null)
    setDraft(String(v))
    setN(v)
    setTimeout(() => reset(), 0)
  }

  const isEnd = step.type === 'done' || step.type === 'small'
  const stairs = Array.from({ length: n }, (_, k) => k + 1)

  function state(s) {
    if (step.ways[s] == null) return 'pending'
    if (isEnd) return s === n ? 'found' : 'done'
    if (step.type === 'step') {
      if (s === step.i) return 'found'
      if (s === step.i - 1) return 'active2'
      if (s === step.i - 2) return 'violet'
    }
    if (step.type === 'init' && s <= 2) return s === 1 ? 'violet' : 'active2'
    return 'done'
  }

  function tag(s) {
    if (isEnd) return null
    const p2 = step.type === 'step' ? step.i : 2
    if (s === p2) return 'p2'
    if (s === p2 - 1) return 'p1'
    return null
  }

  return (
    <div className="space-y-4">
      <VizHeader title="Climbing Stairs" subtitle="ways(i) = ways(i − 1) + ways(i − 2) — Fibonacci in disguise." />

      <InputPanel
        fields={[{ label: `n (1–${MAX_N})`, value: draft, onChange: setDraft, placeholder: '6' }]}
        onRun={() => run(draft)}
        error={error}
        examples={[
          { label: 'n = 2',  onClick: () => run('2') },
          { label: 'n = 5',  onClick: () => run('5') },
          { label: 'n = 10', onClick: () => run('10') },
        ]}
      />

      <Panel title="Staircase · ways to reach each stair" legend={[['#8b5cf6', 'i − 2 (p1)'], ['#ec4899', 'i − 1 (p2)'], ['#10b981', 'stair i']]}>
        <div className="flex items-end gap-1 h-56 pt-5">
          {stairs.map((s) => {
            const t = tag(s)
            return (
              <div key={s} className="relative flex-1 flex flex-col justify-end h-full" style={{ maxWidth: 52 }}>
                <motion.div
                  className={`relative w-full rounded-t-md border-2 flex items-start justify-center pt-1 font-mono font-bold text-xs transition-colors ${CELL_STYLES[state(s)]}`}
                  initial={false}
                  animate={{ height: `${(s / n) * 100}%` }}
                >
                  {t && (
                    <span className={`absolute -top-5 rounded-full border px-1.5 text-[9px] font-black leading-[14px] ${t === 'p1' ? 'text-violet-300 border-violet-400/60 bg-violet-500/15' : 'text-pink-300 border-pink-400/60 bg-pink-500/15'}`}>
                      {t}
                    </span>
                  )}
                  {step.ways[s] ?? '?'}
                </motion.div>
                <span className="text-center text-[9px] font-mono text-slate-600 mt-1">{s}</span>
              </div>
            )
          })}
        </div>
        <Stats items={[
          ['p1', step.type === 'step' ? step.ways[step.i - 1] : step.ways[1] ?? '—', 'violet'],
          ['p2', step.type === 'step' ? step.ways[step.i] : step.ways[Math.min(2, n)] ?? '—', 'pink'],
        ]} />
      </Panel>

      <ResultBanner show={isEnd} title={`${step.ways[n]} ways to climb ${n} stair${n === 1 ? '' : 's'}`} detail="Only the previous two answers were ever kept in memory." />
      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
