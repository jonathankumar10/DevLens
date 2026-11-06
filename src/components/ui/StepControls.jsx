/**
 * Shared playback controls used by all visualizers.
 * Includes play/pause, step navigation, reset, progress bar, and speed selector.
 */
const SPEEDS = [0.25, 0.5, 1, 1.25, 2]

export default function StepControls({ runner }) {
  const { index, total, playing, play, stop, next, prev, reset, speed, setSpeed } = runner

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 sm:gap-4 rounded-xl border border-white/10 bg-white/5 px-3 sm:px-5 py-2.5 sm:py-3">
        {/* Step counter */}
        <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
          Step {index + 1} / {total}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            title="Reset"
            aria-label="Reset"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ResetIcon />
          </button>
          <button
            onClick={prev}
            disabled={index === 0}
            title="Previous step"
            aria-label="Previous step"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30"
          >
            <PrevIcon />
          </button>
          <button
            onClick={playing ? stop : play}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            {playing ? 'Pause' : index === total - 1 ? 'Replay' : 'Play'}
          </button>
          <button
            onClick={next}
            disabled={index === total - 1}
            title="Next step"
            aria-label="Next step"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-30"
          >
            <NextIcon />
          </button>
        </div>

        {/* Progress bar */}
        <div className="hidden sm:flex flex-1 max-w-32 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Speed selector + TTS toggle */}
      <div className="flex items-center justify-between gap-2 px-1 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Speed</span>
          <div className="flex gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  speed === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {s === 1 ? '1×' : `${s}×`}
              </button>
            ))}
          </div>
        </div>

        {runner.tts && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={runner.tts.toggle}
              title={runner.tts.enabled ? 'Disable narration' : 'Enable narration'}
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all"
              style={{
                borderColor:     runner.tts.enabled ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.1)',
                backgroundColor: runner.tts.enabled ? 'rgba(59,130,246,0.1)' : 'transparent',
                color:           runner.tts.enabled ? '#93c5fd' : '#475569',
                boxShadow:       runner.tts.enabled ? '0 0 10px -2px rgba(59,130,246,0.4)' : 'none',
              }}
            >
              <span className="leading-none">{runner.tts.enabled ? '🔊' : '🔇'}</span>
              <span>{runner.tts.enabled ? 'Narration on' : 'Narration off'}</span>
            </button>

            {runner.tts.enabled && runner.tts.voices.length > 0 && (
              <select
                value={runner.tts.selectedVoice?.voiceURI ?? ''}
                onChange={e => {
                  const v = runner.tts.voices.find(v => v.voiceURI === e.target.value) ?? null
                  runner.tts.setVoice(v)
                }}
                className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 outline-none cursor-pointer hover:border-white/20 transition-colors"
              >
                <option value="">Default voice</option>
                {runner.tts.voices.map(v => (
                  <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ResetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 4v6h6M23 20v-6h-6"/>
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/>
    </svg>
  )
}

function PrevIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>
    </svg>
  )
}

function NextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
    </svg>
  )
}
