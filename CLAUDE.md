# CLAUDE.md

@context/project-overview.md
@context/architecture-context.md
@context/code-standards.md
@context/ui-context.md
@context/ai-workflow-rules.md

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
firebase deploy --only functions
firebase functions:secrets:set ANTHROPIC_API_KEY
```

## Routing

`src/router.jsx` — shared `Layout`, each section has an index + detail route:

| Path | Description |
|---|---|
| `/algorithms/:id` | Step-through algorithm visualizers |
| `/patterns/:id` | DSA pattern reference pages |
| `/system-design/:id` | System design concept/design explainers |
| `/ood/:id` | GoF design patterns and OOD interview questions |
| `/ai/:id` | AI concepts: history, ML, LLMs, workflows, agents, production, live-coding interviews |

`/algorithms` and `/patterns` share one index component, `src/pages/DSAIndex.jsx`, which renders `AlgorithmsIndex`/`PatternsIndex` as tab panels based on the current path. The navbar exposes this as a single "DSA" entry.

## Registries (`src/constants/`)

| File | Exports | Content type |
|---|---|---|
| `algorithmRegistry.js` | `ALGORITHMS`, `DIFFICULTY_COLOR` | Imports `index.js` modules |
| `patternsRegistry.js` | `PATTERNS`, `PATTERN_COLORS` | Inline, joins algorithms by `algorithmIds` |
| `systemDesignRegistry.js` | `SYSTEM_DESIGN`, `TYPE_LABEL`, `TYPE_COLOR`, `SD_CATEGORY_LABELS` | Imports `index.js` modules |
| `oodRegistry.js` | `OOD_PATTERNS`, `OOD_QUESTIONS`, `OOD_ITEMS`, `OOD_COLORS`, `OOD_CATEGORY_LABELS` | Inline |
| `aiRegistry.js` | `AI_ITEMS`, `AI_COLORS`, `AI_CATEGORY_LABELS`, `LIVE_CODING_AI_GUIDE` | Inline |

## Content Module Shapes

### Algorithm — `src/content/algorithms/<slug>/`

`index.js` exports a plain object:
- `id`, `title`, `difficulty`, `pattern`, `category`, `path`, `description`, `metaphor`, `tags`, `problemUrl`, `problemLabel`
- `solution.approaches[]` — each: `id`, `label`, `complexity`, and per-language (`java`, `python`) `{ code, getHighlightLines(step) }`

`steps.js` exports `build<Name>Steps(...)` → array of step objects, each must have a `type` field.

`Visualizer.jsx` is lazy-loaded via `import.meta.glob` in `AlgorithmPage.jsx` — no manual import needed.

### System Design — `src/content/system-design/<concepts|designs>/<slug>/`

`index.js` exports a plain object with `id`, `type` (concept | design), `category`, `title`, `tagline`, and concept-specific fields.

`steps.js` exports a steps array used by the diagram animator.

`Diagram.jsx` is lazy-loaded via `import.meta.glob` in `SystemDesignPage.jsx` — no manual import needed.

### Pattern — `src/content/patterns/<slug>/`

`Animation.jsx` is lazy-loaded via `import.meta.glob` in `PatternPage.jsx`. Pattern metadata is inline in `patternsRegistry.js`.

### AI topic — `aiRegistry.js` inline

Concept items (`category`: history | ml | llms | workflows | agents | production): `id`, `category`, `title`, `color`, `tagline`, `description`, `howItWorks[]`, `keyPoints[]`, `interviewAngles[]`

Live-coding items (`category: 'live-coding'`): `id`, `category`, `title`, `color`, `tagline`, `duration`, `description`, `core[]`, and additional interview-guide fields. Rendered by `LiveCodingDetail` component in `AIPage.jsx`.

`LIVE_CODING_AI_GUIDE` is a standalone object with AI coding interview tips (keys: `claudeMd`, `planMode`, `prompting`, etc.) used in the live-coding detail view.

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
