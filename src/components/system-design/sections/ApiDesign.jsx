import { SectionLabel } from '../../detail/Panels'

// ── API design section ────────────────────────────────────────────────────────

const METHOD_COLOR = {
  GET:    'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  POST:   'bg-blue-500/15 text-blue-300 border border-blue-500/30',
  PUT:    'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  PATCH:  'bg-orange-500/15 text-orange-300 border border-orange-500/30',
  DELETE: 'bg-red-500/15 text-red-300 border border-red-500/30',
  WS:     'bg-violet-500/15 text-violet-300 border border-violet-500/30',
}

export function ApiDesignSection({ apiDesign }) {
  return (
    <div className="space-y-3">
      <SectionLabel className="text-slate-500 px-1">API Design</SectionLabel>
      <div className="space-y-2">
        {apiDesign.map((endpoint, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            {/* Header row */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-white/[0.06]">
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold font-mono ${METHOD_COLOR[endpoint.method] ?? 'bg-white/5 text-slate-300'}`}>
                {endpoint.method}
              </span>
              <code className="font-mono text-sm text-white">{endpoint.path}</code>
              <span className="text-xs text-slate-500 sm:ml-auto">{endpoint.description}</span>
            </div>

            {/* Body panels */}
            {(endpoint.reqBody || endpoint.resBody) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
                {/* Request body */}
                <div className="px-4 py-3 space-y-2">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">Request</p>
                  <pre className="font-mono text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {endpoint.reqBody ?? '—'}
                  </pre>
                </div>
                {/* Response body */}
                <div className="px-4 py-3 space-y-2">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">Response</p>
                  <pre className="font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {endpoint.resBody ?? '—'}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
