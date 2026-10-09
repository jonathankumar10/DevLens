import { useMemo, useEffect, useState } from 'react'
import { buildMaxSubarraySteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import {
  VizHeader, InputPanel, Panel, ArrayRow, Stats, StepMessage, ResultBanner,
} from '../../../components/ui/VisualizerKit'
import { parseIntList } from '../../../lib/vizHelpers'

const DEFAULT = [-2, 1, -3, 4, -1, 2, 1, -5, 4]

export default function MaximumSubarrayVisualizer({ onStepChange }) {
  const [nums,  setNums]  = useState(DEFAULT)
  const [draft, setDraft] = useState(DEFAULT.join(', '))
  const [error, setError] = useState(null)

  const steps  = useMemo(() => buildMaxSubarraySteps(nums), [nums])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function handleRun(text = draft) {
    const r = parseIntList(text)
    if (r.error) { setError(r.error); return }
    setError(null)
    setNums(r.value)
    setTimeout(() => reset(), 0)
  }

  const example = (arr) => ({ label: `[${arr.join(',')}]`, onClick: () => { setDraft(arr.join(', ')); handleRun(arr.join(',')) } })

  const isDone = step.type === 'done'

  function getState(idx) {
    if (isDone) return idx >= step.bestStart && idx <= step.bestEnd ? 'found' : 'dim'
    if (step.i < 0) return 'pending'
    if (idx === step.i) return step.type === 'reset' ? 'mid' : step.type === 'new-max' ? 'found' : 'active'
    if (idx >= step.start && idx < step.i) return 'range'
    if (idx < step.start) return 'dim'
    return 'pending'
  }

  function getTags(idx) {
    const tags = []
    if (!isDone && idx === step.i) tags.push({ text: 'i', color: 'blue' })
    if (!isDone && step.i >= 0 && idx === step.start) tags.push({ text: 'start', color: 'amber' })
    return tags
  }

  return (
    <div className="space-y-4">
      <VizHeader title="Maximum Subarray" subtitle="Carry a running sum — drop it the moment it goes negative." />

      <InputPanel
        fields={[{ label: 'nums (comma separated, up to 16)', value: draft, onChange: setDraft, placeholder: '-2, 1, -3, 4' }]}
        onRun={() => handleRun()}
        error={error}
        examples={[example(DEFAULT), example([5, 4, -1, 7, 8]), example([-3, -1, -2])]}
      />

      <Panel
        title="nums"
        legend={[['#3b82f6', 'current'], ['#64748b', 'window'], ['#f59e0b', 'reset'], ['#10b981', 'new best']]}
      >
        <ArrayRow values={nums} getState={getState} getTags={getTags} />
        <Stats items={[
          ['currSum', step.type === 'init' ? 0 : step.currSum, 'blue'],
          ['maxSum', step.maxSum === -Infinity ? '-∞' : step.maxSum, 'emerald'],
          ['best window', step.bestStart < 0 ? '—' : `[${step.bestStart}..${step.bestEnd}]`, 'violet'],
        ]} />
      </Panel>

      <ResultBanner
        show={isDone}
        title={`Max subarray sum = ${step.maxSum}`}
        detail={`nums[${step.bestStart}..${step.bestEnd}] = [${nums.slice(step.bestStart, step.bestEnd + 1).join(', ')}]`}
      />

      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
