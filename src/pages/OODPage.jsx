import { Suspense } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { OOD_ITEMS, OOD_COLORS, OOD_CATEGORY_LABELS } from '../constants/oodRegistry'
import { DIFFICULTY_COLOR } from '../constants/palette'
import { NAV_SECTIONS } from '../constants/sections'
import DetailPageLayout from '../components/detail/DetailPageLayout'
import DetailHero from '../components/detail/DetailHero'
import { InfoPanel, HeaderPanel, SectionLabel, NumberedList, BulletList, Badge } from '../components/detail/Panels'
import { groupByCategory } from '../lib/groupByCategory'
import { findWithNeighbors } from '../lib/findWithNeighbors'
import { lazyGlob } from '../lib/lazyGlob'

const BASE_PATH = '/ood'
const SIDEBAR_GROUPS = groupByCategory(OOD_ITEMS, OOD_CATEGORY_LABELS, BASE_PATH)

// Optional per-item animation: content/ood/<id>/Animation.jsx
const ANIMATIONS = lazyGlob(import.meta.glob('../content/ood/*/Animation.jsx'))

export default function OODPage() {
  const { id } = useParams()
  const { item, prevItem, nextItem } = findWithNeighbors(OOD_ITEMS, id)

  if (!item) return <Navigate to={BASE_PATH} replace />

  const palette = OOD_COLORS[item.color]

  return (
    <DetailPageLayout
      sidebarGroups={SIDEBAR_GROUPS}
      sidebarTitle="OOD"
      activeId={item.id}
      breadcrumb={[{ label: 'Home', to: '/' }, NAV_SECTIONS.ood, { label: item.title }]}
      prevItem={prevItem}
      nextItem={nextItem}
      basePath={BASE_PATH}
    >
      <DetailHero
        title={item.title}
        tagline={item.tagline}
        description={item.description}
        palette={palette}
        badges={
          <>
            <Badge className={`${palette.badgeBg} ${palette.badgeBorder} ${palette.text}`}>
              {OOD_CATEGORY_LABELS[item.category]}
            </Badge>
            {item.difficulty && (
              <Badge className={DIFFICULTY_COLOR[item.difficulty]}>{item.difficulty}</Badge>
            )}
          </>
        }
      />

      {item.type === 'pattern'
        ? <PatternDetail item={item} palette={palette} />
        : <QuestionDetail item={item} palette={palette} />}
    </DetailPageLayout>
  )
}

// ── Design pattern ────────────────────────────────────────────────────────────

function PatternDetail({ item, palette }) {
  const Animation = ANIMATIONS[`../content/ood/${item.id}/Animation.jsx`]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-5">
          <InfoPanel title="How it works">
            <NumberedList items={item.howItWorks} palette={palette} />
          </InfoPanel>
          <InfoPanel title="When to use">
            <BulletList items={item.whenToUse} markerClassName={palette.text} />
          </InfoPanel>
          <InfoPanel title="Real-world analogies">
            <BulletList items={item.realWorldExamples} marker="→" markerClassName="text-slate-600" />
          </InfoPanel>
        </div>

        {/* Animation on the right when there is one; otherwise the participants go there */}
        <div className="lg:sticky lg:top-20 space-y-5">
          {Animation ? (
            <HeaderPanel title="Interactive diagram" palette={palette} pulse>
              <div className="p-4">
                <Suspense fallback={<div className="py-16 text-center text-slate-500 text-sm">Loading…</div>}>
                  <Animation />
                </Suspense>
              </div>
            </HeaderPanel>
          ) : (
            <NamedEntriesPanel title="Participants" entries={item.participants} palette={palette} />
          )}
        </div>
      </div>

      {Animation && <NamedEntriesPanel title="Participants" entries={item.participants} palette={palette} />}

      {item.leetcodeProblems?.length > 0 && <RelatedProblems problems={item.leetcodeProblems} />}
    </div>
  )
}

function RelatedProblems({ problems }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <SectionLabel className="text-slate-500 shrink-0">Related problems</SectionLabel>
        <div className="flex-1 h-px bg-white/8" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {problems.map((problem) => (
          <a
            key={problem.id}
            href={`https://leetcode.com/problems/${problem.title.toLowerCase().replace(/\s+/g, '-')}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] p-4 transition-all space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-white">{problem.title}</h3>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${DIFFICULTY_COLOR[problem.difficulty]}`}>
                {problem.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-600 group-hover:text-blue-400 transition-colors">
              LeetCode #{problem.id}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ── Interview question ────────────────────────────────────────────────────────

function QuestionDetail({ item, palette }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="space-y-5">
        <InfoPanel title="Requirements">
          <NumberedList items={item.requirements} palette={palette} />
        </InfoPanel>
        <InfoPanel title="Hints">
          <BulletList items={item.hints} marker="💡" markerClassName={palette.text} />
        </InfoPanel>
        <InfoPanel title="Patterns applied">
          <div className="flex flex-wrap gap-2">
            {item.patternsUsed.map((pattern) => (
              <span key={pattern} className={`rounded-full px-3 py-1 text-xs font-medium border ${palette.badgeBg} ${palette.badgeBorder} ${palette.text}`}>
                {pattern}
              </span>
            ))}
          </div>
        </InfoPanel>
      </div>

      <div className="lg:sticky lg:top-20">
        <NamedEntriesPanel title="Key Classes" entries={item.keyClasses} palette={palette} />
      </div>
    </div>
  )
}

// ── Shared ────────────────────────────────────────────────────────────────────

// List of `{ name | role, desc }` entries — pattern participants or key classes.
function NamedEntriesPanel({ title, entries, palette }) {
  return (
    <HeaderPanel title={title} palette={palette}>
      <div className="p-5 space-y-4">
        {entries.map((entry) => {
          const name = entry.name ?? entry.role
          return (
            <div key={name} className="space-y-0.5">
              <p className={`text-sm font-semibold font-mono ${palette.text}`}>{name}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{entry.desc}</p>
            </div>
          )
        })}
      </div>
    </HeaderPanel>
  )
}
