/**
 * Step builder for LeetCode #875 — Koko Eating Bananas.
 *
 * Step types:
 *   init     — speed range [1, max(piles)], result = max
 *   fits     — at speed `rate` she needs ≤ h hours → result = rate, try slower
 *   too-slow — at speed `rate` she needs > h hours → speed up
 *   done     — return result
 *
 * Each trial step carries `perPile`, the hours each pile takes at `rate`.
 */
export function buildKokoSteps(piles, h) {
  const steps = []
  let left = 1
  let right = Math.max(...piles)
  let result = right
  const maxPile = right

  const push = (type, extra) => steps.push({ type, piles, h, maxPile, left, right, result, rate: null, perPile: null, hours: null, ...extra })

  push('init', { message: `Speeds range from 1 to max(piles) = ${right}. At ${right}/hr every pile takes 1 hour, so that always works.` })

  while (left <= right) {
    const rate = left + Math.floor((right - left) / 2)
    const perPile = piles.map((p) => Math.ceil(p / rate))
    const hours = perPile.reduce((a, b) => a + b, 0)
    if (hours <= h) {
      result = rate
      push('fits', { rate, perPile, hours, result, message: `Speed ${rate}: ${perPile.join(' + ')} = ${hours} h ≤ ${h} h — fast enough. result = ${rate}, try slower (right = ${rate - 1}).` })
      right = rate - 1
    } else {
      push('too-slow', { rate, perPile, hours, message: `Speed ${rate}: ${perPile.join(' + ')} = ${hours} h > ${h} h — too slow. Speed up (left = ${rate + 1}).` })
      left = rate + 1
    }
  }

  push('done', { message: `Window closed. Minimum speed = ${result} bananas/hour.` })
  return steps
}
