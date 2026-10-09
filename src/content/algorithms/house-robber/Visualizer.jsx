import { useMemo, useEffect, useState } from 'react'
import { buildHouseRobberSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import {
  VizHeader, InputPanel, Panel, ArrayRow, Stats, StepMessage, ResultBanner,
} from '../../../components/ui/VisualizerKit'
import { parseIntList } from '../../../lib/vizHelpers'

const DEFAULT = [2, 7, 9, 3, 1]

export default function HouseRobberVisualizer({ onStepChange }) {
  const [nums,  setNums]  = useState(DEFAULT)
  const [draft, setDraft] = useState(DEFAULT.join(', '))
  const [error, setError] = useState(null)

  const steps  = useMemo(() => buildHouseRobberSteps(nums), [nums])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function run(text) {
    const r = parseIntList(text, { max: 12 })
    if (r.error) { setError(r.error); return }
    if (r.value.some((v) => v < 0)) { setError('Amounts must be ≥ 0.'); return }
    setError(null)
    setDraft(text)
    setNums(r.value)
    setTimeout(() => reset(), 0)
  }

  const isEnd = step.robbed !== null

  function houseState(i) {
    if (isEnd) return step.robbed.includes(i) ? 'found' : 'dim'
    if (i === step.i) return step.type === 'skip' ? 'bad' : 'active'
    if (i === step.i - 2 && step.type === 'rob') return 'violet'
    return i < step.i ? 'range' : 'pending'
  }

  function dpState(i) {
    if (step.dp[i] == null) return 'pending'
    if (isEnd) return i === nums.length - 1 ? 'found' : 'done'
    if (i === step.i) return 'found'
    if (i === step.i - 1) return step.type === 'skip' ? 'active2' : 'pending'
    if (i === step.i - 2) return step.type === 'rob' ? 'violet' : 'pending'
    return 'done'
  }

  const dpTags = (i) => {
    if (isEnd || step.i < 2) return []
    if (i === step.i - 1) return [{ text: 'skip', color: 'pink' }]
    if (i === step.i - 2) return [{ text: '+num', color: 'violet' }]
    return []
  }

  return (
    <div className="space-y-4">
      <VizHeader title="House Robber" subtitle="At every house: skip it (dp[i−1]) or rob it (nums[i] + dp[i−2])." />

      <InputPanel
        fields={[{ label: 'money in each house (up to 12)', value: draft, onChange: setDraft, placeholder: '2, 7, 9, 3, 1' }]}
        onRun={() => run(draft)}
        error={error}
        examples={[
          { label: '[1,2,3,1]',        onClick: () => run('1, 2, 3, 1') },
          { label: '[2,7,9,3,1]',      onClick: () => run('2, 7, 9, 3, 1') },
          { label: '[2,1,1,2]',        onClick: () => run('2, 1, 1, 2') },
          { label: '[5,1,1,5,10,2,8]', onClick: () => run('5, 1, 1, 5, 10, 2, 8') },
        ]}
      />

      <Panel title="Houses (nums)" legend={[['#3b82f6', 'house i'], ['#f43f5e', 'skipped'], ['#10b981', 'robbed']]}>
        <ArrayRow values={nums.map((v) => `$${v}`)} getState={houseState} />
      </Panel>

      <Panel title="dp — best haul using houses 0..i" legend={[['#ec4899', 'dp[i−1]'], ['#8b5cf6', 'dp[i−2]'], ['#10b981', 'dp[i]']]}>
        <ArrayRow values={step.dp.map((v) => (v == null ? '·' : v))} getState={dpState} getTags={dpTags} />
        {step.take != null && (
          <Stats items={[
            ['skip = dp[i−1]', step.skip, step.type === 'skip' ? 'emerald' : 'default'],
            ['rob = nums[i] + dp[i−2]', step.take, step.type === 'rob' ? 'emerald' : 'default'],
          ]} />
        )}
      </Panel>

      <ResultBanner
        show={isEnd}
        title={`Maximum haul = $${step.dp[nums.length - 1] ?? step.dp[0]}`}
        detail={isEnd ? `Rob houses ${step.robbed.join(', ')} — no two are neighbours.` : undefined}
      />
      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
