import { useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildApiParadigmsSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

const CW = 620
const CH = 320

const NODES = [
  {
    id: 'client', label: 'Client', icon: '📱', dir: 'left',
    cx: 75, cy: 160, w: 106, h: 82,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'sends requests', sub2: 'any paradigm',
    desc: 'The API consumer — web app, mobile client, or another service. Each paradigm presents a different interface to this consumer.',
    note: 'Pick the paradigm that matches your consumer\'s needs: flexibility (GraphQL), performance (gRPC), or simplicity (REST).',
  },
  {
    id: 'rest', label: 'REST', icon: '📡', dir: 'top',
    cx: 340, cy: 68, w: 126, h: 80,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'HTTP + JSON', sub2: 'resource URLs',
    desc: 'REST uses HTTP verbs on resource URLs. GET /users/42 returns a JSON object. Simple, cacheable, supported by every HTTP client.',
    note: 'Downside: fixed response shapes cause over-fetching. A mobile app receiving 30 fields when it needs 3 wastes bandwidth and battery.',
  },
  {
    id: 'graphql', label: 'GraphQL', icon: '⬡', dir: 'top',
    cx: 340, cy: 165, w: 126, h: 80,
    color: '#e879f9', glow: 'rgba(232,121,249,0.65)', lc: '#f0abfc', strip: 'bg-fuchsia-500',
    sub1: 'POST /graphql', sub2: 'query language',
    desc: 'GraphQL exposes one endpoint. Clients send a query specifying exactly which fields to return, including nested relations in one round trip.',
    note: 'N+1 problem: fetching 100 users each with their orders fires 101 queries. Solved with DataLoader (batching + caching).',
  },
  {
    id: 'grpc', label: 'gRPC', icon: '⚡', dir: 'top',
    cx: 340, cy: 262, w: 126, h: 80,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'HTTP/2 + Protobuf', sub2: 'binary protocol',
    desc: 'gRPC uses Protocol Buffers over HTTP/2. Binary serialisation, strongly typed contracts, multiplexed streams, and server/client streaming.',
    note: 'gRPC contracts are .proto files — compile-time type checking across languages. Breaking changes are caught before deployment.',
  },
]

const EDGES = {
  'client-rest':    { x1: 128, y1: 130, x2: 277, y2: 80 },
  'client-graphql': { x1: 128, y1: 160, x2: 277, y2: 162 },
  'client-grpc':    { x1: 128, y1: 190, x2: 277, y2: 248 },
}

const DIR_MAP = {
  request:  { fwd: FLOW.violet,  bwd: null       },
  both:     { fwd: FLOW.violet,  bwd: FLOW.emerald  },
  response: { fwd: FLOW.emerald, bwd: null       },
}

const PARADIGM_LABELS = {
  rest:    { color: '#0ea5e9', label: 'REST' },
  graphql: { color: '#e879f9', label: 'GraphQL' },
  grpc:    { color: '#10b981', label: 'gRPC' },
}

export default function ApiParadigmsDiagram({ onStepChange }) {
  const steps  = useMemo(() => buildApiParadigmsSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  const { nodeState } = useDiagramNodes(steps, index)

  const activeParadigm = step.activeNodes.find((id) => id in PARADIGM_LABELS) ?? null

  return (
    <div className="space-y-4">

      <DiagramHeader title="API Paradigms — REST vs GraphQL vs gRPC">
        Compare the three dominant API styles. See when each paradigm wins and what trade-offs each introduces.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIR_MAP} />
        </>}
        footer={<>
          <AnimatePresence mode="wait">
            {activeParadigm && (
              <motion.div
                key={activeParadigm}
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                className="mt-3 flex items-center gap-3 rounded-xl border px-4 py-2.5"
                style={{
                  borderColor: `${PARADIGM_LABELS[activeParadigm].color}40`,
                  background:  `${PARADIGM_LABELS[activeParadigm].color}0e`,
                }}
              >
                <span style={{ color: PARADIGM_LABELS[activeParadigm].color }} className="select-none text-lg">◎</span>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: PARADIGM_LABELS[activeParadigm].color }}>
                  Active paradigm: {PARADIGM_LABELS[activeParadigm].label}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.sky.hex,     glow: FLOW.sky.glow,     label: 'REST (HTTP + JSON)' },
              { color: FLOW.fuchsia.hex, glow: FLOW.fuchsia.glow, label: 'GraphQL (query)' },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'gRPC (Protobuf)' },
            ].map(({ color, glow, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 4px ${glow}` }} />
                <span className="text-[10px] text-slate-500">{label}</span>
              </div>
            ))}
            <span className="text-[10px] text-slate-600 ml-auto hidden sm:inline">tap any node for details</span>
          </div>
        </>}
      >
        {NODES.map((node) => (
          <DiagramNode
            key={node.id}
            node={node}
            {...nodeState(node.id)}
          />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
