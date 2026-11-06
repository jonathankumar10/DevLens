import { motion, useReducedMotion } from 'framer-motion'
import { DEFAULT_DIRECTIONS } from './colors'

const IDLE_STROKE = '#182030'
const DOTS = [0, 1, 2]

function Dots({ id, color, from, to }) {
  return DOTS.map((p) => (
    <motion.circle
      key={`${id}-${p}`}
      r={3.5}
      fill={color.hex}
      style={{ filter: `drop-shadow(0 0 5px ${color.glow})` }}
      initial={{ cx: from[0], cy: from[1] }}
      animate={{ cx: [from[0], to[0]], cy: [from[1], to[1]] }}
      transition={{ duration: 0.5, delay: p * 0.16, ease: 'linear', repeat: Infinity, repeatDelay: 0.1 }}
    />
  ))
}

/**
 * A straight connection between two nodes, drawn inside the diagram's <svg>.
 * When `flow` is set, dots travel along it: `flow.fwd` from (x1,y1) to (x2,y2)
 * and `flow.bwd` back again. The line takes `flow.line`, else the fwd colour.
 *
 * edge     — { x1, y1, x2, y2 }
 * flow     — { fwd, bwd, line } of FLOW colours (each optional), or null when idle
 * stepKey  — restarts the dots on each step
 * color    — optional stroke override, e.g. FLOW.red.hex for a broken link
 * dashed   — optional strokeDasharray (async or broken edges)
 * width    — optional stroke width
 * hidden   — skip the line and dots, drawing only `children`
 * children — optional extra SVG drawn on top (labels, markers)
 */
export default function DiagramEdge({ edgeId, edge, flow, stepKey, color, dashed, width, hidden, children }) {
  const reduceMotion = useReducedMotion()
  const { x1, y1, x2, y2 } = edge
  const fwd = flow?.fwd ?? null
  const bwd = flow?.bwd ?? null
  const isActive = Boolean(flow)
  const line = flow?.line ?? fwd
  const stroke = color ?? (isActive ? (line?.hex ?? '#1e293b') : IDLE_STROKE)
  const glow = color ? null : line?.glow

  if (hidden) return <g>{children}</g>

  return (
    <g>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={stroke}
        strokeWidth={width ?? (isActive || color ? 2 : 1)}
        strokeDasharray={dashed ?? (isActive ? 'none' : '5 4')}
        style={{ filter: isActive && glow ? `drop-shadow(0 0 5px ${glow})` : 'none', transition: 'all 0.3s' }}
      />
      {!reduceMotion && fwd && <Dots id={`${stepKey}-${edgeId}-f`} color={fwd} from={[x1, y1]} to={[x2, y2]} />}
      {!reduceMotion && bwd && <Dots id={`${stepKey}-${edgeId}-b`} color={bwd} from={[x2, y2]} to={[x1, y1]} />}
      {children}
    </g>
  )
}

/**
 * Every edge of a diagram, coloured by the current step's `connections`
 * ({ edgeId: direction }). `directions` maps a direction name to { fwd, bwd, line };
 * `edgeProps(edgeId, direction)` can return per-edge overrides
 * (flow, color, dashed, width, hidden, children).
 */
export function DiagramEdges({ edges, connections, stepKey, directions = DEFAULT_DIRECTIONS, edgeProps }) {
  return Object.entries(edges).map(([edgeId, edge]) => (
    <DiagramEdge
      key={edgeId}
      edgeId={edgeId}
      edge={edge}
      flow={directions[connections?.[edgeId]] ?? null}
      stepKey={stepKey}
      {...edgeProps?.(edgeId, connections?.[edgeId])}
    />
  ))
}
