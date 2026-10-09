/**
 * Pure input-parsing and tree helpers shared by algorithm visualizers
 * and their step builders.
 */

export function parseIntList(text, { min = 1, max = 16 } = {}) {
  const raw = text.split(',').map((t) => t.trim()).filter(Boolean)
  if (raw.length < min) return { error: `Enter at least ${min} number${min === 1 ? '' : 's'}.` }
  if (raw.length > max) return { error: `Keep it to ${max} numbers or fewer.` }
  const nums = raw.map(Number)
  if (nums.some((n) => !Number.isInteger(n))) return { error: 'Only whole numbers, separated by commas.' }
  if (nums.some((n) => Math.abs(n) > 999)) return { error: 'Keep numbers between -999 and 999.' }
  return { value: nums }
}

/**
 * LeetCode-style level order ("3, 9, 20, null, null, 15, 7") → tree of
 * { key, val, left, right }. `key` is stable for the life of the node so
 * animations can follow a node even when the tree is restructured.
 */
export function parseLevelOrder(text, { maxNodes = 15 } = {}) {
  const tokens = text.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
  if (!tokens.length || tokens[0] === 'null') return { value: null }
  const vals = tokens.map((t) => (t === 'null' ? null : Number(t)))
  if (vals.some((v) => v !== null && !Number.isInteger(v))) return { error: 'Use integers or null, separated by commas.' }
  if (vals.filter((v) => v !== null).length > maxNodes) return { error: `Keep it to ${maxNodes} nodes or fewer.` }

  let k = 0
  const make = (val) => ({ key: `n${k++}`, val, left: null, right: null })
  const root = make(vals[0])
  const queue = [root]
  let i = 1
  while (queue.length && i < vals.length) {
    const node = queue.shift()
    if (i < vals.length && vals[i] !== null) { node.left = make(vals[i]); queue.push(node.left) }
    i++
    if (i < vals.length && vals[i] !== null) { node.right = make(vals[i]); queue.push(node.right) }
    i++
  }
  if (treeHeight(root) > 5) return { error: 'Keep the tree to 5 levels or fewer.' }
  return { value: root }
}

export function treeHeight(node) {
  return node ? 1 + Math.max(treeHeight(node.left), treeHeight(node.right)) : 0
}

export function cloneTree(node) {
  return node ? { ...node, left: cloneTree(node.left), right: cloneTree(node.right) } : null
}

// Tailwind classes for array/list cells, keyed by visual state.
export const CELL_STYLES = {
  pending: 'border-slate-700 bg-slate-800/60 text-slate-300',
  active:  'border-blue-400 bg-blue-500/20 text-white shadow-[0_0_10px_1px_rgba(59,130,246,0.5)]',
  active2: 'border-pink-400 bg-pink-500/20 text-white shadow-[0_0_10px_1px_rgba(236,72,153,0.5)]',
  mid:     'border-amber-400 bg-amber-500/20 text-amber-100 shadow-[0_0_10px_1px_rgba(245,158,11,0.5)]',
  done:    'border-emerald-400 bg-emerald-500/20 text-emerald-200',
  found:   'border-emerald-300 bg-emerald-500/35 text-white shadow-[0_0_14px_2px_rgba(16,185,129,0.6)]',
  bad:     'border-rose-400 bg-rose-500/25 text-rose-100 shadow-[0_0_10px_1px_rgba(244,63,94,0.55)]',
  range:   'border-slate-500 bg-slate-700/60 text-slate-100',
  dim:     'border-slate-800 bg-slate-800/20 text-slate-600',
  violet:  'border-violet-400 bg-violet-500/20 text-violet-100',
}
