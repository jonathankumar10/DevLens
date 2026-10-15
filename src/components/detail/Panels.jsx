// ── Building blocks for detail pages ──────────────────────────────────────────
// `palette` props are entries from constants/palette.js.

import SectionLabel from '../ui/SectionLabel'

export { SectionLabel }

// Plain bordered card with a section label.
export function InfoPanel({ title, children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
      <SectionLabel>{title}</SectionLabel>
      {children}
    </div>
  )
}

// Card with a tinted header strip and colored dot. `pulse` animates the dot;
// `aside` renders on the right side of the header.
export function HeaderPanel({ title, palette, pulse = false, aside, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className={`border-b border-white/10 px-5 py-3 flex items-center justify-between gap-2 ${palette.bg}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${palette.dot} ${pulse ? 'animate-pulse' : ''}`} />
          <SectionLabel className="text-slate-400">{title}</SectionLabel>
        </div>
        {aside}
      </div>
      {children}
    </div>
  )
}

// 1, 2, 3… list with colored number badges.
export function NumberedList({ items, palette }) {
  return (
    <ol className="space-y-2.5">
      {items.map((text, i) => (
        <li key={i} className="flex gap-3 text-sm text-slate-300">
          <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${palette.badgeBg} ${palette.text}`}>
            {i + 1}
          </span>
          <span className="leading-relaxed">{text}</span>
        </li>
      ))}
    </ol>
  )
}

// Bullet list with a custom marker character (◆, ?, →, …).
export function BulletList({ items, marker = '◆', markerClassName }) {
  return (
    <ul className="space-y-2">
      {items.map((text, i) => (
        <li key={i} className="flex gap-3 text-sm text-slate-300">
          <span className={`shrink-0 mt-0.5 ${markerClassName}`}>{marker}</span>
          <span className="leading-relaxed">{text}</span>
        </li>
      ))}
    </ul>
  )
}

// Pill-shaped label, e.g. a category or difficulty tag.
export function Badge({ className, children }) {
  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  )
}
