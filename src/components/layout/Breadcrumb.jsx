import { Fragment } from 'react'
import { Link } from 'react-router-dom'

// Renders a "Home / Section / ... / Item" trail of any depth. Every entry
// with a `to` renders as a link; the last entry (no `to`) renders as the
// current-page label.
export default function Breadcrumb({ trail }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-slate-500">
      {trail.map((crumb, i) => (
        <Fragment key={crumb.to ?? crumb.label}>
          {i > 0 && <span>/</span>}
          {crumb.to
            ? <Link to={crumb.to} className="hover:text-slate-300 transition-colors">{crumb.label}</Link>
            : <span className="text-slate-300">{crumb.label}</span>}
        </Fragment>
      ))}
    </nav>
  )
}
