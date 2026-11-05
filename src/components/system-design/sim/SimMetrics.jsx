import { formatCount, formatMs, formatPercent } from '../../../lib/sim/format'

const TONE = {
  neutral: 'text-white',
  good:    'text-emerald-300',
  warning: 'text-amber-300',
  danger:  'text-rose-300',
}

function Metric({ label, value, tone = 'neutral' }) {
  return (
    <div className="min-w-0 px-3 py-2.5">
      <dt className="truncate text-[11px] text-slate-400">{label}</dt>
      <dd className={`mt-0.5 text-base sm:text-lg font-semibold tabular-nums transition-colors ${TONE[tone]}`}>{value}</dd>
    </div>
  )
}

export default function SimMetrics({ scenario, result }) {
  const { p50, p99, errorRate, throughput, servers, lagPerSec, timeoutMs } = result
  const { slo } = scenario

  const latencyTone = (ms) => {
    if (ms === null || ms >= slo.p99Ms * 5) return 'danger'
    return ms > slo.p99Ms ? 'warning' : 'good'
  }
  const errorTone = errorRate > 0.05 ? 'danger' : errorRate > slo.errorRate ? 'warning' : 'good'

  return (
    <dl className="grid grid-cols-3 divide-x divide-white/5 rounded-xl border border-white/10 bg-white/[0.02] sm:grid-cols-6 [&>div:nth-child(n+4)]:border-t [&>div:nth-child(n+4)]:border-white/5 sm:[&>div:nth-child(n+4)]:border-t-0">
      <Metric label="p50 latency" value={formatMs(p50, timeoutMs)} tone={latencyTone(p50)} />
      <Metric label="p99 latency" value={formatMs(p99, timeoutMs)} tone={latencyTone(p99)} />
      <Metric label="Errors" value={formatPercent(errorRate)} tone={errorTone} />
      <Metric label="Served" value={`${formatCount(throughput)}/s`} />
      <Metric label="Machines" value={formatCount(servers)} />
      <Metric label="Queue lag" value={lagPerSec > 0 ? `+${formatCount(lagPerSec)}/s` : 'None'} tone={lagPerSec > 0 ? 'warning' : 'neutral'} />
    </dl>
  )
}
