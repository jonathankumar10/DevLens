import { useCallback, useMemo, useState } from 'react'

/**
 * Node state shared by every step-through diagram. A node is active when the
 * current step lists it in `activeNodes`, and visited once any earlier step
 * did. Returns `nodeState(id)`: spread it onto <DiagramNode>.
 */
export function useDiagramNodes(steps, index) {
  const [expandedNode, setExpandedNode] = useState(null)
  const activeNodes = steps[index]?.activeNodes ?? []

  const visitedNodes = useMemo(() => {
    const visited = new Set()
    for (let i = 0; i <= index; i++) (steps[i]?.activeNodes ?? []).forEach((id) => visited.add(id))
    return visited
  }, [steps, index])

  const toggle = useCallback((id) => setExpandedNode((open) => (open === id ? null : id)), [])

  const nodeState = (id) => {
    const isActive = activeNodes.includes(id)
    return {
      isActive,
      wasVisited: !isActive && visitedNodes.has(id),
      isExpanded: expandedNode === id,
      onToggle: () => toggle(id),
      popKey: isActive ? index : null,
    }
  }

  return { nodeState, visitedNodes, expandedNode }
}
