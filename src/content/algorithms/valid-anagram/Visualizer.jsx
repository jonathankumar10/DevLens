import { useMemo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { buildValidAnagramSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { VizHeader, InputPanel, Panel, ArrayRow, StepMessage, ResultBanner } from '../../../components/ui/VisualizerKit'

const MAX_LEN = 16

function CountChip({ ch, n, checking }) {
  const tone =
    n === 0 ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' :
    n > 0   ? 'border-blue-500/40 bg-blue-500/10 text-blue-200' :
              'border-pink-500/40 bg-pink-500/10 text-pink-200'
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: checking ? 1.12 : 1 }}
      className={`rounded-lg border px-2.5 py-1.5 font-mono text-xs ${tone} ${checking ? 'ring-2 ring-amber-400' : ''}`}
    >
      <span className="font-bold">{ch}</span>
      <span className="text-slate-500"> : </span>
      <span className="font-bold">{n > 0 ? `+${n}` : n}</span>
    </motion.div>
  )
}

export default function ValidAnagramVisualizer({ onStepChange }) {
  const [input,  setInput]  = useState({ s: 'anagram', t: 'nagaram' })
  const [draftS, setDraftS] = useState('anagram')
  const [draftT, setDraftT] = useState('nagaram')
  const [error,  setError]  = useState(null)

  const steps  = useMemo(() => buildValidAnagramSteps(input.s, input.t), [input])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function run(s, t) {
    if (!s || !t) { setError('Enter both strings.'); return }
    if (s.length > MAX_LEN || t.length > MAX_LEN) { setError(`Keep each string to ${MAX_LEN} characters.`); return }
    setError(null)
    setDraftS(s)
    setDraftT(t)
    setInput({ s, t })
    setTimeout(() => reset(), 0)
  }

  const getState = (idx) =>
    step.i === idx ? 'active' : step.i > idx || step.checking || step.result !== null ? 'done' : 'pending'
  const getStateT = (idx) =>
    step.i === idx ? 'active2' : step.i > idx || step.checking || step.result !== null ? 'done' : 'pending'

  return (
    <div className="space-y-4">
      <VizHeader title="Valid Anagram" subtitle="Tally up letters from s, erase them with t — anagrams leave all zeros." />

      <InputPanel
        fields={[
          { label: 's', value: draftS, onChange: setDraftS, placeholder: 'anagram' },
          { label: 't', value: draftT, onChange: setDraftT, placeholder: 'nagaram' },
        ]}
        onRun={() => run(draftS, draftT)}
        error={error}
        examples={[
          { label: 'anagram / nagaram', onClick: () => run('anagram', 'nagaram') },
          { label: 'rat / car',         onClick: () => run('rat', 'car') },
          { label: 'listen / silent',   onClick: () => run('listen', 'silent') },
        ]}
      />

      <Panel title="Strings" legend={[['#3b82f6', 's[i] (+1)'], ['#ec4899', 't[i] (−1)'], ['#10b981', 'counted']]}>
        <div className="space-y-1">
          <p className="text-[11px] font-mono text-slate-500">s</p>
          <ArrayRow values={input.s.split('')} getState={getState} showIndex={false} />
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-mono text-slate-500">t</p>
          <ArrayRow values={input.t.split('')} getState={getStateT} />
        </div>
      </Panel>

      <Panel title="count map" legend={[['#10b981', '0'], ['#3b82f6', 'extra in s'], ['#ec4899', 'extra in t']]}>
        {step.count.length === 0 ? (
          <p className="text-xs text-slate-600 font-mono">{'{ }'}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {step.count.map(([ch, n]) => (
              <CountChip key={ch} ch={ch} n={n} checking={step.checking === ch} />
            ))}
          </div>
        )}
      </Panel>

      <ResultBanner
        show={step.result !== null}
        ok={step.result === true}
        title={step.result ? 'Anagram — return true' : 'Not an anagram — return false'}
        detail={step.type === 'length-mismatch' ? 'Different lengths can never be anagrams.' : step.result ? 'Every letter count cancelled to zero.' : 'At least one letter count is non-zero.'}
      />

      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
