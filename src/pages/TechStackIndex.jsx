import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TECH_STACK_ITEMS, TECH_STACK_COLORS, TECH_STACK_CATEGORY_LABELS } from '../constants/techStackRegistry'
import { NAV_SECTIONS } from '../constants/sections'
import Breadcrumb from '../components/layout/Breadcrumb'

const CATEGORY_ORDER = ['frontend', 'backend', 'database', 'devops', 'tooling']

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } },
}

function TechCard({ item }) {
  const c = TECH_STACK_COLORS[item.color]
  return (
    <motion.div variants={cardVariants}>
      <Link
        to={`/tech-stack/${item.id}`}
        className={`group flex flex-col gap-2 rounded-xl border ${c.border} bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-4 h-full`}
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${c.dot}`} />
          <h3 className="text-sm font-semibold text-white">{item.title}</h3>
        </div>
        <p className={`text-xs font-medium ${c.text}`}>{item.tagline}</p>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.description}</p>
      </Link>
    </motion.div>
  )
}

function CategorySection({ category, items }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
          {TECH_STACK_CATEGORY_LABELS[category] ?? category}
        </h2>
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-[10px] rounded-full px-2 py-0.5 font-medium bg-white/[0.06] text-slate-500">
          {items.length}
        </span>
      </div>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((item) => <TechCard key={item.id} item={item} />)}
      </motion.div>
    </div>
  )
}

export default function TechStackIndex() {
  const byCategory = useMemo(() => {
    const map = new Map()
    TECH_STACK_ITEMS.forEach((item) => {
      if (!map.has(item.category)) map.set(item.category, [])
      map.get(item.category).push(item)
    })
    return map
  }, [])

  const categories = CATEGORY_ORDER.filter((cat) => byCategory.has(cat))

  return (
    <div className="space-y-8">
      <Breadcrumb trail={[
        { label: 'Home', to: '/' },
        { label: NAV_SECTIONS.techStack.label },
      ]} />

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Tech Stack</h1>
        <p className="mt-2 text-slate-400 max-w-2xl">
          {TECH_STACK_ITEMS.length} tools and technologies, grouped by where they sit in the stack — with the
          inferences and gotchas learned from actually using each one. Add a new entry any time you pick
          something new up.
        </p>
      </div>

      <div className="space-y-8">
        {categories.map((cat) => (
          <CategorySection key={cat} category={cat} items={byCategory.get(cat)} />
        ))}
      </div>
    </div>
  )
}
