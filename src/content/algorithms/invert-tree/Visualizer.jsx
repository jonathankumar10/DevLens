import { useMemo, useEffect, useState } from 'react'
import { buildInvertTreeSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import {
  VizHeader, InputPanel, Panel, TreeView, StepMessage, ResultBanner,
} from '../../../components/ui/VisualizerKit'
import { parseLevelOrder } from '../../../lib/vizHelpers'

const DEFAULT = '4, 2, 7, 1, 3, 6, 9'

export default function InvertTreeVisualizer({ onStepChange }) {
  const [tree,  setTree]  = useState(() => parseLevelOrder(DEFAULT).value)
  const [draft, setDraft] = useState(DEFAULT)
  const [error, setError] = useState(null)

  const steps  = useMemo(() => buildInvertTreeSteps(tree), [tree])
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
    if (step.type === 'done') return 'done'
    if (key === step.current) return step.type === 'swap' ? 'violet' : 'active'
    if (step.swapped.includes(key)) return 'done'
    if (step.stack.includes(key)) return 'mid'
    return 'pending'
  }

  return (
    <div className="space-y-4">
      <VizHeader title="Invert Binary Tree" subtitle="Invert both subtrees, then swap them — bottom-up mirroring." />

      <InputPanel
        fields={[{ label: 'level order (use null for gaps)', value: draft, onChange: setDraft, placeholder: DEFAULT }]}
        onRun={() => run(draft)}
        error={error}
        examples={[
          { label: '[4,2,7,1,3,6,9]', onClick: () => run(DEFAULT) },
          { label: '[2,1,3]',         onClick: () => run('2, 1, 3') },
          { label: 'lopsided',        onClick: () => run('1, 2, null, 3, 4, null, 5') },
        ]}
      />

      <Panel title="Tree" legend={[['#2563eb', 'current call'], ['#f59e0b', 'on call stack'], ['#8b5cf6', 'swapping'], ['#10b981', 'inverted']]}>
        <TreeView tree={step.tree} getState={getState} />
      </Panel>

      <ResultBanner show={step.type === 'done'} title="Tree inverted" detail="Every node swapped its children exactly once — O(n)." />
      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
