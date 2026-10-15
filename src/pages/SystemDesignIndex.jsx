import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SYSTEM_DESIGN } from '../constants/systemDesignRegistry'
import { ROADMAP_STAGES, DESIGN_TIERS, JOURNEY_STEPS } from '../constants/systemDesignRoadmap'
import ScaleJourney from '../components/system-design/ScaleJourney'
import { NAV_SECTIONS } from '../constants/sections'
import Breadcrumb from '../components/layout/Breadcrumb'
import { SectionLabel } from '../components/detail/Panels'

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

function ConceptCard({ item, why, section }) {
  if (!item) return null
  return (
    <motion.div variants={chipVariants} whileHover={{ x: 4 }}>
      <Link
        to={item.path}
        className="group flex w-full items-center justify-between gap-3 rounded-md border border-l-4 px-4 py-2.5 text-sm font-medium text-slate-300 bg-white/[0.02] hover:text-white transition-colors"
        style={{ borderColor: `${section.hex}33`, borderLeftColor: `${section.hex}99` }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${section.hex}88`; e.currentTarget.style.borderLeftColor = section.hex; e.currentTarget.style.background = `${section.hex}14` }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${section.hex}33`; e.currentTarget.style.borderLeftColor = `${section.hex}99`; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
      >
        <span className="min-w-0">
          <span className="block">{item.title}</span>
          {why && <span className="block text-[11px] font-normal text-slate-500 leading-relaxed mt-0.5">{why}</span>}
        </span>
        <span className="text-slate-600 group-hover:text-slate-400 transition-colors">→</span>
      </Link>
    </motion.div>
  )
}

// One journey step: the bottleneck, then the concepts that relieve it.
function StepRow({ step, stepIndex, byId, section }) {
  const concepts = step.concepts.filter((c) => byId[c.id])
  if (concepts.length === 0) return null
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
      }}
      className="rounded-xl border border-white/10 bg-black/10 pl-4 pr-4 py-3.5 sm:pl-5 sm:pr-5"
      style={{ borderLeftColor: `${section.hex}77`, borderLeftWidth: '3px' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {step.title}
        </p>
        <span className="text-[10px] text-slate-600">· {step.traffic}</span>
        <Link
          to={`/system-design?step=${stepIndex}`}
          className="ml-auto text-[10px] text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap"
        >
          ▶ in journey
        </Link>
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
        <span className="text-rose-400/80 font-medium">Problem:</span> {step.bottleneck}
      </p>
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        className="flex flex-col gap-1.5"
      >
        {concepts.map((c) => (
          <ConceptCard key={c.id} item={byId[c.id]} why={c.why} section={section} />
        ))}
      </motion.div>
      <p className="text-[11px] text-slate-500 leading-relaxed mt-2.5">
        <span className="text-amber-400/80 font-medium">Trade-off:</span> {step.tradeoff}
      </p>
    </motion.div>
  )
}

function ConceptSection({ section, byId, sectionIndex }) {
  const count = section.steps.reduce((n, s) => n + s.concepts.filter((c) => byId[c.id]).length, 0)
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
      <p className="text-[11px] text-slate-400 leading-relaxed mb-5 max-w-2xl">{section.constraint}</p>
      <div className="space-y-4">
        {section.steps.map((step) => (
          <StepRow
            key={step.id}
            step={step}
            stepIndex={JOURNEY_STEPS.findIndex((s) => s.id === step.id)}
            byId={byId}
            section={section}
          />
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

function DesignNode({ item, teaches, index }) {
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
          {(teaches ?? item.tagline) && (
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
              {teaches ? <><span className="text-indigo-400/80">Teaches:</span> {teaches}</> : item.tagline}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

function DesignsTier({ byId }) {
  const total = DESIGN_TIERS.reduce((n, t) => n + t.items.filter((d) => byId[d.id]).length, 0)
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
          {total} end-to-end walkthroughs
        </span>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed mb-5 max-w-2xl">
        Don’t start with “Design YouTube.” Build small systems that force real decisions, then study how
        products evolve as traffic grows, then design the building blocks themselves.
      </p>
      <div className="space-y-6">
        {DESIGN_TIERS.map((tier, t) => (
          <div key={tier.id}>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-[10px] font-black font-mono text-indigo-400/50">{String.fromCharCode(65 + t)}</span>
              <SectionLabel className="text-slate-300">{tier.label}</SectionLabel>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{tier.description}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tier.items.filter((d) => byId[d.id]).map((d, i) => (
                <DesignNode key={d.id} item={byId[d.id]} teaches={d.teaches} index={i} />
              ))}
            </div>
          </div>
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
          System Design is the study of constraints, trade-offs and failure under scale. Instead of
          memorizing diagrams, learn the {conceptCount} concepts in the order real systems need them: follow
          one system from a single user to millions, and meet each concept at the moment a bottleneck
          forces it — along with the trade-off it introduces.
        </p>
      </div>

      {/* Interactive journey */}
      <ScaleJourney />

      {/* Roadmap stages */}
      <div>
        {ROADMAP_STAGES.map((section, i) => (
          <div key={section.id}>
            <ConceptSection section={section} byId={byId} sectionIndex={i} />
            {i < ROADMAP_STAGES.length - 1 && (
              <SectionConnector fromHex={section.hex} toHex={ROADMAP_STAGES[i + 1].hex} />
            )}
          </div>
        ))}
      </div>

      {/* Designs tier */}
      <DesignsTier byId={byId} />

    </div>
  )
}
