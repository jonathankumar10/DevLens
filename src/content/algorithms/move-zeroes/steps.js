/**
 * Step builder for LeetCode #283 — Move Zeroes.
 *
 * Step types:
 *   init — left = 0
 *   zero — nums[i] == 0 → leave it, i moves on
 *   swap — nums[i] != 0 → swap nums[i] with nums[left], left++
 *   done — loop finished
 */
export function buildMoveZeroesSteps(nums) {
  const steps = []
  const arr = [...nums]
  let left = 0

  const push = (type, i, extra) => steps.push({ type, arr: [...arr], i, left, swapped: null, ...extra })

  push('init', -1, { message: 'left = 0 marks where the next non-zero belongs.' })

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== 0) {
      const v = arr[i]
      ;[arr[i], arr[left]] = [arr[left], arr[i]]
      const at = left
      left++
      push('swap', i, {
        swapped: [at, i],
        message: at === i
          ? `nums[${i}] = ${v} is non-zero and already in place. left = ${left}.`
          : `nums[${i}] = ${v} is non-zero — swap it with nums[${at}]. left = ${left}.`,
      })
    } else {
      push('zero', i, { message: `nums[${i}] = 0 — leave it; it will drift to the back.` })
    }
  }

  push('done', -1, { message: `Done. [${arr.join(', ')}] — all zeros at the end, order of the rest preserved.` })
  return steps
}
