

// ── Option content renderer ───────────────────────────────────────────────────

const LABEL_COLORS = {
  'Pros':            'text-emerald-400',
  'Cons':            'text-red-400',
  'Best for':        'text-blue-400',
  'Result':          'text-sky-400',
  'Method':          'text-violet-400',
  'Structure':       'text-violet-400',
  'Drawback':        'text-amber-400',
  'Why this wins':   'text-emerald-400',
  'Fix':             'text-amber-400',
  'Scale':           'text-sky-400',
  'Trade-off':       'text-amber-400',
  'Critical':        'text-red-400',
  'Acceptable':      'text-emerald-400',
}

const CODE_TRIGGERS = [
  '  Example:', '  CHARS', '  def ', '  SET ', '  GET ',
  '  INCR ', '  encode(', '  if ', '  out', '  while ', '  return ',
]

export function renderOptionContent(raw) {
  const lines = raw.split('\n')
  const blocks = []
  let codeBuf = []
  let inCode = false
  let lastEmpty = false
  let k = 0

  const flushCode = () => {
    if (!codeBuf.length) return
    blocks.push(
      <pre key={k++} className="rounded-lg bg-[#060e20] border border-white/[0.06] px-4 py-3 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
        {codeBuf.join('\n')}
      </pre>
    )
    codeBuf = []
    inCode = false
    lastEmpty = false
  }

  for (const line of lines) {
    const trimmed = line.trim()

    // Code block: trigger on known prefixes, continue while indented
    const isCodeTrigger = CODE_TRIGGERS.some((p) => line.startsWith(p))
    const isCodeContinuation = inCode && line.startsWith('  ')

    if (isCodeTrigger || isCodeContinuation) {
      inCode = true
      codeBuf.push(line.replace(/^ {2}/, ''))
      lastEmpty = false
      continue
    }

    // Non-indented line while inCode → flush
    if (inCode) flushCode()

    // Empty line
    if (trimmed === '') {
      if (inCode) flushCode()
      else if (!lastEmpty) { blocks.push(<div key={k++} className="h-1.5" />); lastEmpty = true }
      continue
    }
    lastEmpty = false

    // Bullet point
    if (trimmed.startsWith('•') || trimmed.startsWith('- ')) {
      const text = trimmed.replace(/^[•-]\s*/, '')
      blocks.push(
        <div key={k++} className="flex items-start gap-2.5">
          <span className="mt-[6px] shrink-0 w-1.5 h-1.5 rounded-full bg-violet-400/70" />
          <span className="text-sm text-slate-300 leading-relaxed">{text}</span>
        </div>
      )
      continue
    }

    // Numbered step
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/)
    if (numMatch) {
      blocks.push(
        <div key={k++} className="flex items-start gap-2.5">
          <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-[9px] text-violet-400 font-bold leading-none">
            {numMatch[1]}
          </span>
          <span className="text-sm text-slate-300 leading-relaxed">{numMatch[2]}</span>
        </div>
      )
      continue
    }

    // Colored label: "Label: rest..."
    const labelMatch = trimmed.match(/^([A-Za-z][A-Za-z\s-]*?):\s+(.+)/)
    if (labelMatch) {
      const color = LABEL_COLORS[labelMatch[1]]
      if (color) {
        blocks.push(
          <p key={k++} className="text-sm leading-relaxed">
            <span className={`font-semibold ${color}`}>{labelMatch[1]}: </span>
            <span className="text-slate-300">{labelMatch[2]}</span>
          </p>
        )
        continue
      }
    }

    // Regular text
    blocks.push(<p key={k++} className="text-sm text-slate-300 leading-relaxed">{trimmed}</p>)
  }
  flushCode()

  return <div className="space-y-2">{blocks}</div>
}
