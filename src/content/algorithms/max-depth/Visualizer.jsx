import { useMemo, useEffect, useState } from 'react'
import { buildMaxDepthSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import {
  VizHeader, InputPanel, Panel, TreeView, Stats, StepMessage, ResultBanner,
} from '../../../components/ui/VisualizerKit'
import { parseLevelOrder } from '../../../lib/vizHelpers'

const DEFAULT = '3, 9, 20, null, null, 15, 7'

export default function MaxDepthVisualizer({ onStepChange }) {
  const [tree,  setTree]  = useState(() => parseLevelOrder(DEFAULT).value)
  const [draft, setDraft] = useState(DEFAULT)
  const [error, setError] = useState(null)

  const steps  = useMemo(() => buildMaxDepthSteps(tree), [tree])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function run(text) {
    const r = parseLevelOrder(text)
    if (r.error) { setError(r.error); return }
    setError(null)
    setDraft(text)
    setTree(r.value)
    setTimeout(() => reset(), 0)
  }

  function getState(key) {
    if (key === step.current) return step.type === 'return' || step.type === 'done' ? 'done' : 'active'
    if (key in step.depths) return 'done'
    if (step.stack.includes(key)) return 'mid'
    return 'pending'
  }

  return (
    <div className="space-y-4">
      <VizHeader title="Maximum Depth of Binary Tree" subtitle="Each node returns 1 + the deeper of its two children." />

      <InputPanel
        fields={[{ label: 'level order (use null for gaps)', value: draft, onChange: setDraft, placeholder: DEFAULT }]}
        onRun={() => run(draft)}
        error={error}
        examples={[
          { label: '[3,9,20,null,null,15,7]', onClick: () => run(DEFAULT) },
          { label: '[1,null,2]',              onClick: () => run('1, null, 2') },
          { label: 'left-leaning',            onClick: () => run('1, 2, 3, 4, null, null, null, 5') },
        ]}
      />

      <Panel title="Tree · returned depth shown in amber" legend={[['#2563eb', 'current call'], ['#f59e0b', 'waiting on stack'], ['#10b981', 'returned']]}>
        <TreeView tree={tree} getState={getState} getBadge={(key) => step.depths[key]} />
        <Stats items={[['call stack depth', step.stack.length, 'amber']]} />
      </Panel>

      <ResultBanner show={step.type === 'done' || step.type === 'empty'} title={`Maximum depth = ${step.answer ?? 0}`} detail="Answers bubbled up from the leaves to the root." />
      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
