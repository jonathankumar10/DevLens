import { useMemo, useEffect, useState } from 'react'
import { buildFirstBadVersionSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { VizHeader, InputPanel, Panel, ArrayRow, Stats, StepMessage, ResultBanner } from '../../../components/ui/VisualizerKit'

const DEFAULT = { n: 12, bad: 8 }

export default function FirstBadVersionVisualizer({ onStepChange }) {
  const [input,    setInput]    = useState(DEFAULT)
  const [draftN,   setDraftN]   = useState(String(DEFAULT.n))
  const [draftBad, setDraftBad] = useState(String(DEFAULT.bad))
  const [error,    setError]    = useState(null)

  const steps  = useMemo(() => buildFirstBadVersionSteps(input.n, input.bad), [input])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function run(nText, badText) {
    const n = Number(nText)
    const bad = Number(badText)
    if (!Number.isInteger(n) || n < 1 || n > 24) { setError('n must be between 1 and 24.'); return }
    if (!Number.isInteger(bad) || bad < 1 || bad > n) { setError(`The first bad version must be between 1 and ${n}.`); return }
    setError(null)
    setDraftN(String(n))
    setDraftBad(String(bad))
    setInput({ n, bad })
    setTimeout(() => reset(), 0)
  }

  const versions = Array.from({ length: input.n }, (_, i) => i + 1)
  const isDone = step.type === 'done'

  function getState(idx) {
    const v = idx + 1
    if (isDone) return v === step.left ? 'found' : v < step.left ? 'done' : 'bad'
    if (v === step.mid) return step.type === 'bad' ? 'bad' : 'done'
    if (v in step.checked) return step.checked[v] ? 'bad' : 'done'
    if (step.type !== 'init' && (v < step.left || v > step.right)) return 'dim'
    return 'range'
  }

  function getTags(idx) {
    const v = idx + 1
    if (isDone) return v === step.left ? [{ text: 'first bad', color: 'emerald' }] : []
    const tags = []
    if (v === step.left)  tags.push({ text: 'L', color: 'blue' })
    if (v === step.mid)   tags.push({ text: 'M', color: 'amber' })
    if (v === step.right) tags.push({ text: 'R', color: 'pink' })
    return tags
  }

  return (
    <div className="space-y-4">
      <VizHeader title="First Bad Version" subtitle="Green, green, green… red. Find the first red with as few API calls as possible." />

      <InputPanel
        fields={[
          { label: 'n (versions, up to 24)', value: draftN, onChange: setDraftN, placeholder: '12' },
          { label: 'first bad (hidden from the algorithm)', value: draftBad, onChange: setDraftBad, placeholder: '8' },
        ]}
        onRun={() => run(draftN, draftBad)}
        error={error}
        examples={[
          { label: 'n=5, bad=4',   onClick: () => run('5', '4') },
          { label: 'n=12, bad=8',  onClick: () => run('12', '8') },
          { label: 'n=24, bad=1',  onClick: () => run('24', '1') },
          { label: 'n=24, bad=24', onClick: () => run('24', '24') },
        ]}
      />

      <Panel title="Versions" legend={[['#64748b', 'unknown'], ['#10b981', 'good'], ['#f43f5e', 'bad']]}>
        <ArrayRow
          values={versions.map((v) => (v in step.checked || isDone ? v : '?'))}
          getState={getState}
          getTags={getTags}
          getSub={(i) => i + 1}
          showIndex={false}
        />
        <Stats items={[['API calls', step.calls, 'amber'], ['left', step.left, 'blue'], ['right', step.right, 'pink']]} />
      </Panel>

      <ResultBanner show={isDone} title={`First bad version = ${step.left}`} detail={`Found with ${step.calls} call${step.calls === 1 ? '' : 's'} to isBadVersion — a linear scan could need ${input.n}.`} />
      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
