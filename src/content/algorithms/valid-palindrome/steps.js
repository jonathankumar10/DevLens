const ALNUM = /[a-zA-Z0-9]/

/**
 * Step builder for LeetCode #125 — Valid Palindrome.
 *
 * Step types:
 *   init       — string presented, left = 0, right = length - 1
 *   skip-left  — s[left] is not alphanumeric → left++
 *   skip-right — s[right] is not alphanumeric → right--
 *   match      — s[left] and s[right] match (case-insensitive) → left++, right--
 *   mismatch   — s[left] and s[right] differ → return false
 *   valid      — left >= right, every pair matched → return true
 *
 * Each step carries `resolved`, a snapshot array (one entry per character)
 * of 'skip' | 'match' | 'mismatch' | null, so the visualizer can render
 * every character's final state without recomputing history.
 */
export function buildValidPalindromeSteps(s) {
  const steps = []
  const n = s.length
  let left = 0
  let right = n - 1
  const resolved = new Array(n).fill(null)

  const push = (type, extra = {}) => {
    steps.push({
      type,
      s,
      left,
      right,
      resolved: [...resolved],
      result: null,
      ...extra,
    })
  }

  push('init', { message: `String has ${n} character${n === 1 ? '' : 's'}. left = 0, right = ${n - 1}.` })

  while (left < right) {
    const lc = s[left]
    const rc = s[right]

    if (!ALNUM.test(lc)) {
      resolved[left] = 'skip'
      push('skip-left', { message: `'${lc}' at index ${left} is not alphanumeric — skip it. left = ${left + 1}.` })
      left++
    } else if (!ALNUM.test(rc)) {
      resolved[right] = 'skip'
      push('skip-right', { message: `'${rc}' at index ${right} is not alphanumeric — skip it. right = ${right - 1}.` })
      right--
    } else {
      const ll = lc.toLowerCase()
      const rl = rc.toLowerCase()

      if (ll !== rl) {
        resolved[left] = 'mismatch'
        resolved[right] = 'mismatch'
        push('mismatch', {
          result: false,
          message: `'${lc}' (index ${left}) ≠ '${rc}' (index ${right}) — not a palindrome. Return false.`,
        })
        return steps
      }

      resolved[left] = 'match'
      resolved[right] = 'match'
      push('match', { message: `'${lc}' (index ${left}) = '${rc}' (index ${right}) — match. left = ${left + 1}, right = ${right - 1}.` })
      left++
      right--
    }
  }

  push('valid', { result: true, message: `left (${left}) ≥ right (${right}) — every pair matched. Return true.` })
  return steps
}
