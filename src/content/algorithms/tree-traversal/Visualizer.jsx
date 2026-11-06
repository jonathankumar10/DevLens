import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { buildTraversalSteps, DEFAULT_TREE } from './steps'
import { useStepRunner } from '../../../hooks/useStepRunner'
import StepControls from '../../../components/ui/StepControls'
import { InputPanel, SecondaryButton, StepMessage, VizHeader } from '../../../components/ui/VisualizerKit'

function parseLevelOrder(input) {
  const tokens = input.split(',').map((s) => s.trim().toLowerCase())
  if (!tokens.length || tokens[0] === 'null' || tokens[0] === '') return null

  const nodeArr = tokens.map((t) =>
    t === 'null' ? null : { val: parseInt(t, 10), left: null, right: null }
  )

  for (const n of nodeArr) {
    if (n !== null && isNaN(n.val)) return undefined
  }

  for (let i = 0; i < nodeArr.length; i++) {
    if (!nodeArr[i]) continue
    const l = 2 * i + 1, r = 2 * i + 2
    if (l < nodeArr.length) nodeArr[i].left  = nodeArr[l]
    if (r < nodeArr.length) nodeArr[i].right = nodeArr[r]
  }

  return nodeArr[0]
}

function treeDepth(node) {
  if (!node) return 0
  return 1 + Math.max(treeDepth(node.left), treeDepth(node.right))
}

function treeSize(node) {
  if (!node) return 0
  return 1 + treeSize(node.left) + treeSize(node.right)
}

function checkBST(node, min = -Infinity, max = Infinity) {
  if (!node) return true
  if (node.val <= min || node.val >= max) return false
  return checkBST(node.left, min, node.val) && checkBST(node.right, node.val, max)
}

function treeToLevelOrder(root) {
  if (!root) return ''
  const result = [], queue = [root]
  while (queue.length) {
    const node = queue.shift()
    if (node) {
      result.push(String(node.val))
      queue.push(node.left  ?? null)
      queue.push(node.right ?? null)
    } else {
      result.push('null')
    }
  }
  while (result[result.length - 1] === 'null') result.pop()
  return result.join(', ')
}

function layoutTree(node, nodeId, depth, xMin, xMax, positions) {
  if (!node) return
  const xMid = (xMin + xMax) / 2
  positions[nodeId] = { x: xMid, y: depth * 90 + 55, val: node.val }
  layoutTree(node.left,  `${nodeId}L`, depth + 1, xMin, xMid, positions)
  layoutTree(node.right, `${nodeId}R`, depth + 1, xMid, xMax, positions)
}

function TreeNodeSVG({ nodeId, pos, step }) {
  const isVisited = step.visited?.includes(nodeId)
  const isCurrent = step.current === nodeId

  return (
    <motion.g>
      {(isVisited || isCurrent) && (
        <motion.circle cx={pos.x} cy={pos.y} r={26} fill="transparent"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            filter: isCurrent
              ? 'drop-shadow(0 0 18px rgba(167,139,250,1))'
              : 'drop-shadow(0 0 10px rgba(16,185,129,0.6))',
          }}
        />
      )}
      <motion.circle cx={pos.x} cy={pos.y} r={22}
        animate={{
          fill: isCurrent ? '#2563eb' : isVisited ? '#065f46' : '#1e293b',
          stroke: isCurrent ? '#93c5fd' : isVisited ? '#10b981' : '#334155',
        }}
        strokeWidth={2} transition={{ duration: 0.3 }}
      />
      <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize="13" fontWeight="700"
        fill={isVisited || isCurrent ? '#fff' : '#64748b'}
        className="pointer-events-none select-none">
        {pos.val}
      </text>
    </motion.g>
  )
}

function TreeEdge({ from, to }) {
  return (
    <line x1={from.x} y1={from.y + 22} x2={to.x} y2={to.y - 22}
      stroke="#334155" strokeWidth={1.5} />
  )
}

const ORDERS = ['inorder', 'preorder', 'postorder']

export default function TreeTraversalVisualizer({ onStepChange, onOrderChange }) {
  const [order,      setOrder]      = useState('inorder')
  const [tree,       setTree]       = useState(DEFAULT_TREE)
  const [draftInput, setDraftInput] = useState(treeToLevelOrder(DEFAULT_TREE))
  const [inputError, setInputError] = useState(null)

  const isBST = useMemo(() => checkBST(tree),  [tree])
  const depth = useMemo(() => treeDepth(tree),  [tree])
  const svgH  = Math.max(300, depth * 90 + 80)

  const steps = useMemo(() => buildTraversalSteps(tree, order), [tree, order])
  const runner = useStepRunner(steps)
  const { step, reset } = runner

  useEffect(() => { onStepChange?.(step)   }, [step,  onStepChange])
  useEffect(() => { onOrderChange?.(order) }, [order, onOrderChange])

  const positions = {}
  layoutTree(tree, 'root', 0, 0, 600, positions)

  const edgePairs = Object.keys(positions).flatMap((id) => {
    const edges = []
    if (positions[`${id}L`]) edges.push([id, `${id}L`])
    if (positions[`${id}R`]) edges.push([id, `${id}R`])
    return edges
  })

  function handleOrderChange(o) {
    setOrder(o)
    setTimeout(() => reset(), 0)
  }

  function handleApply() {
    if (!draftInput.trim()) { setInputError('Input cannot be empty.'); return }
    const parsed = parseLevelOrder(draftInput)
    if (parsed === undefined) { setInputError('Invalid values. Use integers or "null", comma-separated.'); return }
    if (parsed === null) { setInputError('Root cannot be null.'); return }
    const d = treeDepth(parsed)
    if (d > 5) { setInputError('Tree too deep (max 5 levels).'); return }
    if (treeSize(parsed) > 31) { setInputError('Too many nodes (max 31).'); return }
    setInputError(null)
    setTree(parsed)
    setTimeout(() => reset(), 0)
  }

  function handleReset() {
    setTree(DEFAULT_TREE)
    setDraftInput(treeToLevelOrder(DEFAULT_TREE))
    setInputError(null)
    setTimeout(() => reset(), 0)
  }

  return (
    <div className="space-y-4">
      <VizHeader
        title="Tree Traversal"
        subtitle="Nodes light up as they're visited."
        aside={
          <div className="flex rounded-xl overflow-hidden border border-white/10">
            {ORDERS.map((o) => (
              <button key={o} onClick={() => handleOrderChange(o)}
                className={`px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                  order === o ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}>
                {o}
              </button>
            ))}
          </div>
        }
      />

      <InputPanel
        title="Build your own tree"
        aside={
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            isBST
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
              : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
          }`}>
            {isBST ? '✓ Valid BST' : '~ Not a BST'}
          </span>
        }
        fields={[{
          label: <>Level-order values (comma-separated, use <span className="font-mono">null</span> for missing nodes)</>,
          value: draftInput, onChange: setDraftInput, placeholder: 'e.g. 4, 2, 6, 1, 3, 5, 7', width: 'flex-1 min-w-0',
        }]}
        onRun={handleApply}
        runLabel="Apply"
        actions={<SecondaryButton onClick={handleReset}>Reset</SecondaryButton>}
        error={inputError}
        examplesLabel="Example trees"
        examples={[
          { label: 'BST: 4,2,6,1,3,5,7', onClick: () => { setDraftInput('4, 2, 6, 1, 3, 5, 7'); setInputError(null) } },
          { label: 'Non-BST: 1,5,2,7,3,9,4', onClick: () => { setDraftInput('1, 5, 2, 7, 3, 9, 4'); setInputError(null) } },
          { label: 'Skewed: right-skewed', onClick: () => { setDraftInput('1, null, 2, null, null, null, 3'); setInputError(null) } },
        ]}
      >
        {isBST && order === 'inorder' && (
          <p className="text-[11px] text-emerald-500/80">Inorder on a BST gives sorted output — try it!</p>
        )}
      </InputPanel>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
        <svg viewBox={`0 0 600 ${svgH}`} className="w-full" style={{ maxHeight: 420 }}>
          {edgePairs.map(([fromId, toId]) => (
            <TreeEdge key={`${fromId}-${toId}`} from={positions[fromId]} to={positions[toId]} />
          ))}
          {Object.entries(positions).map(([nodeId, pos]) => (
            <TreeNodeSVG key={nodeId} nodeId={nodeId} pos={pos} step={step} />
          ))}
        </svg>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
        <p className="mb-2 text-xs font-medium text-slate-500 uppercase tracking-wide">Visited order</p>
        <div className="flex flex-wrap items-center gap-1.5 min-h-8">
          {!step.visited?.length ? (
            <span className="text-xs text-slate-600">—</span>
          ) : (
            step.visited.map((id, i) => (
              <span key={`${id}-${i}`} className="flex items-center gap-1">
                <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-mono text-emerald-300">
                  {positions[id]?.val}
                </span>
                {i < step.visited.length - 1 && <span className="text-slate-600 text-xs">→</span>}
              </span>
            ))
          )}
        </div>
      </div>

      <StepMessage message={step.message} />

      <StepControls runner={runner} />
    </div>
  )
}
