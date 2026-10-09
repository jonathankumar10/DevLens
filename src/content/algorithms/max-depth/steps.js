/**
 * Step builder for LeetCode #104 — Maximum Depth of Binary Tree (recursive DFS).
 *
 * Step types:
 *   empty     — root is null → return 0
 *   enter     — call maxDepth(node), about to recurse left
 *   left-done — left subtree answered, about to recurse right
 *   return    — both answered → return 1 + max(left, right)
 *   done      — root returned the final answer
 *
 * Each step carries `current` (node key), `stack` (keys on the call stack)
 * and `depths` (key → value returned by that node's call).
 */
export function buildMaxDepthSteps(root) {
  const steps = []
  const stack = []
  const depths = {}

  const push = (type, current, message) => steps.push({ type, current, stack: [...stack], depths: { ...depths }, message })

  if (!root) {
    push('empty', null, 'root is null — depth 0.')
    return steps
  }

  function dfs(node) {
    stack.push(node.key)
    push('enter', node.key, `maxDepth(${node.val}) — ask the left child${node.left ? ` (${node.left.val})` : ' (null → 0)'} first.`)
    const left = node.left ? dfs(node.left) : 0
    push('left-done', node.key, `Back at ${node.val}: left depth = ${left}. Now ask the right child${node.right ? ` (${node.right.val})` : ' (null → 0)'}.`)
    const right = node.right ? dfs(node.right) : 0
    const d = 1 + Math.max(left, right)
    depths[node.key] = d
    push('return', node.key, `${node.val}: 1 + max(${left}, ${right}) = ${d}. Return ${d} to the parent.`)
    stack.pop()
    return d
  }

  const answer = dfs(root)
  push('done', root.key, `The root returned ${answer} — the tree's maximum depth is ${answer}.`)
  steps[steps.length - 1].answer = answer
  return steps
}
