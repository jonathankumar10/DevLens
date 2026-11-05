export function formatCount(value) {
  if (value >= 1_000_000) return `${trim(value / 1_000_000)}M`
  if (value >= 1_000)     return `${trim(value / 1_000)}K`
  return `${Math.round(value)}`
}

function trim(value) {
  return value >= 100 ? `${Math.round(value)}` : `${Number(value.toFixed(1))}`
}

export function formatMs(ms, timeoutMs) {
  if (ms === null) return '—'
  if (timeoutMs && ms >= timeoutMs) return `≥${timeoutMs / 1000} s`
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`
  if (ms >= 10)   return `${Math.round(ms)} ms`
  return `${ms.toFixed(1)} ms`
}

export function formatPercent(fraction) {
  if (fraction === 0) return '0%'
  if (fraction < 0.001) return '<0.1%'
  if (fraction < 0.1) return `${(fraction * 100).toFixed(1)}%`
  return `${Math.round(fraction * 100)}%`
}

// The traffic slider is logarithmic so each drag covers the same ratio of traffic.
export const SLIDER_STEPS = 1000
export const SLIDER_STEP  = 5

// Three significant figures keeps numbers readable while rounding by less than
// one slider step, so an arrow-key press can't snap back to where it started.
function roundRate(value) {
  const magnitude = 10 ** (Math.floor(Math.log10(value)) - 2)
  return Math.round(value / magnitude) * magnitude
}

export function trafficToPosition(traffic, { min, max }) {
  return Math.round((Math.log(traffic / min) / Math.log(max / min)) * SLIDER_STEPS)
}

export function positionToTraffic(position, { min, max }) {
  const value = min * (max / min) ** (position / SLIDER_STEPS)
  return Math.min(max, Math.max(min, roundRate(value)))
}
