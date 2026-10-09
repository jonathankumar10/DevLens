import { useMemo, useEffect, useState } from 'react'
import { buildLinkedListCycleSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import {
  VizHeader, InputPanel, Panel, ListRow, Stats, StepMessage, ResultBanner,
} from '../../../components/ui/VisualizerKit'
import { parseIntList } from '../../../lib/vizHelpers'

const DEFAULT = { values: [3, 2, 0, -4], pos: 1 }

export default function LinkedListCycleVisualizer({ onStepChange }) {
  const [input,       setInput]       = useState(DEFAULT)
  const [draftValues, setDraftValues] = useState(DEFAULT.values.join(', '))
  const [draftPos,    setDraftPos]    = useState(String(DEFAULT.pos))
  const [error,       setError]       = useState(null)

  const steps  = useMemo(() => buildLinkedListCycleSteps(input.values, input.pos), [input])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function run(valuesText, posText) {
    const r = parseIntList(valuesText, { max: 10 })
    if (r.error) { setError(r.error); return }
    const pos = Number(posText)
    if (!Number.isInteger(pos) || pos < -1 || pos >= r.value.length) { setError(`pos must be -1 (no cycle) or an index from 0 to ${r.value.length - 1}.`); return }
    setError(null)
    setDraftValues(valuesText)
    setDraftPos(String(pos))
    setInput({ values: r.value, pos })
    setTimeout(() => reset(), 0)
  }

  const nodes = input.values.map((val, i) => ({ key: i, val }))

  function getState(i) {
    if (step.type === 'meet' && i === step.slow) return 'found'
    if (i === step.slow && i === step.fast) return 'violet'
    if (i === step.slow) return 'active'
    if (i === step.fast) return 'active2'
    return 'pending'
  }

  function getTags(i) {
    const tags = []
    if (i === step.slow) tags.push({ text: 'S', color: 'blue' })
    if (i === step.fast) tags.push({ text: 'F', color: 'pink' })
    return tags
  }

  const isEnd = step.type === 'meet' || step.type === 'no-cycle'

  return (
    <div className="space-y-4">
      <VizHeader title="Linked List Cycle" subtitle="Tortoise moves 1, hare moves 2 — on a loop, the hare always catches up." />

      <InputPanel
        fields={[
          { label: 'values (up to 10)', value: draftValues, onChange: setDraftValues, placeholder: '3, 2, 0, -4' },
          { label: 'pos (tail → index, -1 = none)', value: draftPos, onChange: setDraftPos, placeholder: '1', grow: false },
        ]}
        onRun={() => run(draftValues, draftPos)}
        error={error}
        examples={[
          { label: '[3,2,0,-4], pos=1',       onClick: () => run('3, 2, 0, -4', '1') },
          { label: '[1,2], pos=0',            onClick: () => run('1, 2', '0') },
          { label: '[1,2,3,4,5], pos=-1',     onClick: () => run('1, 2, 3, 4, 5', '-1') },
          { label: '[1..8], pos=3',           onClick: () => run('1, 2, 3, 4, 5, 6, 7, 8', '3') },
        ]}
      />

      <Panel title="List" legend={[['#3b82f6', 'slow'], ['#ec4899', 'fast'], ['#10b981', 'meeting point']]}>
        <ListRow nodes={nodes} getState={getState} getTags={getTags} cycleTo={input.pos >= 0 ? input.pos : null} />
        <Stats items={[
          ['slow', step.slow === null ? 'null' : `node ${step.slow}`, 'blue'],
          ['fast', step.fast === null ? 'null' : `node ${step.fast}`, 'pink'],
        ]} />
      </Panel>

      <ResultBanner
        show={isEnd}
        ok={step.type === 'meet'}
        title={step.type === 'meet' ? 'Cycle detected — return true' : 'No cycle — return false'}
        detail={step.type === 'meet' ? `slow and fast met at node ${step.slow}.` : 'fast reached the end of the list.'}
      />
      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
