const { onCall } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const admin = require('firebase-admin')
const Anthropic = require('@anthropic-ai/sdk')

admin.initializeApp()
const db = admin.firestore()

const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY')

// Generated from the frontend registries by scripts/build-functions-data.mjs
// (runs as a firebase predeploy hook), so the backend always matches the site:
// CATALOG feeds the chatbot prompt, RUBRICS the mock interviewer.
const CATALOG = require('./generated/catalog.json')
const RUBRICS = require('./generated/rubrics.json')

const CATALOG_TEXT = CATALOG.map(({ section, items }) =>
  `${section.toUpperCase()} (${items.length}):\n` +
  items.map((i) => `- ${i.title} (${i.meta}) → ${i.path}`).join('\n')
).join('\n\n')

const SYSTEM_PROMPT = `You are DevLens Assistant, a learning guide for DevLens, an interactive site for software engineering interview prep covering DSA, system design, object-oriented design, AI engineering and tech stack fundamentals.

TOPICS ON THE SITE:
${CATALOG_TEXT}

BEHAVIOUR RULES:
1. If the question is about a topic ON the site → give a clear 2-3 sentence explanation and end with: "You can explore this interactively at <path>"
2. If the topic is in scope (DSA, system design, OOD, AI engineering, software tooling) but NOT on the site yet → answer from your general knowledge, then add: "DevLens doesn't cover this yet, but more topics are being added regularly."
3. If the question is completely off-topic → politely decline and steer back: "I'm specialized in software engineering interview topics — ask me about anything on DevLens!"
4. Keep all responses concise: 3-5 sentences maximum.
5. Never make up content that isn't on the site. Only claim a page exists if it is listed above.`

const INTERVIEW_STAGES = `1. Functional & non-functional requirements (and scale estimates)
2. Data model
3. API design
4. High-level architecture (HLD)
5. Deep-dive trade-offs`

function interviewSystemPrompt(rubric) {
  return `You are a senior staff engineer conducting a live mock system design interview for the prompt: "${rubric.title}".
${rubric.description ? `Context for you only: ${rubric.description}` : ''}

INTERVIEW STAGES (guide the candidate through these in order, at a pace driven by their answers — do not force a rigid script, ask natural follow-ups, and only move on once a stage has been reasonably covered):
${INTERVIEW_STAGES}

Ask one focused question at a time. Keep each of your turns concise (2-5 sentences) like a real interviewer — do not lecture or info-dump.

GRADING RUBRIC (for your eyes only — this is the canonical reference solution, NEVER reveal its exact wording, numbers, or specific decisions verbatim to the candidate, including in your final assessment; always restate things in your own words and let the candidate arrive at ideas themselves):
${JSON.stringify(rubric)}

If the candidate asks you to just give them the answer, decline politely and redirect them to attempt it themselves with a hint at most.

ENDING THE INTERVIEW: When the candidate signals they are done, or you receive a bracketed instruction like "[SYSTEM: ...end the interview...]", stop asking questions and immediately produce your final assessment. The final assessment message MUST start with the exact literal text "**Mock Interview Assessment**" on its own, followed by a brief **Strengths** section, a **Gaps** section, and a **Suggested Level** (mid, senior, or staff) with a one-sentence justification per relevant dimension. Do not ask any further questions after this message.`
}

const MAX_CONTENT_CHARS = 2000

const today = () => new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"

// Reads a { [field], date } daily counter inside a transaction and queues its
// increment. Returns false (and writes nothing) when the limit is reached.
async function takeFromDailyCounter(tx, ref, field, limit) {
  const doc  = await tx.get(ref)
  const data = doc.exists ? doc.data() : null
  const used = data?.date === today() ? (data[field] ?? 0) : 0
  if (used >= limit) return false
  tx.set(ref, { [field]: used + 1, date: today() })
  return true
}

// Daily per-uid limit in Firestore. Runs in a transaction so parallel
// requests can't read the same count and both slip under the limit.
// Returns true when the request is allowed. Fails open: if Firestore is
// unavailable the request goes through rather than blocking the user.
async function checkDailyLimit({ collection, field, uid, limit }) {
  const ref = db.collection(collection).doc(uid)

  try {
    return await db.runTransaction((tx) => takeFromDailyCounter(tx, ref, field, limit))
  } catch (err) {
    console.error(`Firestore rate limit error (${collection}):`, err)
    return true
  }
}

const INTERVIEW_SESSIONS_PER_DAY = 2
// Calls allowed per interview session: the kickoff, the candidate's turns and
// the final assessment. Counted server-side, so trimming the history the
// client sends can't stretch a session indefinitely.
const MAX_CALLS_PER_SESSION = 14
const SESSION_TTL_MS = 2 * 24 * 60 * 60 * 1000

// Tracks each interview session in interviewSessions/{sessionId}. The first
// call for a new sessionId counts against the uid's daily session limit; later
// calls only count against the session's own call limit. Fails open like
// checkDailyLimit. Returns null when allowed, otherwise an error code.
async function claimInterviewTurn({ uid, sessionId, designId }) {
  const sessionRef = db.collection('interviewSessions').doc(sessionId)
  const limitRef   = db.collection('interviewRateLimits').doc(uid)

  try {
    return await db.runTransaction(async (tx) => {
      const session = await tx.get(sessionRef)

      if (session.exists) {
        const { uid: owner, designId: sessionDesign, calls = 0 } = session.data()
        if (owner !== uid || sessionDesign !== designId) return 'INVALID_MESSAGES'
        if (calls >= MAX_CALLS_PER_SESSION) return 'SESSION_TURN_LIMIT'
        tx.update(sessionRef, { calls: calls + 1 })
        return null
      }

      const allowed = await takeFromDailyCounter(tx, limitRef, 'sessionsStarted', INTERVIEW_SESSIONS_PER_DAY)
      if (!allowed) return 'RATE_LIMITED'
      tx.set(sessionRef, {
        uid,
        designId,
        calls:     1,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        // Enable a Firestore TTL policy on this field to clean up old sessions.
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      })
      return null
    })
  } catch (err) {
    console.error('Firestore interview session error:', err)
    return null
  }
}

// Keep only role + content from user/assistant turns, capping each message's
// length and (optionally) how many of the most recent turns are kept.
function sanitise(messages, maxTurns = messages.length) {
  return messages
    .slice(-maxTurns)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT_CHARS) }))
}

// One Claude call, mapped to the { reply } | { error } shape both callables return.
// `fallback` opts into server-side refusal fallback (Claude API, Sonnet/Opus only):
// a request the model's safety classifiers decline is re-run on Anthropic's
// recommended fallback model inside the same call.
async function askClaude({ label, model, maxTokens, system, messages, fallback = false }) {
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value() })
  const params = {
    model,
    // Thinking is on by default on current models and counts toward max_tokens,
    // so this leaves room for it on top of the short reply the prompt asks for.
    max_tokens: maxTokens,
    // Conversational turns: low effort keeps thinking brief and replies fast.
    output_config: { effort: 'low' },
    // Caches the longest stable prefix — the system prompt plus earlier turns,
    // which every call in a conversation resends unchanged.
    cache_control: { type: 'ephemeral' },
    system,
    messages,
  }

  try {
    const response = fallback
      ? await anthropic.beta.messages.create({
          ...params,
          betas:     ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
        })
      : await anthropic.messages.create(params)

    if (response.stop_reason === 'refusal') {
      console.warn(`Claude refusal (${label}):`, response.stop_details)
      return { error: 'API_ERROR' }
    }

    // The response can start with thinking blocks — read the text blocks only.
    const reply = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim()
    if (!reply) {
      console.warn(`Claude returned no text (${label}), stop_reason:`, response.stop_reason)
      return { error: 'API_ERROR' }
    }
    return { reply }
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${err.status} (${label}):`, err.message)
    } else {
      console.error(`Anthropic request failed (${label}):`, err)
    }
    return { error: 'API_ERROR' }
  }
}

exports.interviewChat = onCall({ secrets: [ANTHROPIC_API_KEY], cors: true }, async (request) => {
  const { uid, sessionId, designId, messages, endRequested } = request.data

  if (!uid || typeof uid !== 'string' || uid.length > 64) {
    return { error: 'INVALID_UID' }
  }
  if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 64) {
    return { error: 'INVALID_MESSAGES' }
  }
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 24) {
    return { error: messages && messages.length > 24 ? 'SESSION_TURN_LIMIT' : 'INVALID_MESSAGES' }
  }

  // The rubric is looked up server-side from the generated design data, so a
  // client can't swap in its own system prompt.
  const rubric = typeof designId === 'string' && Object.hasOwn(RUBRICS, designId) ? RUBRICS[designId] : null
  if (!rubric) {
    return { error: 'INVALID_MESSAGES' }
  }

  // Rate limiting: 2 interview sessions per user per day, and a cap on calls per session
  const limitError = await claimInterviewTurn({ uid, sessionId, designId })
  if (limitError) return { error: limitError }

  const sanitised = sanitise(messages)
  if (sanitised.length === 0) {
    return { error: 'INVALID_MESSAGES' }
  }

  if (endRequested) {
    sanitised.push({
      role: 'user',
      content: '[SYSTEM: The candidate has requested to end the interview now. Provide your final assessment immediately based on what has been covered so far.]',
    })
  }

  return askClaude({
    label:     'interviewChat',
    model:     'claude-sonnet-5-5',
    maxTokens: 8000,
    system:    interviewSystemPrompt(rubric),
    messages:  sanitised,
    fallback:  true,
  })
})

exports.chat = onCall({ secrets: [ANTHROPIC_API_KEY], cors: true }, async (request) => {
  const { messages, uid } = request.data

  if (!uid || typeof uid !== 'string' || uid.length > 64) {
    return { error: 'INVALID_UID' }
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: 'INVALID_MESSAGES' }
  }

  // Rate limiting: 10 messages per user per day
  const allowed = await checkDailyLimit({
    collection: 'rateLimits', field: 'count', uid, limit: 10,
  })
  if (!allowed) return { error: 'RATE_LIMITED' }

  // Only the last 20 turns are sent to the model
  const sanitised = sanitise(messages, 20)
  if (sanitised.length === 0) {
    return { error: 'INVALID_MESSAGES' }
  }

  return askClaude({
    label:     'chat',
    model:     'claude-haiku-5-5',
    maxTokens: 4000,
    system:    SYSTEM_PROMPT,
    messages:  sanitised,
  })
})
