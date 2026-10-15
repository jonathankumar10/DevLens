import { Suspense } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PATTERNS, PATTERN_COLORS } from '../constants/patternsRegistry'
import { DIFFICULTY_COLOR } from '../constants/palette'
import { NAV_SECTIONS } from '../constants/sections'
import Breadcrumb from '../components/layout/Breadcrumb'
import DetailHero from '../components/detail/DetailHero'
import { InfoPanel, HeaderPanel, NumberedList, BulletList, Badge } from '../components/detail/Panels'
import { lazyGlob } from '../lib/lazyGlob'
import { PAGE_ENTER } from '../lib/motion'

// Auto-playing illustration: content/patterns/<id>/Animation.jsx
const ANIMATIONS = lazyGlob(import.meta.glob('../content/patterns/*/Animation.jsx'))

export default function PatternPage() {
  const { id } = useParams()
  const pattern = PATTERNS.find((p) => p.id === id)

  if (!pattern) return <Navigate to="/patterns" replace />

  const palette   = PATTERN_COLORS[pattern.color]
  const Animation = ANIMATIONS[`../content/patterns/${id}/Animation.jsx`]

  return (
    <motion.div {...PAGE_ENTER} className="space-y-8">
      <Breadcrumb trail={[
        { label: 'Home', to: '/' },
        NAV_SECTIONS.dsa,
        { label: 'Patterns', to: '/patterns' },
        { label: pattern.title },
      ]} />

      <DetailHero
        title={pattern.title}
        tagline={pattern.tagline}
        description={pattern.description}
        palette={palette}
        badges={<Badge className={`${palette.badgeBg} ${palette.badgeBorder} ${palette.text}`}>Pattern</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-5">
          <InfoPanel title="How it works">
            <NumberedList items={pattern.howItWorks} palette={palette} />
          </InfoPanel>
          <InfoPanel title="When to use">
            <BulletList items={pattern.whenToUse} markerClassName={palette.text} />
          </InfoPanel>
          <InfoPanel title="Complexity">
            <div className="space-y-2">
              {pattern.complexity.map(({ op, time }) => (
                <div key={op} className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-400">{op}</span>
                  <span className={`shrink-0 font-mono text-xs font-bold ${palette.text}`}>{time}</span>
                </div>
              ))}
            </div>
          </InfoPanel>
        </div>

        <div className="lg:sticky lg:top-20">
          <HeaderPanel title="Live illustration — auto-playing" palette={palette} pulse>
            <div className="p-5">
              <Suspense fallback={<div className="py-20 text-center text-slate-500 text-sm">Loading…</div>}>
                {Animation
                  ? <Animation />
                  : <p className="text-slate-500 text-center py-20 text-sm">Animation coming soon.</p>}
              </Suspense>
            </div>
          </HeaderPanel>
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
            {pattern.algorithms.map((algo) => (
              <Link
                key={algo.id}
                to={`/algorithms/${algo.id}`}
                className="group rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] p-4 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">{algo.title}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${DIFFICULTY_COLOR[algo.difficulty]}`}>
                    {algo.difficulty}
                  </span>
                </div>
                {algo.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{algo.description}</p>
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
