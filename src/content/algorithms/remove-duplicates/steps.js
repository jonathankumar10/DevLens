/**
 * Step builder for LeetCode #26 — Remove Duplicates from Sorted Array.
 *
 * Step types:
 *   init  — k = 1 (first element is always unique)
 *   skip  — nums[i] == nums[k-1] → duplicate, reader moves on
 *   write — nums[i] != nums[k-1] → nums[k] = nums[i], k++
 *   done  — return k
 *
 * Each step carries `arr`, a snapshot of the array after the step.
 */
export function buildRemoveDuplicatesSteps(nums) {
  const steps = []
  const arr = [...nums]
  let k = 1

  const push = (type, i, extra) => steps.push({ type, arr: [...arr], i, k, written: null, ...extra })

  push('init', -1, { message: `nums[0] = ${arr[0]} is always kept. k = 1 marks the end of the unique prefix.` })

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== arr[k - 1]) {
      const from = arr[i]
      arr[k] = arr[i]
      k++
      push('write', i, { written: k - 1, message: `nums[${i}] = ${from} ≠ nums[${k - 2}] — new value. Write it to index ${k - 1}, k = ${k}.` })
    } else {
      push('skip', i, { message: `nums[${i}] = ${arr[i]} equals last kept value — duplicate, skip.` })
    }
  }

  push('done', -1, { message: `Done. k = ${k} unique values: [${arr.slice(0, k).join(', ')}].` })
  return steps
}
