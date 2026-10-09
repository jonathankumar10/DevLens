import { useMemo, useEffect, useState } from 'react'
import { buildSearchRotatedSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import {
  VizHeader, InputPanel, Panel, ArrayRow, Stats, StepMessage, ResultBanner,
} from '../../../components/ui/VisualizerKit'
import { parseIntList } from '../../../lib/vizHelpers'

const DEFAULT = { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 }

function isRotatedSorted(nums) {
  if (new Set(nums).size !== nums.length) return false
  let drops = 0
  for (let i = 1; i < nums.length; i++) if (nums[i] < nums[i - 1]) drops++
  return drops === 0 || (drops === 1 && nums[nums.length - 1] < nums[0])
}

export default function SearchRotatedVisualizer({ onStepChange }) {
  const [input,       setInput]       = useState(DEFAULT)
  const [draftNums,   setDraftNums]   = useState(DEFAULT.nums.join(', '))
  const [draftTarget, setDraftTarget] = useState(String(DEFAULT.target))
  const [error,       setError]       = useState(null)

  const steps  = useMemo(() => buildSearchRotatedSteps(input.nums, input.target), [input])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function run(numsText, targetText) {
    const r = parseIntList(numsText)
    if (r.error) { setError(r.error); return }
    if (!isRotatedSorted(r.value)) { setError('Enter a rotated sorted array of unique numbers, e.g. 4, 5, 6, 7, 0, 1, 2.'); return }
    const target = Number(targetText)
    if (!Number.isInteger(target)) { setError('Target must be a whole number.'); return }
    setError(null)
    setDraftNums(numsText)
    setDraftTarget(String(target))
    setInput({ nums: r.value, target })
    setTimeout(() => reset(), 0)
  }

  const isEnd = step.type === 'found' || step.type === 'not-found'
  const inHalf = (i) => step.half && i >= step.half[0] && i <= step.half[1]

  function getState(idx) {
    if (step.type === 'found') return idx === step.answer ? 'found' : 'dim'
    if (step.type === 'not-found') return 'dim'
    if (idx === step.mid) return 'mid'
    if (step.phase === 'search' && !inHalf(idx)) return 'dim'
    if (step.type === 'pivot-found' && idx === step.pivot) return 'violet'
    if (step.type !== 'init' && step.type !== 'pivot-found' && (idx < step.left || idx > step.right)) return 'dim'
    return 'range'
  }

  function getTags(idx) {
    if (step.type === 'found') return idx === step.answer ? [{ text: 'target', color: 'emerald' }] : []
    const tags = []
    if (step.pivot === idx) tags.push({ text: 'P', color: 'violet' })
    if (step.type === 'pivot-found' || isEnd) return tags
    if (idx === step.left)  tags.push({ text: 'L', color: 'blue' })
    if (idx === step.mid)   tags.push({ text: 'M', color: 'amber' })
    if (idx === step.right) tags.push({ text: 'R', color: 'pink' })
    return tags
  }

  return (
    <div className="space-y-4">
      <VizHeader title="Search in Rotated Sorted Array" subtitle="Find the pivot, pick the right sorted run, then binary search it." />

      <InputPanel
        fields={[
          { label: 'rotated sorted nums (unique)', value: draftNums, onChange: setDraftNums, placeholder: '4, 5, 6, 7, 0, 1, 2' },
          { label: 'target', value: draftTarget, onChange: setDraftTarget, placeholder: '0', grow: false },
        ]}
        onRun={() => run(draftNums, draftTarget)}
        error={error}
        examples={[
          { label: '[4,5,6,7,0,1,2] / 0',  onClick: () => run('4, 5, 6, 7, 0, 1, 2', '0') },
          { label: '[4,5,6,7,0,1,2] / 5',  onClick: () => run('4, 5, 6, 7, 0, 1, 2', '5') },
          { label: '[4,5,6,7,0,1,2] / 3',  onClick: () => run('4, 5, 6, 7, 0, 1, 2', '3') },
          { label: '[1,3,5,7,9] / 7',      onClick: () => run('1, 3, 5, 7, 9', '7') },
        ]}
      />

      <Panel title="nums" legend={[['#64748b', 'window'], ['#f59e0b', 'mid'], ['#8b5cf6', 'pivot'], ['#10b981', 'target']]}>
        <ArrayRow values={input.nums} getState={getState} getTags={getTags} />
        <Stats items={[
          ['phase', step.phase === 'pivot' ? '1 · find pivot' : '2 · binary search', 'violet'],
          ['target', input.target, 'amber'],
          ['pivot', step.pivot ?? '—', 'violet'],
        ]} />
      </Panel>

      <ResultBanner
        show={isEnd}
        ok={step.type === 'found'}
        title={step.type === 'found' ? `Return ${step.answer}` : 'Return -1'}
        detail={step.type === 'found' ? `nums[${step.answer}] = ${input.target}` : `${input.target} is not in the array.`}
      />
      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
