/**
 * Step builder for LeetCode #53 — Maximum Subarray (Kadane's).
 *
 * Step types:
 *   init    — maxSum = -∞, currSum = 0
 *   reset   — currSum < 0 → drop the window, start fresh at i
 *   extend  — currSum += nums[i], maxSum unchanged
 *   new-max — currSum += nums[i] and it beats maxSum
 *   done    — return maxSum
 *
 * Each step carries the current window [start, i] and the best window
 * [bestStart, bestEnd] seen so far.
 */
export function buildMaxSubarraySteps(nums) {
  const steps = []
  let maxSum = -Infinity
  let currSum = 0
  let start = 0
  let bestStart = -1
  let bestEnd = -1

  const push = (type, i, message) => {
    steps.push({ type, nums, i, start, currSum, maxSum, bestStart, bestEnd, message })
  }

  push('init', -1, 'maxSum = -∞, currSum = 0. Walk the array once.')

  nums.forEach((num, i) => {
    if (currSum < 0) {
      const old = currSum
      currSum = 0
      start = i
      push('reset', i, `currSum is ${old} (< 0) — it would only hurt. Reset to 0 and start a new window at index ${i}.`)
    }
    currSum += num
    if (currSum > maxSum) {
      maxSum = currSum
      bestStart = start
      bestEnd = i
      push('new-max', i, `Add ${num} → currSum = ${currSum}. New best! maxSum = ${maxSum} (indices ${start}..${i}).`)
    } else {
      push('extend', i, `Add ${num} → currSum = ${currSum}. maxSum stays ${maxSum}.`)
    }
  })

  push('done', -1, `Done. Largest subarray sum = ${maxSum} (indices ${bestStart}..${bestEnd}).`)
  return steps
}
