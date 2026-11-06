import { SectionLabel } from '../../detail/Panels'

// ── Level expectations section ────────────────────────────────────────────────

const LEVEL_COLS = [
  { key: 'mid',    label: 'Mid  (L4)',    style: 'text-sky-300 bg-sky-500/10 border-sky-500/30' },
  { key: 'senior', label: 'Senior (L5)', style: 'text-violet-300 bg-violet-500/10 border-violet-500/30' },
  { key: 'staff',  label: 'Staff  (L6)', style: 'text-amber-300 bg-amber-500/10 border-amber-500/30' },
]

export function LevelExpectationsSection({ rows }) {
  return (
    <div className="space-y-3">
      <SectionLabel className="text-slate-500 px-1">Level Expectations</SectionLabel>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-4 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="px-4 py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Dimension</span>
          </div>
          {LEVEL_COLS.map((col) => (
            <div key={col.key} className="px-4 py-2.5">
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${col.style.split(' ')[0]}`}>
                {col.label}
              </span>
            </div>
          ))}
        </div>
        {/* Rows */}
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-4 border-b border-white/[0.04] last:border-0"
          >
            <div className="px-4 py-3 flex items-start">
              <span className="text-xs font-semibold text-white leading-relaxed">{row.dimension}</span>
            </div>
            {LEVEL_COLS.map((col) => (
              <div key={col.key} className="px-4 py-3 border-l border-white/[0.04]">
                <p className="text-xs text-slate-400 leading-relaxed">{row[col.key]}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
