/**
 * Step builder for LeetCode #141 — Linked List Cycle.
 *
 * The list is values[0..n-1]; the tail links back to index `pos`
 * (or to null when pos == -1). Pointers are node indices; null = fell off.
 *
 * Step types:
 *   init     — slow = fast = head
 *   move     — slow moves 1, fast moves 2, they haven't met
 *   meet     — slow == fast → return true
 *   no-cycle — fast (or fast.next) is null → return false
 */
export function buildLinkedListCycleSteps(values, pos) {
  const steps = []
  const n = values.length
  const next = (i) => (i === null ? null : i < n - 1 ? i + 1 : pos >= 0 ? pos : null)
  let slow = 0
  let fast = 0

  const push = (type, message) => steps.push({ type, values, pos, slow, fast, message })

  push('init', 'slow and fast both start at the head.')

  while (fast !== null && next(fast) !== null) {
    slow = next(slow)
    fast = next(next(fast))
    if (slow === fast) {
      push('meet', `slow → node ${slow}, fast → node ${fast}. They're on the same node — there's a cycle! Return true.`)
      return steps
    }
    push('move', `slow → node ${slow} (val ${values[slow]}), fast → ${fast === null ? 'null' : `node ${fast} (val ${values[fast]})`}.`)
  }

  push('no-cycle', fast === null
    ? 'fast ran off the end (null) — the list terminates. Return false.'
    : `fast.next is null — fast is on the last node. The list terminates. Return false.`)
  return steps
}
