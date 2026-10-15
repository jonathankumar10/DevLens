import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Java ─────────────────────────────────────────────────────────────────────

const JAVA_KEYWORDS = new Set([
  'public','private','protected','class','interface','void','int','boolean',
  'char','return','new','if','else','for','while','do','static','final',
  'null','true','false','import','package','extends','implements','this',
  'super','try','catch','throw','throws','break','continue','switch','case',
])
const JAVA_TYPES = new Set([
  'Map','HashMap','LinkedList','Queue','ArrayList','List','Set','HashSet',
  'String','Integer','TreeNode','Node','Graph','Arrays',
])
const JAVA_TOKEN_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|([^\w\s])|( +)/g

// ─── Python ───────────────────────────────────────────────────────────────────

const PY_KEYWORDS = new Set([
  'def','if','else','elif','for','while','return','in','not','and','or','is',
  'None','True','False','import','from','class','pass','break','continue',
  'lambda','with','as','try','except','finally','raise','del','global',
  'nonlocal','yield','assert',
])
const PY_BUILTINS = new Set([
  'set','dict','list','tuple','int','str','float','bool','len','range',
  'enumerate','zip','map','filter','sorted','reversed','print','max','min',
  'sum','any','all','type','isinstance','deque','defaultdict','Counter',
])
const PY_TOKEN_RE = /(#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|([^\w\s])|( +)/g

// ─── Tokenizer ────────────────────────────────────────────────────────────────

const LANGUAGES = {
  java:   { pattern: JAVA_TOKEN_RE, keywords: JAVA_KEYWORDS, types: JAVA_TYPES },
  python: { pattern: PY_TOKEN_RE,   keywords: PY_KEYWORDS,   types: PY_BUILTINS },
}

// Splits one line into `{ kind, text }` tokens for syntax coloring.
// Both regexes use the same capture-group order:
//   1 comment, 2 string, 3 number, 4 identifier; anything else is an operator
//   or whitespace.
function tokenize(line, language) {
  const { pattern, keywords, types } = LANGUAGES[language] ?? LANGUAGES.java
  const tokens = []
  pattern.lastIndex = 0

  let match
  while ((match = pattern.exec(line)) !== null) {
    const [text, comment, string, number, identifier] = match
    let kind = 'operator'
    if (comment)      kind = 'comment'
    else if (string)  kind = 'string'
    else if (number)  kind = 'number'
    else if (identifier) {
      if (keywords.has(identifier))   kind = 'keyword'
      else if (types.has(identifier)) kind = 'type'
      else                            kind = 'identifier'
    }
    tokens.push({ kind, text })
  }
  return tokens
}

const TOKEN_COLOR = {
  keyword:    'text-blue-400',
  type:       'text-sky-300',
  comment:    'text-slate-500 italic',
  string:     'text-emerald-400',
  number:     'text-orange-400',
  identifier: 'text-slate-100',
  operator:   'text-slate-400',
}

// ─── CodeLine ─────────────────────────────────────────────────────────────────

function CodeLine({ tokens, lineNum, highlighted, isCurrent }) {
  return (
    <div
      className={`relative flex text-xs leading-6 font-mono transition-colors duration-200 ${
        isCurrent   ? 'bg-blue-500/20' :
        highlighted ? 'bg-amber-400/10'  : ''
      }`}
    >
      {isCurrent && (
        <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-400 rounded-r" />
      )}
      <span className="select-none w-7 sm:w-10 shrink-0 text-right pr-2 sm:pr-4 text-slate-600">
        {lineNum}
      </span>
      <span className="flex-1 pr-4 whitespace-pre">
        {tokens.map((token, i) => (
          <span key={i} className={TOKEN_COLOR[token.kind]}>
            {token.text}
          </span>
        ))}
      </span>
    </div>
  )
}

// ─── Main CodePanel ───────────────────────────────────────────────────────────

export default function CodePanel({ solution, step, syncedApproachId }) {
  const approaches = solution?.approaches ?? []
  const [activeId,  setActiveId]  = useState(approaches[0]?.id ?? '')
  const [activeLang, setActiveLang] = useState('java')
  const scrollRef = useRef(null)

  // Follow visualizer-controlled approach (e.g. tree-traversal order) —
  // adjusted during render instead of an effect.
  const [prevSyncedApproachId, setPrevSyncedApproachId] = useState(syncedApproachId)
  if (syncedApproachId && syncedApproachId !== prevSyncedApproachId) {
    setPrevSyncedApproachId(syncedApproachId)
    setActiveId(syncedApproachId)
  }

  const approach = approaches.find((a) => a.id === activeId) ?? approaches[0]

  // Reset to java when switching to an approach that has no python
  const hasPython = !!(approach?.python)
  const currentLang = hasPython ? activeLang : 'java'

  // Each approach has `java` and optionally `python`: { code, getHighlightLines(step) }
  const implementation   = approach?.[currentLang]
  const code             = implementation?.code ?? ''
  const highlightedLines = (step && implementation?.getHighlightLines?.(step)) ?? []

  const highlightSet = new Set(highlightedLines)
  const currentLine  = highlightedLines[0] ?? null

  const lines = code.split('\n')
  const tokenizedLines = lines.map((line) => tokenize(line.length ? line : ' ', currentLang))

  useEffect(() => {
    if (!scrollRef.current || !currentLine) return
    const lineEl = scrollRef.current.querySelector(`[data-line="${currentLine}"]`)
    lineEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [currentLine, activeId, currentLang])

  if (!approach) return null

  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-slate-900 overflow-hidden">
      {/* Header: approach tabs + language toggle + complexity */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5 flex-wrap">
        {/* Approach tabs */}
        <div className="flex gap-1 flex-wrap">
          {approaches.map((a) => (
            <button
              key={a.id}
              onClick={() => !syncedApproachId && setActiveId(a.id)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                a.id === activeId
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              } ${syncedApproachId ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Language toggle */}
          {hasPython && (
            <div className="flex rounded-md border border-white/10 overflow-hidden text-xs">
              {['java', 'python'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-2.5 py-1 font-medium transition-colors ${
                    currentLang === lang
                      ? 'bg-white/10 text-white'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {lang === 'java' ? 'Java' : 'Python'}
                </button>
              ))}
            </div>
          )}

          {/* Complexity */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              <span className="text-slate-400">Time</span>{' '}
              <span className="font-mono text-amber-400">{approach.complexity.time}</span>
            </span>
            <span>
              <span className="text-slate-400">Space</span>{' '}
              <span className="font-mono text-sky-400">{approach.complexity.space}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Code body */}
      <div ref={scrollRef} className="overflow-auto py-3" style={{ maxHeight: 'min(60vh, calc(100vh - 230px))', minHeight: 160 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeId}-${currentLang}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {tokenizedLines.map((lineTokens, idx) => {
              const lineNum   = idx + 1
              const highlighted = highlightSet.has(lineNum)
              const isCurrent   = lineNum === currentLine
              return (
                <div key={lineNum} data-line={lineNum}>
                  <CodeLine
                    tokens={lineTokens}
                    lineNum={lineNum}
                    highlighted={highlighted}
                    isCurrent={isCurrent}
                  />
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step label */}
      <div className="border-t border-white/10 px-4 py-2 min-h-8">
        <AnimatePresence mode="wait">
          {highlightedLines.length > 0 && (
            <motion.p
              key={highlightedLines.join(',')}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-slate-400"
            >
              Executing line{highlightedLines.length > 1 ? 's' : ''}{' '}
              <span className="font-mono text-blue-400">
                {highlightedLines.join(', ')}
              </span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
