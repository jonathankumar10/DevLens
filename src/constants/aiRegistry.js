// ── AI Registry ───────────────────────────────────────────────────────────────
// Index-level metadata for every AI topic; long-form content is in content/ai/aiContent.js.
// Categories: history | ml | llms | workflows | agents | production | live-coding

import { PALETTE } from './palette'

export const AI_CATEGORY_LABELS = {
  history:      'History & Foundations',
  ml:           'Core ML',
  llms:         'LLMs & Transformers',
  workflows:    'AI Workflows',
  agents:       'AI Agents',
  production:   'Production & Evaluation',
  'live-coding': 'Live Coding Interviews',
}

export const AI_COLORS = PALETTE

// Index-level fields only, so the index page, sidebar and home page stay small.
// The long-form content lives in content/ai/aiContent.js — see loadAiContent().
export const AI_ITEMS = [

  // ── History & Foundations ────────────────────────────────────────────────────
  {
    id:       'ai-history',
    category: 'history',
    title:    'The History of AI',
    color:    'amber',
    tagline:  'From Turing\'s vision to the deep learning revolution',
  },

  // ── Core ML ──────────────────────────────────────────────────────────────────
  {
    id:       'neural-networks',
    category: 'ml',
    title:    'Neural Networks',
    color:    'blue',
    tagline:  'Layers of weighted connections that learn by example',
  },
  {
    id:       'training-and-loss',
    category: 'ml',
    title:    'Training & Loss',
    color:    'emerald',
    tagline:  'How a model learns by measuring and shrinking its mistakes',
  },

  // ── LLMs & Transformers ───────────────────────────────────────────────────────
  {
    id:       'transformer-architecture',
    category: 'llms',
    title:    'The Transformer',
    color:    'violet',
    tagline:  'The architecture behind every modern LLM',
  },
  {
    id:       'attention-mechanism',
    category: 'llms',
    title:    'The Attention Mechanism',
    color:    'indigo',
    tagline:  'Every token learns which other tokens matter for understanding it',
  },

  // ── LLMs & Transformers (continued) ─────────────────────────────────────────
  {
    id:       'tokenization',
    category: 'llms',
    title:    'Tokenization',
    color:    'amber',
    tagline:  'How raw text becomes the units an LLM actually reads',
  },
  {
    id:       'context-windows',
    category: 'llms',
    title:    'Context Windows',
    color:    'sky',
    tagline:  'The model\'s working memory — everything it can see at once',
  },
  {
    id:       'llm-inference',
    category: 'llms',
    title:    'LLM Inference & Sampling',
    color:    'emerald',
    tagline:  'How temperature, top-p, and top-k control what the model says next',
  },
  {
    id:       'multimodal-models',
    category: 'llms',
    title:    'Multimodal Models',
    color:    'indigo',
    tagline:  'Models that see, hear, and generate across text, images, and audio',
  },

  // ── AI Workflows ─────────────────────────────────────────────────────────────
  {
    id:       'prompt-engineering',
    category: 'workflows',
    title:    'Prompt Engineering',
    color:    'sky',
    tagline:  'Craft inputs that reliably produce the outputs you need',
  },
  {
    id:       'rag',
    category: 'workflows',
    title:    'Retrieval-Augmented Generation',
    color:    'teal',
    tagline:  'Ground LLM answers in retrieved, up-to-date documents',
  },
  {
    id:       'embeddings',
    category: 'workflows',
    title:    'Embeddings & Vector Search',
    color:    'rose',
    tagline:  'Represent meaning as a point in high-dimensional space',
  },
  {
    id:       'function-calling',
    category: 'workflows',
    title:    'Function Calling & Tool Use',
    color:    'teal',
    tagline:  'Give LLMs the ability to take actions, not just answer questions',
  },
  {
    id:       'fine-tuning',
    category: 'workflows',
    title:    'Fine-Tuning',
    color:    'violet',
    tagline:  'Adapt a pre-trained model to your specific task or style',
  },
  {
    id:       'guardrails',
    category: 'workflows',
    title:    'Hallucinations & Guardrails',
    color:    'rose',
    tagline:  'Why LLMs confabulate and how to build reliable, safe applications',
  },

  // ── AI Agents ─────────────────────────────────────────────────────────────────
  {
    id:       'ai-agents',
    category: 'agents',
    title:    'AI Agents',
    color:    'blue',
    tagline:  'LLMs that plan, use tools, and act in a loop to complete tasks',
  },
  {
    id:       'multi-agent-systems',
    category: 'agents',
    title:    'Multi-Agent Systems',
    color:    'amber',
    tagline:  'Orchestrate networks of specialized agents to tackle complex tasks',
  },

  // ── Production & Evaluation ───────────────────────────────────────────────────
  {
    id:       'ai-engineer',
    category: 'production',
    title:    'The AI Engineer',
    color:    'indigo',
    tagline:  'The engineer who builds reliable products on top of foundation models',
  },
  {
    id:       'llm-evaluation',
    category: 'production',
    title:    'LLM Evaluation',
    color:    'emerald',
    tagline:  'How to measure whether your AI application actually works',
  },
  {
    id:       'ai-observability',
    category: 'production',
    title:    'AI Observability',
    color:    'sky',
    tagline:  'Monitor, trace, and optimize LLM applications in production',
  },

  // ── Live Coding Interviews ───────────────────────────────────────────────────
  {
    id:       'ai-chat-app',
    category: 'live-coding',
    title:    'AI Chat App',
    color:    'blue',
    tagline:  'Stateful chat backed by an LLM — history, persistence, and UX under the clock',
    duration: '60 min',
  },
  {
    id:       'knowledge-base-qa',
    category: 'live-coding',
    title:    'Knowledge Base Q&A',
    color:    'teal',
    tagline:  'Add docs, ask questions — a miniature RAG pipeline from scratch',
    duration: '60 min',
  },
  {
    id:       'document-search-app',
    category: 'live-coding',
    title:    'Document Search App',
    color:    'violet',
    tagline:  'Upload, index, search documents — with an AI summary layer on top',
    duration: '60 min',
  },
  {
    id:       'support-ticket-assistant',
    category: 'live-coding',
    title:    'Support Ticket Assistant',
    color:    'rose',
    tagline:  'Create tickets, chat with an AI about each one — workflow meets LLM context',
    duration: '60 min',
  },
  {
    id:       'task-manager-ai',
    category: 'live-coding',
    title:    'Task Manager with AI Planning',
    color:    'emerald',
    tagline:  'CRUD tasks and let the LLM decompose goals into actionable steps',
    duration: '60 min',
  },
  {
    id:       'kanban-board-ai',
    category: 'live-coding',
    title:    'Kanban Board with AI Triage',
    color:    'amber',
    tagline:  'Move cards across columns and let the LLM suggest where they belong',
    duration: '60 min',
  },
  {
    id:       'meeting-notes-summarizer',
    category: 'live-coding',
    title:    'Meeting Notes Summarizer',
    color:    'sky',
    tagline:  'Paste transcripts, get summaries and action items — LLM extraction in practice',
    duration: '60 min',
  },
  {
    id:       'bookmark-research-assistant',
    category: 'live-coding',
    title:    'Bookmark Research Assistant',
    color:    'indigo',
    tagline:  'Save links and notes, then ask the AI to synthesize your research',
    duration: '60 min',
  },
  {
    id:       'expense-insight-app',
    category: 'live-coding',
    title:    'Expense Insight App',
    color:    'emerald',
    tagline:  'Log expenses, compute totals, and get AI-generated spending analysis',
    duration: '60 min',
  },
  {
    id:       'inventory-assistant',
    category: 'live-coding',
    title:    'Inventory Assistant',
    color:    'amber',
    tagline:  'Track stock levels and let the LLM generate reorder suggestions',
    duration: '60 min',
  },
  {
    id:       'api-usage-dashboard',
    category: 'live-coding',
    title:    'API Usage Dashboard',
    color:    'violet',
    tagline:  'Log API events, visualize metrics, and let the LLM explain anomalies',
    duration: '60 min',
  },
  {
    id:       'notification-center',
    category: 'live-coding',
    title:    'Notification Center',
    color:    'sky',
    tagline:  'Create and manage notifications — with AI grouping and summarization',
    duration: '60 min',
  },
  {
    id:       'habit-coach',
    category: 'live-coding',
    title:    'Habit Coach',
    color:    'teal',
    tagline:  'Track habits and streaks, then ask the AI for a weekly improvement plan',
    duration: '60 min',
  },
  {
    id:       'url-monitor-shortener',
    category: 'live-coding',
    title:    'URL Monitor / Shortener',
    color:    'rose',
    tagline:  'Short links with click tracking — AI reads the stats and spots trends',
    duration: '60 min',
  },
  {
    id:       'file-metadata-explorer',
    category: 'live-coding',
    title:    'File Metadata Explorer',
    color:    'indigo',
    tagline:  'Register file records, search and filter them, get AI-generated descriptions',
    duration: '60 min',
  },
]

// Lazily loads the long-form AI content (one chunk, cached after first use).
// Resolves to { AI_CONTENT: { [id]: fields }, LIVE_CODING_AI_GUIDE }.
let contentPromise = null
export function loadAiContent() {
  contentPromise ??= import('../content/ai/aiContent.js')
  return contentPromise
}
