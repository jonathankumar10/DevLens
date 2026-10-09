import { useMemo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { buildKokoSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import {
  VizHeader, InputPanel, Panel, Stats, StepMessage, ResultBanner,
} from '../../../components/ui/VisualizerKit'
import { parseIntList } from '../../../lib/vizHelpers'

const DEFAULT = { piles: [3, 6, 7, 11], h: 8 }

function SpeedLine({ step }) {
  const { maxPile, left, right, rate, result, type } = step
  const pct = (v) => (maxPile === 1 ? 50 : ((v - 1) / (maxPile - 1)) * 100)
  const isDone = type === 'done'
  return (
    <div className="space-y-1.5 pt-5">
      <div className="relative h-3 rounded-full bg-slate-800">
        {!isDone && left <= right && (
          <motion.div
            className="absolute top-0 h-3 rounded-full bg-slate-500/60"
            animate={{ left: `${pct(left)}%`, width: `${Math.max(pct(right) - pct(left), 1.5)}%` }}
          />
        )}
        {rate != null && !isDone && (
          <motion.div
            className={`absolute -top-5 -translate-x-1/2 rounded-full border px-1.5 text-[9px] font-black leading-[14px] ${type === 'fits' ? 'text-emerald-300 border-emerald-400/60 bg-emerald-500/15' : 'text-rose-300 border-rose-400/60 bg-rose-500/15'}`}
            animate={{ left: `${pct(rate)}%` }}
          >
            k={rate}
          </motion.div>
        )}
        <motion.div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-300 bg-emerald-500"
          animate={{ left: `${pct(result)}%` }}
          title="best so far"
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-slate-500">
        <span>1</span>
        <span className="text-emerald-400">● best so far = {result}</span>
        <span>{maxPile}</span>
      </div>
    </div>
  )
}

export default function KokoVisualizer({ onStepChange }) {
  const [input,      setInput]      = useState(DEFAULT)
  const [draftPiles, setDraftPiles] = useState(DEFAULT.piles.join(', '))
  const [draftH,     setDraftH]     = useState(String(DEFAULT.h))
  const [error,      setError]      = useState(null)

  const steps  = useMemo(() => buildKokoSteps(input.piles, input.h), [input])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function run(pilesText, hText) {
    const r = parseIntList(pilesText, { max: 8 })
    if (r.error) { setError(r.error); return }
    if (r.value.some((p) => p < 1 || p > 99)) { setError('Pile sizes must be between 1 and 99.'); return }
    const h = Number(hText)
    if (!Number.isInteger(h) || h < r.value.length || h > 200) { setError(`h must be a whole number between ${r.value.length} (one hour per pile) and 200.`); return }
    setError(null)
    setDraftPiles(pilesText)
    setDraftH(String(h))
    setInput({ piles: r.value, h })
    setTimeout(() => reset(), 0)
  }

  const isDone = step.type === 'done'
  const tallest = Math.max(...input.piles)

  return (
    <div className="space-y-4">
      <VizHeader title="Koko Eating Bananas" subtitle="Binary search the eating speed, not the piles." />

      <InputPanel
        fields={[
          { label: 'piles (up to 8)', value: draftPiles, onChange: setDraftPiles, placeholder: '3, 6, 7, 11' },
          { label: 'h (hours)', value: draftH, onChange: setDraftH, placeholder: '8', grow: false },
        ]}
        onRun={() => run(draftPiles, draftH)}
        error={error}
        examples={[
          { label: '[3,6,7,11], h=8',      onClick: () => run('3, 6, 7, 11', '8') },
          { label: '[30,11,23,4,20], h=5', onClick: () => run('30, 11, 23, 4, 20', '5') },
          { label: '[30,11,23,4,20], h=6', onClick: () => run('30, 11, 23, 4, 20', '6') },
        ]}
      />

      <Panel title="Piles · hours at current speed">
        <div className="flex items-end gap-2 h-40">
          {input.piles.map((p, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
              <span className="text-[11px] font-mono text-slate-300">{p}</span>
              <div className="w-full flex-1 min-h-0 flex items-end justify-center">
                <motion.div
                  className="w-full max-w-[48px] rounded-t-md bg-amber-400/70 border border-amber-300/60"
                  animate={{ height: `${(p / tallest) * 100}%` }}
                />
              </div>
              <span className={`text-[11px] font-mono font-bold ${step.perPile ? (step.type === 'fits' ? 'text-emerald-300' : 'text-rose-300') : 'text-slate-600'}`}>
                {step.perPile ? `${step.perPile[i]}h` : '—'}
              </span>
            </div>
          ))}
        </div>
        <Stats items={[
          ['speed k', step.rate ?? '—', 'amber'],
          ['hours needed', step.hours ?? '—', step.type === 'fits' ? 'emerald' : step.type === 'too-slow' ? 'rose' : 'default'],
          ['h', input.h, 'violet'],
        ]} />
      </Panel>

      <Panel title="Speed search space" legend={[['#64748b', 'still possible'], ['#10b981', 'best so far']]}>
        <SpeedLine step={step} />
      </Panel>

      <ResultBanner show={isDone} title={`Minimum speed = ${step.result} bananas/hour`} detail={`Any slower and she can't finish ${input.piles.length} piles in ${input.h} hours.`} />
      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
