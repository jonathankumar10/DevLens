# DevLens

An interactive study site for software engineering interviews. It covers
algorithms, system design, object-oriented design, AI engineering and the
tools behind the project. Every topic has an animated diagram or a
step-through visualizer, plus a written explainer. An AI chatbot and an
AI mock system-design interviewer run on Claude through Firebase Cloud
Functions.

> The project used to be called **AlgoViz**. That name still shows up in a few
> places: the npm package name `dsa-visualizer`, the localStorage key
> `algviz-uid` (kept so returning visitors keep their id) and the Firebase
> project id.

---

## Contents

1. [What's in the app](#whats-in-the-app)
2. [Tech stack](#tech-stack)
3. [Getting started](#getting-started)
4. [Project layout](#project-layout)
5. [How it works, end to end](#how-it-works-end-to-end)
   - [Boot sequence: where execution starts](#1-boot-sequence-where-execution-starts)
   - [Routing and code splitting](#2-routing-and-code-splitting)
   - [Registries: the content catalogue](#3-registries-the-content-catalogue)
   - [Detail pages: how a topic gets rendered](#4-detail-pages-how-a-topic-gets-rendered)
   - [Algorithm visualizers: the step pipeline](#5-algorithm-visualizers-the-step-pipeline)
   - [System design: roadmap, diagrams and mock interview](#6-system-design-roadmap-diagrams-and-mock-interview)
   - [The AI backend: Cloud Functions](#7-the-ai-backend-cloud-functions)
6. [Adding content](#adding-content)
7. [Deployment](#deployment)
8. [Known issues and next steps](#known-issues-and-next-steps)

---

## What's in the app

| Section | Route | What you get |
|---|---|---|
| **DSA: Algorithms** | `/algorithms/:id` | 37 LeetCode-style problems. Each has a step-through visualizer, Java/Python solutions, and code lines that highlight as the steps play |
| **DSA: Patterns** | `/patterns/:id` | 8 pattern pages (arrays, two pointers, hash map, stack, binary search, linked list, trees, graphs/BFS), each linked to its algorithms |
| **System Design** | `/system-design/:id` | 37 concepts and 19 full designs, laid out as a learning roadmap ("scale journey"). 40 of them have an animated diagram. URL Shortener also has an **AI mock interview** |
| **OOD** | `/ood/:id` | GoF design patterns (11 with animations) and OOD interview questions |
| **AI** | `/ai/:id` | History, ML, LLMs, workflows, agents, production, plus live-coding interview guides |
| **Tech Stack** | `/tech-stack/:id` | How the tools used across projects work, plus key learnings |
| **Chatbot** | every page | A floating assistant (Claude Haiku) that answers questions about any topic on the site and links to the right page |

`/algorithms` and `/patterns` share one index page (`DSAIndex`) with two tabs.
The navbar shows them as a single **DSA** entry.

---

## Tech stack

| Layer | Choice |
|---|---|
| UI | React 19, React Router 7 (`createBrowserRouter`) |
| Build | Vite 8 (HMR, `import.meta.glob`, route-level code splitting) |
| Styling | Tailwind CSS 4 (via `@tailwindcss/vite`) |
| Animation | Framer Motion, plus Three.js / React Three Fiber for 3D scenes (split into their own `three-vendor` chunk) |
| Speech | Browser `speechSynthesis` for opt-in narration of steps |
| Backend | Firebase Cloud Functions v2 (Node 22), Firestore (rate limits and interview sessions) |
| AI | Anthropic SDK: Claude Haiku 5.5 (chatbot), Claude Sonnet 5.5 (mock interviewer), with prompt caching |
| Hosting | Netlify (static SPA) + Firebase (functions) |

There is no test suite. Correctness checks are `npm run lint`,
`npm run build`, and some dev-only `console.assert`s.

---

## Getting started

### Frontend

```bash
npm install
npm run dev       # Vite dev server with HMR
npm run build     # production build -> dist/
npm run preview   # serve the production build locally
npm run lint      # ESLint
```

Create a `.env` in the project root with your Firebase web config. The app
only uses it to call the Cloud Functions:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

All the visualizers, diagrams and written content work without Firebase.
Only the chatbot and the mock interview need it.

### Cloud Functions

```bash
cd functions && npm install
firebase functions:secrets:set ANTHROPIC_API_KEY   # one-time
npm run functions:data                             # (from the repo root) regenerate functions/generated/
firebase deploy --only functions                   # runs functions:data first (predeploy hook)
```

The Firebase project is set in `.firebaserc`. The runtime (`nodejs22`) and the
predeploy hook are set in `firebase.json`. `cd functions && npm run serve`
regenerates the data and starts the local emulator.

---

## Project layout

```
DevLens/
├── index.html                 # Vite HTML shell (<div id="root">)
├── vite.config.js             # React + Tailwind plugins, three.js manual chunk
├── netlify.toml               # build command + SPA fallback redirect
├── firebase.json / .firebaserc
├── scripts/
│   └── build-functions-data.mjs  # registries → functions/generated/*.json
├── functions/
│   ├── index.js               # Cloud Functions: chat + interviewChat
│   └── generated/             # catalog.json (chatbot topics), rubrics.json (interviews) — generated, don't edit
└── src/
    ├── main.jsx               # ENTRY POINT: mounts <App/>
    ├── App.jsx                # <RouterProvider router={router}/>
    ├── router.jsx             # route table, lazy page imports
    ├── index.css              # Tailwind + global styles
    ├── pages/                 # one index + one detail page per section
    ├── components/
    │   ├── layout/            # Layout, Navbar, Breadcrumb, DetailSidebar
    │   ├── detail/            # DetailPageLayout, DetailHero, Panels, AdjacentNav
    │   ├── system-design/     # ScaleJourney (roadmap animation), MockInterview
    │   └── ui/                # ChatBot, StepControls, CodePanel, VisualizerKit, ...
    ├── constants/             # registries: the catalogue of all content
    ├── content/               # per-topic modules (data, steps, visual components)
    │   ├── algorithms/<slug>/     index.js, steps.js, Visualizer.jsx
    │   ├── patterns/<slug>/       Animation.jsx
    │   ├── system-design/
    │   │   ├── concepts/<slug>/   meta.js, index.js, steps.js, Diagram.jsx
    │   │   └── designs/<slug>/    meta.js, index.js, steps.js, Diagram.jsx[, ConceptIllustration.jsx]
    │   ├── ood/<slug>/            Animation.jsx
    │   └── ai/
    │       ├── aiContent.js       # long-form AI content, loaded on demand
    │       └── <slug>/            Animation.jsx
    ├── hooks/                 # useStepRunner, useTtsRunner, useSpeech, useZoomPan, usePatternAnimation
    └── lib/                   # firebase, userId, lazyGlob, findWithNeighbors, markdown, motion, ...
```

---

## How it works, end to end

### 1. Boot sequence: where execution starts

```
index.html
  └─ <script type="module" src="/src/main.jsx">
       └─ main.jsx        createRoot(#root).render(<StrictMode><App/></StrictMode>)
            └─ App.jsx    <RouterProvider router={router}/>
                 └─ router.jsx   matches the URL and renders <Layout/>
                      └─ Layout.jsx
                           ├─ <Navbar/>
                           ├─ <Suspense fallback="Loading…"><Outlet/></Suspense>  ← the matched page
                           └─ <ChatBot/>                                           ← on every page
```

- `main.jsx` is the only entry point. It imports global CSS and mounts React.
- `Layout` is the shell every route shares. It draws the navbar, the cursor
  glow effect and the floating chatbot. It also holds the single
  `<Suspense>` boundary that every lazily loaded page renders inside.
- `src/lib/firebase.js` is **not** loaded at boot. `ChatBot` and
  `MockInterview` import it, so Firebase is initialised when those modules load.

### 2. Routing and code splitting

`src/router.jsx` defines one parent route (`/`, which renders `Layout`) and
these children:

| Path | Page component |
|---|---|
| `/` | `Home` |
| `/algorithms`, `/patterns` | `DSAIndex` (picks the tab from the path) |
| `/algorithms/:id` | `AlgorithmPage` |
| `/patterns/:id` | `PatternPage` |
| `/system-design`, `/system-design/:id` | `SystemDesignIndex`, `SystemDesignPage` |
| `/ood`, `/ood/:id` | `OODIndex`, `OODPage` |
| `/ai`, `/ai/:id` | `AIIndex`, `AIPage` |
| `/tech-stack`, `/tech-stack/:id` | `TechStackIndex`, `TechStackPage` |

There are two levels of lazy loading:

1. **Pages.** Every page is `React.lazy(() => import(...))`. A page and the
   registry it imports are downloaded only when you first visit that route.
2. **Per-topic visuals.** Detail pages find their visual component with
   `import.meta.glob`, wrapped in `lazyGlob()`:

   ```js
   // src/pages/AlgorithmPage.jsx
   const VISUALIZERS = lazyGlob(import.meta.glob('../content/algorithms/*/Visualizer.jsx'))
   // later, in render:
   const Visualizer = VISUALIZERS[`../content/algorithms/${id}/Visualizer.jsx`]
   ```

   Vite expands the glob at build time into a map from file path to a dynamic
   `import()`. `lazyGlob` turns each loader into a `React.lazy` component at
   **module scope**, so it is created once and never remounts. Adding a
   visualizer only means adding the file; no import lines are needed.

The production server must send every path to `index.html` so client-side
routing works. `netlify.toml` does this with a `/* → /index.html 200` rewrite.

### 3. Registries: the content catalogue

Everything the UI lists comes from `src/constants/`. Pages never scan the
filesystem for metadata. They read a registry, and use globs only to find
visual components (and, for system design, each topic's full content).

The two largest sections keep their registries **metadata-only**, so pages
that only list items (the home page, index pages, sidebars, the roadmap)
stay small. The long-form content is fetched when a detail page opens:

| Section | Always loaded | Loaded on the detail page |
|---|---|---|
| System design | `<slug>/meta.js`: id, type, title, category, tags, description | `<slug>/index.js` via `loadSystemDesignItem(item)` (one chunk per topic) |
| AI | `AI_ITEMS` in `aiRegistry.js`: id, category, title, color, tagline, duration | `content/ai/aiContent.js` via `loadAiContent()` (one chunk for all AI topics) |

`path` is never stored in content files. The registries add it from the id
(`/algorithms/${id}`, `/system-design/${id}`).

| Registry | What it holds | Where data lives |
|---|---|---|
| `algorithmRegistry.js` | `ALGORITHMS`, `CATEGORY_LABELS`, `DIFFICULTY_COLOR` | Imports each `content/algorithms/<slug>/index.js`; adds `path` |
| `patternsRegistry.js` | `PATTERNS`, `PATTERN_COLORS` | Inline; links to algorithms through `algorithmIds` |
| `systemDesignRegistry.js` | `SYSTEM_DESIGN`, `TYPE_LABEL`, `TYPE_COLOR`, `loadSystemDesignItem` | Imports each concept/design `meta.js`; adds `path`; lazy-loads `index.js` |
| `systemDesignRoadmap.js` | `ROADMAP_STAGES`, `JOURNEY_STEPS`, `DESIGN_TIERS`, `WHY_BY_ID`, `ROADMAP_ITEMS`, `ROADMAP_SIDEBAR_GROUPS` | Learning order and a "why this exists" note for every SD item |
| `oodRegistry.js` | `OOD_PATTERNS`, `OOD_QUESTIONS`, `OOD_ITEMS`, ... | Inline |
| `aiRegistry.js` | `AI_ITEMS`, `AI_CATEGORY_LABELS`, `loadAiContent` | Index-level fields inline; content in `content/ai/aiContent.js` |
| `techStackRegistry.js` | `TECH_STACK_ITEMS`, ... | Inline |
| `palette.js` | `PALETTE`, `DIFFICULTY_COLOR` | Shared colour tokens (the `*_COLORS` exports are aliases) |
| `sections.js` | `NAV_SECTIONS` | Section labels/paths shared by the navbar and breadcrumbs |

Tailwind class names in these files must be written out in full (no template
strings), so Tailwind's scanner can find them.

### 4. Detail pages: how a topic gets rendered

Every detail page follows the same flow:

```
URL /<section>/:id
  │
  ├─ useParams() → id
  ├─ findWithNeighbors(REGISTRY_ITEMS, id) → { item, prevItem, nextItem }
  │     (unknown id → <Navigate to="/<section>"/>)
  ├─ VISUALS[`../content/<section>/${id}/<Visual>.jsx`] → lazy component, or undefined
  │
  └─ <DetailPageLayout sidebarGroups breadcrumb activeId prev/next>
        ├─ <DetailHero/>           title, badges, tagline, description
        ├─ <Suspense><Visual/></Suspense>   (fallback panel if the topic has no visual)
        └─ <InfoPanel/> <NumberedList/> <BulletList/> ...   text from the registry item
```

**System design and AI pages** add one step. The registry item is metadata
only, so the page renders the layout straight away and loads the body inside
`<Suspense fallback={<DetailLoading/>}>`:

```
SystemDesignPage / AIPage            (sidebar, breadcrumb, prev/next render immediately)
  └─ <Suspense fallback={<DetailLoading/>}>
       └─ SystemDesignDetail / AIDetailBody
            item = use(loadSystemDesignItem(meta))          // or use(loadAiContent())
            renders hero, diagram/animation, panels, mock interview
```

The load functions cache their promise per item, which React's `use()` needs
(a stable promise across re-renders).

Shared building blocks (in `src/components/detail/`):

- `DetailPageLayout`: sidebar, breadcrumb, page-enter animation (`lib/motion` → `PAGE_ENTER`) and prev/next links (`AdjacentNav`).
- `DetailHero`: header block used by OOD, AI, Tech Stack and Patterns.
- `Panels`: `InfoPanel`, `HeaderPanel`, `NumberedList`, `BulletList`, `Badge`, `SectionLabel`. Their `palette` props take an entry from `PALETTE`.

Section-specific behaviour:

- **OODPage** shows the Participants panel when a pattern has no `Animation.jsx`.
- **AIPage** shows concept items with an optional `Animation.jsx`. Key Takeaways
  goes in the right column when there's no animation, and below the grid when
  there is one. `live-coding` items render through `LiveCodingDetail` using
  `LIVE_CODING_AI_GUIDE` (from `aiContent.js`).

### 5. Algorithm visualizers: the step pipeline

This is the core idea behind the DSA section. The algorithm is run **ahead of
time** into an array of snapshots, and the UI just moves through that array.

```
content/algorithms/<slug>/steps.js
   build<Name>Steps(input) → [ { type: 'compare', lo, hi, mid, ... }, ... ]
                                         │
content/algorithms/<slug>/Visualizer.jsx │
   steps = useMemo(() => buildSteps(input))
   runner = useStepRunner(steps)  ──────►  { step, index, total, playing, speed,
                                           play, stop, next, prev, reset, setIndex }
   renders the current `step` (Framer Motion animates between snapshots)
   <StepControls runner={runner}/>    play/pause/prev/next/speed (+ TTS toggle)
   useEffect → onStepChange(step)  ─────┐
                                         ▼
pages/AlgorithmPage.jsx
   currentStep state ──► <CodePanel solution={algo.solution} step={currentStep}/>
                            approach[lang].getHighlightLines(step) → highlighted line numbers
```

- **`steps.js`** is pure logic with no React. Every step object must have a `type`.
- **`useStepRunner(steps)`** (`src/hooks/useStepRunner.js`) owns the index and a
  `setInterval` playback loop (`BASE_INTERVAL = 900ms` at 1×, divided by
  `speed`). It stops automatically on the last step.
- **`useTtsRunner(steps, getText)`** is a drop-in replacement that adds
  `runner.tts` for spoken narration through `useSpeech` (the Web Speech API).
  `StepControls` shows the TTS toggle only when `runner.tts` is non-null.
- **`index.js`** holds the problem metadata and `solution.approaches[]`. Each
  approach has `{ code, getHighlightLines(step) }` per language, which is how the
  code panel stays in sync with the animation.
- `tree-traversal` is a special case. It also reports `onOrderChange`, so the
  code tab follows the selected traversal order.

Pattern animations (`content/patterns/*/Animation.jsx`) use
`usePatternAnimation(durations)`, a simpler phase loop that runs automatically
and has no user step controls.

### 6. System design: roadmap, diagrams and mock interview

**Roadmap.** `systemDesignRoadmap.js` controls the order of the whole section:

- Concepts sit inside `JOURNEY_STEPS`. Each step goes *bottleneck →
  concepts[{ id, why }] → tradeoff*. Example: "one server can't keep up"
  → load balancing → "now state is a problem".
- Designs sit in `DESIGN_TIERS`, with a `teaches` list.
- This file drives the index page's `ScaleJourney` animation and stage cards,
  the detail sidebar, prev/next order (`ROADMAP_ITEMS`), and the "Why this
  exists" panel (`WHY_BY_ID`).
- `/system-design?step=N` deep-links into the journey.
- In dev, a `console.assert` warns about any SD item missing from the roadmap
  and any roadmap id that has no matching item.

**Diagrams.** `SystemDesignPage` globs `content/system-design/**/Diagram.jsx`
(and optional `ConceptIllustration.jsx`). Each diagram animates through its
topic's `steps.js` with the same step-runner approach the algorithms use.

**Mock interview** (only for designs with `interviewEnabled: true`, currently
URL Shortener):

```
SystemDesignPage ─► <MockInterview design={item}/>
  Start:
    sessionId = crypto.randomUUID()
    callInterviewChat({ uid, sessionId, designId: design.id, messages: [kickoff], endRequested:false })
  Each turn:
    append user message → resend the full history + designId
    (the server looks up the rubric by designId and tracks the session in Firestore)
  End:
    callInterviewChat({ ..., endRequested: true })
    reply starts with "**Mock Interview Assessment**" → UI marks the session ended
  Errors:
    RATE_LIMITED | SESSION_TURN_LIMIT | INVALID_* → end the session
    API_ERROR → show a message the user can retry from
```

### 7. The AI backend: Cloud Functions

**Client side** (`src/lib/firebase.js`): initialises the Firebase app from the
`VITE_FIREBASE_*` env vars and exports two callables, `callChat` and
`callInterviewChat`. The client never calls Anthropic directly, and the API
key only exists server-side as a Firebase secret.

**Identity** (`src/lib/userId.js`): `getUserId()` creates a
`crypto.randomUUID()` the first time and stores it in localStorage under
`algviz-uid`. It is anonymous, has no login, and is used only for rate limiting.

**Generated data** (`functions/generated/`). The functions package can't
import the frontend registries, so `scripts/build-functions-data.mjs` loads
them through Vite's SSR loader and writes two JSON files:

- `catalog.json`: every topic on the site (section, title, path, label). The chatbot prompt is built from it.
- `rubrics.json`: the interview rubric for each design with `interviewEnabled: true`, keyed by design id.

It runs as a `predeploy` hook in `firebase.json`, so a deploy always matches
the site. Run it by hand with `npm run functions:data`.

**Server side** (`functions/index.js`). Both functions are `onCall` HTTPS
callables with `secrets: [ANTHROPIC_API_KEY]` and `cors: true`. They share
three helpers:

| Helper | What it does |
|---|---|
| `checkDailyLimit({ collection, field, uid, limit })` | Per-uid daily counter, read and incremented in one **Firestore transaction** so parallel requests can't both get under the limit. Lets requests through if Firestore is down. |
| `sanitise(messages, maxTurns?)` | Keeps only `user`/`assistant` turns with string content, trims each to 2,000 chars, and optionally keeps only the last N turns. |
| `askClaude({ label, model, maxTokens, system, messages, fallback })` | One Claude call: `effort: 'low'`, automatic prompt caching (`cache_control`), and optional server-side refusal fallback. Checks `stop_reason` for a refusal, reads only the `text` blocks (current models can return `thinking` blocks first), and maps everything to `{ reply }` or `{ error }`. |

#### `chat` (the floating chatbot)

```
ChatBot.jsx ── callChat({ messages, uid }) ──► chat
  1. Validate uid (string, ≤ 64 chars) and messages
  2. checkDailyLimit: Firestore rateLimits/{uid} = { count, date }
       same day and count ≥ 10 → { error: 'RATE_LIMITED' }
       otherwise increment (resets on a new UTC day)
  3. sanitise(messages, 20)
  4. askClaude({ model: 'claude-haiku-5-5', maxTokens: 4000, system: SYSTEM_PROMPT })
  5. return { reply } or { error: 'API_ERROR' }
```

`SYSTEM_PROMPT` is built from `generated/catalog.json`, so it lists every
topic on the site. It tells the model to link users to the right page, keep
answers to 3–5 sentences, and decline off-topic questions.

#### `interviewChat` (the mock interviewer)

```
MockInterview.jsx ── callInterviewChat({ uid, sessionId, designId, messages, endRequested }) ──► interviewChat
  1. Validate uid and sessionId; messages must be 1–24 long
       (> 24 → { error: 'SESSION_TURN_LIMIT' })
  2. rubric = RUBRICS[designId] from generated/rubrics.json
       (unknown design → { error: 'INVALID_MESSAGES' }; the client never sends a rubric)
  3. claimInterviewTurn — one Firestore transaction over interviewSessions/{sessionId}:
       new sessionId  → counts against interviewRateLimits/{uid} (2 sessions/day → 'RATE_LIMITED'),
                        then creates { uid, designId, calls: 1, createdAt, expiresAt }
       existing       → must belong to the same uid + designId (else 'INVALID_MESSAGES');
                        calls ≥ 14 → 'SESSION_TURN_LIMIT'; otherwise calls + 1
  4. sanitise(messages)
  5. If endRequested → append a "[SYSTEM: ...end the interview...]" user turn
  6. askClaude({ model: 'claude-sonnet-5-5', maxTokens: 8000,
                 system: interviewSystemPrompt(rubric), fallback: true })
  7. return { reply } or { error: 'API_ERROR' }
```

Sessions are counted when Firestore first sees a `sessionId`, so faking a
longer history can't skip the daily limit. Turns are counted on the server,
so trimming the history can't make a session run forever. `expiresAt` is
there for a Firestore TTL policy, which you can turn on in the console to
delete old session docs.

`interviewSystemPrompt(rubric)` takes the role of a senior staff interviewer.
It walks through five stages (requirements → data model → API → HLD →
deep dive), asks one question at a time, never reveals the rubric word for
word, and ends with a fixed-format assessment (Strengths / Gaps / Suggested
Level).

#### Error codes returned to the client

| Code | Meaning |
|---|---|
| `INVALID_UID` | Missing or oversized uid |
| `INVALID_MESSAGES` | Bad message list or sessionId, unknown designId, or a session that belongs to another user |
| `RATE_LIMITED` | Daily limit hit (10 chat messages, or 2 interview sessions) |
| `SESSION_TURN_LIMIT` | Interview went past 24 messages or 14 calls |
| `API_ERROR` | The Anthropic call failed, the model declined (refusal), or it returned no text |

---

## Adding content

| To add... | Do this |
|---|---|
| **Algorithm** | Create `src/content/algorithms/<slug>/` with `index.js` (metadata + `solution.approaches`; no `path`, the registry adds it), `steps.js` (`build<Name>Steps`) and `Visualizer.jsx` (uses `useStepRunner`, calls `onStepChange`). Import `index.js` in `algorithmRegistry.js`. Add the id to the matching pattern's `algorithmIds` in `patternsRegistry.js`. |
| **System design concept/design** | Create `src/content/system-design/<concepts\|designs>/<slug>/` with `meta.js` (id, type, title, category, tags, description), `index.js` (`import meta from './meta.js'`, then `export default { ...meta, ...rest }`), `steps.js` and `Diagram.jsx`. Import its `meta.js` in `systemDesignRegistry.js`. **Also place it in `systemDesignRoadmap.js`** (a journey step for a concept, a `DESIGN_TIERS` entry for a design), or the dev assert will fire. Set `interviewEnabled: true` on a design to turn on the mock interview. |
| **Pattern** | Add metadata inline in `patternsRegistry.js`; optionally add `src/content/patterns/<slug>/Animation.jsx`. |
| **AI item** | Add the index fields (id, category, title, color, tagline, duration) to `AI_ITEMS` in `aiRegistry.js`, and the rest under the same id in `AI_CONTENT` in `src/content/ai/aiContent.js`. Optionally add `src/content/ai/<slug>/Animation.jsx`. |
| **OOD / Tech Stack item** | Add an entry inline in the registry; optionally add `src/content/ood/<slug>/Animation.jsx`. |

You never need to import visual components by hand. The `import.meta.glob`
calls in the detail pages pick them up. After adding or renaming topics, the
next functions deploy regenerates the chatbot catalog automatically.

---

## Deployment

- **Frontend:** Netlify runs `npm run build` and publishes `dist/`, with the
  SPA fallback in `netlify.toml`. Set the `VITE_FIREBASE_*` variables in the
  Netlify environment.
- **Functions:** `firebase deploy --only functions` (Node 22). The predeploy
  hook regenerates `functions/generated/`. The Anthropic key comes from
  `firebase functions:secrets:set ANTHROPIC_API_KEY`.
- **Deploy both together** when the interview API changes. The current client
  sends `designId` and the current function needs it, so an old client
  talking to a new function (or the other way round) gets `INVALID_MESSAGES`.

---

## Known issues and next steps

- **Rate limits are still tied to a client-generated id.** Clearing
  localStorage gives a new `uid` and resets the daily limits, and both limits
  let requests through when Firestore is unavailable. Firebase App Check or
  anonymous Auth (to trust the uid) plus a global daily cap would close this.
- **Turn on a Firestore TTL policy** on `interviewSessions.expiresAt` so old
  session docs are deleted.
- **`algorithmRegistry` (about 80 kB) still loads in full** on the home page
  and the DSA index, because it includes every solution's code. It could be
  split into metadata and lazily loaded content the same way as system design.
- **Effort and `max_tokens` haven't been tuned.** Both functions run at
  `effort: 'low'`. Compare reply quality and latency on real conversations
  before raising it.
- `SystemDesignPage.jsx` is about 1,650 lines and would be easier to work with
  if split into smaller components.
