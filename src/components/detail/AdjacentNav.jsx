import { Link } from 'react-router-dom'
import ChevronIcon from '../ui/ChevronIcon'

const CARD_CLASS =
  'group rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4 flex items-center gap-3 ' +
  'transition-colors hover:bg-white/[0.04] hover:border-white/20'

const ICON_CLASS = 'shrink-0 w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors'

function NavCard({ item, basePath, label, direction }) {
  const isNext = direction === 'right'
  const to = item.path ?? `${basePath}/${item.id}`

  return (
    <Link to={to} className={`${CARD_CLASS} ${isNext ? 'justify-end text-right' : ''}`}>
      {!isNext && <ChevronIcon direction="left" className={ICON_CLASS} />}
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">{label}</p>
        <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate">
          {item.title}
        </p>
      </div>
      {isNext && <ChevronIcon direction="right" className={ICON_CLASS} />}
    </Link>
  )
}

// "← Previous / Next →" cards at the bottom of a detail page.
// Items link to their own `path`, or to `${basePath}/${id}` when they have none.
export default function AdjacentNav({ prevItem, nextItem, basePath }) {
  if (!prevItem && !nextItem) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
      {prevItem ? <NavCard item={prevItem} basePath={basePath} label="Previous" direction="left" /> : <div />}
      {nextItem && <NavCard item={nextItem} basePath={basePath} label="Next" direction="right" />}
    </div>
  )
}
