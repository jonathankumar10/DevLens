import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { OOD_PATTERNS, OOD_QUESTIONS } from '../constants/oodRegistry'
import { NAV_SECTIONS } from '../constants/sections'
import Breadcrumb from '../components/layout/Breadcrumb'

// ── SVG animations (one per pattern) ─────────────────────────────────────────

function SvgSingleton({ c }) {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
      <circle cx="20" cy="20" r="7" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1.4" />
      <motion.circle cx="20" cy="20" r="7" fill={c} fillOpacity="0"
        animate={{ r: [7, 12, 7], fillOpacity: [0.25, 0, 0.25] }}
        transition={{ duration: 2, repeat: Infinity }} />
      {[[8, 10], [32, 10]].map(([x, y], i) => (
        <g key={i} opacity="0.3">
          <circle cx={x} cy={y} r="4" stroke={c} strokeWidth="1" fill="none" />
          <line x1={x - 3} y1={y - 3} x2={x + 3} y2={y + 3} stroke={c} strokeWidth="1" />
          <line x1={x + 3} y1={y - 3} x2={x - 3} y2={y + 3} stroke={c} strokeWidth="1" />
        </g>
      ))}
      <circle cx="20" cy="20" r="2.5" fill={c} opacity="0.8" />
    </svg>
  )
}

function SvgFactoryMethod({ c }) {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
      <rect x="4" y="14" width="14" height="12" rx="2" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1.2" />
      <line x1="18" y1="17" x2="25" y2="13" stroke={c} strokeWidth="1" opacity="0.4" />
      <line x1="18" y1="23" x2="25" y2="27" stroke={c} strokeWidth="1" opacity="0.4" />
      <motion.circle cx="30" cy="13" r="4" fill={c}
        animate={{ fillOpacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
        style={{ transformOrigin: '30px 13px' }}
        transition={{ duration: 2, repeat: Infinity }} />
      <motion.rect x="26" y="23" width="8" height="8" rx="1.5" fill={c}
        animate={{ fillOpacity: [0.8, 0.2, 0.8], scale: [1.2, 0.8, 1.2] }}
        style={{ transformOrigin: '30px 27px' }}
        transition={{ duration: 2, repeat: Infinity }} />
      <line x1="7" y1="20" x2="4" y2="20" stroke={c} strokeWidth="1.2" opacity="0.4" />
    </svg>
  )
}

function SvgBuilder({ c }) {
  const layers = [
    { y: 30, opacity: 0.5 },
    { y: 21, opacity: 0.65 },
    { y: 12, opacity: 0.8 },
  ]
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
      {layers.map(({ y, opacity }, i) => (
        <motion.rect key={i} x="8" y={y} width="24" height="7" rx="1.5"
          fill={c} stroke={c} strokeWidth="1"
          animate={{ opacity: [0, opacity, opacity], y: [y - 4, y] }}
          transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 1.8, delay: i * 0.45 }} />
      ))}
    </svg>
  )
}

function SvgAdapter({ c }) {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
      <rect x="2" y="14" width="10" height="12" rx="1.5" stroke={c} strokeWidth="1.2" fill={c} fillOpacity="0.12" />
      <circle cx="33" cy="20" r="6" stroke={c} strokeWidth="1.2" fill={c} fillOpacity="0.12" />
      <rect x="14" y="16" width="14" height="8" rx="1.5" stroke={c} strokeWidth="1.2" fill={c} fillOpacity="0.08" />
      <line x1="12" y1="20" x2="14" y2="20" stroke={c} strokeWidth="1" opacity="0.4" />
      <line x1="28" y1="20" x2="27" y2="20" stroke={c} strokeWidth="1" opacity="0.4" />
      <motion.circle r="2.5" cy="20" fill={c}
        animate={{ cx: [7, 7, 21, 21, 33, 33, 7], opacity: [0, 1, 1, 1, 1, 0, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut',
          times: [0, 0.05, 0.35, 0.5, 0.75, 0.9, 1] }} />
    </svg>
  )
}

function SvgDecorator({ c }) {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
      <circle cx="20" cy="20" r="5" fill={c} fillOpacity="0.5" stroke={c} strokeWidth="1.2" />
      {[9, 13].map((r, i) => (
        <motion.circle key={r} cx="20" cy="20" r={r} stroke={c} strokeWidth="1" fill="none"
          animate={{ opacity: [0, 0.7, 0.7, 0.7], r: [5, 5, r, r] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: (i + 1) * 0.55,
            times: [0, 0.1, 0.4, 1] }} />
      ))}
      <motion.circle cx="20" cy="20" r="16" stroke={c} strokeWidth="1" fill="none"
        animate={{ opacity: [0, 0.5, 0.5, 0.5], r: [5, 5, 16, 16] }}
        transition={{ duration: 2.4, repeat: Infinity, delay: 1.65,
          times: [0, 0.1, 0.4, 1] }} />
    </svg>
  )
}

function SvgFacade({ c }) {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
      {[[22, 7], [22, 18], [22, 29]].map(([x, y], i) => (
        <motion.rect key={i} x={x} y={y} width="14" height="8" rx="1.5"
          fill={c} fillOpacity="0.1" stroke={c} strokeWidth="0.8"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.4 }} />
      ))}
      <rect x="4" y="14" width="14" height="12" rx="2" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1.3" />
      <motion.line x1="18" y1="17" x2="22" y2="11" stroke={c} strokeWidth="0.8" opacity="0.4"
        animate={{ opacity: [0.1, 0.5, 0.1] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0 }} />
      <motion.line x1="18" y1="20" x2="22" y2="22" stroke={c} strokeWidth="0.8" opacity="0.4"
        animate={{ opacity: [0.1, 0.5, 0.1] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }} />
      <motion.line x1="18" y1="23" x2="22" y2="33" stroke={c} strokeWidth="0.8" opacity="0.4"
        animate={{ opacity: [0.1, 0.5, 0.1] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.8 }} />
    </svg>
  )
}

function SvgStrategy({ c }) {
  const targetYs = [9, 20, 31]
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
      <rect x="3" y="15" width="12" height="10" rx="1.5" fill={c} fillOpacity="0.2" stroke={c} strokeWidth="1.2" />
      {targetYs.map((y, i) => (
        <rect key={i} x="24" y={y} width="13" height="7" rx="1.5"
          fill={c} fillOpacity="0.1" stroke={c} strokeWidth="0.8" opacity="0.6" />
      ))}
      <motion.line x1="15" y1="20" x2="24" y2="20"
        stroke={c} strokeWidth="1.4" strokeLinecap="round"
        animate={{ y1: [20, 20, 12.5, 12.5, 20, 20, 34.5, 34.5, 20], y2: [20, 20, 12.5, 12.5, 20, 20, 34.5, 34.5, 20] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut',
          times: [0, 0.15, 0.3, 0.45, 0.5, 0.65, 0.8, 0.95, 1] }} />
      <motion.circle r="3" cx="24" cy="20" fill={c}
        animate={{ cy: [20, 20, 12.5, 12.5, 20, 20, 34.5, 34.5, 20] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut',
          times: [0, 0.15, 0.3, 0.45, 0.5, 0.65, 0.8, 0.95, 1] }} />
    </svg>
  )
}

function SvgObserver({ c }) {
  const subs = [[8, 8], [32, 8], [20, 34]]
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
      <circle cx="20" cy="20" r="5" fill={c} fillOpacity="0.25" stroke={c} strokeWidth="1.3" />
      {subs.map(([x, y], i) => (
        <g key={i}>
          <line x1="20" y1="20" x2={x} y2={y} stroke={c} strokeWidth="0.8" opacity="0.25" />
          <circle cx={x} cy={y} r="4" fill={c} fillOpacity="0.12" stroke={c} strokeWidth="1" />
          <motion.circle cx={x} cy={y} r="4" stroke={c} strokeWidth="0.8" fill="none"
            animate={{ r: [4, 8, 4], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.35 }} />
        </g>
      ))}
      <motion.circle cx="20" cy="20" r="5" stroke={c} strokeWidth="1" fill="none"
        animate={{ r: [5, 10, 5], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }} />
    </svg>
  )
}

function SvgState({ c }) {
  const states = [[12, 10], [28, 10], [20, 28]]
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
      <line x1="12" y1="10" x2="28" y2="10" stroke={c} strokeWidth="0.8" opacity="0.3" />
      <line x1="28" y1="10" x2="20" y2="28" stroke={c} strokeWidth="0.8" opacity="0.3" />
      <line x1="20" y1="28" x2="12" y2="10" stroke={c} strokeWidth="0.8" opacity="0.3" />
      {states.map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r="5"
          fill={c} stroke={c} strokeWidth="1.2"
          animate={{ fillOpacity: [0.15, 0.7, 0.15] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.7 }} />
      ))}
    </svg>
  )
}

function SvgCommand({ c }) {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
      <rect x="2" y="10" width="22" height="20" rx="2" stroke={c} strokeWidth="1" fill={c} fillOpacity="0.05" />
      {[14, 20, 26].map((y, i) => (
        <motion.rect key={y} x="5" y={y - 3} width="16" height="5" rx="1" fill={c}
          animate={{ x: [5, 5, 24], opacity: [0.6, 0.6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.7 }} />
      ))}
      <rect x="28" y="15" width="10" height="10" rx="1.5" stroke={c} strokeWidth="1.2" fill={c} fillOpacity="0.2" />
      <motion.circle cx="33" cy="20" r="2" fill={c}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 0.5] }}
        style={{ transformOrigin: '33px 20px' }}
        transition={{ duration: 2.4, repeat: Infinity, delay: 0.6 }} />
    </svg>
  )
}

function SvgTemplateMethod({ c }) {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
      <rect x="6" y="6" width="28" height="28" rx="2" stroke={c} strokeWidth="1.2" fill={c} fillOpacity="0.04" />
      <line x1="10" y1="14" x2="30" y2="14" stroke={c} strokeWidth="1" opacity="0.3" />
      <line x1="10" y1="20" x2="30" y2="20" stroke={c} strokeWidth="1" opacity="0.3" />
      <line x1="10" y1="26" x2="30" y2="26" stroke={c} strokeWidth="1" opacity="0.3" />
      {[14, 20, 26].map((y, i) => (
        <motion.line key={y} x1="10" y1={y} x2="30" y2={y}
          stroke={c} strokeWidth="2" strokeLinecap="round"
          animate={{ opacity: [0, 0.9, 0.9, 0.3], x2: [10, 30, 30, 30] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.65,
            times: [0, 0.4, 0.8, 1] }} />
      ))}
    </svg>
  )
}

function SvgOODQuestion({ c }) {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
      {[6, 14, 22, 30].map(x => <line key={`v${x}`} x1={x} y1="6" x2={x} y2="34" stroke={c} strokeWidth="0.4" opacity="0.15" />)}
      {[6, 14, 22, 30].map(y => <line key={`h${y}`} x1="6" y1={y} x2="34" y2={y} stroke={c} strokeWidth="0.4" opacity="0.15" />)}
      <rect x="8" y="8" width="10" height="8" rx="1" stroke={c} strokeWidth="1" fill={c} fillOpacity="0.1" />
      <rect x="22" y="8" width="10" height="8" rx="1" stroke={c} strokeWidth="1" fill={c} fillOpacity="0.1" />
      <rect x="14" y="24" width="12" height="8" rx="1" stroke={c} strokeWidth="1" fill={c} fillOpacity="0.1" />
      <line x1="18" y1="16" x2="20" y2="24" stroke={c} strokeWidth="0.8" opacity="0.4" />
      <line x1="22" y1="16" x2="20" y2="24" stroke={c} strokeWidth="0.8" opacity="0.4" />
      <motion.rect x="6" y="6" width="28" height="2" rx="1" fill={c} opacity="0.5"
        animate={{ y: [6, 34, 6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />
    </svg>
  )
}

const NODE_SVG = {
  'singleton':        SvgSingleton,
  'factory-method':   SvgFactoryMethod,
  'builder':          SvgBuilder,
  'adapter':          SvgAdapter,
  'decorator':        SvgDecorator,
  'facade':           SvgFacade,
  'strategy':         SvgStrategy,
  'observer':         SvgObserver,
  'state':            SvgState,
  'command':          SvgCommand,
  'template-method':  SvgTemplateMethod,
}

// ── Stage definitions ─────────────────────────────────────────────────────────

const STAGES = [
  {
    id: 'creational',
    label: 'Creational',
    description: 'Patterns that control how objects are created — keeping construction logic flexible and decoupled from the rest of your code.',
    hex: '#8b5cf6',
    text: 'text-violet-400',
    badge: 'bg-violet-500/15 text-violet-300',
    borderStyle: 'border-violet-500/30',
    bgStyle: 'bg-violet-500/[0.05]',
    ids: ['singleton', 'factory-method', 'builder'],
  },
  {
    id: 'structural',
    label: 'Structural',
    description: 'Patterns that compose classes and objects into larger structures without locking in rigid hierarchies.',
    hex: '#14b8a6',
    text: 'text-teal-400',
    badge: 'bg-teal-500/15 text-teal-300',
    borderStyle: 'border-teal-500/30',
    bgStyle: 'bg-teal-500/[0.05]',
    ids: ['adapter', 'decorator', 'facade'],
  },
  {
    id: 'behavioral',
    label: 'Behavioral',
    description: 'Patterns that define how objects communicate and delegate responsibility at runtime.',
    hex: '#f43f5e',
    text: 'text-rose-400',
    badge: 'bg-rose-500/15 text-rose-300',
    borderStyle: 'border-rose-500/30',
    bgStyle: 'bg-rose-500/[0.05]',
    ids: ['strategy', 'observer', 'state', 'command', 'template-method'],
  },
]

const QUESTION_HEX = '#6366f1'

// ── Shared sub-components ─────────────────────────────────────────────────────

function StageConnector({ fromHex, toHex }) {
  return (
    <div className="flex justify-center my-1">
      <svg width="24" height="40" viewBox="0 0 24 40" fill="none">
        <motion.line x1="12" y1="0" x2="12" y2="28"
          stroke={fromHex} strokeWidth="1.5" strokeDasharray="4 3"
          animate={{ strokeDashoffset: [0, -14] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }} />
        <motion.polyline points="5,22 12,32 19,22"
          stroke={toHex} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }} />
      </svg>
    </div>
  )
}

const nodeContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const nodeVariants = {
  hidden: { opacity: 0, scale: 0.75, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } },
}

function ConceptNode({ item, stage }) {
  const SvgComp = NODE_SVG[item.id]
  return (
    <motion.div variants={nodeVariants} className="flex flex-col items-center gap-2">
      <motion.div
        whileHover={{ y: -5, scale: 1.1 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      >
        <Link
          to={`/ood/${item.id}`}
          className="flex items-center justify-center w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-2xl border bg-white/[0.03] hover:bg-white/[0.07] transition-colors"
          style={{ borderColor: `${stage.hex}55` }}
        >
          {SvgComp && <SvgComp c={stage.hex} />}
        </Link>
      </motion.div>
      <span className="text-[10px] font-medium text-slate-500 text-center leading-tight w-20 line-clamp-2">
        {item.title}
      </span>
    </motion.div>
  )
}

function StageSection({ stage, items, stageIndex }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: { opacity: 0, y: 28 },
        show: { opacity: 1, y: 0, transition: { duration: 0.35, staggerChildren: 0.07, delayChildren: 0.1 } },
      }}
      className="rounded-2xl border px-5 py-5 sm:px-6 sm:py-6"
      style={{ borderColor: `${stage.hex}33`, background: `${stage.hex}08` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-[10px] font-black font-mono tracking-widest ${stage.text} opacity-35`}>
          {String(stageIndex + 1).padStart(2, '0')}
        </span>
        <h2 className={`text-xs font-bold uppercase tracking-[0.16em] ${stage.text}`}>{stage.label}</h2>
        <div className="flex-1 h-px" style={{ background: `${stage.hex}22` }} />
        <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${stage.badge}`}>
          {items.length} pattern{items.length !== 1 ? 's' : ''}
        </span>
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed mb-5 max-w-lg">{stage.description}</p>
      <motion.div variants={nodeContainerVariants} className="flex flex-wrap justify-center gap-3 sm:gap-5">
        {items.map((item) => (
          <ConceptNode key={item.id} item={item} stage={stage} />
        ))}
      </motion.div>
    </motion.div>
  )
}

function QuestionNode({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
      whileHover={{ y: -4 }}
    >
      <Link
        to={`/ood/${item.id}`}
        className="group flex items-center gap-3 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.06] hover:bg-indigo-500/[0.11] hover:border-indigo-500/45 p-3.5 transition-colors h-full"
      >
        <div className="w-10 h-10 rounded-xl border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center shrink-0">
          <SvgOODQuestion c={QUESTION_HEX} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white leading-snug group-hover:text-indigo-200 transition-colors">
            {item.title}
          </p>
          {item.tagline && (
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-1">{item.tagline}</p>
          )}
          <span className={`inline-block mt-1 text-[10px] rounded-full px-2 py-0.5 font-medium ${
            item.difficulty === 'Easy' ? 'bg-emerald-500/15 text-emerald-300' :
            item.difficulty === 'Hard' ? 'bg-rose-500/15 text-rose-300' :
            'bg-amber-500/15 text-amber-300'
          }`}>
            {item.difficulty}
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

function QuestionsTier({ questions }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-indigo-500/30 px-5 py-5 sm:px-6 sm:py-6"
      style={{ background: `${QUESTION_HEX}08` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[10px] font-black font-mono tracking-widest text-indigo-400 opacity-35">04</span>
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-400">Interview Questions</h2>
        <div className="flex-1 h-px bg-indigo-500/20" />
        <span className="text-[10px] rounded-full px-2 py-0.5 font-medium bg-indigo-500/15 text-indigo-300">
          {questions.length} questions
        </span>
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed mb-5 max-w-lg">
        Apply what you know — model real-world systems from scratch using the patterns above. These are the OOD questions most likely to appear in system design rounds.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {questions.map((item, i) => (
          <QuestionNode key={item.id} item={item} index={i} />
        ))}
      </div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OODIndex() {
  const byId = useMemo(() => {
    const map = {}
    OOD_PATTERNS.forEach((p) => { map[p.id] = p })
    return map
  }, [])

  return (
    <div className="space-y-1">
      <Breadcrumb trail={[
        { label: 'Home', to: '/' },
        { label: NAV_SECTIONS.ood.label },
      ]} />

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Object Oriented Design</h1>
        <p className="mt-2 text-slate-400 max-w-2xl">
          A structured path through the 23 GoF patterns — grouped by intent, then applied in classic interview questions.
          Follow the roadmap top-to-bottom: understand how objects are created, how they compose, then how they communicate.
        </p>
      </div>

      <div className="space-y-1">
        {STAGES.map((stage, i) => {
          const items = stage.ids.map((id) => byId[id]).filter(Boolean)
          const nextHex = i < STAGES.length - 1 ? STAGES[i + 1].hex : QUESTION_HEX
          return (
            <div key={stage.id}>
              <StageSection stage={stage} items={items} stageIndex={i} />
              <StageConnector fromHex={stage.hex} toHex={nextHex} />
            </div>
          )
        })}
        <QuestionsTier questions={OOD_QUESTIONS} />
      </div>
    </div>
  )
}
