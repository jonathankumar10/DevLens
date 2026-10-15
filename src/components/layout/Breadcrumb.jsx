import { Fragment } from 'react'
import { Link } from 'react-router-dom'

// Renders a "Home / Section / ... / Item" trail of any depth. Every entry
// with a `to` renders as a link; the last entry (no `to`) renders as the
// current-page label.
export default function Breadcrumb({ trail }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-slate-500">
      {trail.map((crumb, i) => (
        // Index keys are safe: a trail is static per page, and two crumbs can
        // share a path (e.g. "DSA" and "Algorithms" both link to /algorithms).
        <Fragment key={i}>
          {i > 0 && <span>/</span>}
          {crumb.to
            ? <Link to={crumb.to} className="hover:text-slate-300 transition-colors">{crumb.label}</Link>
            : <span className="text-slate-300">{crumb.label}</span>}
        </Fragment>
      ))}
    </nav>
  )
}
