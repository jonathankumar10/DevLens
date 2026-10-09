/**
 * Step builder for LeetCode #33 — Search in Rotated Sorted Array.
 *
 * Phase 1 (find pivot):
 *   init         — l = 0, r = n - 1
 *   pivot-right  — nums[m] > nums[r] → l = m + 1
 *   pivot-left   — nums[m] <= nums[r] → r = m
 *   pivot-found  — l == r is the index of the smallest element
 * Phase 2 (pick a half):
 *   choose-right — target in [nums[pivot], nums[n-1]] → search pivot..n-1
 *   choose-left  — otherwise → search 0..pivot-1
 * Phase 3 (plain binary search):
 *   search-right — nums[mid] < target → left = mid + 1
 *   search-left  — nums[mid] > target → right = mid - 1
 *   found        — nums[mid] == target → return mid
 *   not-found    — window empty → return -1
 */
export function buildSearchRotatedSteps(nums, target) {
  const steps = []
  const n = nums.length
  let l = 0
  let r = n - 1

  const push = (type, extra) => steps.push({
    type, nums, target, phase: 'pivot', left: l, right: r, mid: null, pivot: null, half: null, answer: null, ...extra,
  })

  push('init', { message: `Phase 1: find the pivot (smallest element). l = 0, r = ${r}.` })

  while (l < r) {
    const m = l + Math.floor((r - l) / 2)
    if (nums[m] > nums[r]) {
      push('pivot-right', { mid: m, message: `nums[${m}] = ${nums[m]} > nums[${r}] = ${nums[r]} — pivot is right of m. l = ${m + 1}.` })
      l = m + 1
    } else {
      push('pivot-left', { mid: m, message: `nums[${m}] = ${nums[m]} ≤ nums[${r}] = ${nums[r]} — pivot is m or left of it. r = ${m}.` })
      r = m
    }
  }

  const pivot = l
  push('pivot-found', { pivot, message: `Pivot = ${pivot} (nums[${pivot}] = ${nums[pivot]}). The array is two sorted runs: [0..${pivot - 1}] and [${pivot}..${n - 1}].` })

  let left, right
  if (target >= nums[pivot] && target <= nums[n - 1]) {
    left = pivot
    right = n - 1
    push('choose-right', { phase: 'search', pivot, half: [left, right], left, right, message: `${nums[pivot]} ≤ ${target} ≤ ${nums[n - 1]} — target can only be in the right run [${left}..${right}].` })
  } else {
    left = 0
    right = pivot - 1
    push('choose-left', { phase: 'search', pivot, half: [left, right], left, right, message: `${target} is outside [${nums[pivot]}, ${nums[n - 1]}] — search the left run [${left}..${right}].` })
  }

  const half = [left, right]
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)
    const base = { phase: 'search', pivot, half, left, right, mid }
    if (nums[mid] === target) {
      push('found', { ...base, answer: mid, message: `nums[${mid}] = ${target} — found it! Return ${mid}.` })
      return steps
    }
    if (nums[mid] < target) {
      push('search-right', { ...base, message: `nums[${mid}] = ${nums[mid]} < ${target} — go right. left = ${mid + 1}.` })
      left = mid + 1
    } else {
      push('search-left', { ...base, message: `nums[${mid}] = ${nums[mid]} > ${target} — go left. right = ${mid - 1}.` })
      right = mid - 1
    }
  }

  push('not-found', { phase: 'search', pivot, half, left, right, answer: -1, message: `Window is empty — ${target} isn't in the array. Return -1.` })
  return steps
}
