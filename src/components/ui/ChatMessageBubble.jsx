import { Link } from 'react-router-dom'
import { renderInlineMarkdown } from '../../lib/markdown'

export default function ChatMessageBubble({ role, content, links = [], onLinkClick }) {
  const isUser = role === 'user'

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1.5`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-slate-800 text-slate-200 border-l-2 border-blue-500/50 rounded-bl-sm'
        }`}
      >
        {isUser ? content : renderInlineMarkdown(content)}
      </div>

      {links.length > 0 && (
        <div className="flex flex-wrap gap-1.5 max-w-[85%]">
          {links.map((path) => (
            <Link
              key={path}
              to={path}
              onClick={onLinkClick}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600/35 hover:border-blue-500/70 px-3 py-1 text-xs font-medium text-blue-300 transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              {pathLabel(path)}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function pathLabel(path) {
  const slug = path.split('/').pop().replace(/-/g, ' ')
  return slug.replace(/\b\w/g, (c) => c.toUpperCase())
}
