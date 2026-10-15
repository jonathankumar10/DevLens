// Minimal inline markdown for chat bubbles: **bold** and `code` only.
export function renderInlineMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="rounded bg-white/10 px-1 py-0.5 text-[11px] font-mono">{part.slice(1, -1)}</code>
    }
    return part
  })
}
