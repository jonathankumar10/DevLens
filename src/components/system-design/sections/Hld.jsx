import { Fragment, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionLabel } from '../../detail/Panels'

// ── High level design section ─────────────────────────────────────────────────

function HldNode({ node }) {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="rounded-xl border border-white/10 bg-[#07101f] px-3 py-2.5 flex flex-col items-center gap-1 min-w-[80px] max-w-[110px]">
        <span className="text-lg leading-none">{node.icon}</span>
        <p className="text-[11px] font-medium text-white text-center leading-tight">{node.label}</p>
        {node.note && <p className="text-[9px] text-slate-500 text-center leading-tight">{node.note}</p>}
      </div>
    </div>
  )
}

function HldArrow() {
  return (
    <div className="flex items-center shrink-0">
      <div className="w-5 h-px bg-slate-700" />
      <svg width="6" height="10" viewBox="0 0 6 10" fill="#334155" className="shrink-0">
        <polygon points="0,0 0,10 6,5" />
      </svg>
    </div>
  )
}

// An array entry can itself be an array of nodes — rendered stacked as
// alternatives (e.g. "cache hit, else DB fallback") rather than a sequential
// pipe, since a plain A → B → C chain would wrongly imply B always forwards to C.
function HldNodeEntry({ entry }) {
  if (!Array.isArray(entry)) return <HldNode node={entry} />
  return (
    <div className="relative flex flex-col gap-1.5 pl-2.5">
      <div className="absolute left-0 top-2 bottom-2 w-px bg-slate-700" />
      {entry.map((node, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-2 h-px bg-slate-700" />
          <HldNode node={node} />
        </div>
      ))}
    </div>
  )
}

function LinearFlow({ nodes }) {
  return (
    <div className="flex items-center flex-wrap gap-y-4 overflow-x-auto py-2">
      {nodes.map((node, i) => (
        <Fragment key={i}>
          <HldNodeEntry entry={node} />
          {i < nodes.length - 1 && <HldArrow />}
        </Fragment>
      ))}
    </div>
  )
}

function BranchedFlow({ preFlow, branches }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2">
      {/* Pre-fork nodes */}
      <div className="flex items-center shrink-0">
        {preFlow.map((node, i) => (
          <Fragment key={i}>
            <HldNode node={node} />
            <HldArrow />
          </Fragment>
        ))}
      </div>

      {/* Fork: vertical bar + branches */}
      <div className="relative flex flex-col gap-4 shrink-0">
        {/* Vertical connector spanning all branches */}
        <div
          className="absolute left-0 w-px bg-slate-700 pointer-events-none"
          style={{ top: '25%', bottom: '25%' }}
        />

        {branches.map((branch, bi) => (
          <div key={bi} className="flex items-center">
            {/* Horizontal stub from vertical bar */}
            <div className="flex items-center shrink-0">
              <div className="w-5 h-px bg-slate-700" />
              <svg width="6" height="10" viewBox="0 0 6 10" fill="#334155" className="shrink-0 mr-1">
                <polygon points="0,0 0,10 6,5" />
              </svg>
            </div>
            {/* Branch label + nodes */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-600 mr-1 whitespace-nowrap">
                {branch.label}
              </span>
              {branch.nodes.map((node, ni) => (
                <Fragment key={ni}>
                  <HldNodeEntry entry={node} />
                  {ni < branch.nodes.length - 1 && <HldArrow />}
                </Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HldSection({ hldFlows }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const flow = hldFlows[activeIdx]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 px-1">
        <SectionLabel>High Level Design</SectionLabel>
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-[10px] text-slate-600">{hldFlows.length} flows</span>
      </div>

      {/* Tab switcher */}
      <div className="flex flex-wrap gap-2">
        {hldFlows.map((f, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeIdx === i
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                : 'bg-white/[0.02] text-slate-400 border border-white/10 hover:bg-white/[0.04]'
            }`}
          >
            {f.title}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4"
        >
          <p className="text-sm text-slate-300 leading-relaxed">{flow.description}</p>

          <div className="rounded-xl border border-white/[0.06] bg-[#07101f] px-4 py-4 overflow-x-auto">
            {flow.flow && <LinearFlow nodes={flow.flow} />}
            {flow.preFlow && flow.branches && (
              <BranchedFlow preFlow={flow.preFlow} branches={flow.branches} />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
