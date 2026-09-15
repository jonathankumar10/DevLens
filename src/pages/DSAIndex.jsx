import { lazy, Suspense } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const AlgorithmsIndex = lazy(() => import('./AlgorithmsIndex'))
const PatternsIndex   = lazy(() => import('./PatternsIndex'))

const TABS = [
  { label: 'Algorithms', to: '/algorithms' },
  { label: 'Patterns',   to: '/patterns' },
]

export default function DSAIndex() {
  const { pathname } = useLocation()
  const activeTo = pathname.startsWith('/patterns') ? '/patterns' : '/algorithms'

  return (
    <div className="space-y-8">
      <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
        {TABS.map(({ label, to }) => {
          const active = activeTo === to
          return (
            <Link
              key={to}
              to={to}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                active ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="dsa-tab-pill"
                  className="absolute inset-0 rounded-lg bg-white/10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative">{label}</span>
            </Link>
          )
        })}
      </div>

      <Suspense fallback={<div className="py-20 text-center text-slate-500 text-sm">Loading…</div>}>
        {activeTo === '/patterns' ? <PatternsIndex /> : <AlgorithmsIndex />}
      </Suspense>
    </div>
  )
}
