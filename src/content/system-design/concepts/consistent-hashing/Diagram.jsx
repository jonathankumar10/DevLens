import { useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildConsistentHashingSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'

const CW = 620
const CH = 320

const RING_CX = 310
const RING_CY = 158
const RING_R  = 110

function ringPos(angleDeg, r = RING_R) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: RING_CX + r * Math.cos(rad), y: RING_CY + r * Math.sin(rad) }
}

const SERVERS = [
  {
    id: 'server-a', label: 'Server A', icon: '🖥️', angle: 0,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    w: 80, h: 58,
    desc: 'Hashed to position ~0° on the ring. Owns keys that land between the previous server clockwise and this position.',
    note: 'Each server is positioned by hash(server_id), not by administrator assignment.',
  },
  {
    id: 'server-b', label: 'Server B', icon: '🖥️', angle: 95,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    w: 80, h: 58,
    desc: 'Hashed to ~95° on the ring. Owns keys between Server A (0°) and Server B (95°).',
    note: 'The arc length each server owns is proportional to its share of the keyspace.',
  },
  {
    id: 'server-c', label: 'Server C', icon: '🖥️', angle: 195,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    w: 80, h: 58,
    desc: 'Hashed to ~195° on the ring. Responsible for roughly the bottom-left arc.',
    note: 'If this server is removed, Server D (next clockwise) absorbs its keys.',
  },
  {
    id: 'server-d', label: 'Server D', icon: '🖥️', angle: 285,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    w: 80, h: 58,
    desc: 'Hashed to ~285°. Owns keys from Server C (195°) clockwise to Server D (285°).',
    note: 'Adding Server E between D and A means only ~1/5 of keys move.',
  },
  {
    id: 'server-e', label: 'Server E', icon: '🖥️', angle: 340,
    color: '#f43f5e', glow: 'rgba(244,63,94,0.65)', lc: '#fda4af', strip: 'bg-rose-500',
    w: 80, h: 58,
    desc: 'New server added between D and A. Only keys that previously mapped to A but sit in the D→E arc move here.',
    note: 'Without consistent hashing, adding a server remaps ~all N/(N+1) keys.',
  },
]

const KEYS = [
  {
    id: 'key-1', label: 'key:1', angle: 38,
    color: '#a78bfa', r: RING_R - 30,
    desc: 'Hashes to 38° — between Server A (0°) and Server B (95°). Routes to Server B.',
  },
  {
    id: 'key-2', label: 'key:2', angle: 145,
    color: '#38bdf8', r: RING_R - 30,
    desc: 'Hashes to 145° — between Server B (95°) and Server C (195°). Routes to Server C.',
  },
  {
    id: 'key-3', label: 'key:3', angle: 240,
    color: '#34d399', r: RING_R - 30,
    desc: 'Hashes to 240° — between Server C (195°) and Server D (285°). Routes to Server D.',
  },
]

const KEY_OWNER_MAP = { a: 'server-a', b: 'server-b', c: 'server-c', d: 'server-d', e: 'server-e' }

function KeyDot({ keyNode, ownerColor, isActive }) {
  const pos = ringPos(keyNode.angle, keyNode.r)
  return (
    <g>
      <motion.circle
        cx={pos.x} cy={pos.y} r={6}
        fill={isActive ? ownerColor : keyNode.color}
        style={{ filter: isActive ? `drop-shadow(0 0 6px ${ownerColor})` : 'none' }}
        animate={{ r: isActive ? 7 : 5 }}
        transition={{ duration: 0.25 }}
      />
      <text
        x={pos.x} y={pos.y - 10}
        textAnchor="middle"
        style={{ fill: isActive ? ownerColor : '#475569', fontSize: 8, fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}
      >
        {keyNode.label}
      </text>
    </g>
  )
}

// A server on the hash ring: a compact node placed by its angle, shown once it has joined.
function RingServer({ node, isActive, wasVisited, isExpanded, onToggle, popKey, show }) {
  const pos = ringPos(node.angle, RING_R + 42)
  if (!show) return null

  return (
    <div
      className="absolute"
      style={{
        left: pos.x - node.w / 2,
        top:  pos.y - node.h / 2,
        width: node.w,
        height: node.h,
      }}
    >
      <motion.button
        onClick={onToggle}
        className="relative w-full h-full rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center gap-0.5 px-1 cursor-pointer focus:outline-none"
        animate={{
          borderColor:     isActive ? node.color : wasVisited ? `${node.color}38` : 'rgba(255,255,255,0.08)',
          backgroundColor: isActive ? `${node.color}16` : wasVisited ? `${node.color}07` : 'rgba(10,18,36,1)',
          boxShadow:       isActive ? `0 0 28px -5px ${node.glow}` : 'none',
        }}
        transition={{ duration: 0.28 }}
        initial={{ scale: 0.7, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
      >
        <motion.div className={`absolute top-0 left-0 right-0 h-0.5 ${node.strip}`}
          animate={{ opacity: isActive ? 1 : wasVisited ? 0.35 : 0.12 }} />

        {[0, 1, 2].map((i) => (
          <motion.div
            key={`${popKey ?? 'i'}-${node.id}-${i}`}
            className="absolute inset-0 rounded-xl border-2 pointer-events-none"
            style={{ borderColor: node.color }}
            initial={{ scale: 1, opacity: popKey != null ? 0.65 : 0 }}
            animate={{ scale: 2.0 + i * 0.35, opacity: 0 }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: 'easeOut' }}
          />
        ))}

        <motion.span
          key={`ic-${popKey ?? 0}`}
          animate={popKey != null ? { scale: [1, 1.4, 0.88, 1.06, 1] } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          className="text-base leading-none select-none"
        >
          {node.icon}
        </motion.span>

        <motion.p
          animate={{ color: isActive ? node.lc : wasVisited ? '#94a3b8' : '#475569' }}
          className="text-[9px] font-bold text-center leading-tight"
        >
          {node.label}
        </motion.p>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            className="absolute z-30 w-48 rounded-xl border bg-slate-900/96 backdrop-blur shadow-2xl p-2.5 space-y-1"
            style={{
              borderColor: `${node.color}40`,
              top: '105%', left: '50%', transform: 'translateX(-50%)',
            }}
          >
            <p className="text-[10px] font-bold" style={{ color: node.lc }}>{node.label}</p>
            <p className="text-[9px] text-slate-400 leading-relaxed">{node.desc}</p>
            <p className="text-[9px] italic" style={{ color: node.color }}>{node.note}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ConsistentHashingDiagram({ onStepChange }) {
  const steps  = useMemo(() => buildConsistentHashingSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  const { nodeState } = useDiagramNodes(steps, index)

  const activeServerIds = new Set(step.activeNodes.filter((n) => n.startsWith('server')))
  const showVnodes      = !!step.vnodes

  function getOwnerColor(keyId) {
    const ownerShortId = step.connections?.[keyId]
    if (!ownerShortId) return '#475569'
    const server = SERVERS.find((s) => s.id === KEY_OWNER_MAP[ownerShortId])
    return server?.color ?? '#475569'
  }

  return (
    <div className="space-y-4">

      <DiagramHeader title="Consistent Hashing — the Ring">
        Step through how servers and keys share a virtual ring, and why only ~1/N keys move when topology changes.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <motion.circle
            cx={RING_CX} cy={RING_CY} r={RING_R}
            fill="none"
            animate={{
              stroke:       step.highlightedRing ? '#8b5cf6' : '#1e293b',
              strokeWidth:  step.highlightedRing ? 2 : 1.5,
              filter:       step.highlightedRing ? 'drop-shadow(0 0 6px rgba(139,92,246,0.5))' : 'none',
            }}
            strokeDasharray="6 4"
            transition={{ duration: 0.4 }}
          />

          {showVnodes && SERVERS.map((sv) =>
            [-30, 30, 90].map((offset) => {
              const vpos = ringPos(sv.angle + offset, RING_R)
              return (
                <motion.circle
                  key={`vn-${sv.id}-${offset}`}
                  cx={vpos.x} cy={vpos.y} r={3}
                  fill={sv.color}
                  opacity={0.45}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                />
              )
            })
          )}

          {KEYS.map((k) => {
            const isKActive = step.activeKeys?.includes(k.id)
            const ownerColor = getOwnerColor(k.id)
            return <KeyDot key={k.id} keyNode={k} ownerColor={ownerColor} isActive={isKActive} />
          })}

          {SERVERS.map((sv) => {
            if (sv.id === 'server-e' && !step.activeNodes.includes('server-e')) return null
            const pos = ringPos(sv.angle, RING_R)
            return (
              <motion.circle
                key={`ring-dot-${sv.id}`}
                cx={pos.x} cy={pos.y} r={5}
                fill={activeServerIds.has(sv.id) ? sv.color : '#1e293b'}
                stroke={sv.color}
                strokeWidth={1.5}
                style={{ filter: activeServerIds.has(sv.id) ? `drop-shadow(0 0 6px ${sv.glow})` : 'none' }}
                transition={{ duration: 0.3 }}
              />
            )
          })}

          {SERVERS.map((sv) => {
            if (sv.id === 'server-e' && !step.activeNodes.includes('server-e')) return null
            const visibleServers = SERVERS.filter((s) => s.id !== 'server-e' || step.activeNodes.includes('server-e'))
            const visIdx = visibleServers.findIndex((s) => s.id === sv.id)
            const next = visibleServers[(visIdx + 1) % visibleServers.length]
            const pos1 = ringPos(sv.angle, RING_R)
            const pos2 = ringPos(next.angle, RING_R)
            const bothActive = activeServerIds.has(sv.id) && activeServerIds.has(next.id)
            return (
              <line
                key={`arc-label-${sv.id}`}
                x1={pos1.x} y1={pos1.y} x2={pos2.x} y2={pos2.y}
                stroke={bothActive ? sv.color : '#0f172a'}
                strokeWidth={bothActive ? 1.5 : 0}
                strokeDasharray="3 3"
                style={{ transition: 'all 0.3s' }}
              />
            )
          })}
        </>}
        footer={<>
          <AnimatePresence mode="wait">
            {showVnodes && (
              <motion.div
                key="vnodes-banner"
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                className="mt-3 flex items-center gap-3 rounded-xl border border-violet-500/40 bg-violet-500/[0.07] px-4 py-2.5"
              >
                <span className="text-violet-400 select-none">⬡</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Virtual Nodes Active</p>
                  <p className="text-[11px] font-mono text-violet-300">Each server occupies ~150 positions on the ring — load distributes uniformly</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: '#8b5cf6', glow: 'rgba(139,92,246,0.85)', label: 'server on ring' },
              { color: '#a78bfa', glow: 'rgba(167,139,250,0.85)', label: 'key → nearest clockwise server' },
            ].map(({ color, glow, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-5 h-px rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 4px ${glow}` }} />
                <span className="text-[10px] text-slate-500">{label}</span>
              </div>
            ))}
            <span className="text-[10px] text-slate-600 ml-auto hidden sm:inline">tap any server for details</span>
          </div>
        </>}
      >
        {SERVERS.map((sv) => (
          <RingServer key={sv.id} node={sv} {...nodeState(sv.id)} show={sv.id !== 'server-e' || step.activeNodes.includes('server-e')} />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
