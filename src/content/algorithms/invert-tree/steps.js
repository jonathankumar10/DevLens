import { cloneTree } from '../../../lib/vizHelpers.js'

/**
 * Step builder for LeetCode #226 — Invert Binary Tree (recursive DFS).
 *
 * Step types:
 *   empty — root is null
 *   enter — call invertTree(node), recurse into children first
 *   swap  — both subtrees inverted → swap node.left and node.right
 *   done  — root returned
 *
 * Each step carries `tree`, a snapshot of the (partially) inverted tree;
 * node keys are stable so the visualizer can animate nodes to new spots.
 */
export function buildInvertTreeSteps(root) {
  const steps = []
  const work = cloneTree(root)
  const stack = []
  const swapped = new Set()

  const push = (type, current, message) => steps.push({
    type, current, tree: cloneTree(work), stack: [...stack], swapped: [...swapped], message,
  })

  if (!work) {
    push('empty', null, 'root is null — nothing to invert. Return null.')
    return steps
  }

  function dfs(node) {
    stack.push(node.key)
    push('enter', node.key, `invertTree(${node.val}) — invert both subtrees first.`)
    if (node.left) dfs(node.left)
    if (node.right) dfs(node.right)
    ;[node.left, node.right] = [node.right, node.left]
    swapped.add(node.key)
    push('swap', node.key, node.left || node.right
      ? `Both subtrees of ${node.val} are inverted — swap its left and right.`
      : `${node.val} is a leaf — swapping two nulls changes nothing.`)
    stack.pop()
  }

  dfs(work)
  push('done', work.key, 'Every node has swapped its children — the tree is mirrored. Return root.')
  return steps
}
