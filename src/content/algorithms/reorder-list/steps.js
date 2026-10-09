/**
 * Step builder for LeetCode #143 — Reorder List.
 *
 * Nodes are indices 0..n-1 with a mutable `next` array, so every step can
 * show the real chains that exist at that moment.
 *
 * Step types:
 *   init        — slow = fast = head
 *   find-mid    — slow += 1, fast += 2
 *   split       — cut after slow; second half starts at mid
 *   reverse     — one node of the second half flipped onto prev
 *   merge-start — first = head, second = head of reversed half
 *   merge       — splice `second` in after `first`, advance both
 *   done        — list is reordered
 *
 * Each step carries `rows` — [{ label, keys }] chains to draw — and `tags`,
 * a map of node index → pointer labels.
 */
export function buildReorderListSteps(values) {
  const steps = []
  const n = values.length
  const next = values.map((_, i) => (i < n - 1 ? i + 1 : null))

  const chain = (start) => {
    const keys = []
    for (let c = start; c !== null && keys.length <= n; c = next[c]) keys.push(c)
    return keys
  }
  const fmt = (start) => `[${chain(start).map((k) => values[k]).join(', ')}]`

  const push = (type, phase, rows, tags, message) => steps.push({ type, phase, values, rows, tags, message })

  let slow = 0
  let fast = 0
  const sfTags = () => ({ [slow]: [{ text: 'S', color: 'blue' }], ...(fast !== null && { [fast]: [...(fast === slow ? [{ text: 'S', color: 'blue' }] : []), { text: 'F', color: 'pink' }] }) })

  push('init', 1, [{ label: 'list', keys: chain(0) }], sfTags(), 'Phase 1 — find the middle. slow and fast start at the head.')

  while (fast !== null && next[fast] !== null) {
    slow = next[slow]
    fast = next[next[fast]]
    push('find-mid', 1, [{ label: 'list', keys: chain(0) }], sfTags(),
      `slow → ${values[slow]}, fast → ${fast === null ? 'null' : values[fast]}.`)
  }

  let mid = next[slow]
  next[slow] = null
  let prev = null
  push('split', 2, [
    { label: 'first half', keys: chain(0) },
    { label: 'second half', keys: chain(mid) },
  ], { [slow]: [{ text: 'slow', color: 'blue' }], ...(mid !== null && { [mid]: [{ text: 'mid', color: 'amber' }] }) },
  `Phase 2 — cut after slow (${values[slow]}). Second half ${fmt(mid)} will be reversed.`)

  while (mid !== null) {
    const temp = next[mid]
    next[mid] = prev
    prev = mid
    mid = temp
    push('reverse', 2, [
      { label: 'first half', keys: chain(0) },
      { label: 'reversed (prev)', keys: chain(prev) },
      { label: 'remaining (mid)', keys: chain(mid) },
    ], { [prev]: [{ text: 'prev', color: 'violet' }], ...(mid !== null && { [mid]: [{ text: 'mid', color: 'amber' }] }) },
    `Flip ${values[prev]} to point at the reversed part. reversed = ${fmt(prev)}.`)
  }

  let first = 0
  let second = prev
  const mergeTags = () => ({
    ...(first !== null && { [first]: [{ text: 'first', color: 'blue' }] }),
    ...(second !== null && { [second]: [{ text: 'second', color: 'pink' }] }),
  })
  push('merge-start', 3, [
    { label: 'first', keys: chain(0) },
    { label: 'second', keys: chain(second) },
  ], mergeTags(), 'Phase 3 — zip the halves: one from the front, one from the (reversed) back.')

  while (second !== null) {
    const temp1 = next[first]
    const temp2 = next[second]
    next[first] = second
    next[second] = temp1
    const a = first
    const b = second
    first = temp1
    second = temp2
    push('merge', 3, [
      { label: 'from head', keys: chain(0) },
      { label: 'second (left)', keys: chain(second) },
    ], mergeTags(), `Splice ${values[b]} in after ${values[a]}. List so far: ${fmt(0)}.`)
  }

  push('done', 3, [{ label: 'result', keys: chain(0) }], {}, `Done — ${fmt(0)}.`)
  return steps
}
