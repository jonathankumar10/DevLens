import { Link } from 'react-router-dom'
import { SectionLabel } from '../../detail/Panels'

// ── Why this exists ───────────────────────────────────────────────────────────

export function WhyItExists({ why }) {
  if (!why) return null

  if (why.kind === 'design') {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.05] px-5 py-3">
        <span className="text-[10px] rounded-full px-2 py-0.5 font-semibold bg-indigo-500/15 text-indigo-300">
          {why.tier.label}
        </span>
        <p className="text-sm text-slate-300">
          <span className="text-indigo-400 font-medium">Teaches:</span> {why.teaches}
        </p>
      </div>
    )
  }

  const { stage } = why
  const cells = [
    { label: 'The problem',        text: why.problem,  tone: 'text-rose-400',  border: 'border-rose-500/20',  bg: 'bg-rose-500/[0.05]' },
    { label: 'What this solves',   text: why.why,      tone: stage.text,       border: 'border-white/10',     bg: 'bg-white/[0.02]', style: { borderColor: `${stage.hex}40`, background: `${stage.hex}0d` } },
    { label: 'Trade-off it brings', text: why.tradeoff, tone: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/[0.05]' },
  ]

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2 px-1">
        <SectionLabel>Why this exists</SectionLabel>
        <span className={`text-[10px] rounded-full px-2 py-0.5 font-semibold ${stage.badge}`}>
          Stage {why.stageIndex + 1} · {stage.label}
        </span>
        <span className="text-[10px] text-slate-600">{why.stepTitle}</span>
        <Link
          to={`/system-design?step=${why.stepIndex}`}
          className="ml-auto text-[11px] text-slate-400 hover:text-white transition-colors"
        >
          ▶ See it in the journey
        </Link>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {cells.map((c, i) => (
          <div key={c.label} className="relative">
            <div className={`h-full rounded-xl border px-4 py-3 ${c.border} ${c.bg}`} style={c.style}>
              <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${c.tone}`}>{c.label}</p>
              <p className="text-sm text-slate-300 leading-relaxed">{c.text}</p>
            </div>
            {i < cells.length - 1 && (
              <span className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600 text-xs">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
