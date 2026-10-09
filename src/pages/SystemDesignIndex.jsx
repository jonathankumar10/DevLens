import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SYSTEM_DESIGN } from '../constants/systemDesignRegistry'
import { NAV_SECTIONS } from '../constants/sections'
import Breadcrumb from '../components/layout/Breadcrumb'

// ── Section definitions ────────────────────────────────────────────────────────
// Concepts are grouped into three top-level sections (mirroring how a system
// design interview is actually reasoned about: what you need to know before
// you start, the quality attributes you're designing for, and the technical
// building blocks you assemble), each divided into labeled subsections.

const SECTIONS = [
  {
    id:    'prerequisites',
    label: 'Prerequisites',
    description: 'Vocabulary and framework you need before tackling any design — read these first.',
    hex:   '#f59e0b',
    text:  'text-amber-400',
    badge: 'bg-amber-500/15 text-amber-300',
    subsections: [
      { label: 'Architecture Basics',          ids: ['computer-architecture', 'application-architecture'] },
      { label: 'Interview Framework',          ids: ['design-requirements', 'reshaded'] },
      { label: 'Abstractions',                 ids: ['abstractions-in-system-design', 'rpc'] },
      { label: 'Consistency & Failure Models', ids: ['consistency-models-spectrum', 'failure-models-spectrum'] },
    ],
  },
  {
    id:    'non-functional',
    label: 'Non-Functional Characteristics',
    description: 'The quality attributes that determine whether a design is actually good enough.',
    hex:   '#f43f5e',
    text:  'text-rose-400',
    badge: 'bg-rose-500/15 text-rose-300',
    subsections: [
      { label: 'Availability & Reliability', ids: ['availability-patterns', 'cap-theorem'] },
      { label: 'Consistency Patterns',       ids: ['consistency-patterns'] },
      { label: 'Performance & Scale',        ids: ['rate-limiting', 'consistent-hashing'] },
    ],
  },
  {
    id:    'functional',
    label: 'Functional Characteristics / Building Blocks',
    description: 'The technical building blocks you assemble to actually construct a system.',
    hex:   '#06b6d4',
    text:  'text-cyan-400',
    badge: 'bg-cyan-500/15 text-cyan-300',
    subsections: [
      { label: 'Overview',                ids: ['building-blocks-overview'] },
      { label: 'Networking',              ids: ['networking-basics', 'tcp-and-udp', 'dns'] },
      { label: 'APIs',                    ids: ['http', 'websockets', 'api-paradigms', 'api-design'] },
      { label: 'Caching & Delivery',      ids: ['caching', 'cdns', 'proxies-and-load-balancing'] },
      { label: 'Storage',                 ids: ['sql', 'nosql', 'database-replication', 'database-sharding', 'database-indexes', 'acid-and-base', 'object-storage'] },
      { label: 'Messaging & Architecture', ids: ['message-queues', 'event-driven-architecture', 'microservices'] },
      { label: 'Observability',           ids: ['logging-and-monitoring', 'distributed-tracing'] },
    ],
  },
]

// ── Shared sub-components ─────────────────────────────────────────────────────

function SectionConnector({ fromHex, toHex }) {
  return (
    <div className="flex justify-center my-1">
      <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
        <motion.line x1="12" y1="0" x2="12" y2="20"
          stroke={fromHex} strokeWidth="1.5" strokeDasharray="4 3"
          animate={{ strokeDashoffset: [0, -14] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }} />
        <motion.polyline points="5,14 12,24 19,14"
          stroke={toHex} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }} />
      </svg>
    </div>
  )
}

const chipVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 8 },
  show:   { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 22 } },
}

function ConceptCard({ item, section }) {
  if (!item) return null
  return (
    <motion.div variants={chipVariants} whileHover={{ x: 4 }}>
      <Link
        to={item.path}
        className="group flex w-full items-center justify-between rounded-md border border-l-4 px-4 py-2.5 text-sm font-medium text-slate-300 bg-white/[0.02] hover:text-white transition-colors"
        style={{ borderColor: `${section.hex}33`, borderLeftColor: `${section.hex}99` }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${section.hex}88`; e.currentTarget.style.borderLeftColor = section.hex; e.currentTarget.style.background = `${section.hex}14` }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${section.hex}33`; e.currentTarget.style.borderLeftColor = `${section.hex}99`; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
      >
        <span>{item.title}</span>
        <span className="text-slate-600 group-hover:text-slate-400 transition-colors">→</span>
      </Link>
    </motion.div>
  )
}

function SubsectionRow({ subsection, byId, section }) {
  const items = subsection.ids.map((id) => byId[id]).filter(Boolean)
  if (items.length === 0) return null
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
      }}
      className="rounded-xl border border-white/10 bg-black/10 pl-4 pr-4 py-3.5 sm:pl-5 sm:pr-5"
      style={{ borderLeftColor: `${section.hex}77`, borderLeftWidth: '3px' }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {subsection.label}
        </p>
        <span className="text-[10px] text-slate-600">· {items.length}</span>
      </div>
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        className="flex flex-col gap-1.5"
      >
        {items.map((item) => (
          <ConceptCard key={item.id} item={item} section={section} />
        ))}
      </motion.div>
    </motion.div>
  )
}

function ConceptSection({ section, byId, sectionIndex }) {
  const count = section.subsections.reduce((n, s) => n + s.ids.filter((id) => byId[id]).length, 0)
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: { opacity: 0, y: 28 },
        show:   { opacity: 1, y: 0, transition: { duration: 0.35, staggerChildren: 0.1, delayChildren: 0.1 } },
      }}
      className="rounded-2xl border px-5 py-5 sm:px-6 sm:py-6"
      style={{ borderColor: `${section.hex}33`, background: `${section.hex}08` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-[10px] font-black font-mono tracking-widest ${section.text} opacity-35`}>
          {String(sectionIndex + 1).padStart(2, '0')}
        </span>
        <h2 className={`text-xs font-bold uppercase tracking-[0.16em] ${section.text}`}>{section.label}</h2>
        <div className="flex-1 h-px" style={{ background: `${section.hex}22` }} />
        <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${section.badge}`}>
          {count} concept{count !== 1 ? 's' : ''}
        </span>
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed mb-5 max-w-lg">{section.description}</p>
      <div className="space-y-4">
        {section.subsections.map((sub) => (
          <SubsectionRow key={sub.label} subsection={sub} byId={byId} section={section} />
        ))}
      </div>
    </motion.div>
  )
}

// ── Designs tier ──────────────────────────────────────────────────────────────

function SvgBlueprint({ c }) {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
      {[10, 18, 26, 34].map((x) => <line key={`v${x}`} x1={x} y1="6" x2={x} y2="34" stroke={c} strokeWidth="0.5" opacity="0.2" />)}
      {[10, 18, 26, 34].map((y) => <line key={`h${y}`} x1="6" y1={y} x2="34" y2={y} stroke={c} strokeWidth="0.5" opacity="0.2" />)}
      <rect x="10" y="10" width="16" height="12" rx="1" stroke={c} strokeWidth="1.2" fill={c} fillOpacity="0.1" />
      <rect x="10" y="26" width="8" height="8" rx="1" stroke={c} strokeWidth="1" fill={c} fillOpacity="0.1" />
      <rect x="22" y="26" width="12" height="8" rx="1" stroke={c} strokeWidth="1" fill={c} fillOpacity="0.1" />
      <motion.rect x="6" y="6" width="28" height="2" rx="1" fill={c} opacity="0.5"
        animate={{ y: [6, 34, 6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />
    </svg>
  )
}

const DESIGN_HEX = '#6366f1'

function DesignNode({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
      whileHover={{ y: -4 }}
    >
      <Link
        to={item.path}
        className="group flex items-center gap-3 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.06] hover:bg-indigo-500/[0.11] hover:border-indigo-500/45 p-3.5 transition-colors h-full"
      >
        <div className="w-10 h-10 rounded-xl border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center shrink-0">
          <SvgBlueprint c={DESIGN_HEX} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white leading-snug group-hover:text-indigo-200 transition-colors">
            {item.title}
          </p>
          {item.tagline && (
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-1">{item.tagline}</p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

function DesignsTier({ designs }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-indigo-500/30 px-5 py-5 sm:px-6 sm:py-6"
      style={{ background: `${DESIGN_HEX}08` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-400">System Designs</h2>
        <div className="flex-1 h-px bg-indigo-500/20" />
        <span className="text-[10px] rounded-full px-2 py-0.5 font-medium bg-indigo-500/15 text-indigo-300">
          {designs.length} end-to-end walkthroughs
        </span>
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed mb-5 max-w-lg">
        Put the concepts together — full system walkthroughs that draw on the sections above.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {designs.map((item, i) => (
          <DesignNode key={item.id} item={item} index={i} />
        ))}
      </div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SystemDesignIndex() {
  const byId = useMemo(() => {
    const map = {}
    SYSTEM_DESIGN.forEach((item) => { map[item.id] = item })
    return map
  }, [])

  const conceptCount = useMemo(() => SYSTEM_DESIGN.filter((i) => i.type === 'concept').length, [])
  const designs = useMemo(() => SYSTEM_DESIGN.filter((i) => i.type === 'design'), [])

  return (
    <div className="space-y-8">

      <Breadcrumb trail={[
        { label: 'Home', to: '/' },
        { label: NAV_SECTIONS.systemDesign.label },
      ]} />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">System Design</h1>
        <p className="mt-2 text-slate-400 max-w-2xl">
          {conceptCount} concepts, organized into prerequisites, non-functional characteristics, and
          functional building blocks. Work through a section top to bottom, then click any concept to
          deep-dive. Master the concepts before tackling the designs below.
        </p>
      </div>

      {/* Concept sections */}
      <div>
        {SECTIONS.map((section, i) => (
          <div key={section.id}>
            <ConceptSection section={section} byId={byId} sectionIndex={i} />
            {i < SECTIONS.length - 1 && (
              <SectionConnector fromHex={section.hex} toHex={SECTIONS[i + 1].hex} />
            )}
          </div>
        ))}
      </div>

      {/* Designs tier */}
      <DesignsTier designs={designs} />

    </div>
  )
}
