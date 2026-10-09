/**
 * Step builder for LeetCode #133 — Clone Graph (BFS + hash map).
 *
 * adj — adjacency list, adj[i] = neighbors of node (i + 1), 1-indexed values.
 *
 * Step types:
 *   empty          — no nodes → return null
 *   init           — clone node 1, queue = [1]
 *   poll           — curr = queue.poll()
 *   clone-neighbor — neighbor has no clone yet → clone it, enqueue, link
 *   link-existing  — neighbor already cloned → just link
 *   done           — return the clone of node 1
 *
 * Each step carries `cloned` (values with a copy), `queue`, `processed`
 * (values already polled), `links` ([from, to] edges added to copies),
 * plus `curr` and `neighbor`.
 */
export function buildCloneGraphSteps(adj) {
  const steps = []
  const cloned = []
  const queue = []
  const processed = []
  const links = []

  const push = (type, curr, neighbor, message) => steps.push({
    type, adj, curr, neighbor,
    cloned: [...cloned], queue: [...queue], processed: [...processed], links: links.map((l) => [...l]),
    message,
  })

  if (adj.length === 0) {
    push('empty', null, null, 'The graph is empty — return null.')
    return steps
  }

  cloned.push(1)
  queue.push(1)
  push('init', null, null, 'Copy node 1 into the map and put the original in the queue.')

  while (queue.length) {
    const curr = queue.shift()
    push('poll', curr, null, `Poll ${curr}. Its neighbors: [${adj[curr - 1].join(', ')}].`)
    for (const nb of adj[curr - 1]) {
      if (!cloned.includes(nb)) {
        cloned.push(nb)
        queue.push(nb)
        links.push([curr, nb])
        push('clone-neighbor', curr, nb, `${nb} has no copy yet — create ${nb}', queue ${nb}, and link ${curr}' → ${nb}'.`)
      } else {
        links.push([curr, nb])
        push('link-existing', curr, nb, `${nb} is already copied — just link ${curr}' → ${nb}'.`)
      }
    }
    processed.push(curr)
  }

  push('done', null, null, `Queue empty. All ${cloned.length} nodes and ${links.length / 2} edges copied. Return 1'.`)
  return steps
}
