import { useMemo, useEffect, useState } from 'react'
import { buildRemoveNthSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import {
  VizHeader, InputPanel, Panel, ListRow, Stats, StepMessage, ResultBanner,
} from '../../../components/ui/VisualizerKit'
import { parseIntList } from '../../../lib/vizHelpers'

const DEFAULT = { values: [1, 2, 3, 4, 5], n: 2 }

export default function RemoveNthNodeVisualizer({ onStepChange }) {
  const [input,       setInput]       = useState(DEFAULT)
  const [draftValues, setDraftValues] = useState(DEFAULT.values.join(', '))
  const [draftN,      setDraftN]      = useState(String(DEFAULT.n))
  const [error,       setError]       = useState(null)

  const steps  = useMemo(() => buildRemoveNthSteps(input.values, input.n), [input])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function run(valuesText, nText) {
    const r = parseIntList(valuesText, { max: 10 })
    if (r.error) { setError(r.error); return }
    const n = Number(nText)
    if (!Number.isInteger(n) || n < 1 || n > r.value.length) { setError(`n must be between 1 and ${r.value.length}.`); return }
    setError(null)
    setDraftValues(valuesText)
    setDraftN(String(n))
    setInput({ values: r.value, n })
    setTimeout(() => reset(), 0)
  }

  const isDone = step.type === 'done'
  const all = [{ key: 0, val: 'D' }, ...input.values.map((val, i) => ({ key: i + 1, val }))]
  const nodes = isDone ? all.filter((nd) => nd.key !== step.removed) : all

  function getState(key) {
    if (key === 0) return 'dim'
    if (key === step.removed) return isDone ? 'dim' : 'bad'
    if (isDone) return 'done'
    if (key === step.slow && key === step.fast) return 'violet'
    if (key === step.slow) return 'active'
    if (key === step.fast) return 'active2'
    if (step.slow < key && key < step.fast) return 'range'
    return 'pending'
  }

  function getTags(key) {
    if (isDone) return key === 0 ? [{ text: 'dummy', color: 'white' }] : []
    const tags = []
    if (key === step.slow) tags.push({ text: 'S', color: 'blue' })
    if (key === step.fast) tags.push({ text: 'F', color: 'pink' })
    return tags
  }

  return (
    <div className="space-y-4">
      <VizHeader title="Remove Nth Node From End" subtitle="Give fast an n-node head start; when it hits the end, slow is right before the target." />

      <InputPanel
        fields={[
          { label: 'values (up to 10)', value: draftValues, onChange: setDraftValues, placeholder: '1, 2, 3, 4, 5' },
          { label: 'n', value: draftN, onChange: setDraftN, placeholder: '2', grow: false },
        ]}
        onRun={() => run(draftValues, draftN)}
        error={error}
        examples={[
          { label: '[1,2,3,4,5], n=2', onClick: () => run('1, 2, 3, 4, 5', '2') },
          { label: '[1,2], n=2 (head)', onClick: () => run('1, 2', '2') },
          { label: '[1], n=1',          onClick: () => run('1', '1') },
        ]}
      />

      <Panel title="List (D = dummy)" legend={[['#3b82f6', 'slow'], ['#ec4899', 'fast'], ['#64748b', 'gap'], ['#f43f5e', 'to remove']]}>
        <ListRow nodes={nodes} getState={getState} getTags={getTags} />
        <Stats items={[['n', input.n, 'amber'], ['gap (fast − slow)', step.fast - step.slow, 'violet']]} />
      </Panel>

      <ResultBanner
        show={isDone}
        title={`[${input.values.filter((_, i) => i + 1 !== step.removed).join(', ')}]`}
        detail={`Removed ${input.values[step.removed - 1]}, the ${input.n === 1 ? 'last' : `${input.n}th-from-last`} node, in a single pass.`}
      />
      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
