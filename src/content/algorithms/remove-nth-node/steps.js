/**
 * Step builder for LeetCode #19 — Remove Nth Node From End of List.
 *
 * Positions: 0 = dummy, 1..len = list nodes.
 *
 * Step types:
 *   init         — dummy → head, slow = fast = dummy
 *   advance-fast — fast moves n steps ahead
 *   move-both    — slow and fast move together until fast.next is null
 *   remove       — slow.next = slow.next.next
 *   done         — return dummy.next
 */
export function buildRemoveNthSteps(values, n) {
  const steps = []
  const len = values.length
  let slow = 0
  let fast = 0
  let removed = null

  const push = (type, message) => steps.push({ type, values, n, slow, fast, removed, message })

  push('init', `Put a dummy node before the head. slow = fast = dummy.`)

  for (let i = 0; i < n; i++) {
    fast++
    push('advance-fast', `Head start ${i + 1}/${n}: fast → ${values[fast - 1]}.`)
  }

  while (fast < len) {
    slow++
    fast++
    push('move-both', `Move together: slow → ${values[slow - 1]}, fast → ${values[fast - 1]}.`)
  }

  removed = slow + 1
  push('remove', `fast is on the last node, so slow.next (${values[removed - 1]}) is ${n === 1 ? 'the last node' : `${n}th from the end`}. slow.next = slow.next.next.`)
  const result = values.filter((_, i) => i + 1 !== removed)
  push('done', `Return dummy.next → [${result.join(', ')}].`)
  return steps
}
