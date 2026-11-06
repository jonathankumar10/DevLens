import { useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildLoggingAndMonitoringSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

// ── Layout ────────────────────────────────────────────────────────────────────
// App Server (left) → Log Aggregator (top-center) → Alerting/Dashboard (right)
//                   → Metrics Collector (bottom-center) ↗

const CW = 620
const CH = 300

const NODES = [
  {
    id: 'app', label: 'App Server', icon: '🖥️', dir: 'left',
    cx: 90, cy: 150, w: 112, h: 82,
    color: '#3b82f6', glow: 'rgba(59,130,246,0.65)', lc: '#93c5fd', strip: 'bg-blue-500',
    sub1: 'emits logs + metrics', sub2: 'stdout / /metrics',
    desc: 'Your application emits two data streams: structured JSON logs to stdout, and numeric metrics on a /metrics HTTP endpoint.',
    note: 'Always include trace_id in log lines — it is the key that links logs to distributed traces.',
  },
  {
    id: 'aggregator', label: 'Fluentd', icon: '📦', dir: 'top',
    cx: 290, cy: 80, w: 120, h: 80,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'log aggregator', sub2: 'ELK / CloudWatch',
    desc: 'Fluentd (or Filebeat, Vector) tails stdout, buffers, and ships logs to Elasticsearch or CloudWatch. Never SSH into servers to read raw logs.',
    note: 'The pod may be dead when you need its logs. Centralized log storage is non-negotiable.',
  },
  {
    id: 'metrics', label: 'Prometheus', icon: '📈', dir: 'bottom',
    cx: 290, cy: 230, w: 120, h: 80,
    color: '#f59e0b', glow: 'rgba(245,158,11,0.65)', lc: '#fcd34d', strip: 'bg-amber-500',
    sub1: 'time-series DB', sub2: 'scrapes /metrics',
    desc: 'Prometheus polls each service /metrics endpoint every 15 seconds. Stores counters, gauges, and histograms as time-series. Supports PromQL for aggregation.',
    note: 'The Four Golden Signals: Latency, Traffic, Errors, Saturation. Instrument all four.',
  },
  {
    id: 'alerting', label: 'Grafana', icon: '🚨', dir: 'right',
    cx: 530, cy: 150, w: 112, h: 82,
    color: '#f43f5e', glow: 'rgba(244,63,94,0.65)', lc: '#fda4af', strip: 'bg-rose-500',
    sub1: 'dashboards + alerts', sub2: 'PagerDuty / Slack',
    desc: 'Grafana visualizes Prometheus metrics as time-series graphs. Alertmanager fires PagerDuty or Slack when a rule threshold is crossed.',
    note: 'Alert on symptoms (high error rate), not causes (high CPU). Good alerts are actionable and rare.',
  },
]

const EDGES = {
  'app-aggregator': { x1: 146, y1: 118, x2: 230, y2: 100 },
  'app-metrics':    { x1: 146, y1: 182, x2: 230, y2: 210 },
  'metrics-alerting':{ x1: 350, y1: 220, x2: 474, y2: 175 },
  'aggregator-alerting': { x1: 350, y1: 90, x2: 474, y2: 125 },
}

// direction → color
const DIR_C_MAP = {
  request:  FLOW.violet,
  response: FLOW.emerald,
  alert:    FLOW.red,
  metric:   FLOW.amber,
}

// ── Edge connection ───────────────────────────────────────────────────────────

// ── Node block ────────────────────────────────────────────────────────────────

// ── Main component ────────────────────────────────────────────────────────────

const FIRING = { text: 'FIRING', color: FLOW.red.hex, pulse: true }

export default function LoggingAndMonitoringDiagram({ onStepChange }) {
  const steps  = useMemo(() => buildLoggingAndMonitoringSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  useEffect(() => { onStepChange?.(step) }, [step, onStepChange])

  const { nodeState } = useDiagramNodes(steps, index)

  const isAlertFired = step.type === 'alert-fires'
  const isFullLoop   = step.type === 'correlation'

  return (
    <div className="space-y-4">

      <DiagramHeader title="Logging & Monitoring — Full Observability Stack">
        From app events to structured logs, metrics scraped by Prometheus, and alerts fired to Grafana.
      </DiagramHeader>

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} />
          {/* Path labels */}
          <text x={168} y={82} style={{ fill: '#8b5cf6', fontSize: 8, fontFamily: 'ui-monospace, monospace', fontWeight: 600, opacity: 0.7 }}>logs</text>
          <text x={162} y={215} style={{ fill: '#f59e0b', fontSize: 8, fontFamily: 'ui-monospace, monospace', fontWeight: 600, opacity: 0.7 }}>metrics</text>
        </>}
        footer={<>
          {/* Alert / full-loop banner */}
          <AnimatePresence mode="wait">
            {(isAlertFired || isFullLoop) && (
              <motion.div
                key={step.type}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="relative mt-3 flex items-center gap-4 rounded-xl border px-4 py-3 overflow-hidden"
                style={{
                  borderColor: isAlertFired ? 'rgba(244,63,94,0.4)' : 'rgba(139,92,246,0.4)',
                  background:  isAlertFired ? 'rgba(244,63,94,0.06)' : 'rgba(139,92,246,0.06)',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={`br-${step.type}-${i}`}
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ border: `1px solid ${isAlertFired ? 'rgba(244,63,94,0.2)' : 'rgba(139,92,246,0.2)'}` }}
                    initial={{ scale: 0.95, opacity: 0.7 }}
                    animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
                    transition={{ duration: 1.1, delay: i * 0.2, ease: 'easeOut' }}
                  />
                ))}
                <span className="text-xl relative z-10 select-none">{isAlertFired ? '🚨' : '🔁'}</span>
                <div className="relative z-10">
                  {isAlertFired ? (
                    <>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Alert Fired</p>
                      <p className="text-sm font-mono text-white">p99 latency <span className="text-rose-300 font-bold">&gt; 500 ms</span> for 5 min — PagerDuty notified</p>
                  </>
                  ) : (
                    <>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-violet-400">Full Observability Loop Active</p>
                      <p className="text-sm text-white">Metrics fire the alert → traces show the service → logs reveal the root cause</p>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,  glow: FLOW.violet.glow,  label: 'log / data flow'  },
              { color: FLOW.amber.hex,   glow: FLOW.amber.glow,   label: 'metrics scrape'   },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'query response'   },
              { color: FLOW.red.hex,    glow: FLOW.red.glow,    label: 'alert'            },
            ].map(({ color, glow, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-5 h-px rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 4px ${glow}` }} />
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
            tone={isAlertFired && node.id === 'alerting' ? FLOW.red.hex : null}
            badge={isAlertFired && node.id === 'alerting' ? FIRING : null}
          />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
