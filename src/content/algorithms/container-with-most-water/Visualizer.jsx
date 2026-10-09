import { useMemo, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { buildContainerSteps } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import {
  VizHeader, InputPanel, Panel, Stats, StepMessage, ResultBanner,
} from '../../../components/ui/VisualizerKit'
import { parseIntList } from '../../../lib/vizHelpers'

const DEFAULT = [1, 8, 6, 2, 5, 4, 8, 3, 7]
const W = 600
const H = 220

function Chart({ heights, step }) {
  const n = heights.length
  const maxH = Math.max(...heights, 1)
  const slot = W / n
  const barW = Math.min(28, slot * 0.5)
  const x = (i) => i * slot + slot / 2
  const y = (h) => H - (h / maxH) * (H - 20)

  const water = (l, r) => {
    const h = Math.min(heights[l], heights[r])
    return { x: x(l), y: y(h), w: x(r) - x(l), h: H - y(h) }
  }
  const cur = step.left != null && step.area != null ? water(step.left, step.right) : null
  const best = step.best ? water(step.best[0], step.best[1]) : null

  return (
    <svg viewBox={`0 0 ${W} ${H + 18}`} className="w-full">
      {best && (
        <motion.rect
          initial={false}
          animate={{ x: best.x, y: best.y, width: best.w, height: best.h }}
          fill="rgba(16,185,129,0.08)"
          stroke="#10b981"
          strokeDasharray="4 3"
          strokeWidth={1.5}
        />
      )}
      {cur && (
        <motion.rect
          initial={false}
          animate={{ x: cur.x, y: cur.y, width: cur.w, height: cur.h }}
          fill="rgba(56,189,248,0.25)"
        />
      )}
      {heights.map((h, i) => {
        const color =
          i === step.left  ? '#3b82f6' :
          i === step.right ? '#ec4899' :
          step.type === 'done' && step.best?.includes(i) ? '#10b981' :
          (step.left != null && (i < step.left || i > step.right)) ? '#1e293b' : '#475569'
        return (
          <g key={i}>
            <motion.rect
              initial={false}
              animate={{ fill: color }}
              x={x(i) - barW / 2}
              y={y(h)}
              width={barW}
              height={H - y(h)}
              rx={3}
            />
            <text x={x(i)} y={H + 13} textAnchor="middle" fontSize="11" fill="#64748b" className="font-mono">{h}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function ContainerVisualizer({ onStepChange }) {
  const [heights, setHeights] = useState(DEFAULT)
  const [draft,   setDraft]   = useState(DEFAULT.join(', '))
  const [error,   setError]   = useState(null)

  const steps  = useMemo(() => buildContainerSteps(heights), [heights])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  function run(text) {
    const r = parseIntList(text, { min: 2 })
    if (r.error) { setError(r.error); return }
    if (r.value.some((v) => v < 0)) { setError('Heights must be ≥ 0.'); return }
    setError(null)
    setDraft(text)
    setHeights(r.value)
    setTimeout(() => reset(), 0)
  }

  return (
    <div className="space-y-4">
      <VizHeader title="Container With Most Water" subtitle="Start wide, then always move the shorter wall inward." />

      <InputPanel
        fields={[{ label: 'heights (2–16 values)', value: draft, onChange: setDraft, placeholder: '1, 8, 6, 2, 5, 4, 8, 3, 7' }]}
        onRun={() => run(draft)}
        error={error}
        examples={[
          { label: '[1,8,6,2,5,4,8,3,7]', onClick: () => run(DEFAULT.join(', ')) },
          { label: '[1,1]',               onClick: () => run('1, 1') },
          { label: '[2,3,10,5,7,8,9]',    onClick: () => run('2, 3, 10, 5, 7, 8, 9') },
        ]}
      />

      <Panel title="Walls" legend={[['#3b82f6', 'left'], ['#ec4899', 'right'], ['#38bdf8', 'current water'], ['#10b981', 'best']]}>
        <Chart heights={heights} step={step} />
        <Stats items={[['area', step.area ?? '—', 'blue'], ['max', step.max, 'emerald']]} />
      </Panel>

      <ResultBanner show={step.type === 'done'} title={`Most water = ${step.max}`} detail={step.best ? `Between walls ${step.best[0]} and ${step.best[1]}.` : undefined} />
      <StepMessage message={step.message} />
      <StepControls runner={runner} />
    </div>
  )
}
