import { useMemo, useEffect, useState } from 'react'
import { buildRemoveDuplicatesSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import {
  VizHeader, InputPanel, Panel, ArrayRow, Stats, StepMessage, ResultBanner,
} from '../../../components/ui/VisualizerKit'
import { parseIntList } from '../../../lib/vizHelpers'

const DEFAULT = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]

export default function RemoveDuplicatesVisualizer({ onStepChange }) {
  const [nums,  setNums]  = useState(DEFAULT)
  const [draft, setDraft] = useState(DEFAULT.join(', '))
  const [error, setError] = useState(null)

  const steps  = useMemo(() => buildRemoveDuplicatesSteps(nums), [nums])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function run(text) {
    const r = parseIntList(text)
    if (r.error) { setError(r.error); return }
    const sorted = r.value.every((v, i) => i === 0 || r.value[i - 1] <= v)
    if (!sorted) { setError('The array must be sorted in non-decreasing order.'); return }
    setError(null)
    setDraft(text)
    setNums(r.value)
    setTimeout(() => reset(), 0)
  }

  const isDone = step.type === 'done'

  function getState(idx) {
    if (idx === step.written) return 'found'
    if (idx === step.i) return step.type === 'skip' ? 'bad' : 'active2'
    if (idx < step.k) return 'done'
    if (isDone) return 'dim'
    return 'pending'
  }

  function getTags(idx) {
    if (isDone) return idx === step.k - 1 ? [{ text: 'k-1', color: 'emerald' }] : []
    const tags = []
    if (idx === step.i) tags.push({ text: 'i', color: 'pink' })
    if (idx === step.k) tags.push({ text: 'k', color: 'emerald' })
    return tags
  }

  return (
    <div className="space-y-4">
      <VizHeader title="Remove Duplicates from Sorted Array" subtitle="Reader scans ahead, writer keeps only new values." />

      <InputPanel
        fields={[{ label: 'sorted nums (up to 16)', value: draft, onChange: setDraft, placeholder: '0, 0, 1, 1, 2' }]}
        onRun={() => run(draft)}
        error={error}
        examples={[
          { label: '[1,1,2]',              onClick: () => run('1, 1, 2') },
          { label: '[0,0,1,1,1,2,2,3,3,4]', onClick: () => run(DEFAULT.join(', ')) },
          { label: '[1,2,3]',              onClick: () => run('1, 2, 3') },
        ]}
      />

      <Panel title="nums" legend={[['#ec4899', 'reader i'], ['#10b981', 'unique prefix'], ['#f43f5e', 'duplicate']]}>
        <ArrayRow values={step.arr} getState={getState} getTags={getTags} />
        <Stats items={[['k', step.k, 'emerald'], ['unique so far', `[${step.arr.slice(0, step.k).join(', ')}]`]]} />
      </Panel>

      <ResultBanner show={isDone} title={`Return k = ${step.k}`} detail="Everything after index k − 1 can be ignored." />
      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
