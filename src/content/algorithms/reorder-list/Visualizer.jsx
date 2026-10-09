import { useMemo, useEffect, useState } from 'react'
import { buildReorderListSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import {
  VizHeader, InputPanel, Panel, ListRow, StepMessage, ResultBanner,
} from '../../../components/ui/VisualizerKit'
import { parseIntList } from '../../../lib/vizHelpers'

const DEFAULT = [1, 2, 3, 4, 5]
const PHASES = ['Find middle', 'Reverse back half', 'Merge']

export default function ReorderListVisualizer({ onStepChange }) {
  const [values, setValues] = useState(DEFAULT)
  const [draft,  setDraft]  = useState(DEFAULT.join(', '))
  const [error,  setError]  = useState(null)

  const steps  = useMemo(() => buildReorderListSteps(values), [values])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function run(text) {
    const r = parseIntList(text, { max: 10 })
    if (r.error) { setError(r.error); return }
    setError(null)
    setDraft(text)
    setValues(r.value)
    setTimeout(() => reset(), 0)
  }

  const isDone = step.type === 'done'

  function getState(key) {
    if (isDone) return 'done'
    const t = step.tags[key]
    if (!t) return 'pending'
    if (t.some((x) => x.color === 'pink')) return 'active2'
    if (t.some((x) => x.color === 'amber')) return 'mid'
    if (t.some((x) => x.color === 'violet')) return 'violet'
    return 'active'
  }

  return (
    <div className="space-y-4">
      <VizHeader title="Reorder List" subtitle="Find the middle, reverse the back half, zip the two halves together." />

      <InputPanel
        fields={[{ label: 'values (up to 10)', value: draft, onChange: setDraft, placeholder: '1, 2, 3, 4, 5' }]}
        onRun={() => run(draft)}
        error={error}
        examples={[
          { label: '[1,2,3,4]',     onClick: () => run('1, 2, 3, 4') },
          { label: '[1,2,3,4,5]',   onClick: () => run('1, 2, 3, 4, 5') },
          { label: '[1..8]',        onClick: () => run('1, 2, 3, 4, 5, 6, 7, 8') },
        ]}
      />

      <div className="flex gap-2">
        {PHASES.map((p, i) => (
          <div
            key={p}
            className={`flex-1 rounded-lg border px-3 py-1.5 text-center text-[11px] font-semibold transition-colors ${
              step.phase === i + 1 && !isDone ? 'border-blue-500/50 bg-blue-500/15 text-blue-200'
              : step.phase > i + 1 || isDone ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-white/10 bg-white/[0.03] text-slate-500'
            }`}
          >
            {i + 1}. {p}
          </div>
        ))}
      </div>

      <Panel>
        <div className="space-y-3">
          {step.rows.map((row) => (
            <div key={row.label}>
              <p className="text-[11px] font-mono text-slate-500">{row.label}</p>
              {row.keys.length ? (
                <ListRow
                  nodes={row.keys.map((k) => ({ key: k, val: values[k] }))}
                  getState={getState}
                  getTags={(k) => step.tags[k]}
                />
              ) : (
                <p className="text-[11px] font-mono text-slate-600 py-3">null</p>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <ResultBanner
        show={isDone}
        title={`[${step.rows[0].keys.map((k) => values[k]).join(', ')}]`}
        detail="Reordered in place — only next pointers changed."
      />
      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
