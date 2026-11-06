import { motion } from 'framer-motion'
import ComponentAnimation from '../animations/ComponentAnimation'

// ── Component deep-dive card ──────────────────────────────────────────────────

export function ComponentCard({ comp, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay: index * 0.07 }}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 320, damping: 22 } }}
      className="rounded-2xl border overflow-hidden bg-white/[0.02]"
      style={{ borderColor: `${comp.color}28` }}
    >
      <div className="h-1 w-full" style={{ backgroundColor: comp.color }} />

      <div className="px-4 sm:px-5 py-3.5 flex items-center gap-3 border-b border-white/[0.06]">
        <span className="text-2xl select-none leading-none">{comp.icon}</span>
        <h3 className="font-semibold text-white text-sm flex-1">{comp.title}</h3>
        <span
          className="shrink-0 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: comp.color, boxShadow: `0 0 8px 2px ${comp.color}50` }}
        />
      </div>

      <ComponentAnimation type={comp.animationType} color={comp.color} />

      <div className="px-4 sm:px-5 pt-1 pb-2.5">
        <p className="text-sm text-slate-300 leading-relaxed">{comp.summary}</p>
      </div>

      {comp.stats?.length > 0 && (
        <div className="mx-4 sm:mx-5 mb-3 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="flex divide-x divide-white/[0.06]">
            {comp.stats.map((stat) => (
              <div key={stat.label} className="flex-1 px-3 py-2.5 space-y-0.5 min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600 truncate">{stat.label}</p>
                <p className="text-xs font-mono font-bold leading-none truncate" style={{ color: comp.color }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 sm:px-5 pb-4">
        <p className="text-xs text-slate-400 leading-relaxed">{comp.detail}</p>
      </div>
    </motion.div>
  )
}
