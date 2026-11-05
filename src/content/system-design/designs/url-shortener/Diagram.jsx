import { useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildUrlShortenerSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'

// ── Node definitions ──────────────────────────────────────────────────────────

const NODE_META = {
  client:     { label: 'Client',          icon: '💻', desc: 'Browser or mobile app making the request.' },
  lb:         { label: 'API Gateway',     icon: '🔀',  desc: 'Authenticates, rate limits, and routes POST to shortening and GET to redirects.' },
  api:        { label: 'API Server',      icon: '⚙️',  desc: 'Validates requests, generates Base62 codes, orchestrates reads/writes.' },
  // The 'api' node is one physical tier playing two logical roles — labeled
  // differently per phase, since reads and writes scale independently.
  apiByPhase: {
    write: { label: 'Shortening Service', desc: 'Validates the URL, generates the code, writes the link.' },
    read:  { label: 'Redirect Service',   desc: 'Cache-first lookup, checks expiry and deletion, issues the redirect.' },
  },
  cache:      { label: 'Redis Cache',     icon: '⚡',  desc: 'In-memory key→value store. O(1) lookup, sub-millisecond reads.' },
  db:         { label: 'Database',        icon: '🗄️',  desc: 'Persistent store for all short_code → long_url mappings.' },
  kafka:      { label: 'Kafka',           icon: '📨', desc: 'Buffers click events, sent after the redirect — decoupled from user latency.' },
  analytics:  { label: 'Analytics Svc',   icon: '📊', desc: 'Consumes the Kafka stream asynchronously and tallies clicks.' },
  counters:   { label: 'Redis Counters',  icon: '⚡',  desc: 'INCR per short_code — real-time click counts for dashboards.' },
  clickhouse: { label: 'ClickHouse',      icon: '🗄️',  desc: 'Periodic flush target — durable store for historical, ad-hoc analytics queries.' },
}

// Vertical layout order for the main path: client → lb → api
// Then storage: cache and db side-by-side below api
const MAIN_PATH = ['client', 'lb', 'api']

// ── Branch layout (api fans out to cache / db / kafka, kafka fans further down) ─
// All coordinates are pixel positions inside a fixed-size SVG canvas so every
// line is guaranteed to start and end exactly at the node it connects to.

const BRANCH_W = 700
const BOX_W = 120
const BOX_H = 92

const JUNCTION_Y1   = 26
const TOP_ROW1      = 46
const BOTTOM_ROW1   = TOP_ROW1 + BOX_H
const TOP_ANALYTICS = BOTTOM_ROW1 + 48
const BOTTOM_ANALYTICS = TOP_ANALYTICS + BOX_H
const JUNCTION_Y2   = BOTTOM_ANALYTICS + 18
const TOP_ROW3       = JUNCTION_Y2 + 20
const BOTTOM_ROW3    = TOP_ROW3 + BOX_H
const BRANCH_H        = BOTTOM_ROW3 + 10

const CACHE_X = 140
const DB_X    = 350
const KAFKA_X = 560
const COUNTERS_X   = 490
const CLICKHOUSE_X = 630

// ── Vertical connector arrow ──────────────────────────────────────────────────

function VerticalArrow({ isActive, direction = 'down', stepKey, delayMs = 0 }) {
  const isDown = direction === 'down'
  return (
    <div className="relative flex flex-col items-center h-8 w-6 shrink-0">
      {/* Static line */}
      <div className={`w-px flex-1 transition-colors duration-300 ${isActive ? 'bg-blue-500' : 'bg-slate-700'}`} />

      {/* Arrow head */}
      <svg
        className={`shrink-0 ${isDown ? '' : 'rotate-180'}`}
        width="10" height="6" viewBox="0 0 10 6"
        fill={isActive ? '#2563eb' : '#334155'}
      >
        <polygon points="0,0 10,0 5,6" />
      </svg>

      {/* Traveling particle */}
      {isActive && (
        <motion.div
          key={`${stepKey}-vert-${delayMs}`}
          className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-blue-400 shadow-lg shadow-blue-400/70 pointer-events-none"
          style={{ top: isDown ? 0 : 'calc(100% - 10px)' }}
          animate={{ y: isDown ? [0, 28] : [0, -28] }}
          transition={{
            duration: 0.6,
            delay: delayMs / 1000,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        />
      )}
    </div>
  )
}

// ── Horizontal connector arrow ────────────────────────────────────────────────

function HorizArrow({ isActive, direction = 'right', stepKey }) {
  const isRight = direction === 'right'
  return (
    <div className="relative flex items-center w-10 h-6 shrink-0">
      <div className={`w-full h-px transition-colors duration-300 ${isActive ? 'bg-blue-500' : 'bg-slate-700'}`} />
      <svg
        className={`absolute ${isRight ? 'right-0' : 'left-0 rotate-180'}`}
        width="6" height="10" viewBox="0 0 6 10"
        fill={isActive ? '#2563eb' : '#334155'}
      >
        <polygon points="0,0 0,10 6,5" />
      </svg>

      {isActive && (
        <motion.div
          key={`${stepKey}-horiz`}
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-400 shadow-lg shadow-blue-400/70 pointer-events-none"
          style={{ left: 0 }}
          animate={{ x: isRight ? [0, 34] : [34, 0] }}
          transition={{
            duration: 0.6,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatDelay: 0.5,
          }}
        />
      )}
    </div>
  )
}

// ── Branch connector line (drawn inside the SVG canvas) ────────────────────────

function BranchLine({ x1, y1, x2, y2, isActive, withArrow = true, stepKey, delayMs = 0 }) {
  const isVertical = x1 === x2
  return (
    <g>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={isActive ? '#3b82f6' : '#334155'}
        strokeWidth={isActive ? 2 : 1}
        style={{ transition: 'stroke 0.3s' }}
      />
      {withArrow && (
        <polygon
          points={isVertical ? `${x2 - 5},${y2 - 6} ${x2 + 5},${y2 - 6} ${x2},${y2}` : `${x2 - 6},${y2 - 5} ${x2 - 6},${y2 + 5} ${x2},${y2}`}
          fill={isActive ? '#2563eb' : '#334155'}
        />
      )}
      {isActive && (
        <motion.circle
          key={`${stepKey}-branch-${x1}-${y1}-${x2}-${y2}`}
          r={3.5}
          fill="#60a5fa"
          style={{ filter: 'drop-shadow(0 0 5px rgba(96,165,250,0.85))' }}
          animate={{ cx: [x1, x2], cy: [y1, y2] }}
          transition={{ duration: 0.5, delay: delayMs / 1000, ease: 'linear', repeat: Infinity, repeatDelay: 0.4 }}
        />
      )}
    </g>
  )
}

// ── Branch node (absolutely positioned inside the SVG canvas's HTML overlay) ───

function BranchNode({ id, cx, top, isActive, shortCode }) {
  return (
    <div className="absolute" style={{ left: cx - BOX_W / 2, top, width: BOX_W }}>
      <NodeCard id={id} isActive={isActive} shortCode={shortCode} fullWidth />
    </div>
  )
}

// ── Node card ─────────────────────────────────────────────────────────────────

function NodeCard({ id, isActive, shortCode, fullWidth = false, phase }) {
  const phaseOverride = id === 'api' ? NODE_META.apiByPhase[phase === 'write' ? 'write' : 'read'] : null
  const meta = phaseOverride ? { ...NODE_META[id], ...phaseOverride } : NODE_META[id]
  const isStorage = id === 'cache' || id === 'db'

  return (
    <motion.div
      animate={{
        borderColor: isActive ? 'rgba(59,130,246,0.65)' : 'rgba(255,255,255,0.08)',
      }}
      transition={{ duration: 0.25 }}
      className="relative flex flex-col items-center gap-1.5 rounded-2xl border bg-slate-900 px-3 py-3 select-none"
      style={{
        boxShadow: isActive ? '0 0 22px -4px rgba(59,130,246,0.55)' : 'none',
        width: fullWidth ? '100%' : isStorage ? '5.5rem' : '7.5rem',
      }}
    >
      <span className="text-xl leading-none">{meta.icon}</span>
      <span className="text-[11px] font-medium text-slate-300 text-center leading-tight">{meta.label}</span>

      {/* Short code badge (appears when code is generated) */}
      <AnimatePresence>
        {shortCode && (id === 'db' || id === 'cache') && (
          <motion.span
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 22 }}
            className="text-[9px] font-mono text-blue-300 bg-blue-500/15 border border-blue-500/30 rounded px-1.5 py-0.5"
          >
            {shortCode}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <span className="text-[9px] text-slate-600 leading-tight text-center">{meta.desc}</span>

      {/* Active ring */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-blue-400/50 pointer-events-none"
          animate={{ scale: [1, 1.05, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        />
      )}
    </motion.div>
  )
}

// ── Phase badge ───────────────────────────────────────────────────────────────

const PHASE_META = {
  write:     { icon: '✏️', label: 'Write Flow — Shorten a URL',         classes: 'bg-amber-500/15 text-amber-300 border border-amber-500/30' },
  read:      { icon: '↗️', label: 'Read Flow — Follow the Short URL',   classes: 'bg-sky-500/15 text-sky-300 border border-sky-500/30' },
  analytics: { icon: '📊', label: 'Analytics Flow — Track the Click (Async)', classes: 'bg-violet-500/15 text-violet-300 border border-violet-500/30' },
}

function PhaseBadge({ phase }) {
  const meta = PHASE_META[phase]
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.2 }}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.classes}`}
      >
        <span>{meta.icon}</span>
        {meta.label}
      </motion.div>
    </AnimatePresence>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function UrlShortenerDiagram({ onStepChange }) {
  const steps  = useMemo(() => buildUrlShortenerSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  const active    = step.activeNodes
  const arrow     = step.activeArrow
  const shortCode = step.shortCode

  // Helper: is an arrow active between these two nodes?
  function arrowActive(from, to) {
    return arrow?.from === from && arrow?.to === to
  }
  // Arrow between api and client spans lb too (write-response / read-redirect)
  function clientApiArrow() {
    return arrowActive('api', 'client') || arrowActive('client', 'api')
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <p className="text-sm text-slate-400">
        Same architecture, now animated step by step — trace the write (shorten) and read (redirect) flows live.
      </p>

      {/* Phase badge */}
      <PhaseBadge phase={step.phase} />

      {/* Architecture diagram */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#070d1f] p-5 sm:p-6">
        <div className="flex w-fit min-w-full flex-col items-center gap-0">

          {/* Client */}
          <NodeCard id="client" isActive={active.includes('client')} shortCode={shortCode} />

          {/* client → lb */}
          <VerticalArrow
            isActive={arrowActive('client', 'lb') || arrowActive('lb', 'client') || clientApiArrow()}
            direction={arrowActive('lb', 'client') || (arrowActive('api', 'client') && step.phase === 'read') ? 'up' : 'down'}
            stepKey={index}
          />

          {/* API Gateway */}
          <NodeCard id="lb" isActive={active.includes('lb')} shortCode={shortCode} />

          {/* lb → api */}
          <VerticalArrow
            isActive={arrowActive('lb', 'api') || arrowActive('api', 'lb')}
            direction={arrowActive('api', 'lb') ? 'up' : 'down'}
            stepKey={index}
          />

          {/* API Server */}
          <NodeCard id="api" isActive={active.includes('api')} shortCode={shortCode} phase={step.phase} />

          {/* api fans out to cache / db / kafka; kafka fans further down to
              analytics → {counters, clickhouse}. Drawn on a fixed-size SVG
              canvas so every connector line starts and ends exactly at the
              node it links — nothing is left visually floating. */}
          <div className="relative" style={{ width: BRANCH_W, height: BRANCH_H }}>
            <svg className="absolute inset-0 pointer-events-none overflow-visible" viewBox={`0 0 ${BRANCH_W} ${BRANCH_H}`} width="100%" height={BRANCH_H}>
              {/* api → fan-out junction → cache / db / kafka */}
              <BranchLine x1={DB_X} y1={0} x2={DB_X} y2={JUNCTION_Y1} isActive={active.includes('api')} withArrow={false} stepKey={index} />
              <line x1={CACHE_X} y1={JUNCTION_Y1} x2={KAFKA_X} y2={JUNCTION_Y1} stroke="#334155" strokeWidth={1} />
              <BranchLine x1={CACHE_X} y1={JUNCTION_Y1} x2={CACHE_X} y2={TOP_ROW1} isActive={arrowActive('api', 'cache')} stepKey={index} />
              <BranchLine x1={DB_X}    y1={JUNCTION_Y1} x2={DB_X}    y2={TOP_ROW1} isActive={arrowActive('api', 'db')} stepKey={index} delayMs={80} />
              <BranchLine x1={KAFKA_X} y1={JUNCTION_Y1} x2={KAFKA_X} y2={TOP_ROW1} isActive={arrowActive('api', 'kafka')} stepKey={index} delayMs={160} />

              {/* kafka → analytics */}
              <BranchLine x1={KAFKA_X} y1={BOTTOM_ROW1} x2={KAFKA_X} y2={TOP_ANALYTICS} isActive={arrowActive('kafka', 'analytics')} stepKey={index} />

              {/* analytics → junction → counters / clickhouse */}
              <BranchLine x1={KAFKA_X} y1={BOTTOM_ANALYTICS} x2={KAFKA_X} y2={JUNCTION_Y2} isActive={active.includes('analytics')} withArrow={false} stepKey={index} />
              <line x1={COUNTERS_X} y1={JUNCTION_Y2} x2={CLICKHOUSE_X} y2={JUNCTION_Y2} stroke="#334155" strokeWidth={1} />
              <BranchLine x1={COUNTERS_X}   y1={JUNCTION_Y2} x2={COUNTERS_X}   y2={TOP_ROW3} isActive={arrowActive('analytics', 'counters')} stepKey={index} />
              <BranchLine x1={CLICKHOUSE_X} y1={JUNCTION_Y2} x2={CLICKHOUSE_X} y2={TOP_ROW3} isActive={arrowActive('analytics', 'clickhouse')} stepKey={index} delayMs={80} />
            </svg>

            <BranchNode id="cache"      cx={CACHE_X}      top={TOP_ROW1}      isActive={active.includes('cache')}      shortCode={shortCode} />
            <BranchNode id="db"         cx={DB_X}         top={TOP_ROW1}      isActive={active.includes('db')}         shortCode={shortCode} />
            <BranchNode id="kafka"      cx={KAFKA_X}      top={TOP_ROW1}      isActive={active.includes('kafka')}      shortCode={shortCode} />
            <BranchNode id="analytics"  cx={KAFKA_X}      top={TOP_ANALYTICS} isActive={active.includes('analytics')}  shortCode={shortCode} />
            <BranchNode id="counters"   cx={COUNTERS_X}   top={TOP_ROW3}      isActive={active.includes('counters')}   shortCode={shortCode} />
            <BranchNode id="clickhouse" cx={CLICKHOUSE_X} top={TOP_ROW3}      isActive={active.includes('clickhouse')} shortCode={shortCode} />
          </div>

        </div>

        {/* Short URL reveal */}
        <AnimatePresence>
          {shortCode && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="mt-5 flex items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/[0.07] px-4 py-2.5"
            >
              <span className="text-blue-400 text-lg">🎫</span>
              <div>
                <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">Short URL</p>
                <p className="text-sm font-mono text-white">
                  short.ly/<span className="text-blue-300 font-bold">{shortCode}</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step message + detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.message}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22 }}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 space-y-1.5"
        >
          <p className="text-sm font-semibold text-white">{step.message}</p>
          <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">{step.detail}</p>
        </motion.div>
      </AnimatePresence>

      <StepControls runner={runner} />
    </div>
  )
}
