import { SectionLabel } from '../../detail/Panels'

// ── Data model section ────────────────────────────────────────────────────────

export function DataModelSection({ dataModel }) {
  return (
    <div className="space-y-3">
      <SectionLabel className="text-slate-500 px-1">Data Model</SectionLabel>
      <div className="grid gap-4 sm:grid-cols-2">
        {dataModel.map((entity) => (
          <div key={entity.entity} className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.06] flex items-baseline gap-3">
              <span className="font-mono text-sm font-bold text-white">{entity.entity}</span>
              {entity.note && (
                <span className="text-xs text-slate-500 leading-snug">{entity.note}</span>
              )}
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="px-5 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">Field</th>
                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">Type</th>
                  <th className="px-5 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600 hidden sm:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody>
                {entity.fields.map((field) => (
                  <tr key={field.name} className="border-b border-white/[0.04] last:border-0">
                    <td className="px-5 py-2 font-mono text-xs text-violet-300">{field.name}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-400 whitespace-nowrap">{field.type}</td>
                    <td className="px-5 py-2 text-xs text-slate-500 hidden sm:table-cell">{field.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
