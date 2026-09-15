import { useState } from 'react'
import { Link } from 'react-router-dom'
import LeetCodeBadge from '../ui/LeetCodeBadge'

function GroupList({ groups, activeId, onNavigate }) {
  const [overrides, setOverrides] = useState({})

  // A group is open if the user has explicitly toggled it, otherwise it
  // defaults open only when it contains the active item — so navigating
  // to a new section auto-expands it without remembering stale state.
  const isOpen = (key) =>
    key in overrides
      ? overrides[key]
      : groups.find((g) => g.key === key)?.items.some((i) => i.id === activeId) ?? false

  const toggle = (key) => setOverrides((prev) => ({ ...prev, [key]: !isOpen(key) }))

  return (
    <div className="space-y-0.5">
      {groups.map((group) => {
        const open = isOpen(group.key)
        return (
          <div key={group.key}>
            <button
              onClick={() => toggle(group.key)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:bg-white/[0.03] transition-colors"
            >
              <svg
                className={`shrink-0 w-3 h-3 text-slate-600 transition-transform ${open ? 'rotate-90' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex-1 truncate">
                {group.label}
              </span>
              <span className="text-[10px] text-slate-700">{group.items.length}</span>
            </button>

            {open && (
              <div className="ml-2.5 pl-2.5 border-l border-white/[0.08] space-y-0.5 pb-1.5">
                {group.items.map((item) => {
                  const active = item.id === activeId
                  return (
                    <div
                      key={item.id}
                      className={`group flex items-center gap-1 rounded-md transition-colors ${
                        active
                          ? 'bg-blue-500/15 text-blue-300 font-medium'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                      }`}
                    >
                      <Link
                        to={item.path}
                        onClick={onNavigate}
                        className="flex-1 min-w-0 flex items-center gap-2.5 px-2.5 py-1.5 text-sm"
                      >
                        <span className={`shrink-0 w-1.5 h-1.5 rounded-full transition-colors ${
                          active ? 'bg-blue-400' : 'bg-slate-700 group-hover:bg-slate-500'
                        }`} />
                        <span className="truncate">{item.title}</span>
                      </Link>
                      <LeetCodeBadge url={item.problemUrl} label={item.problemLabel} className="mr-1.5" />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Left-hand section nav for detail pages — shown on algorithms, OOD, AI, and
// system-design item pages so users can jump between topics without going
// back to the index. Desktop renders a sticky column; mobile collapses into
// a toggleable panel above the page content.
export default function DetailSidebar({ groups, activeId, title = 'On this page' }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen((o) => !o)}
        className="lg:hidden w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-medium text-slate-300 mb-4"
      >
        <span>{title}</span>
        <svg
          className={`w-4 h-4 text-slate-500 transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {mobileOpen && (
        <div className="lg:hidden rounded-xl border border-white/10 bg-white/[0.02] p-2 mb-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
          <GroupList groups={groups} activeId={activeId} onNavigate={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar */}
      <nav
        className="hidden lg:block w-64 shrink-0 sticky overflow-y-auto pr-2 scrollbar-thin"
        style={{
          top: 'calc(var(--navbar-h, 4rem) + 1rem)',
          maxHeight: 'calc(100vh - var(--navbar-h, 4rem) - 2rem)',
        }}
      >
        <GroupList groups={groups} activeId={activeId} />
      </nav>
    </>
  )
}
