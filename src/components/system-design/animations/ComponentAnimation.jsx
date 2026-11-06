import { Fragment, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Component animations ──────────────────────────────────────────────────────

function DiskAnimation({ color }) {
  return (
    <div className="flex items-center justify-center py-3 bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3">
      <svg viewBox="0 0 80 80" width="80" height="80">
        <circle cx="40" cy="40" r="34" fill="#060e20" />
        <motion.g
          style={{ transformOrigin: '40px 40px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        >
          {[30, 23, 16].map((r) => (
            <circle key={r} cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="0.5" opacity="0.18" />
          ))}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <line key={deg}
              x1="40" y1="40"
              x2={40 + 32 * Math.cos((deg * Math.PI) / 180)}
              y2={40 + 32 * Math.sin((deg * Math.PI) / 180)}
              stroke={color} strokeWidth="0.4" opacity="0.1"
            />
          ))}
        </motion.g>
        <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="0.8" opacity="0.25" />
        <motion.g
          style={{ transformOrigin: '40px 40px' }}
          animate={{ rotate: [-40, 40, -40] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.15 }}
        >
          <line x1="40" y1="40" x2="40" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
          <circle cx="40" cy="9" r="4" fill={color} opacity="0.9" style={{ filter: `drop-shadow(0 0 5px ${color})` }} />
          <circle cx="40" cy="9" r="1.5" fill="#060e20" />
        </motion.g>
        <circle cx="40" cy="40" r="5.5" fill={color} opacity="0.55" />
        <circle cx="40" cy="40" r="2.5" fill="#060e20" />
      </svg>
    </div>
  )
}

function RamAnimation({ color }) {
  const ROWS = 3
  const COLS = 4
  const cells = ROWS * COLS
  return (
    <div className="flex items-center justify-center py-4 bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3">
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {Array.from({ length: cells }).map((_, i) => (
          <motion.div
            key={i}
            className="w-7 h-4 rounded"
            style={{ border: `1px solid ${color}22` }}
            animate={{
              backgroundColor: [`${color}00`, `${color}55`, `${color}15`, `${color}00`],
              borderColor:     [`${color}22`, `${color}88`, `${color}44`, `${color}22`],
              boxShadow:       [`0 0 0 0 ${color}00`, `0 0 6px 1px ${color}55`, `0 0 3px 0 ${color}22`, `0 0 0 0 ${color}00`],
            }}
            transition={{
              duration: 1.8,
              delay: i * 0.11,
              repeat: Infinity,
              repeatDelay: 0.6,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function CpuAnimation({ color }) {
  const [active, setActive] = useState(0)
  const stages = [
    { label: 'F', name: 'Fetch' },
    { label: 'D', name: 'Decode' },
    { label: 'E', name: 'Execute' },
    { label: 'W', name: 'Write' },
  ]

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % stages.length), 520)
    return () => clearInterval(id)
  }, [stages.length])

  return (
    <div className="bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3 px-3 py-4 space-y-3">
      <div className="flex items-center justify-between gap-1">
        {stages.map((s, i) => (
          <Fragment key={s.label}>
            <motion.div
              className="flex-1 h-9 rounded-lg border flex flex-col items-center justify-center gap-0.5"
              animate={{
                borderColor:     active === i ? color : '#1e293b',
                backgroundColor: active === i ? `${color}20` : 'transparent',
                boxShadow:       active === i ? `0 0 12px -2px ${color}` : 'none',
              }}
              transition={{ duration: 0.18 }}
            >
              <motion.span
                animate={{ color: active === i ? color : '#334155' }}
                transition={{ duration: 0.18 }}
                className="text-[11px] font-black leading-none"
              >
                {s.label}
              </motion.span>
            </motion.div>
            {i < stages.length - 1 && (
              <motion.div
                className="w-3 h-px rounded-full shrink-0"
                animate={{ backgroundColor: active > i ? color : '#1e293b' }}
                transition={{ duration: 0.18 }}
              />
            )}
          </Fragment>
        ))}
      </div>
      <motion.p
        key={active}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="text-center text-[10px] font-semibold"
        style={{ color }}
      >
        {stages[active].name}
      </motion.p>
    </div>
  )
}

function CacheAnimation({ color }) {
  return (
    <div className="bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3 px-4 py-3 space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color }}>Cache HIT</span>
          <span className="text-[9px] font-mono" style={{ color }}>~1–4 ns ⚡</span>
        </div>
        <div className="relative h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: `${color}12` }}>
          <motion.div
            className="absolute top-0 left-0 h-full w-4 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px 2px ${color}80` }}
            animate={{ x: ['-16px', '200%'] }}
            transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2, ease: 'easeIn' }}
          />
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-wide text-cyan-500">Cache MISS → RAM</span>
          <span className="text-[9px] font-mono text-cyan-500">~60 ns</span>
        </div>
        <div className="relative h-2.5 rounded-full overflow-hidden bg-cyan-500/10">
          <motion.div
            className="absolute top-0 left-0 h-full w-4 rounded-full bg-cyan-500"
            style={{ boxShadow: '0 0 8px 2px rgba(6,182,212,0.6)' }}
            animate={{ x: ['-16px', '200%'] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.5, ease: 'linear' }}
          />
        </div>
      </div>
    </div>
  )
}

function PacketAnimation({ color }) {
  const fields = ['SRC IP', 'DST IP', 'TTL', 'PORT']
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % fields.length), 600)
    return () => clearInterval(id)
  }, [fields.length])

  return (
    <div className="bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3 px-4 py-4">
      <div className="rounded-lg border border-white/10 overflow-hidden">
        {fields.map((f, i) => (
          <motion.div
            key={f}
            className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.04] last:border-0"
            animate={{ backgroundColor: active === i ? `${color}18` : 'transparent' }}
            transition={{ duration: 0.2 }}
          >
            <motion.span
              animate={{ color: active === i ? color : '#475569' }}
              className="text-[9px] font-mono font-semibold uppercase tracking-wide"
            >
              {f}
            </motion.span>
            <motion.span
              animate={{ opacity: active === i ? 1 : 0.3 }}
              className="text-[9px] font-mono"
              style={{ color }}
            >
              {active === i ? '● ● ●' : '· · ·'}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function RouterAnimation({ color }) {
  const rows = ['10.0.0.0/24', '172.16.0.0/16', '0.0.0.0/0']
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % rows.length), 550)
    return () => clearInterval(id)
  }, [rows.length])

  return (
    <div className="bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3 px-4 py-4 space-y-1.5">
      {rows.map((prefix, i) => (
        <motion.div
          key={prefix}
          className="h-6 rounded-md border flex items-center justify-between px-2.5"
          animate={{
            borderColor:     active === i ? color : '#1e293b',
            backgroundColor: active === i ? `${color}15` : 'transparent',
            boxShadow:       active === i ? `0 0 8px -1px ${color}` : 'none',
          }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-[9px] font-mono text-slate-500">{prefix}</span>
          {active === i && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[8px] font-bold uppercase tracking-wide"
              style={{ color }}
            >
              match
            </motion.span>
          )}
        </motion.div>
      ))}
    </div>
  )
}

function TtlAnimation({ color }) {
  const START = 64
  const STEP  = 21
  const [ttl, setTtl] = useState(START)

  useEffect(() => {
    const id = setInterval(() => setTtl((t) => (t <= STEP ? START : t - STEP)), 550)
    return () => clearInterval(id)
  }, [])

  const circumference = 176
  const pct = ttl / START

  return (
    <div className="flex items-center justify-center py-4 bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3">
      <svg width="72" height="72" viewBox="0 0 70 70">
        <circle cx="35" cy="35" r="28" fill="none" stroke="#1e293b" strokeWidth="5" />
        <motion.circle
          cx="35" cy="35" r="28" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          style={{ rotate: -90, transformOrigin: '35px 35px' }}
          animate={{ strokeDasharray: `${pct * circumference} ${circumference}` }}
          transition={{ duration: 0.4 }}
        />
        <text x="35" y="40" textAnchor="middle" fontSize="16" fontWeight="bold" fill={color} fontFamily="monospace">
          {ttl}
        </text>
      </svg>
    </div>
  )
}

function PortAnimation({ color }) {
  const ports = [
    { num: 22,   label: 'SSH' },
    { num: 80,   label: 'HTTP' },
    { num: 443,  label: 'HTTPS' },
    { num: 5432, label: 'DB' },
  ]
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % ports.length), 600)
    return () => clearInterval(id)
  }, [ports.length])

  return (
    <div className="bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3 px-4 py-4 grid grid-cols-2 gap-2">
      {ports.map((p, i) => (
        <motion.div
          key={p.num}
          className="rounded-lg border px-2.5 py-1.5 flex items-center justify-between"
          animate={{
            borderColor:     active === i ? color : '#1e293b',
            backgroundColor: active === i ? `${color}15` : 'transparent',
            boxShadow:       active === i ? `0 0 8px -1px ${color}` : 'none',
          }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-[9px] font-mono" style={{ color: active === i ? color : '#64748b' }}>:{p.num}</span>
          <span className="text-[8px] text-slate-600">{p.label}</span>
        </motion.div>
      ))}
    </div>
  )
}

function HandshakeAnimation({ color }) {
  const stages = [
    { label: 'SYN',      dir: 'right' },
    { label: 'SYN-ACK',  dir: 'left'  },
    { label: 'ACK',      dir: 'right' },
  ]
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % stages.length), 700)
    return () => clearInterval(id)
  }, [stages.length])

  const stage = stages[active]
  const isRight = stage.dir === 'right'

  return (
    <div className="bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3 px-4 py-5 flex items-center gap-2">
      <span className="text-[9px] font-mono text-slate-500 shrink-0">Client</span>
      <div className="relative flex-1 h-px" style={{ backgroundColor: `${color}30` }}>
        <motion.span
          key={`${active}-${stage.label}`}
          className="absolute top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold whitespace-nowrap"
          style={{ background: color, color: '#020617' }}
          initial={{ left: isRight ? '0%' : '100%', x: isRight ? '0%' : '-100%', opacity: 0 }}
          animate={{ left: isRight ? '100%' : '0%', x: isRight ? '-100%' : '0%', opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {stage.label}
        </motion.span>
      </div>
      <span className="text-[9px] font-mono text-slate-500 shrink-0">Server</span>
    </div>
  )
}

function GitAnimation({ color }) {
  return (
    <div className="bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3 px-4 py-5 flex items-center gap-3">
      <div className="flex-1 relative h-1 rounded-full" style={{ backgroundColor: `${color}20` }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px 2px ${color}80` }}
            animate={{ left: ['0%', '100%'] }}
            transition={{ duration: 1.4, delay: i * 0.5, repeat: Infinity, ease: 'easeIn', repeatDelay: 0.4 }}
          />
        ))}
      </div>
      <div className="rounded-md border px-2 py-1 shrink-0" style={{ borderColor: `${color}40` }}>
        <span className="text-[9px] font-mono" style={{ color }}>main</span>
      </div>
    </div>
  )
}

function PipelineAnimation({ color }) {
  const stages = ['Build', 'Test', 'Deploy']
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % (stages.length + 1)), 500)
    return () => clearInterval(id)
  }, [stages.length])

  return (
    <div className="bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3 px-3 py-4">
      <div className="flex items-center gap-1">
        {stages.map((s, i) => (
          <Fragment key={s}>
            <motion.div
              className="flex-1 h-8 rounded-lg border flex items-center justify-center"
              animate={{
                borderColor:     active >= i ? color : '#1e293b',
                backgroundColor: active > i ? `${color}25` : active === i ? `${color}15` : 'transparent',
              }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-[9px] font-semibold" style={{ color: active >= i ? color : '#334155' }}>
                {active > i ? '✓' : s}
              </span>
            </motion.div>
            {i < stages.length - 1 && <div className="w-2 h-px bg-slate-700 shrink-0" />}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

function CdnAnimation({ color }) {
  return (
    <div className="flex items-center justify-center gap-3 py-4 bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3">
      <div className="flex flex-col items-center gap-1">
        <span className="text-lg leading-none">🌍</span>
        <span className="text-[8px] text-slate-600">Edge</span>
      </div>
      <div className="relative w-14 h-px" style={{ backgroundColor: `${color}30` }}>
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px 2px ${color}80` }}
          animate={{ left: ['0%', '100%'] }}
          transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0.5, ease: 'easeOut' }}
        />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-lg leading-none">🖥️</span>
        <span className="text-[8px] text-slate-600">Browser</span>
      </div>
    </div>
  )
}

function LoadBalancerAnimation({ color }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % 3), 500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3 px-4 py-4 flex items-center justify-center gap-3">
      <div className="rounded-md border px-2 py-1.5 shrink-0" style={{ borderColor: `${color}50` }}>
        <span className="text-[9px] font-mono" style={{ color }}>LB</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-10 h-4 rounded border flex items-center justify-center"
            animate={{
              borderColor:     active === i ? color : '#1e293b',
              backgroundColor: active === i ? `${color}20` : 'transparent',
              boxShadow:       active === i ? `0 0 8px -1px ${color}` : 'none',
            }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-[7px] font-mono" style={{ color: active === i ? color : '#334155' }}>srv{i + 1}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ServerPulseAnimation({ color }) {
  return (
    <div className="flex items-center justify-center gap-3 py-5 bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3">
      <span className="text-[9px] font-mono text-slate-500">req</span>
      <motion.div
        className="w-10 h-10 rounded-xl border-2 flex items-center justify-center text-lg"
        style={{ borderColor: color }}
        animate={{ boxShadow: [`0 0 0px 0px ${color}00`, `0 0 16px 4px ${color}55`, `0 0 0px 0px ${color}00`] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        ⚙️
      </motion.div>
      <span className="text-[9px] font-mono text-slate-500">res</span>
    </div>
  )
}

function DatabaseAnimation({ color }) {
  return (
    <div className="bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3 px-4 py-3 space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color }}>Write</span>
          <span className="text-[9px] font-mono" style={{ color }}>committed</span>
        </div>
        <div className="relative h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: `${color}12` }}>
          <motion.div
            className="absolute top-0 left-0 h-full w-4 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px 2px ${color}80` }}
            animate={{ x: ['-16px', '200%'] }}
            transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.6, ease: 'easeInOut' }}
          />
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Read</span>
          <span className="text-[9px] font-mono text-slate-500">served</span>
        </div>
        <div className="relative h-2.5 rounded-full overflow-hidden bg-white/5">
          <motion.div
            className="absolute top-0 left-0 h-full w-4 rounded-full bg-slate-400"
            style={{ boxShadow: '0 0 8px 2px rgba(148,163,184,0.5)' }}
            animate={{ x: ['-16px', '200%'] }}
            transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 0.4, ease: 'easeIn' }}
          />
        </div>
      </div>
    </div>
  )
}

function MonitorAnimation({ color }) {
  const lines = ['200 OK   /api/users   12 ms', '200 OK   /api/orders  34 ms', '500 ERR  /api/pay     890 ms']
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % lines.length), 700)
    return () => clearInterval(id)
  }, [lines.length])

  return (
    <div className="bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3 px-4 py-3 space-y-1.5">
      {lines.map((l, i) => (
        <motion.p
          key={l}
          animate={{
            opacity: active === i ? 1 : 0.3,
            color:   active === i ? (l.includes('500') ? '#f43f5e' : color) : '#334155',
          }}
          transition={{ duration: 0.25 }}
          className="text-[9px] font-mono truncate"
        >
          {l}
        </motion.p>
      ))}
    </div>
  )
}

function ThroughputAnimation({ color }) {
  const bars = [0, 1, 2, 3, 4]
  return (
    <div className="flex items-end justify-center gap-1.5 h-16 py-3 bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3">
      {bars.map((i) => (
        <motion.div
          key={i}
          className="w-3 rounded-t"
          style={{ background: color, boxShadow: `0 0 6px -1px ${color}` }}
          animate={{ height: [`${18 + (i % 3) * 8}px`, `${36 + (i % 3) * 10}px`, `${18 + (i % 3) * 8}px`] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function CongestionAnimation({ color }) {
  return (
    <div className="flex items-end justify-center h-16 py-3 bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3">
      <motion.div
        className="w-7 rounded-t"
        style={{ background: color, boxShadow: `0 0 8px -1px ${color}` }}
        animate={{ height: ['10px', '52px', '26px', '52px', '10px'] }}
        transition={{ duration: 2.2, repeat: Infinity, times: [0, 0.42, 0.48, 0.92, 1], ease: 'easeInOut' }}
      />
    </div>
  )
}

function QuicAnimation({ color }) {
  return (
    <div className="bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3 px-4 py-4 space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="text-[8px] font-mono text-slate-500 w-20 shrink-0">TCP + TLS</span>
        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-slate-500"
            animate={{ width: ['0%', '100%', '0%'] }}
            transition={{ duration: 1.6, repeat: Infinity, times: [0, 0.55, 1], ease: 'easeInOut' }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[8px] font-mono w-20 shrink-0" style={{ color }}>QUIC (0-RTT)</span>
        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            animate={{ width: ['0%', '32%', '0%'] }}
            transition={{ duration: 1.6, repeat: Infinity, times: [0, 0.55, 1], ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  )
}

function ReferralAnimation({ color }) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-5 bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3">
      <span className="text-[9px] font-mono text-slate-500 shrink-0">query</span>
      <motion.div
        className="px-2 py-1 rounded-md border text-[9px] font-mono whitespace-nowrap"
        style={{ borderColor: `${color}60`, color }}
        animate={{ opacity: [0, 1, 1, 0], x: [-6, 0, 0, 10] }}
        transition={{ duration: 1.3, repeat: Infinity, times: [0, 0.2, 0.7, 1], ease: 'easeInOut' }}
      >
        referred →
      </motion.div>
      <span className="text-[9px] font-mono text-slate-500 shrink-0">next hop</span>
    </div>
  )
}

function HttpMessageAnimation({ color }) {
  const lines = ['GET /api/users HTTP/1.1', 'Host: example.com', 'Accept: application/json', '', '{ "id": 42 }']
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % lines.length), 550)
    return () => clearInterval(id)
  }, [lines.length])

  return (
    <div className="bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3 px-4 py-3 space-y-1">
      {lines.map((l, i) => (
        <motion.p
          key={i}
          animate={{ opacity: active === i ? 1 : 0.3, color: active === i ? color : '#475569' }}
          transition={{ duration: 0.2 }}
          className="text-[9px] font-mono truncate h-3"
        >
          {l || '·'}
        </motion.p>
      ))}
    </div>
  )
}

function StatelessAnimation({ color }) {
  const [n, setN] = useState(1)

  useEffect(() => {
    const id = setInterval(() => setN((v) => (v >= 3 ? 1 : v + 1)), 700)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center justify-center gap-3 py-5 bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3">
      <AnimatePresence mode="wait">
        <motion.span
          key={n}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
          className="text-[9px] font-mono"
          style={{ color }}
        >
          req #{n}
        </motion.span>
      </AnimatePresence>
      <span className="text-slate-600 text-xs">→</span>
      <div className="px-2.5 py-1.5 rounded-md border border-white/10 text-[8px] font-mono text-slate-500">
        memory: empty
      </div>
    </div>
  )
}

function MultiplexAnimation({ color }) {
  const streams = [0, 1, 2]
  return (
    <div className="bg-[#060e20] rounded-xl mx-4 sm:mx-5 mb-3 px-4 py-4 space-y-1.5">
      {streams.map((i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[8px] font-mono text-slate-500 w-10 shrink-0">#{i + 1}</span>
          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              animate={{ width: ['0%', '100%', '0%'] }}
              transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

const ANIMATIONS_BY_TYPE = {
  disk:         DiskAnimation,
  ram:          RamAnimation,
  cpu:          CpuAnimation,
  cache:        CacheAnimation,
  packet:       PacketAnimation,
  router:       RouterAnimation,
  ttl:          TtlAnimation,
  port:         PortAnimation,
  handshake:    HandshakeAnimation,
  throughput:   ThroughputAnimation,
  congestion:   CongestionAnimation,
  quic:         QuicAnimation,
  referral:     ReferralAnimation,
  httpmessage:  HttpMessageAnimation,
  stateless:    StatelessAnimation,
  multiplex:    MultiplexAnimation,
  git:          GitAnimation,
  pipeline:     PipelineAnimation,
  cdn:          CdnAnimation,
  loadbalancer: LoadBalancerAnimation,
  serverpulse:  ServerPulseAnimation,
  database:     DatabaseAnimation,
  monitor:      MonitorAnimation,
}

// Small looping animation shown on a component card, chosen by `type`
// (a component's `animationType`). Renders nothing for unknown types.
export default function ComponentAnimation({ type, color }) {
  const Animation = ANIMATIONS_BY_TYPE[type]
  return Animation ? <Animation color={color} /> : null
}
