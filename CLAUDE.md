# CLAUDE.md

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build
npm run preview   # Preview production build locally
npm run lint      # ESLint (no --fix by default)
```

No test suite.

### Firebase Functions

```bash
cd functions && npm install
npm run functions:data             # regenerate functions/generated/*.json from the registries
firebase deploy --only functions   # runs functions:data automatically (predeploy hook)
firebase functions:secrets:set ANTHROPIC_API_KEY
```

`functions/generated/catalog.json` (chatbot topic list) and `rubrics.json` (mock interview rubrics, keyed by design id) are built by `scripts/build-functions-data.mjs` — never edit them by hand. The interview client sends only `designId`; the rubric is looked up server-side.

## Routing

`src/router.jsx` — shared `Layout`, each section has an index + detail route:

| Path | Description |
|---|---|
| `/algorithms/:id` | Step-through algorithm visualizers |
| `/patterns/:id` | DSA pattern reference pages |
| `/system-design/:id` | System design concept/design explainers |
| `/ood/:id` | GoF design patterns and OOD interview questions |
| `/ai/:id` | AI concepts: history, ML, LLMs, workflows, agents, production, live-coding interviews |
| `/tech-stack/:id` | Tools used across projects: how they work + key learnings |

`/algorithms` and `/patterns` share one index component, `src/pages/DSAIndex.jsx`, which renders `AlgorithmsIndex`/`PatternsIndex` as tab panels based on the current path. The navbar exposes this as a single "DSA" entry.

## Registries (`src/constants/`)

| File | Exports | Content type |
|---|---|---|
| `algorithmRegistry.js` | `ALGORITHMS`, `DIFFICULTY_COLOR` | Imports `index.js` modules; derives `path` from `id` |
| `patternsRegistry.js` | `PATTERNS`, `PATTERN_COLORS` | Inline, joins algorithms by `algorithmIds` |
| `systemDesignRegistry.js` | `SYSTEM_DESIGN`, `TYPE_LABEL`, `TYPE_COLOR`, `loadSystemDesignItem` | Imports each item's `meta.js` (metadata only) and derives `path`; `loadSystemDesignItem(item)` lazy-loads the full `index.js` |
| `systemDesignRoadmap.js` | `ROADMAP_STAGES`, `DESIGN_TIERS`, `JOURNEY_STEPS`, `WHY_BY_ID`, `ROADMAP_ITEMS`, `ROADMAP_SIDEBAR_GROUPS` | Learning order + "why" for every SD item |
| `oodRegistry.js` | `OOD_PATTERNS`, `OOD_QUESTIONS`, `OOD_ITEMS`, `OOD_COLORS`, `OOD_CATEGORY_LABELS` | Inline |
| `aiRegistry.js` | `AI_ITEMS`, `AI_COLORS`, `AI_CATEGORY_LABELS`, `loadAiContent` | Index-level fields inline; `loadAiContent()` lazy-loads `content/ai/aiContent.js` (`AI_CONTENT`, `LIVE_CODING_AI_GUIDE`) |
| `techStackRegistry.js` | `TECH_STACK_ITEMS`, `TECH_STACK_COLORS`, `TECH_STACK_CATEGORY_LABELS` | Inline |
| `palette.js` | `PALETTE`, `DIFFICULTY_COLOR` | Shared color tokens; the `*_COLORS` exports above are aliases of `PALETTE` |

## Shared Building Blocks

Reuse these instead of copying markup between pages:

- `components/detail/DetailPageLayout` — sidebar + breadcrumb + page-enter animation + prev/next links. Every section's detail page uses it.
- `components/detail/DetailHero` — title, badges, tagline, tinted description (OOD, AI, Tech Stack, Patterns).
- `components/detail/Panels` — `InfoPanel`, `HeaderPanel`, `NumberedList`, `BulletList`, `Badge`, `SectionLabel`. `palette` props take an entry from `PALETTE`.
- `components/detail/AdjacentNav`, `components/ui/ChevronIcon`, `components/ui/SectionLabel`.
- `lib/lazyGlob(import.meta.glob(...))` — module-scope lazy components keyed by path.
- `lib/findWithNeighbors(items, id)` — `{ item, prevItem, nextItem }` for detail pages.
- `lib/motion` (`PAGE_ENTER`), `lib/firebase` (`callChat`, `callInterviewChat`), `lib/userId`, `lib/markdown`.

Tailwind classes in shared constants must be written out in full — never built with template strings — so Tailwind can find them.

## Content Module Shapes

### Algorithm — `src/content/algorithms/<slug>/`

`index.js` exports a plain object:
- `id`, `title`, `difficulty`, `pattern`, `category`, `description`, `metaphor`, `tags`, `problemUrl`, `problemLabel` (`path` is derived by the registry — don't add it)
- `solution.approaches[]` — each: `id`, `label`, `complexity`, and per-language (`java`, `python`) `{ code, getHighlightLines(step) }`

`steps.js` exports `build<Name>Steps(...)` → array of step objects, each must have a `type` field.

`Visualizer.jsx` is lazy-loaded via `import.meta.glob` in `AlgorithmPage.jsx` — no manual import needed.

### System Design — `src/content/system-design/<concepts|designs>/<slug>/`

`meta.js` exports the index-level fields: `id`, `type` (concept | design), `title`, `category`, `tags`, `description`. The registry imports only these, so index pages, the roadmap and the sidebar stay small.

`index.js` does `import meta from './meta.js'` and exports `{ ...meta, metaphor, howItWorks, keyPoints, ... }` with the rest of the content (designs with a mock interview also set `interviewEnabled: true` plus the rubric fields). `SystemDesignPage` loads it on demand via `loadSystemDesignItem` + React `use()` inside a `<Suspense>`; `path` is derived — don't add it.

`steps.js` exports a steps array used by the diagram animator.

`Diagram.jsx` is lazy-loaded via `import.meta.glob` in `SystemDesignPage.jsx` — no manual import needed.

Every SD item must also be placed in `systemDesignRoadmap.js` (a dev-only `console.assert` flags missing ids): concepts go in a journey step (`bottleneck` → `concepts[{ id, why }]` → `tradeoff`), designs in a `DESIGN_TIERS` entry with `teaches`. The roadmap drives the index (`ScaleJourney` animation + stage cards), the detail sidebar, prev/next order, and the detail page's "Why this exists" panel. `/system-design?step=N` deep-links the journey.

### Pattern — `src/content/patterns/<slug>/`

`Animation.jsx` is lazy-loaded via `import.meta.glob` in `PatternPage.jsx`. Pattern metadata is inline in `patternsRegistry.js`.

### AI topic — `aiRegistry.js` + `content/ai/aiContent.js`

Each item is split in two: `AI_ITEMS` in `aiRegistry.js` holds only `id`, `category`, `title`, `color`, `tagline` (+ `duration` for live-coding) — what the index, sidebar and home page need. Everything else lives under the same id in `AI_CONTENT` in `src/content/ai/aiContent.js`, which `AIPage` loads on demand via `loadAiContent()` + React `use()`. Field lists below are the merged item.

Concept items (`category`: history | ml | llms | workflows | agents | production): `id`, `category`, `title`, `color`, `tagline`, `description`, `howItWorks[]`, `keyPoints[]`, `interviewAngles[]`

Live-coding items (`category: 'live-coding'`): `id`, `category`, `title`, `color`, `tagline`, `duration`, `description`, `core[]`, and additional interview-guide fields. Rendered by `LiveCodingDetail` component in `AIPage.jsx`.

`LIVE_CODING_AI_GUIDE` (in `aiContent.js`) is a standalone object with AI coding interview tips (keys: `claudeMd`, `planMode`, `prompting`, etc.) used in the live-coding detail view.

`AIPage.jsx` lazy-loads `src/content/ai/*/Animation.jsx`. Key Takeaways always renders for concept items — right column when no animation, below the two-column grid when animation is present.

### OOD item — `oodRegistry.js` inline

`type: 'pattern'` — `id`, `type`, `category` (creational | structural | behavioral), `title`, `color`, `tagline`, `description`, `howItWorks[]`, `whenToUse[]`, `participants[]`, `realWorldExamples[]`, `leetcodeProblems[]`

`type: 'question'` — `id`, `type`, `category: 'question'`, `title`, `color`, `difficulty`, `tagline`, `description`, `requirements[]`, `keyClasses[]`, `patternsUsed[]`, `hints[]`

`OODPage.jsx` lazy-loads `src/content/ood/*/Animation.jsx`. Falls back to Participants panel if no animation.

## Playback Hooks

- `useStepRunner(steps)` — play/pause/speed/prev/next/reset. `BASE_INTERVAL` 900ms at 1×.
- `useTtsRunner(steps, getText)` — drop-in for `useStepRunner` with opt-in TTS via browser Speech Synthesis. Returns same runner shape plus `runner.tts = { enabled, toggle, voices, selectedVoice, setVoice }` (or `null` if unsupported). `StepControls` renders TTS toggle automatically when `runner.tts` is non-null.
- `useSpeech()` — low-level `window.speechSynthesis` wrapper, used internally by `useTtsRunner`.
- `usePatternAnimation(durations)` — auto-cycling phase animation for pattern index pages.
