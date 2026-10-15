import { useState, useRef, useEffect } from 'react'
import { callInterviewChat } from '../../lib/firebase'
import { getUserId } from '../../lib/userId'
import ChatMessageBubble from '../ui/ChatMessageBubble'
import SectionLabel from '../ui/SectionLabel'

const KICKOFF_MESSAGE = "I'm ready to start the interview. Please begin."
const ASSESSMENT_MARKER = '**Mock Interview Assessment**'

const ERROR_TEXT = {
  RATE_LIMITED: "You've reached today's mock interview limit (2 sessions/day). Come back tomorrow to practice again.",
  SESSION_TURN_LIMIT: 'This interview has run long enough to hit the session limit. Start a new interview to continue.',
  INVALID_MESSAGES: 'Something about this session looked invalid. Start a new interview.',
  INVALID_UID: 'Something about this session looked invalid. Start a new interview.',
  API_ERROR: 'Sorry, something went wrong grading that. Try again in a moment.',
  NETWORK: "Couldn't reach the interviewer right now. Check your connection and try again.",
}

const TERMINAL_ERRORS = new Set(['RATE_LIMITED', 'SESSION_TURN_LIMIT', 'INVALID_MESSAGES', 'INVALID_UID'])

function buildRubric(design) {
  const { title, description, requirements, dataModel, apiDesign, hldFlows, deepDive, levelExpectations, keyPoints } = design
  return { title, description, requirements, dataModel, apiDesign, hldFlows, deepDive, levelExpectations, keyPoints }
}

export default function MockInterview({ design }) {
  const [started, setStarted]   = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [ended, setEnded]       = useState(false)
  const [error, setError]       = useState(null)

  const sessionId = useRef(null)
  const uid       = useRef(getUserId())
  const rubric    = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  async function callInterview(nextMessages, { endRequested = false } = {}) {
    setIsLoading(true)
    setError(null)

    try {
      const { data } = await callInterviewChat({
        uid:       uid.current,
        sessionId: sessionId.current,
        rubric:    rubric.current,
        messages:  nextMessages,
        endRequested,
      })

      if (data.error) {
        setError(data.error)
        if (TERMINAL_ERRORS.has(data.error)) setEnded(true)
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
        if (data.reply.startsWith(ASSESSMENT_MARKER)) setEnded(true)
      }
    } catch {
      setError('NETWORK')
    } finally {
      setIsLoading(false)
    }
  }

  function handleStart() {
    sessionId.current = crypto.randomUUID()
    rubric.current = buildRubric(design)
    setStarted(true)
    setMessages([])
    setEnded(false)
    setError(null)
    callInterview([{ role: 'user', content: KICKOFF_MESSAGE }])
  }

  function handleReset() {
    setStarted(false)
    setMessages([])
    setEnded(false)
    setError(null)
  }

  function send() {
    const text = input.trim()
    if (!text || isLoading || ended) return

    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    callInterview(next)
  }

  function handleEndEarly() {
    if (isLoading || ended || messages.length === 0) return
    callInterview(messages, { endRequested: true })
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <SectionLabel>Mock interview</SectionLabel>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      {!started ? (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] px-5 py-6 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-2xl">
            🎤
          </div>
          <p className="text-sm font-medium text-slate-300">Test what you've learned in a live mock interview</p>
          <p className="text-xs text-slate-500 max-w-md">
            Claude plays the interviewer and walks you through requirements, data modeling, API design, architecture,
            and trade-offs for "{design.title}" — then gives you a leveled assessment.
          </p>
          <button
            onClick={handleStart}
            className="mt-1 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            Start Mock Interview
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden flex flex-col">
          <div className="max-h-[480px] overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <ChatMessageBubble key={i} role={m.role} content={m.content} />
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border-l-2 border-blue-500/50 rounded-2xl rounded-bl-sm px-4 py-3 text-xs text-slate-400">
                  Thinking…
                </div>
              </div>
            )}

            {error && (
              <div
                className={`rounded-xl px-4 py-3 text-xs ${
                  TERMINAL_ERRORS.has(error)
                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                    : 'bg-red-500/10 border border-red-500/30 text-red-300'
                }`}
              >
                {ERROR_TEXT[error] || ERROR_TEXT.API_ERROR}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="shrink-0 px-3 pb-3 pt-2 border-t border-white/8">
            {ended ? (
              <button
                onClick={handleReset}
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors"
              >
                Start New Interview
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-slate-800 rounded-xl border border-white/8 pr-1.5 pl-4 py-1.5">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="Type your answer…"
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none disabled:opacity-50"
                  />
                  <button
                    onClick={send}
                    disabled={!input.trim() || isLoading}
                    className="shrink-0 w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                    aria-label="Send message"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={handleEndEarly}
                  disabled={isLoading || messages.length === 0}
                  className="shrink-0 rounded-lg border border-white/10 hover:border-white/25 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  End Interview
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
