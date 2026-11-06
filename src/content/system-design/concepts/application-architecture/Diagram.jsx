import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildApplicationArchitectureSteps } from './steps'
import { useTtsRunner } from '../../../../hooks/useTtsRunner'
import StepControls from '../../../../components/ui/StepControls'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { FLOW } from '../../../../components/system-design/diagram/colors'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'

// ── Layout ────────────────────────────────────────────────────────────────────
// Two-lane directed flow:
//   Deploy lane (top): Developer → CI/CD → Server
//   Request lane:      User → Frontend → Load Balancer → Server → Cache / DB
//   Observability:     Server → Monitoring (below)

const CW = 770  // container width
const CH = 400  // container height

const NODES = [
  {
    id: 'developer', label: 'Developer', icon: '👨‍💻', dir: 'top',
    cx: 85,  cy: 65,  w: 110, h: 80,
    sub1: 'push → deploy', sub2: 'version control',
    color: '#6366f1', glow: 'rgba(99,102,241,0.65)',   lc: '#a5b4fc', strip: 'bg-indigo-500',
    desc: 'Writes code and pushes to version control.',
    note: 'Every change is tracked and can be rolled back in seconds.',
  },
  {
    id: 'cicd', label: 'CI / CD', icon: '🔄', dir: 'top',
    cx: 245, cy: 65,  w: 110, h: 80,
    sub1: 'build + test', sub2: 'automated',
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)',   lc: '#c4b5fd', strip: 'bg-violet-500',
    desc: 'Builds, tests, and deploys every code change automatically.',
    note: 'If any test fails the pipeline stops — nothing broken ships.',
  },
  {
    id: 'user', label: 'User', icon: '👤', dir: 'bottom',
    cx: 68,  cy: 300, w: 96,  h: 76,
    sub1: 'browser', sub2: 'end user',
    color: '#94a3b8', glow: 'rgba(148,163,184,0.65)',  lc: '#cbd5e1', strip: 'bg-slate-400',
    desc: 'The person using the application.',
    note: 'Their experience is what every other layer is optimised for.',
  },
  {
    id: 'frontend', label: 'Frontend', icon: '💻', dir: 'bottom',
    cx: 210, cy: 300, w: 110, h: 80,
    sub1: 'React / Vue', sub2: 'served by CDN',
    color: '#06b6d4', glow: 'rgba(6,182,212,0.65)',    lc: '#67e8f9', strip: 'bg-cyan-500',
    desc: 'JavaScript app running in the browser.',
    note: 'Static assets served by CDN — fast load worldwide.',
  },
  {
    id: 'lb', label: 'Load Balancer', icon: '⚖️', dir: 'left',
    cx: 350, cy: 190, w: 112, h: 86,
    sub1: 'round-robin', sub2: 'health checks',
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)',   lc: '#7dd3fc', strip: 'bg-sky-500',
    desc: 'Routes requests to healthy servers, skips failed ones.',
    note: 'Add a server and traffic shifts to it automatically.',
  },
  {
    id: 'server', label: 'App Server', icon: '🖥️', dir: 'right',
    cx: 510, cy: 190, w: 120, h: 92,
    sub1: 'stateless', sub2: 'business logic',
    color: '#3b82f6', glow: 'rgba(59,130,246,0.65)',   lc: '#93c5fd', strip: 'bg-blue-500',
    desc: 'Handles requests, runs business logic, returns responses.',
    note: 'Stateless by design — any server handles any request.',
  },
  {
    id: 'cache', label: 'Cache', icon: '⚡', dir: 'right',
    cx: 655, cy: 115, w: 110, h: 80,
    sub1: '< 1 ms', sub2: 'Redis',
    color: '#10b981', glow: 'rgba(16,185,129,0.65)',   lc: '#6ee7b7', strip: 'bg-emerald-500',
    desc: 'In-memory store — returns data without hitting the database.',
    note: '90%+ hit rate means the DB sees a fraction of the reads.',
  },
  {
    id: 'db', label: 'Database', icon: '🗄️', dir: 'right',
    cx: 680, cy: 255, w: 110, h: 80,
    sub1: '1–10 ms', sub2: 'persistent',
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)',   lc: '#fcd34d', strip: 'bg-amber-500',
    desc: 'Permanent source of truth — every write lands here.',
    note: 'Reads go to cache. Writes go to the database.',
  },
  {
    id: 'monitor', label: 'Monitoring', icon: '📊', dir: 'bottom',
    cx: 510, cy: 335, w: 110, h: 78,
    sub1: 'real-time', sub2: 'logs + alerts',
    color: '#f43f5e', glow: 'rgba(244,63,94,0.65)',    lc: '#fda4af', strip: 'bg-rose-500',
    desc: 'Tracks every request, error, and metric across the system.',
    note: 'You cannot fix what you cannot see.',
  },
]

// Connection endpoints — (x1,y1) is the "from" side, (x2,y2) is the "to" side.
// axis: 'h' horizontal | 'v' vertical | 'd' diagonal
const EDGES = {
  'dev-cicd':       { x1: 140, y1: 65,  x2: 190, y2: 65 },
  'cicd-server':    { x1: 245, y1: 105, x2: 450, y2: 144 },
  'user-frontend':  { x1: 116, y1: 300, x2: 155, y2: 300 },
  'frontend-lb':    { x1: 265, y1: 300, x2: 350, y2: 233 },
  'lb-server':      { x1: 406, y1: 190, x2: 450, y2: 190 },
  'server-cache':   { x1: 570, y1: 162, x2: 600, y2: 155 },
  'server-db':      { x1: 570, y1: 218, x2: 625, y2: 245 },
  'server-monitor': { x1: 510, y1: 236, x2: 510, y2: 296 },
}

// The line stays blue; requests travel forward in blue, responses come back in green.
const DIR_MAP = {
  request:  { fwd: FLOW.blue, line: FLOW.blue },
  response: { bwd: FLOW.emerald, line: FLOW.blue },
  both:     { fwd: FLOW.blue, bwd: FLOW.emerald, line: FLOW.blue },
}

// ── Edge connection (SVG particles) ──────────────────────────────────────────

// ── Node block ────────────────────────────────────────────────────────────────

// ── Main component ────────────────────────────────────────────────────────────

export default function ApplicationArchitectureDiagram() {
  const steps  = useMemo(() => buildApplicationArchitectureSteps(), [])
  const runner = useTtsRunner(steps, (step) => `${step.message}. ${step.detail}`)
  const { step, index } = runner

  const { nodeState } = useDiagramNodes(steps, index)

  const showBanner = step.type === 'monitoring'

  return (
    <div className="space-y-4">

      {/* Header */}
      <DiagramHeader title="Application Architecture — End to End">
        From a developer pushing code to a user getting a response. Step through each layer to see how they interact.
      </DiagramHeader>

      {/* Diagram */}
      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIR_MAP} />
        </>}
        footer={<>
          {/* Monitoring / full-system banner */}
          <AnimatePresence>
            {showBanner && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0,  scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="relative mt-3 flex items-center gap-3 rounded-xl border border-rose-500/40 bg-rose-500/[0.07] px-4 py-3 overflow-hidden"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={`br-${i}`}
                    className="absolute inset-0 rounded-xl border border-rose-400/18 pointer-events-none"
                    initial={{ scale: 0.95, opacity: 0.65 }}
                    animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
                    transition={{ duration: 1.1, delay: i * 0.2, ease: 'easeOut' }}
                  />
                ))}
                <span className="text-xl relative z-10 select-none">📊</span>
                <div className="relative z-10">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Full System Active</p>
                  <p className="text-sm text-white">Every layer is visible — deploy pipeline, request path, data layer, and observability all live.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px bg-blue-500 rounded-full" style={{ boxShadow: '0 0 4px rgba(59,130,246,0.8)' }} />
              <span className="text-[10px] text-slate-500">request / deploy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-px bg-emerald-500 rounded-full" style={{ boxShadow: '0 0 4px rgba(16,185,129,0.8)' }} />
              <span className="text-[10px] text-slate-500">response / data</span>
            </div>
            <span className="text-[10px] text-slate-600 ml-auto hidden sm:inline">tap any component for details</span>
          </div>
        </>}
      >
        {/* Node blocks */}
        {NODES.map((node) => (
          <DiagramNode
            key={node.id}
            node={node}
            {...nodeState(node.id)}
          />
        ))}
      </DiagramCanvas>

      {/* Step message */}
      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
