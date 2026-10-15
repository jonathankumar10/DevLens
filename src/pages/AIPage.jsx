import { Suspense } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { AI_ITEMS, AI_COLORS, AI_CATEGORY_LABELS, LIVE_CODING_AI_GUIDE } from '../constants/aiRegistry'
import { NAV_SECTIONS } from '../constants/sections'
import DetailPageLayout from '../components/detail/DetailPageLayout'
import DetailHero from '../components/detail/DetailHero'
import { InfoPanel, HeaderPanel, SectionLabel, NumberedList, BulletList, Badge } from '../components/detail/Panels'
import { groupByCategory } from '../lib/groupByCategory'
import { findWithNeighbors } from '../lib/findWithNeighbors'
import { lazyGlob } from '../lib/lazyGlob'

const BASE_PATH = '/ai'
const SIDEBAR_GROUPS = groupByCategory(AI_ITEMS, AI_CATEGORY_LABELS, BASE_PATH)

// Optional per-topic animation: content/ai/<id>/Animation.jsx
const ANIMATIONS = lazyGlob(import.meta.glob('../content/ai/*/Animation.jsx'))

const AI_TOOLS_GUIDE_SECTIONS = [
  { key: 'claudeMd',  label: 'Creating CLAUDE.md' },
  { key: 'planMode',  label: 'Using Plan Mode' },
  { key: 'prompting', label: 'Prompting Effectively' },
]

export default function AIPage() {
  const { id } = useParams()
  const { item, prevItem, nextItem } = findWithNeighbors(AI_ITEMS, id)

  if (!item) return <Navigate to={BASE_PATH} replace />

  const palette = AI_COLORS[item.color]

  return (
    <DetailPageLayout
      sidebarGroups={SIDEBAR_GROUPS}
      sidebarTitle="AI"
      activeId={item.id}
      breadcrumb={[{ label: 'Home', to: '/' }, NAV_SECTIONS.ai, { label: item.title }]}
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
              {AI_CATEGORY_LABELS[item.category]}
            </Badge>
            {item.duration && (
              <Badge className="border-white/10 bg-white/[0.06] text-slate-400">{item.duration}</Badge>
            )}
          </>
        }
      />

      {item.category === 'live-coding'
        ? <LiveCodingDetail item={item} palette={palette} />
        : <ConceptDetail item={item} palette={palette} />}
    </DetailPageLayout>
  )
}

// ── Concept topic ─────────────────────────────────────────────────────────────

function ConceptDetail({ item, palette }) {
  const Animation = ANIMATIONS[`../content/ai/${item.id}/Animation.jsx`]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-5">
          <InfoPanel title="How it works">
            <NumberedList items={item.howItWorks} palette={palette} />
          </InfoPanel>
          <InfoPanel title="Interview angles">
            <BulletList items={item.interviewAngles} marker="?" markerClassName={`font-bold ${palette.text}`} />
          </InfoPanel>
        </div>

        {/* Animation on the right when there is one; otherwise the key takeaways go there */}
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
            <KeyTakeawaysPanel item={item} palette={palette} />
          )}
        </div>
      </div>

      {Animation && <KeyTakeawaysPanel item={item} palette={palette} />}
    </div>
  )
}

function KeyTakeawaysPanel({ item, palette }) {
  return (
    <HeaderPanel title="Key takeaways" palette={palette}>
      <div className="p-5">
        <BulletList items={item.keyPoints} markerClassName={palette.text} />
      </div>
    </HeaderPanel>
  )
}

// ── Live-coding interview ─────────────────────────────────────────────────────

function LiveCodingDetail({ item, palette }) {
  const boldMarker = `font-bold ${palette.text}`

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-5">
          <InfoPanel title="Core requirements">
            <NumberedList items={item.core} palette={palette} />
          </InfoPanel>
          <InfoPanel title="Bonus features">
            <BulletList items={item.bonus} marker="+" markerClassName={boldMarker} />
          </InfoPanel>
        </div>
        <div className="lg:sticky lg:top-20 space-y-5">
          <InfoPanel title="Skills tested">
            <BulletList items={item.skillsTested} markerClassName={palette.text} />
          </InfoPanel>
          <InfoPanel title="Interview angles">
            <BulletList items={item.interviewAngles} marker="?" markerClassName={boldMarker} />
          </InfoPanel>
        </div>
      </div>

      {item.interviewApproach && (
        <InfoPanel title="How to run this interview">
          <NumberedList items={item.interviewApproach} palette={palette} />
        </InfoPanel>
      )}

      {(item.clarifyingQuestions || item.claudeWorkflow) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {item.clarifyingQuestions && (
            <InfoPanel title="Clarifying questions to ask">
              <BulletList items={item.clarifyingQuestions} marker="→" markerClassName={boldMarker} />
            </InfoPanel>
          )}
          {item.claudeWorkflow && (
            <InfoPanel title="Claude workflow">
              <BulletList items={item.claudeWorkflow} marker="⌘" markerClassName={boldMarker} />
            </InfoPanel>
          )}
        </div>
      )}

      {item.claudeMdContent && (
        <HeaderPanel
          title="Starter CLAUDE.md"
          palette={palette}
          aside={<p className="text-[10px] text-slate-500">Drop in project root before prompting Claude</p>}
        >
          <div className="overflow-auto max-h-96 scrollbar-thin">
            <pre className="p-5 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre">{item.claudeMdContent}</pre>
          </div>
        </HeaderPanel>
      )}

      <HeaderPanel title="AI tooling playbook" palette={palette} pulse>
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          {AI_TOOLS_GUIDE_SECTIONS.map(({ key, label }) => (
            <div key={key} className="p-5 space-y-3">
              <SectionLabel>{label}</SectionLabel>
              <BulletList items={LIVE_CODING_AI_GUIDE[key]} markerClassName={palette.text} />
            </div>
          ))}
        </div>
      </HeaderPanel>
    </div>
  )
}
