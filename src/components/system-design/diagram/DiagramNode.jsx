import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

const IDLE_BORDER     = 'rgba(255,255,255,0.08)'
const IDLE_BACKGROUND = 'rgba(10,18,36,1)'

// Where the details popover opens, relative to the node (`node.dir`).
const POPOVER_POSITION = {
  top:    { top: '105%',    left: '50%', transform: 'translateX(-50%)' },
  right:  { left: '105%',   top: '50%',  transform: 'translateY(-50%)' },
  bottom: { bottom: '105%', left: '50%', transform: 'translateX(-50%)' },
  left:   { right: '105%',  top: '50%',  transform: 'translateY(-50%)' },
}

/**
 * One box in a system design diagram, positioned by its centre (cx, cy).
 * Clicking it toggles a popover with `node.desc` and `node.note`.
 *
 * node     — { id, label, icon, sub1, sub2, cx, cy, w, h, color, glow, lc, strip, dir, desc, note }.
 *            To show a state, pass a modified copy (e.g. `{ ...node, icon: '💀' }`).
 * tone     — optional hex colour for a state such as down, failed or warm.
 *            It replaces the node's own border and background colours.
 * badge    — optional { text, color, pulse } pill in the top-right corner;
 *            `pulse` makes it blink, for ongoing states such as an alert firing.
 * children — optional extra content drawn inside the box.
 * isActive, wasVisited, isExpanded, onToggle, popKey — from useDiagramNodes.
 */
export default function DiagramNode({ node, isActive, wasVisited, isExpanded, onToggle, popKey, tone, badge, children }) {
  const reduceMotion = useReducedMotion()
  const { cx, cy, w, h } = node
  const accent = tone ?? node.color
  const popped = popKey != null && !reduceMotion

  const borderColor = tone ?? (isActive ? node.color : wasVisited ? `${node.color}38` : IDLE_BORDER)
  const backgroundColor = tone
    ? `${tone}${isActive ? '1f' : '14'}`
    : isActive ? `${node.color}16` : wasVisited ? `${node.color}07` : IDLE_BACKGROUND
  const boxShadow = isActive ? `0 0 28px -5px ${tone ? `${tone}a6` : node.glow}` : 'none'

  return (
    <div className="absolute" style={{ left: cx - w / 2, top: cy - h / 2, width: w, height: h }}>
      <motion.button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="relative w-full h-full rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center gap-0.5 px-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        animate={{ borderColor, backgroundColor, boxShadow }}
        transition={{ duration: 0.28 }}
      >
        <motion.div
          className={`absolute top-0 left-0 right-0 h-0.5 ${node.strip}`}
          animate={{ opacity: isActive ? 1 : wasVisited ? 0.35 : 0.12 }}
        />

        {/* Ripple burst when the node becomes active */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`${popKey ?? 'i'}-${node.id}-${i}`}
            className="absolute inset-0 rounded-xl border-2 pointer-events-none"
            style={{ borderColor: accent }}
            initial={{ scale: 1, opacity: popped ? 0.65 : 0 }}
            animate={{ scale: 2.0 + i * 0.35, opacity: 0 }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: 'easeOut' }}
          />
        ))}

        <motion.span
          key={`icon-${popKey ?? 0}`}
          animate={popped ? { scale: [1, 1.4, 0.88, 1.06, 1] } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          className="text-xl leading-none select-none"
        >
          {node.icon}
        </motion.span>

        <motion.p
          animate={{ color: isActive ? node.lc : wasVisited ? '#94a3b8' : '#475569' }}
          className="text-[10px] font-bold text-center leading-tight"
        >
          {node.label}
        </motion.p>
        {node.sub1 && (
          <motion.p animate={{ color: tone ?? (isActive ? node.color : '#1f2937') }} className="text-[9px] font-mono">
            {node.sub1}
          </motion.p>
        )}
        {node.sub2 && <p className="text-[8px] text-slate-700">{node.sub2}</p>}

        {children}

        <AnimatePresence>
          {badge && (
            <motion.span
              key={badge.text}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: badge.pulse && !reduceMotion ? [1, 0.4, 1] : 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={badge.pulse && !reduceMotion
                ? { opacity: { duration: 1, repeat: Infinity }, scale: { type: 'spring', stiffness: 360, damping: 20 } }
                : { type: 'spring', stiffness: 360, damping: 20 }}
              className="absolute top-1 right-1 text-[7px] font-bold font-mono border rounded px-1 leading-tight"
              style={{ color: badge.color, borderColor: `${badge.color}50`, background: `${badge.color}15` }}
            >
              {badge.text}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            className="absolute z-30 w-52 rounded-xl border bg-slate-900/96 backdrop-blur shadow-2xl p-3 space-y-1.5"
            style={{ borderColor: `${node.color}40`, ...POPOVER_POSITION[node.dir ?? 'top'] }}
          >
            <p className="text-[11px] font-bold" style={{ color: node.lc }}>{node.label}</p>
            {node.desc && <p className="text-[10px] text-slate-400 leading-relaxed">{node.desc}</p>}
            {node.note && <p className="text-[10px] italic" style={{ color: node.color }}>{node.note}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Small status pill drawn inside a node (pass it as DiagramNode children),
 * usually in place of `sub2`. Colours animate when the status changes.
 * status — { label, color, bg, border }
 */
export function NodePill({ status, className = 'mt-0.5' }) {
  return (
    <motion.span
      animate={{ color: status.color, backgroundColor: status.bg, borderColor: status.border }}
      transition={{ duration: 0.35 }}
      className={`rounded border px-1.5 text-[8px] font-bold font-mono leading-4 ${className}`}
    >
      {status.label}
    </motion.span>
  )
}
