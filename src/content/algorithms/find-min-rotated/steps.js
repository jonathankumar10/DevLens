/**
 * Step builder for LeetCode #153 — Find Minimum in Rotated Sorted Array.
 *
 * Step types:
 *   init     — left = 0, right = n - 1
 *   go-right — nums[mid] > nums[right] → the drop is right of mid, left = mid + 1
 *   go-left  — nums[mid] < nums[right] → min is mid or left of it, right = mid
 *   done     — left == right → return nums[left]
 */
export function buildFindMinRotatedSteps(nums) {
  const steps = []
  let left = 0
  let right = nums.length - 1

  const push = (type, mid, message) => steps.push({ type, nums, left, right, mid, message })

  push('init', null, `left = 0, right = ${right}. Compare each midpoint against nums[right].`)

  while (left < right) {
    const mid = left + Math.floor((right - left) / 2)
    if (nums[mid] > nums[right]) {
      push('go-right', mid, `nums[${mid}] = ${nums[mid]} > nums[${right}] = ${nums[right]} — the drop is to the right. left = ${mid + 1}.`)
      left = mid + 1
    } else {
      push('go-left', mid, `nums[${mid}] = ${nums[mid]} < nums[${right}] = ${nums[right]} — mid is on the low side. right = ${mid}.`)
      right = mid
    }
  }

  push('done', left, `left == right == ${left}. Minimum = nums[${left}] = ${nums[left]}.`)
  return steps
}
