import React, { Suspense } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { OOD_ITEMS, OOD_COLORS, OOD_CATEGORY_LABELS } from '../constants/oodRegistry'
import { NAV_SECTIONS } from '../constants/sections'
import DetailSidebar from '../components/layout/DetailSidebar'
import Breadcrumb from '../components/layout/Breadcrumb'
import { groupByCategory } from '../lib/groupByCategory'

const SIDEBAR_GROUPS = groupByCategory(OOD_ITEMS, OOD_CATEGORY_LABELS, '/ood')

// Lazy-load per-pattern animations from content/ood/*/Animation.jsx
const OOD_ANIMATIONS = import.meta.glob('../content/ood/*/Animation.jsx')

// Lazy components must be created once, at module scope — not during render.
const OOD_LAZY_ANIMATIONS = Object.fromEntries(
  Object.entries(OOD_ANIMATIONS).map(([key, loader]) => [key, React.lazy(loader)])
)

const DIFFICULTY_COLOR = {
  Easy:   'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  Hard:   'text-rose-400 bg-rose-500/10 border-rose-500/25',
}

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

export default function OODPage() {
  const { id } = useParams()
  const index  = OOD_ITEMS.findIndex((i) => i.id === id)
  const item   = OOD_ITEMS[index]

  if (!item) return <Navigate to="/ood" replace />

  const c = OOD_COLORS[item.color]
  const prevItem = index > 0 ? OOD_ITEMS[index - 1] : null
  const nextItem = index < OOD_ITEMS.length - 1 ? OOD_ITEMS[index + 1] : null

  return (
    <div className="lg:flex lg:items-start lg:gap-8">
      <DetailSidebar groups={SIDEBAR_GROUPS} activeId={item.id} title="OOD" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex-1 min-w-0 space-y-8"
      >
      <Breadcrumb trail={[
        { label: 'Home', to: '/' },
        NAV_SECTIONS.ood,
        { label: item.title },
      ]} />

      {/* Hero */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{item.title}</h1>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${c.badgeBg} ${c.badgeBorder} ${c.text}`}>
            {OOD_CATEGORY_LABELS[item.category]}
          </span>
          {item.difficulty && (
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${DIFFICULTY_COLOR[item.difficulty]}`}>
              {item.difficulty}
            </span>
          )}
        </div>
        <p className={`text-base font-medium ${c.text}`}>{item.tagline}</p>
      </div>

      {/* Description */}
      <div className={`rounded-xl border px-5 py-4 ${c.bg} ${c.border}`}>
        <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
      </div>

      {item.type === 'pattern' ? <PatternDetail item={item} c={c} /> : <QuestionDetail item={item} c={c} />}

      {/* Next / Previous */}
      <AdjacentNav prevItem={prevItem} nextItem={nextItem} basePath="/ood" />
      </motion.div>
    </div>
  )
}

// ── Pattern detail ────────────────────────────────────────────────────────────

function PatternDetail({ item, c }) {
  const AnimationComponent = OOD_LAZY_ANIMATIONS[`../content/ood/${item.id}/Animation.jsx`] ?? null

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: text panels */}
        <div className="space-y-5">
          <InfoPanel title="How it works" c={c}>
            <ol className="space-y-2.5">
              {item.howItWorks.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300">
                  <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${c.badgeBg} ${c.text}`}>{i + 1}</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </InfoPanel>

          <InfoPanel title="When to use" c={c}>
            <ul className="space-y-2">
              {item.whenToUse.map((signal, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300">
                  <span className={`shrink-0 mt-0.5 ${c.text}`}>◆</span>
                  <span className="leading-relaxed">{signal}</span>
                </li>
              ))}
            </ul>
          </InfoPanel>

          <InfoPanel title="Real-world analogies" c={c}>
            <ul className="space-y-2">
              {item.realWorldExamples.map((ex, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300">
                  <span className="shrink-0 text-slate-600">→</span>
                  <span className="leading-relaxed">{ex}</span>
                </li>
              ))}
            </ul>
          </InfoPanel>
        </div>

        {/* Right: animation (if exists) or participants */}
        <div className="lg:sticky lg:top-20 space-y-5">
          {AnimationComponent ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <div className={`border-b border-white/10 px-5 py-3 flex items-center gap-2 ${c.bg}`}>
                <div className={`w-2 h-2 rounded-full ${c.dot} animate-pulse`} />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Interactive diagram
                </p>
              </div>
              <div className="p-4">
                <Suspense fallback={<div className="py-16 text-center text-slate-500 text-sm">Loading…</div>}>
                  <AnimationComponent />
                </Suspense>
              </div>
            </div>
          ) : (
            <ParticipantsPanel item={item} c={c} />
          )}
        </div>
      </div>

      {/* Participants — always visible below the two-column grid */}
      {AnimationComponent && <ParticipantsPanel item={item} c={c} />}

      {/* Related LeetCode problems */}
      {item.leetcodeProblems?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Related problems</p>
            <div className="flex-1 h-px bg-white/8" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {item.leetcodeProblems.map((prob) => (
              <a
                key={prob.id}
                href={`https://leetcode.com/problems/${prob.title.toLowerCase().replace(/\s+/g, '-')}/`}
                target="_blank" rel="noopener noreferrer"
                className="group rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] p-4 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">{prob.title}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    prob.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10' :
                    prob.difficulty === 'Hard' ? 'text-rose-400 bg-rose-500/10' : 'text-amber-400 bg-amber-500/10'
                  }`}>{prob.difficulty}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-600 group-hover:text-blue-400 transition-colors">
                  LeetCode #{prob.id}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ParticipantsPanel({ item, c }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className={`border-b border-white/10 px-5 py-3 flex items-center gap-2 ${c.bg}`}>
        <div className={`w-2 h-2 rounded-full ${c.dot}`} />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Participants</p>
      </div>
      <div className="p-5 space-y-4">
        {item.participants.map((p) => (
          <div key={p.role} className="space-y-0.5">
            <p className={`text-sm font-semibold font-mono ${c.text}`}>{p.role}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Interview question detail ─────────────────────────────────────────────────

function QuestionDetail({ item, c }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-5">
          <InfoPanel title="Requirements" c={c}>
            <ol className="space-y-2.5">
              {item.requirements.map((req, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300">
                  <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${c.badgeBg} ${c.text}`}>{i + 1}</span>
                  <span className="leading-relaxed">{req}</span>
                </li>
              ))}
            </ol>
          </InfoPanel>

          <InfoPanel title="Hints" c={c}>
            <ul className="space-y-2">
              {item.hints.map((hint, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300">
                  <span className={`shrink-0 mt-0.5 ${c.text}`}>💡</span>
                  <span className="leading-relaxed">{hint}</span>
                </li>
              ))}
            </ul>
          </InfoPanel>

          <InfoPanel title="Patterns applied" c={c}>
            <div className="flex flex-wrap gap-2">
              {item.patternsUsed.map((p) => (
                <span key={p} className={`rounded-full px-3 py-1 text-xs font-medium border ${c.badgeBg} ${c.badgeBorder} ${c.text}`}>{p}</span>
              ))}
            </div>
          </InfoPanel>
        </div>

        <div className="lg:sticky lg:top-20">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className={`border-b border-white/10 px-5 py-3 flex items-center gap-2 ${c.bg}`}>
              <div className={`w-2 h-2 rounded-full ${c.dot}`} />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Key Classes</p>
            </div>
            <div className="p-5 space-y-4">
              {item.keyClasses.map((cls) => (
                <div key={cls.name} className="space-y-0.5">
                  <p className={`text-sm font-semibold font-mono ${c.text}`}>{cls.name}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{cls.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Shared info panel ─────────────────────────────────────────────────────────

function InfoPanel({ title, children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      {children}
    </div>
  )
}
