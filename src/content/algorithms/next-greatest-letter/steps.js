/**
 * Step builder for LeetCode #744 — Find Smallest Letter Greater Than Target.
 *
 * Step types:
 *   init     — left = 0, right = n - 1
 *   go-right — letters[mid] <= target → left = mid + 1
 *   go-left  — letters[mid] >  target → right = mid - 1 (mid is a candidate)
 *   done     — return letters[left], or letters[0] if left fell off the end
 */
export function buildNextGreatestLetterSteps(letters, target) {
  const steps = []
  let left = 0
  let right = letters.length - 1

  const push = (type, mid, extra) => steps.push({ type, letters, target, left, right, mid, answer: null, wrapped: false, ...extra })

  push('init', null, { message: `Search for the first letter > '${target}'. left = 0, right = ${right}.` })

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)
    if (letters[mid] <= target) {
      push('go-right', mid, { message: `letters[${mid}] = '${letters[mid]}' ≤ '${target}' — too small. left = ${mid + 1}.` })
      left = mid + 1
    } else {
      push('go-left', mid, { message: `letters[${mid}] = '${letters[mid]}' > '${target}' — a candidate; look for a smaller one. right = ${mid - 1}.` })
      right = mid - 1
    }
  }

  const wrapped = left === letters.length
  const answer = wrapped ? 0 : left
  push('done', null, {
    answer,
    wrapped,
    message: wrapped
      ? `left = ${left} ran off the end — no letter > '${target}'. Wrap around: return '${letters[0]}'.`
      : `left = ${left}. Return letters[${left}] = '${letters[left]}'.`,
  })
  return steps
}
