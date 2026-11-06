import { motion, AnimatePresence } from 'framer-motion'

const CANVAS_STYLE = {
  background: '#060d1a',
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
}

export function DiagramHeader({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="text-sm text-slate-400">{children}</p>
    </div>
  )
}

/**
 * The dotted canvas. `svg` is drawn in an <svg> layer sized width × height
 * (edges, labels); `children` sit on top (DiagramNode boxes). `header` and
 * `footer` go above and below the stage (mode pills, banners, legend).
 * The stage scrolls sideways on small screens.
 */
export function DiagramCanvas({ width, height, svg, children, header, footer }) {
  return (
    <div className="rounded-2xl border border-white/10 p-3 sm:p-5" style={CANVAS_STYLE}>
      {header}
      <div className="overflow-x-auto pb-2">
        <div className="relative mx-auto" style={{ width, height }}>
          <svg
            className="absolute inset-0 pointer-events-none overflow-visible"
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
          >
            {svg}
          </svg>
          {children}
        </div>
      </div>
      {footer}
    </div>
  )
}

/** Line-colour key under the canvas. items: [[FLOW colour, label], ...] */
export function FlowLegend({ items, hint = true }) {
  return (
    <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
      {items.map(([color, label]) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-5 h-px rounded-full" style={{ background: color.hex, boxShadow: `0 0 4px ${color.glow}` }} />
          <span className="text-[10px] text-slate-500">{label}</span>
        </div>
      ))}
      {hint && <span className="text-[10px] text-slate-600 ml-auto hidden sm:inline">tap any node for details</span>}
    </div>
  )
}

const OUTCOME_TONE = {
  good: { box: 'border-emerald-500/40 bg-emerald-500/[0.07]', icon: 'text-emerald-400', title: 'text-emerald-400', detail: 'text-emerald-300' },
  bad:  { box: 'border-rose-500/40 bg-rose-500/[0.07]',       icon: 'text-rose-400',    title: 'text-rose-400',    detail: 'text-rose-300' },
  warn: { box: 'border-amber-500/40 bg-amber-500/[0.07]',     icon: 'text-amber-400',   title: 'text-amber-400',   detail: 'text-amber-300' },
  info: { box: 'border-sky-500/40 bg-sky-500/[0.07]',         icon: 'text-sky-400',     title: 'text-sky-400',     detail: 'text-sky-300' },
}

/** Result strip under the canvas, e.g. "Cache HIT". Pass outcome = null to hide. */
export function OutcomeBanner({ outcome }) {
  const tone = outcome && OUTCOME_TONE[outcome.tone ?? 'good']
  return (
    <AnimatePresence mode="wait">
      {outcome && (
        <motion.div
          key={outcome.title}
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 23 }}
          className={`mt-3 flex items-center gap-3 rounded-xl border px-4 py-2.5 ${tone.box}`}
        >
          {outcome.icon && <span className={`text-lg select-none ${tone.icon}`}>{outcome.icon}</span>}
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${tone.title}`}>{outcome.title}</p>
            {outcome.detail && <p className={`text-[11px] font-mono ${tone.detail}`}>{outcome.detail}</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** The current step's message and detail, under the canvas. */
export function StepNarration({ step }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.message}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.2 }}
        className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 space-y-1.5"
      >
        <p className="text-sm font-semibold text-white">{step.message}</p>
        {step.detail && <p className="text-xs text-slate-400 leading-relaxed">{step.detail}</p>}
      </motion.div>
    </AnimatePresence>
  )
}
