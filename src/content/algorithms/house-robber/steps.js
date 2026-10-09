/**
 * Step builder for LeetCode #198 — House Robber.
 *
 * Step types:
 *   base0  — dp[0] = nums[0]
 *   single — only one house → return dp[0]
 *   base1  — dp[1] = max(nums[0], nums[1])
 *   rob    — nums[i] + dp[i-2] wins → dp[i] uses house i
 *   skip   — dp[i-1] wins (or ties) → house i is skipped
 *   done   — return dp[n-1]; `robbed` lists the houses in one optimal plan
 */
export function buildHouseRobberSteps(nums) {
  const steps = []
  const n = nums.length
  const dp = Array(n).fill(null)

  const push = (type, i, extra) => steps.push({ type, nums, i, dp: [...dp], robbed: null, ...extra })

  dp[0] = nums[0]
  push('base0', 0, { message: `Only house 0 so far — rob it. dp[0] = ${nums[0]}.` })

  if (n === 1) {
    push('single', 0, { robbed: [0], message: `There's just one house. Return ${dp[0]}.` })
    return steps
  }

  dp[1] = Math.max(nums[0], nums[1])
  push('base1', 1, { message: `Houses 0 and 1 are neighbours — pick the richer one. dp[1] = max(${nums[0]}, ${nums[1]}) = ${dp[1]}.` })

  for (let i = 2; i < n; i++) {
    const skip = dp[i - 1]
    const take = nums[i] + dp[i - 2]
    dp[i] = Math.max(skip, take)
    push(take > skip ? 'rob' : 'skip', i, {
      skip, take,
      message: take > skip
        ? `Rob house ${i}: ${nums[i]} + dp[${i - 2}] (${dp[i - 2]}) = ${take} beats skipping (${skip}). dp[${i}] = ${take}.`
        : `Skip house ${i}: dp[${i - 1}] = ${skip} ≥ ${nums[i]} + dp[${i - 2}] = ${take}. dp[${i}] = ${skip}.`,
    })
  }

  // Walk the dp table backwards to recover one optimal set of houses.
  const robbed = []
  let i = n - 1
  while (i >= 0) {
    if (i === 0) { robbed.push(0); break }
    if (i === 1) { robbed.push(nums[1] > nums[0] ? 1 : 0); break }
    if (dp[i] === dp[i - 1]) {
      i -= 1
    } else {
      robbed.push(i)
      i -= 2
    }
  }

  push('done', n - 1, { robbed: robbed.reverse(), message: `Best haul = dp[${n - 1}] = ${dp[n - 1]} (houses ${robbed.join(', ')}).` })
  return steps
}
