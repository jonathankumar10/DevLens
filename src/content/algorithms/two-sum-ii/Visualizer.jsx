import { useMemo, useEffect, useState } from 'react'
import { buildTwoSumIISteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import {
  VizHeader, InputPanel, Panel, ArrayRow, Stats, StepMessage, ResultBanner,
} from '../../../components/ui/VisualizerKit'
import { parseIntList } from '../../../lib/vizHelpers'

const DEFAULT = { numbers: [1, 3, 4, 5, 7, 10, 11], target: 9 }

export default function TwoSumIIVisualizer({ onStepChange }) {
  const [input,       setInput]       = useState(DEFAULT)
  const [draftNums,   setDraftNums]   = useState(DEFAULT.numbers.join(', '))
  const [draftTarget, setDraftTarget] = useState(String(DEFAULT.target))
  const [error,       setError]       = useState(null)

  const steps  = useMemo(() => buildTwoSumIISteps(input.numbers, input.target), [input])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function run(numsText, targetText) {
    const r = parseIntList(numsText, { min: 2 })
    if (r.error) { setError(r.error); return }
    if (r.value.some((v, i) => i > 0 && r.value[i - 1] > v)) { setError('numbers must be sorted in non-decreasing order.'); return }
    const target = Number(targetText)
    if (!Number.isInteger(target)) { setError('Target must be a whole number.'); return }
    setError(null)
    setDraftNums(numsText)
    setDraftTarget(String(target))
    setInput({ numbers: r.value, target })
    setTimeout(() => reset(), 0)
  }

  const isFound = step.type === 'found'

  function getState(idx) {
    if (isFound) return idx === step.left || idx === step.right ? 'found' : 'dim'
    if (step.type === 'not-found') return 'dim'
    if (idx === step.left)  return step.type === 'too-small' ? 'bad' : 'active'
    if (idx === step.right) return step.type === 'too-big' ? 'bad' : 'active2'
    if (idx < step.left || idx > step.right) return 'dim'
    return 'range'
  }

  function getTags(idx) {
    if (step.type === 'not-found') return []
    const tags = []
    if (idx === step.left)  tags.push({ text: 'L', color: 'blue' })
    if (idx === step.right) tags.push({ text: 'R', color: 'pink' })
    return tags
  }

  const sumTone = step.sum == null ? 'default' : step.sum === input.target ? 'emerald' : 'rose'

  return (
    <div className="space-y-4">
      <VizHeader title="Two Sum II – Sorted Input" subtitle="Sum too big? Move right in. Too small? Move left in." />

      <InputPanel
        fields={[
          { label: 'sorted numbers (2–16)', value: draftNums, onChange: setDraftNums, placeholder: '2, 7, 11, 15' },
          { label: 'target', value: draftTarget, onChange: setDraftTarget, placeholder: '9', grow: false },
        ]}
        onRun={() => run(draftNums, draftTarget)}
        error={error}
        examples={[
          { label: '[2,7,11,15] / 9',        onClick: () => run('2, 7, 11, 15', '9') },
          { label: '[1,3,4,5,7,10,11] / 9',  onClick: () => run('1, 3, 4, 5, 7, 10, 11', '9') },
          { label: '[-1,0] / -1',            onClick: () => run('-1, 0', '-1') },
          { label: '[1,2,3] / 10',           onClick: () => run('1, 2, 3', '10') },
        ]}
      />

      <Panel title="numbers (1-indexed answer)" legend={[['#3b82f6', 'left'], ['#ec4899', 'right'], ['#f43f5e', 'pointer that moves'], ['#10b981', 'pair']]}>
        <ArrayRow values={input.numbers} getState={getState} getTags={getTags} getSub={(i) => `#${i + 1}`} showIndex={false} />
        <Stats items={[['sum', step.sum ?? '—', sumTone], ['target', input.target, 'violet']]} />
      </Panel>

      <ResultBanner
        show={isFound || step.type === 'not-found'}
        ok={isFound}
        title={isFound ? `Return [${step.left + 1}, ${step.right + 1}]` : 'Return [-1, -1]'}
        detail={isFound ? `${input.numbers[step.left]} + ${input.numbers[step.right]} = ${input.target}` : 'No two numbers add up to the target.'}
      />
      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
