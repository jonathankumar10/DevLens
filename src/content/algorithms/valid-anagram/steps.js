/**
 * Step builder for LeetCode #242 — Valid Anagram (hash map counting).
 *
 * Step types:
 *   length-mismatch — lengths differ → return false immediately
 *   init            — empty count map
 *   count           — count[s[i]]++, count[t[i]]--
 *   check-ok        — count[c] == 0, keep checking
 *   check-fail      — count[c] != 0 → return false
 *   valid           — every count is zero → return true
 *
 * Each step carries `count`, an ordered snapshot of [char, count] pairs.
 */
export function buildValidAnagramSteps(s, t) {
  const steps = []
  const count = new Map()

  const push = (type, extra) => {
    steps.push({ type, s, t, i: -1, checking: null, result: null, count: [...count.entries()], ...extra })
  }

  if (s.length !== t.length) {
    push('length-mismatch', { result: false, message: `len(s) = ${s.length} but len(t) = ${t.length} — can't be anagrams. Return false.` })
    return steps
  }

  push('init', { message: 'Lengths match. Start an empty tally: +1 for each letter of s, −1 for each letter of t.' })

  for (let i = 0; i < s.length; i++) {
    count.set(s[i], (count.get(s[i]) ?? 0) + 1)
    count.set(t[i], (count.get(t[i]) ?? 0) - 1)
    push('count', { i, message: `i = ${i}: +1 for '${s[i]}', −1 for '${t[i]}'.` })
  }

  for (const [c, n] of count) {
    if (n !== 0) {
      push('check-fail', { checking: c, result: false, message: `count['${c}'] = ${n} ≠ 0 — ${n > 0 ? 's has extra' : 't has extra'} '${c}'. Return false.` })
      return steps
    }
    push('check-ok', { checking: c, message: `count['${c}'] = 0 ✓` })
  }

  push('valid', { result: true, message: 'Every letter cancelled out. Return true.' })
  return steps
}
