import { Link, useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TECH_STACK_ITEMS, TECH_STACK_COLORS, TECH_STACK_CATEGORY_LABELS } from '../constants/techStackRegistry'
import { NAV_SECTIONS } from '../constants/sections'
import DetailSidebar from '../components/layout/DetailSidebar'
import Breadcrumb from '../components/layout/Breadcrumb'
import { groupByCategory } from '../lib/groupByCategory'

const SIDEBAR_GROUPS = groupByCategory(TECH_STACK_ITEMS, TECH_STACK_CATEGORY_LABELS, '/tech-stack')

function AdjacentNav({ prevItem, nextItem, basePath }) {
  if (!prevItem && !nextItem) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
      {prevItem ? (
        <Link
          to={`${basePath}/${prevItem.id}`}
          className="group rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 transition-colors px-5 py-4 flex items-center gap-3"
        >
          <svg className="shrink-0 w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Previous</p>
            <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate">{prevItem.title}</p>
          </div>
        </Link>
      ) : <div />}
      {nextItem && (
        <Link
          to={`${basePath}/${nextItem.id}`}
          className="group rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 transition-colors px-5 py-4 flex items-center justify-end gap-3 text-right"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Next</p>
            <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate">{nextItem.title}</p>
          </div>
          <svg className="shrink-0 w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  )
}

function InfoPanel({ title, children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      {children}
    </div>
  )
}

function KeyLearningsPanel({ item, c }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className={`border-b border-white/10 px-5 py-3 flex items-center gap-2 ${c.bg}`}>
        <div className={`w-2 h-2 rounded-full ${c.dot}`} />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Inferences & key learnings</p>
      </div>
      <div className="p-5 space-y-4">
        {item.keyLearnings.map((point, i) => (
          <div key={i} className="flex gap-3 text-sm text-slate-300">
            <span className={`shrink-0 mt-0.5 ${c.text}`}>◆</span>
            <span className="leading-relaxed">{point}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TechStackPage() {
  const { id } = useParams()
  const index  = TECH_STACK_ITEMS.findIndex((i) => i.id === id)
  const item   = TECH_STACK_ITEMS[index]

  if (!item) return <Navigate to="/tech-stack" replace />

  const c = TECH_STACK_COLORS[item.color]
  const prevItem = index > 0 ? TECH_STACK_ITEMS[index - 1] : null
  const nextItem = index < TECH_STACK_ITEMS.length - 1 ? TECH_STACK_ITEMS[index + 1] : null

  return (
    <div className="lg:flex lg:items-start lg:gap-8">
      <DetailSidebar groups={SIDEBAR_GROUPS} activeId={item.id} title="Tech Stack" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex-1 min-w-0 space-y-8"
      >
        <Breadcrumb trail={[
          { label: 'Home', to: '/' },
          NAV_SECTIONS.techStack,
          { label: item.title },
        ]} />

        {/* Hero */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{item.title}</h1>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${c.badgeBg} ${c.badgeBorder} ${c.text}`}>
              {TECH_STACK_CATEGORY_LABELS[item.category]}
            </span>
          </div>
          <p className={`text-base font-medium ${c.text}`}>{item.tagline}</p>
        </div>

        {/* Description */}
        <div className={`rounded-xl border px-5 py-4 ${c.bg} ${c.border}`}>
          <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-5">
            <InfoPanel title="How it works">
              <ol className="space-y-2.5">
                {item.howItWorks.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-300">
                    <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${c.badgeBg} ${c.text}`}>{i + 1}</span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </InfoPanel>

            <InfoPanel title="Interview angles">
              <ul className="space-y-2">
                {item.interviewAngles.map((q, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-300">
                    <span className={`shrink-0 mt-0.5 ${c.text} font-bold`}>?</span>
                    <span className="leading-relaxed">{q}</span>
                  </li>
                ))}
              </ul>
            </InfoPanel>
          </div>

          <div className="lg:sticky lg:top-20 space-y-5">
            <KeyLearningsPanel item={item} c={c} />
          </div>
        </div>

        {/* Next / Previous */}
        <AdjacentNav prevItem={prevItem} nextItem={nextItem} basePath="/tech-stack" />
      </motion.div>
    </div>
  )
}
