/**
 * Step builder for LeetCode #278 — First Bad Version.
 *
 * Step types:
 *   init — left = 1, right = n
 *   bad  — isBadVersion(mid) → first bad is mid or earlier, right = mid - 1
 *   good — !isBadVersion(mid) → first bad is later, left = mid + 1
 *   done — return left
 *
 * `checked` maps version → true (bad) / false (good) for every API call made so far.
 */
export function buildFirstBadVersionSteps(n, firstBad) {
  const steps = []
  const checked = {}
  let left = 1
  let right = n

  const push = (type, mid, message) => steps.push({ type, n, left, right, mid, checked: { ...checked }, calls: Object.keys(checked).length, message })

  push('init', null, `Versions 1..${n}. left = 1, right = ${n}.`)

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2)
    const bad = mid >= firstBad
    checked[mid] = bad
    if (bad) {
      push('bad', mid, `isBadVersion(${mid}) → true. The first bad is ${mid} or earlier. right = ${mid - 1}.`)
      right = mid - 1
    } else {
      push('good', mid, `isBadVersion(${mid}) → false. The first bad comes later. left = ${mid + 1}.`)
      left = mid + 1
    }
  }

  push('done', null, `left = ${left} passed right = ${right}. First bad version = ${left}.`)
  return steps
}
