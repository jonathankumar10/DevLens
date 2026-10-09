import { useMemo, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildCloneGraphSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { VizHeader, InputPanel, Panel, StepMessage, ResultBanner } from '../../../components/ui/VisualizerKit'

const DEFAULT = '[[2,4],[1,3],[2,4],[1,3]]'
const SIZE = 240
const R = 18

function parseAdj(text) {
  let adj
  try { adj = JSON.parse(text) } catch { return { error: 'Use JSON like [[2,4],[1,3],[2,4],[1,3]].' } }
  if (!Array.isArray(adj) || adj.some((row) => !Array.isArray(row) || row.some((v) => !Number.isInteger(v)))) {
    return { error: 'Each entry must be a list of node numbers.' }
  }
  const n = adj.length
  if (n > 8) return { error: 'Keep it to 8 nodes or fewer.' }
  for (let i = 0; i < n; i++) {
    for (const v of adj[i]) {
      if (v < 1 || v > n || v === i + 1) return { error: `Node ${i + 1} has an invalid neighbor ${v}.` }
      if (!adj[v - 1].includes(i + 1)) return { error: `Edges must be undirected: ${i + 1} lists ${v} but ${v} doesn't list ${i + 1}.` }
    }
  }
  return { value: adj }
}

function positions(n) {
  return Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI * i) / n - Math.PI / 2
    const r = n === 1 ? 0 : SIZE / 2 - R - 8
    return { x: SIZE / 2 + r * Math.cos(a), y: SIZE / 2 + r * Math.sin(a) }
  })
}

const FILL = {
  unseen:    { fill: '#1e293b', stroke: '#334155', text: '#94a3b8' },
  queued:    { fill: '#5b21b6', stroke: '#a78bfa', text: '#fff' },
  current:   { fill: '#2563eb', stroke: '#93c5fd', text: '#fff' },
  neighbor:  { fill: '#92400e', stroke: '#f59e0b', text: '#fff' },
  processed: { fill: '#065f46', stroke: '#10b981', text: '#fff' },
}

function GraphNode({ p, label, tone, prime }) {
  const c = FILL[tone]
  return (
    <motion.g initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} style={{ originX: `${p.x}px`, originY: `${p.y}px` }}>
      <motion.circle cx={p.x} cy={p.y} r={R} initial={false} animate={{ fill: c.fill, stroke: c.stroke }} strokeWidth={2} />
      <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={c.text} className="select-none">
        {label}{prime ? "'" : ''}
      </text>
    </motion.g>
  )
}

export default function CloneGraphVisualizer({ onStepChange }) {
  const [adj,   setAdj]   = useState(() => parseAdj(DEFAULT).value)
  const [draft, setDraft] = useState(DEFAULT)
  const [error, setError] = useState(null)

  const steps  = useMemo(() => buildCloneGraphSteps(adj), [adj])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function run(text) {
    const r = parseAdj(text)
    if (r.error) { setError(r.error); return }
    setError(null)
    setDraft(text)
    setAdj(r.value)
    setTimeout(() => reset(), 0)
  }

  const pos = positions(adj.length)
  const edges = []
  adj.forEach((row, i) => row.forEach((v) => { if (i + 1 < v) edges.push([i + 1, v]) }))

  function tone(v) {
    if (v === step.curr) return 'current'
    if (v === step.neighbor) return 'neighbor'
    if (step.processed.includes(v)) return 'processed'
    if (step.queue.includes(v)) return 'queued'
    return 'unseen'
  }

  const linked = (a, b) => step.links.some(([x, y]) => x === a && y === b)
  const isActiveEdge = (a, b) => step.curr != null && step.neighbor != null &&
    ((a === step.curr && b === step.neighbor) || (b === step.curr && a === step.neighbor))

  return (
    <div className="space-y-4">
      <VizHeader title="Clone Graph" subtitle="BFS the original; a map from original → copy makes sure each node is copied once." />

      <InputPanel
        fields={[{ label: 'adjacency list (node i+1 → neighbors)', value: draft, onChange: setDraft, placeholder: DEFAULT }]}
        onRun={() => run(draft)}
        error={error}
        examples={[
          { label: 'square',   onClick: () => run(DEFAULT) },
          { label: 'triangle + tail', onClick: () => run('[[2,3],[1,3],[1,2,4],[3]]') },
          { label: 'star',     onClick: () => run('[[2,3,4,5],[1],[1],[1],[1]]') },
          { label: 'single',   onClick: () => run('[[]]') },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Panel title="Original" legend={[['#2563eb', 'curr'], ['#f59e0b', 'neighbor'], ['#8b5cf6', 'queued'], ['#10b981', 'done']]}>
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[280px] mx-auto">
            {edges.map(([a, b]) => (
              <line key={`${a}-${b}`} x1={pos[a - 1].x} y1={pos[a - 1].y} x2={pos[b - 1].x} y2={pos[b - 1].y}
                stroke={isActiveEdge(a, b) ? '#f59e0b' : '#334155'} strokeWidth={isActiveEdge(a, b) ? 3 : 1.5} />
            ))}
            {pos.map((p, i) => <GraphNode key={i} p={p} label={i + 1} tone={tone(i + 1)} />)}
          </svg>
        </Panel>

        <Panel title="Clone (solid = linked both ways)">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[280px] mx-auto">
            {edges.map(([a, b]) => {
              const ab = linked(a, b)
              const ba = linked(b, a)
              if (!ab && !ba) return null
              return (
                <motion.line key={`${a}-${b}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  x1={pos[a - 1].x} y1={pos[a - 1].y} x2={pos[b - 1].x} y2={pos[b - 1].y}
                  stroke="#10b981" strokeWidth={2} strokeDasharray={ab && ba ? undefined : '5 4'} />
              )
            })}
            <AnimatePresence>
              {step.cloned.map((v) => <GraphNode key={v} p={pos[v - 1]} label={v} tone="processed" prime />)}
            </AnimatePresence>
          </svg>
        </Panel>
      </div>

      <Panel title="Queue">
        <div className="flex gap-1.5 min-h-[28px] items-center">
          {step.queue.length === 0 && <span className="text-[11px] font-mono text-slate-600">empty</span>}
          <AnimatePresence>
            {step.queue.map((v) => (
              <motion.span key={v} layout initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="rounded-md border border-violet-400/50 bg-violet-500/15 px-2.5 py-1 font-mono text-xs font-bold text-violet-200">
                {v}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </Panel>

      <ResultBanner show={step.type === 'done' || step.type === 'empty'} title={step.type === 'empty' ? 'Return null' : "Return 1' — a full deep copy"} detail={step.type === 'done' ? `${step.cloned.length} nodes, ${step.links.length / 2} edges, each copied exactly once.` : undefined} />
      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
