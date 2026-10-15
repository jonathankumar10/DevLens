// ── Shared color palette ──────────────────────────────────────────────────────
// Every registry item picks a `color` key from this map; pages read the
// matching Tailwind classes from it. Class names are written out in full
// (never built with template strings) so Tailwind's scanner can find them.

export const PALETTE = {
  sky:     { text: 'text-sky-300',     bg: 'bg-sky-500/10',     border: 'border-sky-500/25',     badgeBg: 'bg-sky-500/15',     badgeBorder: 'border-sky-500/30',     dot: 'bg-sky-400',     glow: '#0ea5e9' },
  amber:   { text: 'text-amber-300',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   badgeBg: 'bg-amber-500/15',   badgeBorder: 'border-amber-500/30',   dot: 'bg-amber-400',   glow: '#f59e0b' },
  violet:  { text: 'text-violet-300',  bg: 'bg-violet-500/10',  border: 'border-violet-500/25',  badgeBg: 'bg-violet-500/15',  badgeBorder: 'border-violet-500/30',  dot: 'bg-violet-400',  glow: '#8b5cf6' },
  emerald: { text: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', badgeBg: 'bg-emerald-500/15', badgeBorder: 'border-emerald-500/30', dot: 'bg-emerald-400', glow: '#10b981' },
  rose:    { text: 'text-rose-300',    bg: 'bg-rose-500/10',    border: 'border-rose-500/25',    badgeBg: 'bg-rose-500/15',    badgeBorder: 'border-rose-500/30',    dot: 'bg-rose-400',    glow: '#f43f5e' },
  teal:    { text: 'text-teal-300',    bg: 'bg-teal-500/10',    border: 'border-teal-500/25',    badgeBg: 'bg-teal-500/15',    badgeBorder: 'border-teal-500/30',    dot: 'bg-teal-400',    glow: '#14b8a6' },
  blue:    { text: 'text-blue-300',    bg: 'bg-blue-500/10',    border: 'border-blue-500/25',    badgeBg: 'bg-blue-500/15',    badgeBorder: 'border-blue-500/30',    dot: 'bg-blue-400',    glow: '#3b82f6' },
  orange:  { text: 'text-orange-300',  bg: 'bg-orange-500/10',  border: 'border-orange-500/25',  badgeBg: 'bg-orange-500/15',  badgeBorder: 'border-orange-500/30',  dot: 'bg-orange-400',  glow: '#f97316' },
  cyan:    { text: 'text-cyan-300',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/25',    badgeBg: 'bg-cyan-500/15',    badgeBorder: 'border-cyan-500/30',    dot: 'bg-cyan-400',    glow: '#06b6d4' },
  indigo:  { text: 'text-indigo-300',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/25',  badgeBg: 'bg-indigo-500/15',  badgeBorder: 'border-indigo-500/30',  dot: 'bg-indigo-400',  glow: '#6366f1' },
  pink:    { text: 'text-pink-300',    bg: 'bg-pink-500/10',    border: 'border-pink-500/25',    badgeBg: 'bg-pink-500/15',    badgeBorder: 'border-pink-500/30',    dot: 'bg-pink-400',    glow: '#ec4899' },
}

// ── Difficulty badges ─────────────────────────────────────────────────────────

export const DIFFICULTY_COLOR = {
  Easy:   'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
  Hard:   'text-rose-400 bg-rose-500/10 border-rose-500/25',
}
