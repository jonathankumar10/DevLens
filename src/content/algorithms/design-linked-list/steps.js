/**
 * Step builder for LeetCode #707 — Design Linked List (doubly linked, two sentinels).
 *
 * ops — [{ name, args }] e.g. { name: 'addAtIndex', args: [1, 2] }
 *
 * Step types:
 *   init                         — head ⇄ tail sentinels
 *   get-walk / get-hit / get-miss
 *   add-head / add-tail
 *   index-walk / add-index / add-index-invalid
 *   delete-walk / delete / delete-invalid
 *
 * Each step carries `list` ([{ key, val }] between the sentinels), `cursor`
 * (a node key, 'T' for the tail sentinel, or null), `added` / `removing`
 * keys, `opIndex` and the `outputs` produced so far (one per op).
 */
export function buildDesignLinkedListSteps(ops) {
  const steps = []
  let list = []
  let nextKey = 0
  const outputs = ops.map(() => null)

  const push = (type, opIndex, extra) => steps.push({
    type, ops, opIndex, list: [...list], cursor: null, added: null, removing: null, outputs: [...outputs], ...extra,
  })
  const fmt = () => `[${list.map((n) => n.val).join(', ')}]`
  const cursorAt = (i) => (i < list.length ? list[i].key : 'T')

  push('init', -1, { message: 'MyLinkedList() — create dummy head and tail and link them to each other.' })

  ops.forEach(({ name, args }, oi) => {
    const label = `${name}(${args.join(', ')})`

    if (name === 'get') {
      const [index] = args
      let count = 0
      for (; count < list.length; count++) {
        if (count === index) {
          outputs[oi] = list[count].val
          push('get-hit', oi, { cursor: list[count].key, message: `${label}: count == ${index} — return ${list[count].val}.` })
          return
        }
        push('get-walk', oi, { cursor: list[count].key, message: `${label}: count = ${count} ≠ ${index}, move on.` })
      }
      outputs[oi] = -1
      push('get-miss', oi, { cursor: 'T', message: `${label}: reached the tail sentinel — index ${index} doesn't exist. Return -1.` })
      return
    }

    if (name === 'addAtHead' || name === 'addAtTail') {
      const node = { key: nextKey++, val: args[0] }
      list = name === 'addAtHead' ? [node, ...list] : [...list, node]
      outputs[oi] = 'null'
      push(name === 'addAtHead' ? 'add-head' : 'add-tail', oi, {
        added: node.key,
        message: `${label}: insert ${args[0]} between ${name === 'addAtHead' ? 'head and head.next' : 'tail.prev and tail'}. List: ${fmt()}.`,
      })
      return
    }

    if (name === 'addAtIndex' || name === 'deleteAtIndex') {
      const [index, val] = args
      const isAdd = name === 'addAtIndex'
      let count = 0
      push(isAdd ? 'index-walk' : 'delete-walk', oi, { cursor: cursorAt(0), message: `${label}: start at head.next, count = 0.` })
      while (count < list.length && count < index) {
        count++
        push(isAdd ? 'index-walk' : 'delete-walk', oi, { cursor: cursorAt(count), message: `${label}: temp = temp.next, count = ${count}.` })
      }
      outputs[oi] = 'null'

      if (isAdd) {
        if (count !== index) {
          push('add-index-invalid', oi, { cursor: 'T', message: `${label}: hit the tail at count ${count} < ${index} — index too large, do nothing.` })
          return
        }
        const node = { key: nextKey++, val }
        list = [...list.slice(0, count), node, ...list.slice(count)]
        push('add-index', oi, { added: node.key, message: `${label}: insert ${val} before ${count < list.length - 1 ? `node ${list[count + 1].val}` : 'the tail'}. List: ${fmt()}.` })
        return
      }

      if (count >= list.length) {
        push('delete-invalid', oi, { cursor: 'T', message: `${label}: temp is the tail — no node at index ${index}, do nothing.` })
        return
      }
      const victim = list[count]
      push('delete', oi, { removing: victim.key, cursor: victim.key, message: `${label}: unlink ${victim.val} — temp.prev.next = temp.next, temp.next.prev = temp.prev.` })
      list = list.filter((nd) => nd.key !== victim.key)
    }
  })

  return steps
}
