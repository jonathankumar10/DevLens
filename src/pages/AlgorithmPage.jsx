import { Suspense, useState, useCallback } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { ALGORITHMS, DIFFICULTY_COLOR, CATEGORY_LABELS } from '../constants/algorithmRegistry'
import { NAV_SECTIONS } from '../constants/sections'
import CodePanel from '../components/ui/CodePanel'
import DetailPageLayout from '../components/detail/DetailPageLayout'
import { SectionLabel } from '../components/detail/Panels'
import { groupByCategoryAndDifficulty } from '../lib/groupByCategory'
import { lazyGlob } from '../lib/lazyGlob'

const SIDEBAR_GROUPS = groupByCategoryAndDifficulty(ALGORITHMS, CATEGORY_LABELS, '/algorithms')

// Vite resolves this glob at build time, so adding a visualizer is just
// dropping Visualizer.jsx into its algorithm folder.
const VISUALIZERS = lazyGlob(import.meta.glob('../content/algorithms/*/Visualizer.jsx'))

export default function AlgorithmPage() {
  const { id } = useParams()
  const algo = ALGORITHMS.find((a) => a.id === id)

  const [currentStep, setCurrentStep] = useState(null)
  const [treeOrder,   setTreeOrder]   = useState('inorder')

  const handleStep  = useCallback((step)  => setCurrentStep(step), [])
  const handleOrder = useCallback((order) => setTreeOrder(order),  [])

  if (!algo) return <Navigate to="/algorithms" replace />

  const Visualizer = VISUALIZERS[`../content/algorithms/${id}/Visualizer.jsx`]

  // tree-traversal keeps its code panel tab in sync with the order selector
  const syncedApproachId = algo.id === 'tree-traversal' ? treeOrder : undefined

  return (
    <DetailPageLayout
      sidebarGroups={SIDEBAR_GROUPS}
      sidebarTitle="Algorithms"
      activeId={algo.id}
      breadcrumb={[
        { label: 'Home', to: '/' },
        NAV_SECTIONS.dsa,
        { label: 'Algorithms', to: '/algorithms' },
        { label: algo.title },
      ]}
      contentClassName="space-y-6"
    >
      {/* Title + badges */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white">{algo.title}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${DIFFICULTY_COLOR[algo.difficulty]}`}>
            {algo.difficulty}
          </span>
          <span className="rounded-md bg-blue-500/15 px-3 py-1 text-xs text-blue-300">
            {algo.pattern}
          </span>
          {algo.problemUrl && (
            <a
              href={algo.problemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 hover:text-white hover:border-white/25 hover:bg-white/10 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              {algo.problemLabel}
            </a>
          )}
        </div>
      </div>

      {/* Problem statement + metaphor bridge */}
      <div className="space-y-3">
        {/* Problem statement */}
        {algo.description && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4 space-y-1.5">
            <SectionLabel>Problem</SectionLabel>
            <p className="text-sm text-slate-300 leading-relaxed">{algo.description}</p>
          </div>
        )}

        {/* Metaphor bridge */}
        {algo.metaphor && (
          <div className="flex gap-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.05] px-5 py-4">
            <div className="mt-0.5 w-0.5 shrink-0 self-stretch rounded-full bg-blue-500/50" />
            <div className="space-y-1">
              <SectionLabel className="text-blue-400">How we visualize it</SectionLabel>
              <p className="text-sm text-slate-300 leading-relaxed">{algo.metaphor}</p>
            </div>
          </div>
        )}
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Left — Visualizer */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:p-5">
          <Suspense fallback={
            <div className="py-20 text-center text-slate-500 text-sm">Loading visualizer…</div>
          }>
            {Visualizer
              ? <Visualizer onStepChange={handleStep} onOrderChange={handleOrder} />
              : <p className="text-slate-500 text-center py-10">Visualizer coming soon.</p>
            }
          </Suspense>
        </div>

        {/* Right — Code */}
        {algo.solution && (
          <div className="lg:sticky lg:top-20">
            <CodePanel
              solution={algo.solution}
              step={currentStep}
              syncedApproachId={syncedApproachId}
            />
          </div>
        )}
      </div>
    </DetailPageLayout>
  )
}
