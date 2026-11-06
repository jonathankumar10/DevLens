import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { buildNotificationSystemSteps } from './steps'
import { useStepRunner } from '../../../../hooks/useStepRunner'
import StepControls from '../../../../components/ui/StepControls'
import StepBanner from '../../../../components/ui/StepBanner'
import { DiagramEdges } from '../../../../components/system-design/diagram/DiagramEdge'
import DiagramNode from '../../../../components/system-design/diagram/DiagramNode'
import { DiagramCanvas, DiagramHeader, StepNarration } from '../../../../components/system-design/diagram/DiagramParts'
import { useDiagramNodes } from '../../../../components/system-design/diagram/useDiagramNodes'
import { FLOW } from '../../../../components/system-design/diagram/colors'

// ── Layout ────────────────────────────────────────────────────────────────────
// Left:         apiServer (upstream service)
// Center-left:  notifSvc (Notification Service), prefStore (Preferences)
// Center:       mq (Message Queue / Kafka)
// Center-right: pushWorker, emailWorker, smsWorker (stacked)
// Right:        apns (APNs/FCM), sendgrid (SendGrid), twilio (Twilio) — stacked

const CW = 750
const CH = 380

const NODES = [
  {
    id: 'apiServer', label: 'API Server', icon: '⚙️', dir: 'left',
    cx: 62, cy: 160, w: 100, h: 72,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'OrderSvc etc.', sub2: 'event publisher',
    desc: 'Any upstream service that needs to notify a user. Calls the Notification Service API without knowing about delivery channels.',
    note: 'Decoupling callers from delivery details means adding a new channel (e.g. Slack) requires zero changes to callers.',
  },
  {
    id: 'notifSvc', label: 'Notif Service', icon: '📣', dir: 'top',
    cx: 210, cy: 130, w: 112, h: 74,
    color: '#6366f1', glow: 'rgba(99,102,241,0.65)', lc: '#a5b4fc', strip: 'bg-indigo-500',
    sub1: 'pref check', sub2: 'fan-out logic',
    desc: 'Central orchestrator. Validates, checks preferences, selects channels, and publishes to per-channel queues.',
    note: 'The Notification Service is stateless — all state lives in the preference store and queues.',
  },
  {
    id: 'prefStore', label: 'Pref Store', icon: '⚙️', dir: 'bottom',
    cx: 210, cy: 260, w: 112, h: 70,
    color: '#7c3aed', glow: 'rgba(124,58,237,0.65)', lc: '#c4b5fd', strip: 'bg-violet-700',
    sub1: 'Redis / Dynamo', sub2: 'opt-outs + tokens',
    desc: 'Stores per-user channel preferences, opt-outs, quiet hours, and device tokens. Cached in Redis for low-latency reads on every notification.',
    note: 'Device token hygiene: process APNs feedback and FCM canonical IDs to remove stale tokens immediately.',
  },
  {
    id: 'mq', label: 'Message Queue', icon: '📨', dir: 'top',
    cx: 370, cy: 160, w: 114, h: 74,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'Kafka / SQS', sub2: 'per-channel topics',
    desc: 'Separate queues per channel: push_queue, email_queue, sms_queue. Workers scale independently per channel. At-least-once delivery with idempotency keys prevents duplicate sends.',
    note: 'Priority queues: OTP/security alerts on a high-priority queue ahead of marketing blasts.',
  },
  {
    id: 'pushWorker', label: 'Push Worker', icon: '🔧', dir: 'top',
    cx: 535, cy: 105, w: 110, h: 68,
    color: '#a855f7', glow: 'rgba(168,85,247,0.65)', lc: '#d8b4fe', strip: 'bg-purple-500',
    sub1: 'iOS + Android', sub2: 'device tokens',
    desc: 'Dequeues push notifications, looks up device tokens, and calls APNs (iOS) or FCM (Android). Scales to thousands of workers.',
    note: 'Push is cheapest and fastest — no per-message cost, sub-second delivery when the device is online.',
  },
  {
    id: 'emailWorker', label: 'Email Worker', icon: '🔧', dir: 'top',
    cx: 535, cy: 200, w: 110, h: 68,
    color: '#06b6d4', glow: 'rgba(6,182,212,0.65)', lc: '#67e8f9', strip: 'bg-cyan-500',
    sub1: 'HTML templates', sub2: 'rate limited',
    desc: 'Renders HTML email templates and calls SendGrid or AWS SES. Higher volume but more latency tolerance than push.',
    note: 'Email deliverability depends on domain reputation, SPF/DKIM records, and bounce rate management.',
  },
  {
    id: 'smsWorker', label: 'SMS Worker', icon: '🔧', dir: 'bottom',
    cx: 535, cy: 295, w: 110, h: 68,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'OTP + alerts', sub2: 'expensive',
    desc: 'Calls Twilio for SMS delivery. Reserved for high-priority messages — OTP codes, fraud alerts. Rate-limited to avoid carrier blacklisting.',
    note: 'SMS costs ~$0.0075/message. Marketing SMS is expensive at scale; push is preferred for casual notifications.',
  },
  {
    id: 'apns', label: 'APNs / FCM', icon: '🍎', dir: 'right',
    cx: 682, cy: 105, w: 110, h: 68,
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.65)', lc: '#c4b5fd', strip: 'bg-violet-500',
    sub1: 'Apple / Google', sub2: 'device delivery',
    desc: 'Apple Push Notification service (iOS) and Firebase Cloud Messaging (Android). Handle the last-mile delivery to devices. Return delivery receipts and feedback for invalid tokens.',
    note: 'APNs feedback service returns a list of inactive tokens daily — process it to remove stale tokens from your store.',
  },
  {
    id: 'sendgrid', label: 'SendGrid', icon: '📧', dir: 'right',
    cx: 682, cy: 200, w: 110, h: 68,
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.65)', lc: '#7dd3fc', strip: 'bg-sky-500',
    sub1: 'SMTP + API', sub2: 'email delivery',
    desc: 'Managed email delivery provider. Handles SMTP relay, bounce processing, unsubscribe management, and delivery tracking via webhooks.',
    note: 'AWS SES is cheaper at high volume ($0.10/1000 emails vs SendGrid\'s tiered pricing) but requires more operational work.',
  },
  {
    id: 'twilio', label: 'Twilio', icon: '📱', dir: 'right',
    cx: 682, cy: 295, w: 110, h: 68,
    color: '#10b981', glow: 'rgba(16,185,129,0.65)', lc: '#6ee7b7', strip: 'bg-emerald-500',
    sub1: 'SMS / voice', sub2: 'global carriers',
    desc: 'SMS delivery via Twilio\'s carrier network. Provides delivery receipts, international routing, and number management.',
    note: 'Carrier filtering can block SMS that look like spam — use registered sender IDs and keep message content clean.',
  },
]

const EDGES = {
  'apiServer-notifSvc':    { x1: 112, y1: 155, x2: 154, y2: 143 },
  'notifSvc-prefStore':    { x1: 210, y1: 167, x2: 210, y2: 225 },
  'notifSvc-mq':           { x1: 266, y1: 158, x2: 313, y2: 161 },
  'mq-pushWorker':         { x1: 427, y1: 145, x2: 480, y2: 120 },
  'mq-emailWorker':        { x1: 427, y1: 165, x2: 480, y2: 200 },
  'mq-smsWorker':          { x1: 427, y1: 178, x2: 480, y2: 278 },
  'pushWorker-apns':       { x1: 590, y1: 112, x2: 627, y2: 112 },
  'emailWorker-sendgrid':  { x1: 590, y1: 202, x2: 627, y2: 202 },
  'smsWorker-twilio':      { x1: 590, y1: 295, x2: 627, y2: 295 },
  'apns-pushWorker':       { x1: 627, y1: 120, x2: 590, y2: 120 },
  'pushWorker-notifSvc':   { x1: 480, y1: 108, x2: 266, y2: 138 },
  'pushWorker-mq':         { x1: 480, y1: 120, x2: 427, y2: 152 },
}

const DIR_MAP = {
  request:  { fwd: FLOW.violet,  bwd: null },
  response: { fwd: FLOW.emerald, bwd: null },
  both:     { fwd: FLOW.violet,  bwd: FLOW.emerald },
  dispatch: { fwd: FLOW.sky, bwd: null },
  retry:    { fwd: FLOW.amber,    bwd: null },
}

// ── Edge connection ───────────────────────────────────────────────────────────

// ── Node block ────────────────────────────────────────────────────────────────

// ── Channel badge ─────────────────────────────────────────────────────────────

function ChannelBadge({ type }) {
  const channelMap = {
    'push-dispatch':  { label: '📱 Push — APNs / FCM', bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' },
    'email-dispatch': { label: '📧 Email — SendGrid / SES', bg: 'bg-sky-500/15', text: 'text-sky-300', border: 'border-sky-500/30' },
    'sms-dispatch':   { label: '💬 SMS — Twilio', bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  }
  const c = channelMap[type]
  if (!c) return null
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={type}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}
      >
        {c.label}
      </motion.div>
    </AnimatePresence>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function NotificationSystemDiagram() {
  const steps  = useMemo(() => buildNotificationSystemSteps(), [])
  const runner = useStepRunner(steps)
  const { step, index } = runner

  const { nodeState } = useDiagramNodes(steps, index)


  return (
    <div className="space-y-4">

      <DiagramHeader title="Notification System Architecture">
        Trace how a single event fans out across push, email, and SMS — with preferences, retries, and deduplication.
      </DiagramHeader>

      <ChannelBadge type={step.type} />

      <DiagramCanvas
        width={CW}
        height={CH}
        svg={<>
          <DiagramEdges edges={EDGES} connections={step.connections} stepKey={index} directions={DIR_MAP} />
          <text x={12}  y={20} style={{ fill: '#4c1d95', fontSize: 8, fontFamily: 'monospace', fontWeight: 700, opacity: 0.7 }}>UPSTREAM</text>
          <text x={156} y={20} style={{ fill: '#312e81', fontSize: 8, fontFamily: 'monospace', fontWeight: 700, opacity: 0.7 }}>NOTIF SERVICE</text>
          <text x={326} y={20} style={{ fill: '#0c4a6e', fontSize: 8, fontFamily: 'monospace', fontWeight: 700, opacity: 0.7 }}>QUEUES</text>
          <text x={468} y={20} style={{ fill: '#4a044e', fontSize: 8, fontFamily: 'monospace', fontWeight: 700, opacity: 0.7 }}>WORKERS</text>
          <text x={624} y={20} style={{ fill: '#064e3b', fontSize: 8, fontFamily: 'monospace', fontWeight: 700, opacity: 0.7 }}>PROVIDERS</text>
        </>}
        footer={<>
          <StepBanner banner={step.banner} />

          <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
            {[
              { color: FLOW.violet.hex,  glow: FLOW.violet.glow,  label: 'request / trigger' },
              { color: FLOW.emerald.hex, glow: FLOW.emerald.glow, label: 'receipt / response' },
              { color: FLOW.sky.hex, glow: FLOW.sky.glow, label: 'queue / dispatch' },
              { color: FLOW.amber.hex,    glow: FLOW.amber.glow,    label: 'retry / backoff' },
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
          />
        ))}
      </DiagramCanvas>

      <StepNarration step={step} />

      <StepControls runner={runner} />
    </div>
  )
}
