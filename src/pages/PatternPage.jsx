import React, { Suspense } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PATTERNS, PATTERN_COLORS } from '../constants/patternsRegistry'
import { DIFFICULTY_COLOR } from '../constants/algorithmRegistry'
import { NAV_SECTIONS } from '../constants/sections'
import Breadcrumb from '../components/layout/Breadcrumb'

const ANIMATIONS = import.meta.glob('../content/patterns/*/Animation.jsx')

// Lazy components must be created once, at module scope — not during render.
const LAZY_ANIMATIONS = Object.fromEntries(
  Object.entries(ANIMATIONS).map(([key, loader]) => [key, React.lazy(loader)])
)

export default function PatternPage() {
  const { id } = useParams()
  const pattern = PATTERNS.find((p) => p.id === id)

  const AnimationComponent = LAZY_ANIMATIONS[`../content/patterns/${id}/Animation.jsx`] ?? null

  if (!pattern) return <Navigate to="/patterns" replace />

  const c = PATTERN_COLORS[pattern.color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <Breadcrumb trail={[
        { label: 'Home', to: '/' },
        NAV_SECTIONS.dsa,
        { label: 'Patterns', to: '/patterns' },
        { label: pattern.title },
      ]} />

      {/* Hero */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{pattern.title}</h1>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${c.badgeBg} ${c.badgeBorder} ${c.text}`}>
            Pattern
          </span>
        </div>
        <p className={`text-base font-medium ${c.text}`}>{pattern.tagline}</p>
      </div>

      {/* Description */}
      <div className={`rounded-xl border px-5 py-4 ${c.bg} ${c.border}`}>
        <p className="text-sm text-slate-300 leading-relaxed">{pattern.description}</p>
      </div>

      {/* Two-column: info left, animation right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-5">

          {/* How it works */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">How it works</p>
            <ol className="space-y-2.5">
              {pattern.howItWorks.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300">
                  <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${c.badgeBg} ${c.text}`}>
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* When to use */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">When to use</p>
            <ul className="space-y-2">
              {pattern.whenToUse.map((signal, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300">
                  <span className={`shrink-0 mt-0.5 ${c.text}`}>◆</span>
                  <span className="leading-relaxed">{signal}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Complexity */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Complexity</p>
            <div className="space-y-2">
              {pattern.complexity.map(({ op, time }) => (
                <div key={op} className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-400">{op}</span>
                  <span className={`shrink-0 font-mono text-xs font-bold ${c.text}`}>{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live animation */}
        <div className="lg:sticky lg:top-20">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className={`border-b border-white/10 px-5 py-3 flex items-center gap-2 ${c.bg}`}>
              <div className={`w-2 h-2 rounded-full ${c.dot} animate-pulse`} />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Live illustration — auto-playing
              </p>
            </div>
            <div className="p-5">
              <Suspense fallback={
                <div className="py-20 text-center text-slate-500 text-sm">Loading…</div>
              }>
                {AnimationComponent
                  ? <AnimationComponent />
                  : <p className="text-slate-500 text-center py-20 text-sm">Animation coming soon.</p>
                }
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Problems */}
      {pattern.algorithms.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
              Problems using this pattern
            </p>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pattern.algorithms.map((a) => (
              <Link
                key={a.id}
                to={`/algorithms/${a.id}`}
                className="group rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] p-4 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">{a.title}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${DIFFICULTY_COLOR[a.difficulty]}`}>
                    {a.difficulty}
                  </span>
                </div>
                {a.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{a.description}</p>
                )}
                <div className="flex items-center gap-1 text-xs text-slate-600 group-hover:text-blue-400 transition-colors">
                  View visualizer
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
