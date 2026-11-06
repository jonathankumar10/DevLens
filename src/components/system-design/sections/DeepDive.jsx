import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionLabel } from '../../detail/Panels'
import { renderOptionContent } from './optionContent'

// ── Deep dive section ─────────────────────────────────────────────────────────

const LEVEL_STYLE = {
  mid:    'bg-sky-500/15 text-sky-300 border-sky-500/30',
  senior: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  staff:  'bg-amber-500/15 text-amber-300 border-amber-500/30',
}

const LEVEL_CHEVRON = {
  mid:    'text-sky-400',
  senior: 'text-violet-400',
  staff:  'text-amber-400',
}

const BADGE_CONFIG = {
  'Chosen':         { cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25', card: 'border-emerald-500/25 bg-emerald-950/20', divider: 'border-emerald-500/10' },
  'Decision Guide': { cls: 'text-violet-400 bg-violet-500/10 border-violet-500/25',   card: 'border-violet-500/20 bg-violet-950/10',   divider: 'border-violet-500/10' },
  'Key Insight':    { cls: 'text-amber-400 bg-amber-500/10 border-amber-500/25',       card: 'border-amber-500/20 bg-amber-950/10',     divider: 'border-amber-500/10' },
}

function DeepDiveOption({ opt, isOpen, onToggle }) {
  const badge = opt.badge ? BADGE_CONFIG[opt.badge] : null

  return (
    <div className={`rounded-lg border overflow-hidden transition-colors duration-200 ${badge ? badge.card : 'border-white/[0.06] bg-[#07101f]'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-white/[0.025] transition-colors"
      >
        <motion.svg
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.18 }}
          className={`shrink-0 w-3.5 h-3.5 transition-colors ${isOpen ? 'text-violet-400' : 'text-slate-500'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </motion.svg>
        <span className={`text-sm font-medium flex-1 ${isOpen ? 'text-slate-100' : 'text-slate-300'}`}>{opt.label}</span>
        {opt.badge && (
          <span className={`shrink-0 text-[9px] font-semibold rounded-full border px-2 py-0.5 tracking-wide ${badge.cls}`}>
            {opt.badge}
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="opt-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={`px-4 pb-4 pt-3 border-t ${badge ? badge.divider : 'border-white/[0.04]'}`}>
              {renderOptionContent(opt.content)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DeepDiveItem({ item, isOpen, onToggle }) {
  const [openOptions, setOpenOptions] = useState(new Set())

  const toggleOption = (idx) => {
    setOpenOptions((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-200 ${
      isOpen ? 'border-white/[0.16] bg-white/[0.025]' : 'border-white/10 bg-white/[0.02]'
    }`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold capitalize ${LEVEL_STYLE[item.level]}`}>
          {item.level}
        </span>
        <span className={`text-sm flex-1 leading-snug transition-colors ${isOpen ? 'text-white font-medium' : 'text-slate-200'}`}>
          {item.question}
        </span>
        {item.options?.length > 0 && (
          <span className="shrink-0 text-[10px] text-slate-600 font-mono mr-1">{item.options.length}</span>
        )}
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={`shrink-0 w-4 h-4 transition-colors ${isOpen ? LEVEL_CHEVRON[item.level] : 'text-slate-500'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="dd-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-3 border-t border-white/[0.06] space-y-3">
              {(item.description || item.answer) && (
                <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] px-4 py-3">
                  <p className="text-sm text-slate-400 leading-relaxed">{item.description ?? item.answer}</p>
                </div>
              )}
              {item.options?.length > 0 && (
                <div className="space-y-1.5">
                  {item.options.map((opt, i) => (
                    <DeepDiveOption
                      key={i}
                      opt={opt}
                      isOpen={openOptions.has(i)}
                      onToggle={() => toggleOption(i)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function DeepDiveSection({ items }) {
  const [openIdx, setOpenIdx] = useState(null)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 px-1">
        <SectionLabel>Deep Dive</SectionLabel>
        <div className="flex-1 h-px bg-white/[0.06]" />
        <div className="flex items-center gap-1.5">
          {['mid', 'senior', 'staff'].map((level) => (
            <span key={level} className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${LEVEL_STYLE[level]}`}>
              {level}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <DeepDiveItem
            key={i}
            item={item}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
          />
        ))}
      </div>
    </div>
  )
}
