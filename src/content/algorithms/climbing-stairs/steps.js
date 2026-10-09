/**
 * Step builder for LeetCode #70 — Climbing Stairs.
 *
 * Step types:
 *   small — n <= 2 → return n
 *   init  — p1 = ways(1) = 1, p2 = ways(2) = 2
 *   step  — ways(i) = ways(i-2) + ways(i-1); slide p1, p2 up one stair
 *   done  — return p2
 *
 * `ways` is indexed by stair number (ways[0] unused); null = not computed yet.
 */
export function buildClimbingStairsSteps(n) {
  const steps = []
  const ways = Array(n + 1).fill(null)

  const push = (type, i, message) => steps.push({ type, n, i, ways: [...ways], message })

  if (n <= 2) {
    for (let s = 1; s <= n; s++) ways[s] = s
    push('small', n, `n = ${n} ≤ 2 — there ${n === 1 ? 'is 1 way' : 'are 2 ways (1+1 or 2)'}. Return ${n}.`)
    return steps
  }

  ways[1] = 1
  ways[2] = 2
  push('init', 2, 'Stair 1: one way (1). Stair 2: two ways (1+1, 2). p1 = 1, p2 = 2.')

  for (let i = 3; i <= n; i++) {
    ways[i] = ways[i - 1] + ways[i - 2]
    push('step', i, `Stair ${i}: from stair ${i - 2} (${ways[i - 2]} ways) + from stair ${i - 1} (${ways[i - 1]} ways) = ${ways[i]}.`)
  }

  push('done', n, `Reached the top: ${ways[n]} distinct ways to climb ${n} stairs.`)
  return steps
}
