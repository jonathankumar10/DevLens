/**
 * Step builder for LeetCode #11 — Container With Most Water.
 *
 * Step types:
 *   init       — left = 0, right = n - 1, max = 0
 *   move-left  — measure area; left wall is shorter → left++
 *   move-right — measure area; right wall is shorter (or equal) → right--
 *   done       — return max
 *
 * Measuring steps carry the walls measured (`left`, `right`), the `area`,
 * and the best container so far (`best` = [l, r], `max`).
 */
export function buildContainerSteps(heights) {
  const steps = []
  let left = 0
  let right = heights.length - 1
  let max = 0
  let best = null

  const push = (type, extra) => steps.push({ type, heights, left, right, max, best, area: null, ...extra })

  push('init', { message: `Start with the widest container: walls ${left} and ${right}.` })

  while (left < right) {
    const h = Math.min(heights[left], heights[right])
    const area = h * (right - left)
    const isBest = area > max
    if (isBest) {
      max = area
      best = [left, right]
    }
    const leftShorter = heights[left] < heights[right]
    push(leftShorter ? 'move-left' : 'move-right', {
      area,
      message: `min(${heights[left]}, ${heights[right]}) × ${right - left} = ${area}${isBest ? ' — new max!' : ''}. ` +
        (leftShorter ? `Left wall is shorter → left++.` : `Right wall is ${heights[left] === heights[right] ? 'equal' : 'shorter'} → right--.`),
    })
    if (leftShorter) left++
    else right--
  }

  push('done', { left: null, right: null, message: `Pointers met. Most water = ${max}.` })
  return steps
}
