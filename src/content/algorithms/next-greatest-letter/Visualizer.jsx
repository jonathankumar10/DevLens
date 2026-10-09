import { useMemo, useEffect, useState } from 'react'
import { buildNextGreatestLetterSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { VizHeader, InputPanel, Panel, ArrayRow, Stats, StepMessage, ResultBanner } from '../../../components/ui/VisualizerKit'

const DEFAULT = { letters: ['c', 'f', 'j'], target: 'a' }

export default function NextGreatestLetterVisualizer({ onStepChange }) {
  const [input,        setInput]        = useState(DEFAULT)
  const [draftLetters, setDraftLetters] = useState(DEFAULT.letters.join(', '))
  const [draftTarget,  setDraftTarget]  = useState(DEFAULT.target)
  const [error,        setError]        = useState(null)

  const steps  = useMemo(() => buildNextGreatestLetterSteps(input.letters, input.target), [input])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function run(lettersText, target) {
    const letters = lettersText.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
    const t = target.trim().toLowerCase()
    if (letters.length < 2 || letters.length > 16) { setError('Enter 2–16 letters.'); return }
    if (letters.some((l) => !/^[a-z]$/.test(l))) { setError('Each entry must be a single letter a–z.'); return }
    if (letters.some((l, i) => i > 0 && letters[i - 1] > l)) { setError('Letters must be sorted.'); return }
    if (!/^[a-z]$/.test(t)) { setError('Target must be a single letter a–z.'); return }
    setError(null)
    setDraftLetters(letters.join(', '))
    setDraftTarget(t)
    setInput({ letters, target: t })
    setTimeout(() => reset(), 0)
  }

  const isDone = step.type === 'done'

  function getState(idx) {
    if (isDone) return idx === step.answer ? 'found' : 'dim'
    if (idx === step.mid) return step.type === 'go-right' ? 'bad' : 'mid'
    if (step.type !== 'init' && (idx < step.left || idx > step.right)) return 'dim'
    return 'range'
  }

  function getTags(idx) {
    if (isDone) return idx === step.answer ? [{ text: step.wrapped ? 'wrap' : 'ans', color: 'emerald' }] : []
    const tags = []
    if (idx === step.left)  tags.push({ text: 'L', color: 'blue' })
    if (idx === step.mid)   tags.push({ text: 'M', color: 'amber' })
    if (idx === step.right) tags.push({ text: 'R', color: 'pink' })
    return tags
  }

  return (
    <div className="space-y-4">
      <VizHeader title="Smallest Letter Greater Than Target" subtitle="Binary search for the boundary just past the target." />

      <InputPanel
        fields={[
          { label: 'sorted letters', value: draftLetters, onChange: setDraftLetters, placeholder: 'c, f, j' },
          { label: 'target', value: draftTarget, onChange: setDraftTarget, placeholder: 'a', grow: false },
        ]}
        onRun={() => run(draftLetters, draftTarget)}
        error={error}
        examples={[
          { label: 'c,f,j / a',     onClick: () => run('c, f, j', 'a') },
          { label: 'c,f,j / c',     onClick: () => run('c, f, j', 'c') },
          { label: 'x,x,y,y / z',   onClick: () => run('x, x, y, y', 'z') },
          { label: 'a,c,e,g,k,m,p / h', onClick: () => run('a, c, e, g, k, m, p', 'h') },
        ]}
      />

      <Panel title="letters" legend={[['#64748b', 'search window'], ['#f59e0b', 'mid > target'], ['#f43f5e', 'mid ≤ target']]}>
        <ArrayRow values={input.letters} getState={getState} getTags={getTags} />
        <Stats items={[['target', `'${input.target}'`, 'violet'], ['left', step.left, 'blue'], ['right', step.right, 'pink']]} />
      </Panel>

      <ResultBanner
        show={isDone}
        title={`Return '${input.letters[step.answer ?? 0]}'`}
        detail={step.wrapped ? 'No letter was greater than the target, so we wrapped to letters[0].' : `letters[${step.answer}] is the first letter after '${input.target}'.`}
      />
      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
