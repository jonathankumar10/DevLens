import { leetcodeNumber } from '../../lib/leetcode'

// Small, explicitly-labeled pill linking out to a problem's LeetCode page —
// used anywhere a bare number or generic external-link icon would leave it
// unclear what the link actually points to.
export default function LeetCodeBadge({ url, label, className = '' }) {
  if (!url) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={label ? `Open ${label} on LeetCode` : 'Open on LeetCode'}
      className={`inline-flex shrink-0 items-center gap-1 rounded border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500/80 transition-colors hover:border-amber-400/40 hover:bg-amber-500/15 hover:text-amber-300 ${className}`}
    >
      <span className="opacity-80">LC</span>
      <span>{leetcodeNumber(label)}</span>
    </a>
  )
}
