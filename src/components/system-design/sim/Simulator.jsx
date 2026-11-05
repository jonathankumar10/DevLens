import { useSimulation } from '../../../hooks/useSimulation'
import { formatMs, formatPercent } from '../../../lib/sim/format'
import StepControls from '../../ui/StepControls'
import SystemCanvas from './SystemCanvas'
import SimControls from './SimControls'
import SimMetrics from './SimMetrics'

const INSIGHT_TONE = {
  good:    'border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-100',
  warning: 'border-amber-400/25 bg-amber-400/[0.06] text-amber-100',
  danger:  'border-rose-400/30 bg-rose-400/[0.07] text-rose-100',
}

function ModeTabs({ mode, onGuide, onExplore }) {
  const tab = (active) => `rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
    active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
  }`
  return (
    <div className="flex shrink-0 gap-1 rounded-lg border border-white/10 p-1" role="group" aria-label="Simulator mode">
      <button type="button" aria-pressed={mode === 'guide'} onClick={onGuide} className={tab(mode === 'guide')}>
        Guided tour
      </button>
      <button type="button" aria-pressed={mode === 'explore'} onClick={onExplore} className={tab(mode === 'explore')}>
        Explore
      </button>
    </div>
  )
}

function SloBadge({ scenario, result }) {
  const target = `p99 under ${scenario.slo.p99Ms} ms, errors under ${formatPercent(scenario.slo.errorRate)}`
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
      <span className={`rounded-full px-2 py-0.5 font-semibold ${
        result.meetsSlo ? 'bg-emerald-400/15 text-emerald-300' : 'bg-rose-400/15 text-rose-300'
      }`}>
        {result.meetsSlo ? 'Target met' : 'Target missed'}
      </span>
      <span>Target: {target}</span>
    </p>
  )
}

export default function Simulator({ scenario }) {
  const sim = useSimulation(scenario)
  const { mode, state, result, insight, runner } = sim
  const step = runner.step

  return (
    <section
      aria-label={scenario.title}
      className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:p-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 basis-64">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-300">Live simulator</p>
          <h2 className="mt-1 text-lg sm:text-xl font-semibold text-white">{scenario.title}</h2>
          <p className="mt-1 text-sm text-slate-400">{scenario.summary}</p>
        </div>
        <ModeTabs mode={mode} onGuide={sim.startGuide} onExplore={sim.explore} />
      </header>

      <div aria-live="polite" className="min-h-[92px]">
        {mode === 'guide' ? (
          <div className="rounded-xl border border-blue-400/25 bg-blue-400/[0.06] px-4 py-3">
            <p className="text-sm font-semibold text-white">
              <span className="mr-2 text-blue-300 tabular-nums">{runner.index + 1}.</span>
              {step.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">{step.text}</p>
          </div>
        ) : (
          <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${INSIGHT_TONE[insight.tone]}`}>
            {insight.text}
          </div>
        )}
      </div>

      <SimMetrics scenario={scenario} result={result} />
      <SloBadge scenario={scenario} result={result} />

      <SystemCanvas scenario={scenario} result={result} onToggleFailure={sim.toggleFailure} />

      {mode === 'guide' && <StepControls runner={runner} />}

      <div className="space-y-4 border-t border-white/10 pt-4">
        {mode === 'guide' ? (
          <p className="text-xs text-slate-400">Change anything below to take over from this step.</p>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">You're in control. Click a node, or use the controls below.</p>
            <button
              type="button"
              onClick={sim.resetExplore}
              className="shrink-0 rounded-md border border-white/10 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              Reset
            </button>
          </div>
        )}
        <SimControls
          scenario={scenario}
          state={state}
          result={result}
          setTraffic={sim.setTraffic}
          setValue={sim.setValue}
          toggleFailure={sim.toggleFailure}
        />
      </div>

      <ul className="sr-only">
        {scenario.nodes.map((node) => {
          const data = result.nodes[node.id]
          return (
            <li key={node.id}>
              {node.label}: {data.status === 'off' ? 'not in use' : data.down ? 'down' : `${Math.round(data.utilization * 100)}% load`}
            </li>
          )
        })}
        <li>p99 latency: {formatMs(result.p99, result.timeoutMs)}</li>
      </ul>

      <p className="text-[11px] leading-relaxed text-slate-500">
        A teaching model with round-number capacities, not a benchmark. It shows how a system tends to behave, not how yours will perform.
      </p>
    </section>
  )
}
