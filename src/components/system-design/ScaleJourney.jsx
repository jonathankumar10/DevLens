import { useEffect, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTtsRunner } from '../../hooks/useTtsRunner'
import StepControls from '../ui/StepControls'
import { SYSTEM_DESIGN } from '../../constants/systemDesignRegistry'
import { ROADMAP_STAGES, JOURNEY_STEPS } from '../../constants/systemDesignRoadmap'

// ── Diagram layout ────────────────────────────────────────────────────────────
// Fixed positions; nodes appear as the journey's steps add them.

const NODE_W = 96
const NODE_H = 34

const NODES = {
  dns:     { x: 50,  y: 60,  label: 'DNS' },
  client:  { x: 50,  y: 170, label: 'Users' },
  monitor: { x: 50,  y: 290, label: 'Metrics & logs' },
  cdn:     { x: 165, y: 60,  label: 'CDN' },
  lb:      { x: 165, y: 170, label: 'Load balancer' },
  ws:      { x: 165, y: 280, label: 'WS gateway' },
  app2:    { x: 290, y: 125, label: 'App server', service: 'Orders svc' },
  app:     { x: 290, y: 170, label: 'App server', service: 'Users svc' },
  app3:    { x: 290, y: 215, label: 'App server', service: 'Feed svc' },
  queue:   { x: 290, y: 295, label: 'Queue' },
  cache:   { x: 410, y: 60,  label: 'Cache' },
  db:      { x: 410, y: 170, label: 'Primary DB' },
  replica: { x: 410, y: 250, label: 'Read replicas' },
  workers: { x: 410, y: 315, label: 'Workers' },
  obj:     { x: 530, y: 60,  label: 'Object store' },
  shards:  { x: 530, y: 170, label: 'Shards' },
  seq:     { x: 530, y: 240, label: 'ID generator' },
}

// [from, to, options] — hiddenBy: edge disappears once that node exists.
const EDGES = [
  ['client', 'dns'],
  ['client', 'cdn'],
  ['client', 'app', { hiddenBy: 'lb' }],
  ['client', 'lb'],
  ['client', 'ws'],
  ['lb', 'app'], ['lb', 'app2'], ['lb', 'app3'],
  ['ws', 'app3'],
  ['app', 'cache'],
  ['app', 'db'],
  ['app', 'obj'],
  ['app', 'seq'],
  ['app', 'queue'],
  ['app', 'monitor', { dashed: true }],
  ['db', 'replica'],
  ['db', 'shards'],
  ['queue', 'workers'],
]

const TITLE_BY_ID = Object.fromEntries(SYSTEM_DESIGN.map((item) => [item.id, item.title]))

const STAGE_START = ROADMAP_STAGES.map((stage) => JOURNEY_STEPS.findIndex((s) => s.stage.id === stage.id))

function narration(step) {
  const fixes = step.concepts.map((c) => TITLE_BY_ID[c.id]).join(', ')
  return `${step.title}. ${step.bottleneck} The fix: ${fixes}. The trade-off: ${step.tradeoff}`
}

function meterColor(value) {
  if (value >= 85) return '#f43f5e'
  if (value >= 60) return '#f59e0b'
  return '#10b981'
}

// ── Diagram ───────────────────────────────────────────────────────────────────

function JourneyDiagram({ visible, flags, added, hot, hex }) {
  const isVisible = (id) => visible.has(id)
  return (
    <svg viewBox="0 0 580 340" className="w-full h-auto" role="img" aria-label="Architecture at this step of the journey">
      {/* Edges */}
      {EDGES.map(([from, to, opts = {}]) => {
        if (!isVisible(from) || !isVisible(to)) return null
        if (opts.hiddenBy && isVisible(opts.hiddenBy)) return null
        const a = NODES[from]
        const b = NODES[to]
        const live = hot && (from === hot || to === hot)
        return (
          <g key={`${from}-${to}`}>
            <motion.line
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={live ? '#f43f5e' : '#475569'}
              strokeWidth={live ? 1.6 : 1}
              strokeDasharray={opts.dashed ? '4 4' : undefined}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: live ? 0.9 : 0.5 }}
              transition={{ duration: 0.5 }}
            />
            {live && (
              <motion.circle
                r="3"
                fill="#fb7185"
                initial={{ cx: a.x, cy: a.y }}
                animate={{ cx: [a.x, b.x], cy: [a.y, b.y] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              />
            )}
          </g>
        )
      })}

      {/* Nodes */}
      {Object.entries(NODES).map(([id, node]) => {
        if (!isVisible(id)) return null
        const isHot = id === hot
        const isNew = added.has(id)
        const label = flags.has('services') && node.service ? node.service : node.label
        const stroke = isHot ? '#f43f5e' : isNew ? hex : '#64748b'
        return (
          <motion.g
            key={id}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{ transformOrigin: `${node.x}px ${node.y}px`, transformBox: 'view-box' }}
          >
            {isHot && (
              <motion.rect
                x={node.x - NODE_W / 2 - 4} y={node.y - NODE_H / 2 - 4}
                width={NODE_W + 8} height={NODE_H + 8} rx="10"
                fill="none" stroke="#f43f5e" strokeWidth="1.5"
                animate={{ opacity: [0.15, 0.7, 0.15] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
            <rect
              x={node.x - NODE_W / 2} y={node.y - NODE_H / 2}
              width={NODE_W} height={NODE_H} rx="7"
              fill="#0f172a" stroke={stroke} strokeWidth={isHot || isNew ? 1.6 : 1}
            />
            <rect
              x={node.x - NODE_W / 2} y={node.y - NODE_H / 2}
              width={NODE_W} height={NODE_H} rx="7"
              fill={isHot ? '#f43f5e' : isNew ? hex : '#94a3b8'} fillOpacity={isHot || isNew ? 0.14 : 0.04}
            />
            <text
              x={node.x} y={node.y + 4}
              textAnchor="middle"
              className="select-none"
              fontSize="11" fontWeight="600"
              fill={isHot ? '#fda4af' : isNew ? '#f1f5f9' : '#cbd5e1'}
            >
              {label}
            </text>
          </motion.g>
        )
      })}
    </svg>
  )
}

// ── Side panel ────────────────────────────────────────────────────────────────

function StepPanel({ step }) {
  const { stage } = step
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.id}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.25 }}
        className="space-y-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[10px] rounded-full px-2 py-0.5 font-semibold ${stage.badge}`}>
            {step.stageIndex + 1}. {stage.label}
          </span>
          <span className="text-[10px] rounded-full px-2 py-0.5 font-medium bg-white/5 text-slate-400 border border-white/10">
            {step.traffic}
          </span>
        </div>

        <h3 className="text-base font-semibold text-white">{step.title}</h3>

        <div className="rounded-lg border border-rose-500/25 bg-rose-500/[0.06] px-3.5 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-400 mb-1">Bottleneck</p>
          <p className="text-sm text-slate-300 leading-relaxed">{step.bottleneck}</p>
        </div>

        {step.metric && (
          <div>
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>{step.metric.label}</span>
              <span className="tabular-nums">{step.metric.value}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${step.metric.value}%` }}
                transition={{ duration: 0.6 }}
                style={{ background: meterColor(step.metric.value) }}
              />
            </div>
          </div>
        )}

        <div>
          <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${stage.text}`}>
            The fix
          </p>
          <div className="space-y-1.5">
            {step.concepts.map((c) => (
              <Link
                key={c.id}
                to={`/system-design/${c.id}`}
                className="group block rounded-lg border px-3 py-2 transition-colors hover:bg-white/[0.04]"
                style={{ borderColor: `${stage.hex}40` }}
              >
                <span className="flex items-center justify-between text-sm font-medium text-slate-200 group-hover:text-white">
                  {TITLE_BY_ID[c.id]}
                  <span className="text-slate-600 group-hover:text-slate-400">→</span>
                </span>
                <span className="block text-[11px] text-slate-500 leading-relaxed mt-0.5">{c.why}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.05] px-3.5 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 mb-1">Trade-off it introduces</p>
          <p className="text-sm text-slate-300 leading-relaxed">{step.tradeoff}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Journey ───────────────────────────────────────────────────────────────────

export default function ScaleJourney() {
  const runner = useTtsRunner(JOURNEY_STEPS, narration)
  const { index, step, setIndex, setSpeed, stop } = runner
  const [params] = useSearchParams()
  const rootRef = useRef(null)

  // Steps are dense — default to a slower autoplay pace.
  useEffect(() => { setSpeed(0.25) }, [setSpeed])

  // Deep-link from concept pages: /system-design?step=N
  useEffect(() => {
    const raw = params.get('step')
    if (raw === null) return
    const n = Number(raw)
    if (Number.isInteger(n) && n >= 0 && n < JOURNEY_STEPS.length) {
      setIndex(n)
      rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [params, setIndex])

  const { visible, flags } = useMemo(() => {
    const v = new Set()
    const f = new Set()
    JOURNEY_STEPS.slice(0, index + 1).forEach((s) => {
      s.adds.forEach((id) => v.add(id))
      s.flags?.forEach((id) => f.add(id))
    })
    return { visible: v, flags: f }
  }, [index])

  const added = useMemo(() => new Set(step.adds), [step])

  return (
    <div
      ref={rootRef}
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 space-y-4 scroll-mt-20"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">The Scale Journey</h2>
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-[10px] text-slate-500">1 user → 10M users · {JOURNEY_STEPS.length} bottlenecks</span>
      </div>
      <p className="text-[12px] text-slate-500 leading-relaxed max-w-2xl">
        Watch one system grow. Each step, something saturates — and the concept that relieves it appears,
        along with the trade-off it brings. Click any fix to deep-dive.
      </p>

      {/* Stage strip */}
      <div className="flex flex-wrap gap-1.5">
        {ROADMAP_STAGES.map((stage, i) => {
          const active = step.stage.id === stage.id
          return (
            <button
              key={stage.id}
              onClick={() => { stop(); setIndex(STAGE_START[i]) }}
              className="rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors"
              style={{
                borderColor: active ? stage.hex : `${stage.hex}33`,
                background:  active ? `${stage.hex}22` : 'transparent',
                color:       active ? '#f8fafc' : '#94a3b8',
              }}
            >
              <span className="font-mono opacity-60 mr-1">{i + 1}</span>{stage.label}
            </button>
          )
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-xl border border-white/[0.06] bg-black/20 p-2 sm:p-3 self-start">
          <JourneyDiagram
            visible={visible}
            flags={flags}
            added={added}
            hot={step.hot}
            hex={step.stage.hex}
          />
        </div>
        <div className="lg:col-span-2">
          <StepPanel step={step} />
        </div>
      </div>

      <StepControls runner={runner} />
    </div>
  )
}
