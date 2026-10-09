/**
 * Step builder for LeetCode #167 — Two Sum II (sorted input).
 *
 * Step types:
 *   init      — left = 0, right = n - 1
 *   too-big   — sum > target → right--
 *   too-small — sum < target → left++
 *   found     — sum == target → return [left + 1, right + 1]
 *   not-found — pointers crossed → return [-1, -1]
 */
export function buildTwoSumIISteps(numbers, target) {
  const steps = []
  let left = 0
  let right = numbers.length - 1

  const push = (type, extra) => steps.push({ type, numbers, target, left, right, sum: null, ...extra })

  push('init', { message: `left = 0, right = ${right}. Looking for a pair that sums to ${target}.` })

  while (left < right) {
    const sum = numbers[left] + numbers[right]
    if (sum > target) {
      push('too-big', { sum, message: `${numbers[left]} + ${numbers[right]} = ${sum} > ${target} — too big. right--.` })
      right--
    } else if (sum < target) {
      push('too-small', { sum, message: `${numbers[left]} + ${numbers[right]} = ${sum} < ${target} — too small. left++.` })
      left++
    } else {
      push('found', { sum, message: `${numbers[left]} + ${numbers[right]} = ${target}! Return [${left + 1}, ${right + 1}] (1-indexed).` })
      return steps
    }
  }

  push('not-found', { message: 'Pointers crossed — no pair adds up to the target. Return [-1, -1].' })
  return steps
}
