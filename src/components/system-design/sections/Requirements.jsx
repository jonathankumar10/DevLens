import { SectionLabel } from '../../detail/Panels'

// ── Requirements section ──────────────────────────────────────────────────────

const REQ_SECTIONS = [
  { key: 'functional',    label: 'Functional',      accent: 'text-violet-400', dot: 'bg-violet-400',  border: 'border-violet-500/20' },
  { key: 'nonFunctional', label: 'Non-Functional',  accent: 'text-sky-400',    dot: 'bg-sky-400',     border: 'border-sky-500/20'    },
  { key: 'scale',         label: 'Scale Estimates', accent: 'text-emerald-400',dot: 'bg-emerald-400', border: 'border-emerald-500/20' },
  { key: 'outOfScope',    label: 'Out of Scope',    accent: 'text-slate-400',  dot: 'bg-slate-500',   border: 'border-slate-500/20'  },
]

export function RequirementsSection({ requirements }) {
  return (
    <div className="space-y-3">
      <SectionLabel className="text-slate-500 px-1">Requirements</SectionLabel>
      <div className="space-y-3">
        {REQ_SECTIONS.map(({ key, label, accent, dot, border }) =>
          requirements[key]?.length > 0 && (
            <div key={key} className={`grid gap-3 rounded-xl border ${border} bg-white/[0.02] px-5 py-4`}>
              <SectionLabel className={accent}>{label}</SectionLabel>
              <ul className="grid gap-y-2.5">
                {requirements[key].map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300 leading-relaxed">
                    <span className={`mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full ${dot}`} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>
    </div>
  )
}
