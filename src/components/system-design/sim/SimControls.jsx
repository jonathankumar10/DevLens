import { formatCount, SLIDER_STEP, SLIDER_STEPS, positionToTraffic, trafficToPosition } from '../../../lib/sim/format'

function TrafficSlider({ traffic, config, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor="sim-traffic" className="text-xs font-semibold text-slate-300">Traffic</label>
        <output htmlFor="sim-traffic" className="text-lg font-semibold tabular-nums text-white">
          {formatCount(traffic)} <span className="text-xs font-normal text-slate-400">{config.unit}</span>
        </output>
      </div>
      <input
        id="sim-traffic"
        type="range"
        min="0"
        max={SLIDER_STEPS}
        step={SLIDER_STEP}
        value={trafficToPosition(traffic, config)}
        aria-valuetext={`${formatCount(traffic)} requests per second`}
        onChange={(e) => onChange(positionToTraffic(Number(e.target.value), config))}
        className="w-full h-6 cursor-pointer accent-blue-500"
      />
      <div className="flex justify-between text-[11px] tabular-nums text-slate-500">
        <span>{formatCount(config.min)}</span>
        {config.designPeak && <span>Design peak: {formatCount(config.designPeak)}</span>}
        <span>{formatCount(config.max)}</span>
      </div>
    </div>
  )
}

const STEPPER_BUTTON = 'h-9 w-9 rounded-lg border border-white/10 bg-white/5 text-slate-200 transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5'

function Stepper({ control, value, onChange }) {
  const index = control.options.indexOf(value)
  const display = value === 0 && control.offLabel ? control.offLabel : value

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-slate-300">{control.label}</span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label={`Decrease ${control.label}`}
          disabled={index <= 0}
          onClick={() => onChange(control.options[index - 1])}
          className={STEPPER_BUTTON}
        >
          −
        </button>
        <span aria-live="polite" className="w-11 text-center text-sm font-semibold tabular-nums text-white">{display}</span>
        <button
          type="button"
          aria-label={`Increase ${control.label}`}
          disabled={index >= control.options.length - 1}
          onClick={() => onChange(control.options[index + 1])}
          className={STEPPER_BUTTON}
        >
          +
        </button>
      </div>
    </div>
  )
}

function Switch({ control, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-slate-300">{control.label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={control.label}
        onClick={() => onChange(!value)}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${
          value ? 'border-blue-400/60 bg-blue-500' : 'border-white/15 bg-white/10'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-[22px] w-[22px] rounded-full bg-white transition-transform ${
            value ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  )
}

function FailureButton({ failure, node, active, onToggle }) {
  const unavailable = !node.enabled
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={unavailable}
      onClick={() => onToggle(failure.node)}
      className={`min-h-9 rounded-lg border px-3 py-1.5 text-left text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
        active
          ? 'border-rose-400/60 bg-rose-500/15 text-rose-200'
          : 'border-white/10 bg-white/5 text-slate-300 hover:border-rose-400/40 hover:bg-rose-500/10'
      }`}
    >
      {active ? `Restore: ${failure.label}` : failure.label}
    </button>
  )
}

export default function SimControls({ scenario, state, result, setTraffic, setValue, toggleFailure }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-5">
        <TrafficSlider traffic={state.traffic} config={scenario.traffic} onChange={setTraffic} />

        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-300">Break something</p>
          <div className="grid grid-cols-2 gap-2">
            {scenario.failures.map((failure) => (
              <FailureButton
                key={failure.node}
                failure={failure}
                node={result.nodes[failure.node]}
                active={result.nodes[failure.node].failed}
                onToggle={toggleFailure}
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold text-slate-300">Architecture</p>
        <div className="divide-y divide-white/5">
          {scenario.controls.map((control) => (
            control.type === 'switch'
              ? <Switch key={control.id} control={control} value={state.values[control.id]} onChange={(v) => setValue(control.id, v)} />
              : <Stepper key={control.id} control={control} value={state.values[control.id]} onChange={(v) => setValue(control.id, v)} />
          ))}
        </div>
      </div>
    </div>
  )
}
