import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { callChat } from '../../lib/firebase'
import { getUserId } from '../../lib/userId'
import ChatMessageBubble from './ChatMessageBubble'

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-blue-400"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

// ── Path detection ────────────────────────────────────────────────────────────

const PATH_RE = /\/(algorithms|system-design)\/[\w-]+/g

function extractPaths(text) {
  return [...new Set(text.match(PATH_RE) || [])]
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChatBot() {
  const [isOpen,    setIsOpen]    = useState(false)
  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const uid = useRef(getUserId())

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen])

  async function send() {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg = { role: 'user', content: text }
    const next    = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setIsLoading(true)

    try {
      const { data } = await callChat({ messages: next, uid: uid.current })

      if (data.error === 'RATE_LIMITED') {
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            content: "You've reached today's 10-message limit. Check back tomorrow!",
          },
        ])
      } else if (data.error) {
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            content: "Sorry, something went wrong. Try again in a moment.",
          },
        ])
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: "Couldn't reach the assistant right now. Check your connection and try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* ── Chat panel ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed bottom-20 right-3 sm:right-6 z-50 flex flex-col w-[calc(100vw-24px)] sm:w-[360px] h-[min(500px,80vh)] rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/8 bg-slate-900/90 shrink-0">
              <motion.span
                className="w-2 h-2 rounded-full bg-blue-400"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm font-semibold text-white flex-1">AlgoViz Assistant</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-200 transition-colors"
                aria-label="Close chat"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6"  y2="18"/>
                  <line x1="6"  y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-2xl">
                    🤖
                  </div>
                  <p className="text-sm font-medium text-slate-300">Ask me anything about DSA or System Design</p>
                  <p className="text-xs text-slate-500">I can explain concepts, suggest what to learn next, and point you to the right visualizer.</p>
                </div>
              )}

              {messages.map((m, i) => (
                <ChatMessageBubble
                  key={i}
                  role={m.role}
                  content={m.content}
                  links={m.role === 'user' ? [] : extractPaths(m.content)}
                  onLinkClick={() => setIsOpen(false)}
                />
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border-l-2 border-blue-500/50 rounded-2xl rounded-bl-sm">
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input row */}
            <div className="shrink-0 px-3 pb-3 pt-2 border-t border-white/8">
              <div className="flex items-center gap-2 bg-slate-800 rounded-xl border border-white/8 pr-1.5 pl-4 py-1.5">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Ask about algorithms, patterns…"
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
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bubble trigger ───────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-3 sm:right-6 z-50">
        {/* Pulse ring — only shows when closed */}
        {!isOpen && (
          <motion.span
            className="absolute inset-0 rounded-full bg-blue-500/30"
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <motion.button
          onClick={() => setIsOpen((o) => !o)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-900/40 flex items-center justify-center"
          aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.svg
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0,   opacity: 1 }}
                exit={{   rotate: 90,  opacity: 0 }}
                transition={{ duration: 0.18 }}
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6"  y2="18"/>
                <line x1="6"  y1="6" x2="18" y2="18"/>
              </motion.svg>
            ) : (
              <motion.svg
                key="chat"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0,  opacity: 1 }}
                exit={{   rotate: -90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  )
}
