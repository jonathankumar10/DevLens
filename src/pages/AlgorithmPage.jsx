import React, { Suspense, useState, useCallback } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ALGORITHMS, DIFFICULTY_COLOR, CATEGORY_LABELS } from '../constants/algorithmRegistry'
import { NAV_SECTIONS } from '../constants/sections'
import CodePanel from '../components/ui/CodePanel'
import DetailSidebar from '../components/layout/DetailSidebar'
import Breadcrumb from '../components/layout/Breadcrumb'
import { groupByCategoryAndDifficulty } from '../lib/groupByCategory'

const SIDEBAR_GROUPS = groupByCategoryAndDifficulty(ALGORITHMS, CATEGORY_LABELS, '/algorithms')

// Vite resolves this glob at build time — no manual imports ever needed.
// To add a new visualizer: drop Visualizer.jsx in its algorithm folder. Done.
const VISUALIZERS = import.meta.glob('../content/algorithms/*/Visualizer.jsx')

// Lazy components must be created once, at module scope — not during render.
const LAZY_VISUALIZERS = Object.fromEntries(
  Object.entries(VISUALIZERS).map(([key, loader]) => [key, React.lazy(loader)])
)

export default function AlgorithmPage() {
  const { id } = useParams()
  const algo = ALGORITHMS.find((a) => a.id === id)

  const [currentStep, setCurrentStep] = useState(null)
  const [treeOrder,   setTreeOrder]   = useState('inorder')

  const handleStep  = useCallback((s) => setCurrentStep(s), [])
  const handleOrder = useCallback((o) => setTreeOrder(o),   [])

  const VisualizerComponent = LAZY_VISUALIZERS[`../content/algorithms/${id}/Visualizer.jsx`] ?? null

  if (!algo) return <Navigate to="/algorithms" replace />

  // tree-traversal keeps its code panel tab in sync with the order selector
  const syncedApproachId = algo.id === 'tree-traversal' ? treeOrder : undefined

  return (
    <div className="lg:flex lg:items-start lg:gap-8">
      <DetailSidebar groups={SIDEBAR_GROUPS} activeId={algo.id} title="Algorithms" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex-1 min-w-0 space-y-6"
      >
      <Breadcrumb trail={[
        { label: 'Home', to: '/' },
        NAV_SECTIONS.dsa,
        { label: 'Algorithms', to: '/algorithms' },
        { label: algo.title },
      ]} />

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
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Problem</p>
            <p className="text-sm text-slate-300 leading-relaxed">{algo.description}</p>
          </div>
        )}

        {/* Metaphor bridge */}
        {algo.metaphor && (
          <div className="flex gap-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.05] px-5 py-4">
            <div className="mt-0.5 w-0.5 shrink-0 self-stretch rounded-full bg-blue-500/50" />
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                How we visualize it
              </p>
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
            {VisualizerComponent
              ? <VisualizerComponent onStepChange={handleStep} onOrderChange={handleOrder} />
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
      </motion.div>
    </div>
  )
}
