import { Suspense, use } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TYPE_COLOR, TYPE_LABEL, loadSystemDesignItem } from '../constants/systemDesignRegistry'
import { ROADMAP_ITEMS, ROADMAP_SIDEBAR_GROUPS, WHY_BY_ID } from '../constants/systemDesignRoadmap'
import { NAV_SECTIONS } from '../constants/sections'
import MockInterview from '../components/system-design/MockInterview'
import { WhyItExists } from '../components/system-design/sections/WhyItExists'
import { RequirementsSection } from '../components/system-design/sections/Requirements'
import { DataModelSection } from '../components/system-design/sections/DataModel'
import { ApiDesignSection } from '../components/system-design/sections/ApiDesign'
import { HldSection } from '../components/system-design/sections/Hld'
import { DeepDiveSection } from '../components/system-design/sections/DeepDive'
import { LevelExpectationsSection } from '../components/system-design/sections/LevelExpectations'
import { ComponentCard } from '../components/system-design/sections/ComponentCard'
import DetailPageLayout from '../components/detail/DetailPageLayout'
import DetailLoading from '../components/detail/DetailLoading'
import { findWithNeighbors } from '../lib/findWithNeighbors'
import { lazyGlob } from '../lib/lazyGlob'
import { lazySimulators } from '../lib/lazySimulators'
import { SectionLabel } from '../components/detail/Panels'

// Optional per-item visuals: content/system-design/<concepts|designs>/<id>/{Diagram,ConceptIllustration}.jsx
const DIAGRAMS              = lazyGlob(import.meta.glob('../content/system-design/**/Diagram.jsx'))
const CONCEPT_ILLUSTRATIONS = lazyGlob(import.meta.glob('../content/system-design/**/ConceptIllustration.jsx'))
const SIMULATORS            = lazySimulators(import.meta.glob('../content/system-design/**/scenario.js'))

export default function SystemDesignPage() {
  const { id } = useParams()
  const { item, prevItem, nextItem } = findWithNeighbors(ROADMAP_ITEMS, id)

  if (!item) return <Navigate to="/system-design" replace />

  return (
    <DetailPageLayout
      sidebarGroups={ROADMAP_SIDEBAR_GROUPS}
      sidebarTitle="System Design"
      activeId={item.id}
      breadcrumb={[
        { label: 'Home', to: '/' },
        NAV_SECTIONS.systemDesign,
        { label: TYPE_LABEL[item.type], to: '/system-design' },
        { label: item.title },
      ]}
      prevItem={prevItem}
      nextItem={nextItem}
    >
      <Suspense fallback={<DetailLoading />}>
        <SystemDesignDetail meta={item} />
      </Suspense>
    </DetailPageLayout>
  )
}

// The registry holds metadata only; the item's full content (index.js) is
// loaded on demand, so this renders once it arrives while the sidebar and
// breadcrumb render immediately.
function SystemDesignDetail({ meta }) {
  const item = use(loadSystemDesignItem(meta))

  const folder = `../content/system-design/${item.type}s/${item.id}`
  const ConceptIllustration = CONCEPT_ILLUSTRATIONS[`${folder}/ConceptIllustration.jsx`]
  const Diagram             = DIAGRAMS[`${folder}/Diagram.jsx`]
  const Simulator           = SIMULATORS[`${folder}/scenario.js`]

  return (
    <>
      {/* Title + type badge */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{item.title}</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${TYPE_COLOR[item.type]}`}>
          {TYPE_LABEL[item.type]}
        </span>
      </div>

      {/* Why this exists — where the item sits in the roadmap */}
      <WhyItExists why={WHY_BY_ID[item.id]} />

      {Simulator && (
        <a
          href="#live-simulator"
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-blue-400/30 bg-blue-400/[0.07] px-3 py-1.5 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-400/15"
        >
          Try the live simulator <span aria-hidden="true">↓</span>
        </a>
      )}

      {/* Hero row: Overview + Mental Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {item.description && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4 space-y-1.5">
            <SectionLabel>Overview</SectionLabel>
            <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
          </div>
        )}
        {item.metaphor && (
          <div className="flex gap-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.05] px-5 py-4">
            <div className="mt-0.5 w-0.5 shrink-0 self-stretch rounded-full bg-blue-500/50" />
            <div className="space-y-1">
              <SectionLabel className="text-blue-400">Mental model</SectionLabel>
              <p className="text-sm text-slate-300 leading-relaxed">{item.metaphor}</p>
            </div>
          </div>
        )}
      </div>

      {/* Concept illustration */}
      {ConceptIllustration && (
        <Suspense fallback={null}>
          <ConceptIllustration />
        </Suspense>
      )}

      {/* Requirements */}
      {item.requirements && <RequirementsSection requirements={item.requirements} />}

      {/* Data Model */}
      {item.dataModel?.length > 0 && <DataModelSection dataModel={item.dataModel} />}

      {/* API Design */}
      {item.apiDesign?.length > 0 && <ApiDesignSection apiDesign={item.apiDesign} />}

      {/* High Level Design */}
      {item.hldFlows?.length > 0 && <HldSection hldFlows={item.hldFlows} />}

      {/* Diagram */}
      {Diagram && (
        <>
          <div className="flex items-center gap-3 px-1">
            <SectionLabel>Interactive Walkthrough</SectionLabel>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:p-5">
            <Suspense fallback={
              <div className="py-20 text-center text-slate-500 text-sm">Loading diagram…</div>
            }>
              <Diagram />
            </Suspense>
          </div>
        </>
      )}

      {/* Live simulator */}
      {Simulator && (
        <div id="live-simulator" className="scroll-mt-20">
          <Suspense fallback={<div className="min-h-[600px] rounded-2xl border border-white/10 bg-white/[0.02]" />}>
            <Simulator />
          </Suspense>
        </div>
      )}

      {/* How it works */}
      {item.howItWorks?.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4 space-y-4">
          <SectionLabel>How it works</SectionLabel>
          <ol className="space-y-3">
            {item.howItWorks.map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="flex items-start gap-3 text-sm text-slate-300"
              >
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-[10px] text-blue-400 font-bold leading-none">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </motion.li>
            ))}
          </ol>
        </div>
      )}

      {/* Deep Dive Q&A */}
      {item.deepDive?.length > 0 && <DeepDiveSection items={item.deepDive} />}

      {/* Level expectations */}
      {item.levelExpectations?.length > 0 && <LevelExpectationsSection rows={item.levelExpectations} />}

      {/* Components */}
      {item.components?.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 px-1">
            <SectionLabel>Components</SectionLabel>
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[10px] text-slate-600">{item.components.length} components</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {item.components.map((comp, i) => (
              <ComponentCard key={comp.id} comp={comp} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Key takeaways */}
      {item.keyPoints?.length > 0 && (
        <div className="space-y-3">
          <SectionLabel className="text-slate-500 px-1">Key takeaways</SectionLabel>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {item.keyPoints.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                className="flex items-start gap-2.5 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3"
              >
                <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-[9px] text-blue-400 font-bold">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-300 leading-relaxed">{point}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Mock interview */}
      {item.type === 'design' && item.interviewEnabled && <MockInterview design={item} />}

      {/* Tags */}
      {item.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/5 border border-white/10 px-2.5 py-1 text-xs text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </>
  )
}
