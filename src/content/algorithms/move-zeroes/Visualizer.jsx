import { useMemo, useEffect, useState } from 'react'
import { buildMoveZeroesSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import {
  VizHeader, InputPanel, Panel, ArrayRow, Stats, StepMessage, ResultBanner,
} from '../../../components/ui/VisualizerKit'
import { parseIntList } from '../../../lib/vizHelpers'

const DEFAULT = [0, 1, 0, 3, 12]

export default function MoveZeroesVisualizer({ onStepChange }) {
  const [nums,  setNums]  = useState(DEFAULT)
  const [draft, setDraft] = useState(DEFAULT.join(', '))
  const [error, setError] = useState(null)

  const steps  = useMemo(() => buildMoveZeroesSteps(nums), [nums])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function run(text) {
    const r = parseIntList(text)
    if (r.error) { setError(r.error); return }
    setError(null)
    setDraft(text)
    setNums(r.value)
    setTimeout(() => reset(), 0)
  }

  const isDone = step.type === 'done'

  function getState(idx) {
    if (step.swapped?.includes(idx)) return 'found'
    if (idx === step.i) return 'bad'
    if (idx < step.left) return 'done'
    if (isDone) return 'dim'
    return 'pending'
  }

  function getTags(idx) {
    if (isDone) return []
    const tags = []
    if (idx === step.i) tags.push({ text: 'i', color: 'pink' })
    if (idx === step.left) tags.push({ text: 'left', color: 'blue' })
    return tags
  }

  return (
    <div className="space-y-4">
      <VizHeader title="Move Zeroes" subtitle="Swap every non-zero into the next front seat — zeros sink to the back." />

      <InputPanel
        fields={[{ label: 'nums (up to 16)', value: draft, onChange: setDraft, placeholder: '0, 1, 0, 3, 12' }]}
        onRun={() => run(draft)}
        error={error}
        examples={[
          { label: '[0,1,0,3,12]',    onClick: () => run('0, 1, 0, 3, 12') },
          { label: '[4,2,0,0,0,7,1]', onClick: () => run('4, 2, 0, 0, 0, 7, 1') },
          { label: '[0]',             onClick: () => run('0') },
        ]}
      />

      <Panel title="nums" legend={[['#ec4899', 'scout i'], ['#3b82f6', 'left'], ['#10b981', 'non-zero placed']]}>
        <ArrayRow values={step.arr} getState={getState} getTags={getTags} />
        <Stats items={[['left', step.left, 'blue'], ['i', step.i < 0 ? '—' : step.i, 'pink']]} />
      </Panel>

      <ResultBanner show={isDone} title={`[${step.arr.join(', ')}]`} detail="Non-zeros kept their order; every zero ended up at the back." />
      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
