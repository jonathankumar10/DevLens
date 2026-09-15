import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ALGORITHMS } from '../constants/algorithmRegistry'
import { PATTERNS } from '../constants/patternsRegistry'
import { OOD_PATTERNS, OOD_QUESTIONS } from '../constants/oodRegistry'
import { AI_ITEMS } from '../constants/aiRegistry'
import { SYSTEM_DESIGN } from '../constants/systemDesignRegistry'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } },
}

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Pick a topic',
    body: 'Algorithms, patterns, system design, OOD, or AI — whatever I\'m working through at the moment, organized as I go.',
  },
  {
    step: '02',
    title: 'Build intuition',
    body: 'Interactive visualizations step by step, because I retain things better by watching them run than by reading about them.',
  },
  {
    step: '03',
    title: 'Write it down properly',
    body: 'Trade-offs, edge cases, the "why" behind each decision — the parts I\'d otherwise forget I ever understood.',
  },
]

export default function Home() {
  const SECTIONS = [
    {
      title: 'DSA',
      path: '/algorithms',
      count: `${ALGORITHMS.length} visualizers · ${PATTERNS.length} patterns`,
      description: 'Watch every algorithm execute frame by frame, then work through the recurring patterns — arrays, hash maps, stacks — that come up again and again.',
      dot: 'bg-blue-400',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
    },
    {
      title: 'System Design',
      path: '/system-design',
      count: `${SYSTEM_DESIGN.length} topics`,
      description: 'CDNs, databases, load balancers, consistent hashing — understand every building block before the design round.',
      dot: 'bg-violet-400',
      text: 'text-violet-400',
      border: 'border-violet-500/20',
    },
    {
      title: 'OOD',
      path: '/ood',
      count: `${OOD_PATTERNS.length} patterns · ${OOD_QUESTIONS.length} questions`,
      description: 'GoF design patterns with interactive diagrams, plus full OOD walkthroughs for parking lots, elevators, and more.',
      dot: 'bg-rose-400',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
    },
    {
      title: 'AI',
      path: '/ai',
      count: `${AI_ITEMS.length} topics`,
      description: 'From neural networks and transformers to RAG and prompt engineering — the AI fundamentals every engineer needs today.',
      dot: 'bg-amber-400',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
    },
  ]

  return (
    <div className="space-y-24 pb-12">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative pt-14 pb-2 text-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage: 'radial-gradient(rgba(59,130,246,0.10) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', filter: 'blur(48px)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300 mb-6"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          DSA · System Design · OOD · AI
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.07 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-5"
        >
          Everything I'm{' '}
          <span className="bg-gradient-to-r from-white via-blue-300 to-blue-500 bg-clip-text text-transparent">
           learning
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.14 }}
          className="mx-auto max-w-lg text-lg text-slate-400 leading-relaxed mb-8"
        >
          A running, visualized notebook of the software engineering concepts
          I've worked through — kept here so I don't have to relearn them twice.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-center gap-3 flex-wrap"
        >
          <Link to="/algorithms"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors shadow-lg shadow-blue-500/20">
            Start with Algorithms <ArrowIcon />
          </Link>
          <Link to="/ai"
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 px-6 py-2.5 text-sm font-medium text-violet-300 hover:text-violet-200 transition-colors">
            Explore AI <ArrowIcon />
          </Link>
        </motion.div>
      </section>

      {/* ── Five sections ─────────────────────────────────────────────────────── */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-10 text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white">What I've covered so far</h2>
          <p className="mt-2 text-slate-400 text-sm max-w-md mx-auto">
            Four areas I'm building out as I learn — DSA, system design, OOD, and AI.
          </p>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SECTIONS.map((s) => (
            <motion.div key={s.title} variants={cardVariant}>
              <Link
                to={s.path}
                className={`group block rounded-2xl border ${s.border} bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200 overflow-hidden h-full`}
              >
                <div className={`h-1 w-full ${s.dot}`} />
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-white">{s.title}</h3>
                    <span className={`shrink-0 text-[11px] font-mono ${s.text} opacity-60 mt-0.5`}>{s.count}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.description}</p>
                  <div className={`flex items-center gap-1.5 text-xs font-semibold ${s.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    Explore <ArrowIcon />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-10 text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white">How I'm building this</h2>
          <p className="mt-2 text-slate-400 text-sm">
            Less a reference doc, more a lab notebook — built to help the ideas actually stick.
          </p>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid gap-4 grid-cols-1 sm:grid-cols-3"
        >
          {HOW_IT_WORKS.map((s) => (
            <motion.div
              key={s.step}
              variants={cardVariant}
              className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 space-y-3"
            >
              <span className="block text-4xl font-black text-white/8 font-mono leading-none">{s.step}</span>
              <h3 className="font-semibold text-white">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Coming soon ───────────────────────────────────────────────────────── */}
      <section>
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <p className="text-sm font-semibold text-white">More coming soon</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Frontend and Backend internals are on the roadmap — browser rendering, JS engine, databases, and more.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {['Frontend', 'Backend'].map((label) => (
              <span key={label} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-500">
                {label} <span className="text-slate-700 ml-1">soon</span>
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
