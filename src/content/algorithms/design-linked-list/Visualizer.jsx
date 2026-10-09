import { useMemo, useEffect, useState } from 'react'
import { buildDesignLinkedListSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { VizHeader, InputPanel, Panel, ListRow, StepMessage } from '../../../components/ui/VisualizerKit'

const DEFAULT_OPS = 'addAtHead(1) addAtTail(3) addAtIndex(1,2) get(1) deleteAtIndex(1) get(1)'
const ARITY = { get: 1, addAtHead: 1, addAtTail: 1, addAtIndex: 2, deleteAtIndex: 1 }

function parseOps(text) {
  const ops = []
  const re = /(\w+)\s*\(([^)]*)\)/g
  let m
  while ((m = re.exec(text))) {
    const name = m[1]
    if (!Object.hasOwn(ARITY, name)) return { error: `Unknown operation "${name}".` }
    const args = m[2].split(',').map((a) => a.trim()).filter(Boolean).map(Number)
    if (args.length !== ARITY[name] || args.some((a) => !Number.isInteger(a))) return { error: `${name} takes ${ARITY[name]} integer argument${ARITY[name] > 1 ? 's' : ''}.` }
    if (name !== 'addAtHead' && name !== 'addAtTail' && args[0] < 0) return { error: 'Indices must be ≥ 0.' }
    ops.push({ name, args })
  }
  if (!ops.length) return { error: 'Enter operations like addAtHead(1) get(0).' }
  if (ops.length > 12) return { error: 'Keep it to 12 operations or fewer.' }
  return { value: ops }
}

export default function DesignLinkedListVisualizer({ onStepChange }) {
  const [ops,   setOps]   = useState(() => parseOps(DEFAULT_OPS).value)
  const [draft, setDraft] = useState(DEFAULT_OPS)
  const [error, setError] = useState(null)

  const steps  = useMemo(() => buildDesignLinkedListSteps(ops), [ops])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function run(text) {
    const r = parseOps(text)
    if (r.error) { setError(r.error); return }
    setError(null)
    setDraft(text)
    setOps(r.value)
    setTimeout(() => reset(), 0)
  }

  const nodes = [{ key: 'H', val: 'H' }, ...step.list, { key: 'T', val: 'T' }]

  function getState(key) {
    if (key === 'H' || key === 'T') return step.cursor === key ? 'mid' : 'dim'
    if (key === step.removing) return 'bad'
    if (key === step.added) return 'found'
    if (key === step.cursor) return step.type === 'get-hit' ? 'found' : 'active'
    return 'pending'
  }

  const getTags = (key) => (key === step.cursor ? [{ text: 'temp', color: 'blue' }] : [])

  return (
    <div className="space-y-4">
      <VizHeader title="Design Linked List" subtitle="Dummy head and tail make every insert and delete the same four-pointer rewire." />

      <InputPanel
        title="Operations"
        fields={[{ label: 'get · addAtHead · addAtTail · addAtIndex · deleteAtIndex', value: draft, onChange: setDraft, placeholder: DEFAULT_OPS }]}
        onRun={() => run(draft)}
        error={error}
        examples={[
          { label: 'LeetCode example', onClick: () => run(DEFAULT_OPS) },
          { label: 'invalid indices',  onClick: () => run('addAtTail(5) addAtIndex(3,9) get(4) deleteAtIndex(2) get(0)') },
          { label: 'build & trim',     onClick: () => run('addAtHead(2) addAtHead(1) addAtTail(4) addAtIndex(2,3) deleteAtIndex(0) deleteAtIndex(2) get(1)') },
        ]}
      />

      <Panel title="Calls">
        <div className="flex flex-wrap gap-1.5">
          {ops.map((op, i) => (
            <div
              key={i}
              className={`rounded-md border px-2 py-1 font-mono text-[11px] transition-colors ${
                i === step.opIndex ? 'border-blue-400/60 bg-blue-500/15 text-blue-100'
                : i < step.opIndex ? 'border-white/10 bg-white/[0.03] text-slate-400'
                : 'border-white/5 text-slate-600'
              }`}
            >
              {op.name}({op.args.join(',')})
              {step.outputs[i] !== null && <span className="text-emerald-300"> → {step.outputs[i]}</span>}
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="List (H, T = sentinels)" legend={[['#3b82f6', 'temp'], ['#10b981', 'inserted / returned'], ['#f43f5e', 'deleting']]}>
        <ListRow nodes={nodes} getState={getState} getTags={getTags} terminal={false} arrow="⇄" />
        <p className="text-[11px] font-mono text-slate-500">size = {step.list.length}</p>
      </Panel>

      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
