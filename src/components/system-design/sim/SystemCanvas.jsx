import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { formatCount } from '../../../lib/sim/format'

const NODE_W = 132
const NODE_H = 62
const PADDING = 10
const NARROW_BELOW = 560

const STATUS_COLOR = {
  ok:        '#34d399',
  idle:      '#475569',
  busy:      '#fbbf24',
  hot:       '#fb923c',
  saturated: '#fb7185',
  down:      '#fb7185',
  off:       '#334155',
}

const ICONS = {
  client:   'M3 5h18v11H3zM8 20h8M12 16v4',
  gateway:  'M12 3v6M12 9l-7 6M12 9l7 6M5 15v5M19 15v5M12 9v11',
  service:  'M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01',
  cache:    'M13 2 4 14h7l-1 8 10-13h-7z',
  database: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  queue:    'M3 7h13M3 12h13M3 17h13M19 5l2 2-2 2M19 15l2 2-2 2',
}

function useIsNarrow(ref) {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element) return undefined
    const observer = new ResizeObserver(([entry]) => {
      setNarrow(entry.contentRect.width < NARROW_BELOW)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return narrow
}

// A cubic curve leaving and entering along whichever axis dominates the edge.
function edgeCurve(from, to) {
  const dx = to.x - from.x
  const dy = to.y - from.y

  // Favoring horizontal exits routes diagonal edges through the gap between
  // columns, so they don't pass through the boxes stacked below a node.
  if (Math.abs(dx) * 1.2 >= Math.abs(dy)) {
    const dir = Math.sign(dx) || 1
    const x0 = from.x + dir * (NODE_W / 2)
    const x3 = to.x - dir * (NODE_W / 2)
    const mid = (x0 + x3) / 2
    return [[x0, from.y], [mid, from.y], [mid, to.y], [x3, to.y]]
  }

  const dir = Math.sign(dy) || 1
  const y0 = from.y + dir * (NODE_H / 2)
  const y3 = to.y - dir * (NODE_H / 2)
  const mid = (y0 + y3) / 2
  return [[from.x, y0], [from.x, mid], [to.x, mid], [to.x, y3]]
}

function curvePoint([a, b, c, d], t) {
  const u = 1 - t
  const blend = (i) => u * u * u * a[i] + 3 * u * u * t * b[i] + 3 * u * t * t * c[i] + t * t * t * d[i]
  return [blend(0), blend(1)]
}

function edgeColor(edge, target) {
  if (target.status === 'down' || target.drop > 0) return '#fb7185'
  if (edge.isAsync) return '#a78bfa'
  if (target.status === 'hot') return '#fb923c'
  if (target.status === 'busy') return '#fbbf24'
  return '#60a5fa'
}

function particleCount(rate) {
  return Math.max(1, Math.min(6, Math.round(Math.log10(rate))))
}

function nodeDetail(node, data) {
  if (node.kind === 'client') return `${formatCount(data.arrival)} req/s`
  if (data.status === 'off') return 'Not in use'
  if (data.status === 'down') return 'Down'
  const count = data.instances > 1 ? `${data.alive} × ` : ''
  return `${count}${formatCount(node.capacity)}/s`
}

function CanvasNode({ node, data, position, canFail, pulse, onToggleFailure }) {
  const color = STATUS_COLOR[data.status]
  const isOff = data.status === 'off'
  const isDown = data.status === 'down'
  const load = Math.min(1, data.utilization)

  return (
    <g
      transform={`translate(${position.x - NODE_W / 2} ${position.y - NODE_H / 2})`}
      opacity={isOff ? 0.45 : 1}
      onClick={canFail ? () => onToggleFailure(node.id) : undefined}
      style={canFail ? { cursor: 'pointer' } : undefined}
    >
      {canFail && <title>{data.failed ? `Restore ${node.label}` : `Click to fail ${node.label}`}</title>}
      <rect
        width={NODE_W}
        height={NODE_H}
        rx="12"
        fill={isDown ? '#2a1218' : '#0d1424'}
        stroke={color}
        strokeWidth={data.status === 'saturated' || isDown ? 2 : 1.25}
        strokeDasharray={isOff ? '5 4' : undefined}
        className={pulse && data.status === 'saturated' ? 'sim-node-alert' : undefined}
        style={{ transition: 'stroke 200ms, fill 200ms' }}
      />
      <g transform="translate(11 11) scale(0.62)" fill="none" stroke={isOff ? '#64748b' : '#94a3b8'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={ICONS[node.kind]} />
      </g>
      <text x="31" y="23" fill={isOff ? '#94a3b8' : '#f1f5f9'} fontSize="11.5" fontWeight="600">{node.label}</text>
      <text x="11" y="41" fill={isDown ? '#fda4af' : '#94a3b8'} fontSize="10.5">{nodeDetail(node, data)}</text>
      {node.kind !== 'client' && !isOff && !isDown && (
        <>
          <text x={NODE_W - 11} y="41" textAnchor="end" fill={color} fontSize="10.5" fontWeight="600">
            {Math.round(data.utilization * 100)}%
          </text>
          <rect x="11" y="48" width={NODE_W - 22} height="4" rx="2" fill="#1e293b" />
          <rect
            x="11" y="48" width={(NODE_W - 22) * load} height="4" rx="2" fill={color}
            style={{ transition: 'width 200ms, fill 200ms' }}
          />
        </>
      )}
    </g>
  )
}

export default function SystemCanvas({ scenario, result, onToggleFailure }) {
  const wrapperRef = useRef(null)
  const svgRef = useRef(null)
  const phases = useRef(new Map())
  const visible = useRef(true)
  const narrow = useIsNarrow(wrapperRef)
  const reducedMotion = useReducedMotion()

  const positions = useMemo(() => Object.fromEntries(
    scenario.nodes.map((n) => [n.id, narrow ? n.narrow : n.wide]),
  ), [scenario, narrow])

  const viewBox = useMemo(() => {
    const points = Object.values(positions)
    const minX = Math.min(...points.map((p) => p.x)) - NODE_W / 2 - PADDING
    const maxX = Math.max(...points.map((p) => p.x)) + NODE_W / 2 + PADDING
    const minY = Math.min(...points.map((p) => p.y)) - NODE_H / 2 - PADDING
    const maxY = Math.max(...points.map((p) => p.y)) + NODE_H / 2 + PADDING
    return { minX, minY, width: maxX - minX, height: maxY - minY }
  }, [positions])

  const edges = useMemo(() => result.edges.map((edge) => {
    const curve = edgeCurve(positions[edge.from], positions[edge.to])
    return {
      ...edge,
      curve,
      color: edgeColor(edge, result.nodes[edge.to]),
      width: 0.75 + Math.log10(edge.rate) * 0.42,
      particles: particleCount(edge.rate),
      d: `M${curve[0]} C${curve[1]} ${curve[2]} ${curve[3]}`,
    }
  }), [result, positions])

  const failable = useMemo(() => new Set((scenario.failures ?? []).map((f) => f.node)), [scenario])

  // Stop animating while the canvas is off screen.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return undefined
    const observer = new IntersectionObserver(([entry]) => { visible.current = entry.isIntersecting })
    observer.observe(svg)
    return () => observer.disconnect()
  }, [])

  // Particles are moved directly on each frame, without re-rendering React. A
  // per-edge phase keeps them gliding when the traffic slider changes the flow.
  useEffect(() => {
    if (reducedMotion) return undefined
    const svg = svgRef.current
    if (!svg) return undefined

    const byKey = Object.fromEntries(edges.map((e) => [e.key, e]))
    const dots = [...svg.querySelectorAll('circle[data-edge]')]
    let frame
    let last = performance.now()

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (visible.current) {
        for (const key of Object.keys(byKey)) {
          const speed = 0.28 + Math.log10(byKey[key].rate) * 0.05
          phases.current.set(key, ((phases.current.get(key) ?? 0) + dt * speed) % 1)
        }
        for (const dot of dots) {
          const edge = byKey[dot.dataset.edge]
          if (!edge) continue
          const t = (phases.current.get(edge.key) + Number(dot.dataset.index) / edge.particles) % 1
          const [x, y] = curvePoint(edge.curve, t)
          dot.setAttribute('cx', x)
          dot.setAttribute('cy', y)
          dot.setAttribute('opacity', Math.min(1, Math.min(t, 1 - t) * 8))
        }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [edges, reducedMotion])

  return (
    <div ref={wrapperRef}>
      <svg
        ref={svgRef}
        viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
        className="block w-full h-auto select-none"
        role="img"
        aria-label={`Architecture diagram for ${scenario.title}. Node status is listed in text below.`}
      >
        <g fill="none">
          {edges.map((edge) => (
            <path
              key={edge.key}
              d={edge.d}
              stroke={edge.color}
              strokeOpacity={0.45}
              strokeWidth={edge.width}
              strokeDasharray={edge.isAsync ? '5 4' : undefined}
              style={{ transition: 'stroke 200ms' }}
            />
          ))}
        </g>

        {!reducedMotion && edges.flatMap((edge) => (
          Array.from({ length: edge.particles }, (_, i) => (
            <circle
              key={`${edge.key}-${i}`}
              data-edge={edge.key}
              data-index={i}
              r={2 + edge.width * 0.35}
              fill={edge.color}
              opacity="0"
            />
          ))
        ))}

        {scenario.nodes.map((node) => (
          <CanvasNode
            key={node.id}
            node={node}
            data={result.nodes[node.id]}
            position={positions[node.id]}
            canFail={failable.has(node.id) && result.nodes[node.id].enabled}
            pulse={!reducedMotion}
            onToggleFailure={onToggleFailure}
          />
        ))}
      </svg>
    </div>
  )
}
