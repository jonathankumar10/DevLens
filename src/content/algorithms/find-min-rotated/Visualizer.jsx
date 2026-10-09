import { useMemo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { buildFindMinRotatedSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import {
  VizHeader, InputPanel, Panel, ArrayRow, StepMessage, ResultBanner,
} from '../../../components/ui/VisualizerKit'
import { parseIntList } from '../../../lib/vizHelpers'

const DEFAULT = [4, 5, 6, 7, 0, 1, 2]

function isRotatedSorted(nums) {
  if (new Set(nums).size !== nums.length) return false
  let drops = 0
  for (let i = 1; i < nums.length; i++) if (nums[i] < nums[i - 1]) drops++
  return drops === 0 || (drops === 1 && nums[nums.length - 1] < nums[0])
}

// Bar heights make the "two staircases" shape visible.
function Staircase({ nums, step }) {
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  const span = max - min || 1
  return (
    <div className="flex items-end gap-1 h-24">
      {nums.map((v, i) => {
        const inWindow = step.type === 'init' || (i >= step.left && i <= step.right)
        const color =
          step.type === 'done' && i === step.left ? 'bg-emerald-400' :
          i === step.mid                           ? 'bg-amber-400' :
          i === step.right                         ? 'bg-pink-400/80' :
          inWindow                                 ? 'bg-slate-500' : 'bg-slate-800'
        return (
          <div key={i} className="flex-1 h-full flex items-end justify-center" style={{ maxWidth: 48 }}>
            <motion.div
              className={`w-full rounded-t ${color} transition-colors`}
              animate={{ height: `${15 + ((v - min) / span) * 85}%` }}
            />
          </div>
        )
      })}
    </div>
  )
}

export default function FindMinRotatedVisualizer({ onStepChange }) {
  const [nums,  setNums]  = useState(DEFAULT)
  const [draft, setDraft] = useState(DEFAULT.join(', '))
  const [error, setError] = useState(null)

  const steps  = useMemo(() => buildFindMinRotatedSteps(nums), [nums])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function run(text) {
    const r = parseIntList(text)
    if (r.error) { setError(r.error); return }
    if (!isRotatedSorted(r.value)) { setError('Enter a rotated sorted array of unique numbers, e.g. 4, 5, 6, 7, 0, 1, 2.'); return }
    setError(null)
    setDraft(text)
    setNums(r.value)
    setTimeout(() => reset(), 0)
  }

  const isDone = step.type === 'done'

  function getState(idx) {
    if (isDone) return idx === step.left ? 'found' : 'dim'
    if (idx === step.mid) return 'mid'
    if (step.type !== 'init' && (idx < step.left || idx > step.right)) return 'dim'
    return 'range'
  }

  function getTags(idx) {
    if (isDone) return idx === step.left ? [{ text: 'min', color: 'emerald' }] : []
    const tags = []
    if (idx === step.left)  tags.push({ text: 'L', color: 'blue' })
    if (idx === step.mid)   tags.push({ text: 'M', color: 'amber' })
    if (idx === step.right) tags.push({ text: 'R', color: 'pink' })
    return tags
  }

  return (
    <div className="space-y-4">
      <VizHeader title="Find Minimum in Rotated Sorted Array" subtitle="Compare mid with the right end to find which side holds the drop." />

      <InputPanel
        fields={[{ label: 'rotated sorted nums (unique, up to 16)', value: draft, onChange: setDraft, placeholder: '4, 5, 6, 7, 0, 1, 2' }]}
        onRun={() => run(draft)}
        error={error}
        examples={[
          { label: '[3,4,5,1,2]',          onClick: () => run('3, 4, 5, 1, 2') },
          { label: '[4,5,6,7,0,1,2]',      onClick: () => run('4, 5, 6, 7, 0, 1, 2') },
          { label: '[11,13,15,17]',        onClick: () => run('11, 13, 15, 17') },
          { label: '[2,3,4,5,6,7,8,9,1]',  onClick: () => run('2, 3, 4, 5, 6, 7, 8, 9, 1') },
        ]}
      />

      <Panel title="nums" legend={[['#64748b', 'search window'], ['#f59e0b', 'mid'], ['#ec4899', 'right'], ['#10b981', 'minimum']]}>
        <Staircase nums={nums} step={step} />
        <ArrayRow values={nums} getState={getState} getTags={getTags} />
      </Panel>

      <ResultBanner show={isDone} title={`Minimum = ${nums[step.left]}`} detail={`Found at index ${step.left} in ${steps.length - 2} comparison${steps.length - 2 === 1 ? '' : 's'}.`} />
      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
