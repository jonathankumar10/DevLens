// ── Tech Stack Registry ──────────────────────────────────────────────────────
// A running log of tools/technologies actually used across projects — what
// each one is, how it works, and the inferences learned from using it.
// Add a new item any time you pick up something new; a category with no
// items just doesn't render in the index or sidebar.
// Categories: frontend | backend | database | devops | tooling

export const TECH_STACK_CATEGORY_LABELS = {
  frontend: 'Frontend',
  backend:  'Backend',
  database: 'Database',
  devops:   'DevOps & Infra',
  tooling:  'Tooling',
}

export const TECH_STACK_COLORS = {
  sky:     { text: 'text-sky-300',    bg: 'bg-sky-500/10',    border: 'border-sky-500/25',    badgeBg: 'bg-sky-500/15',    badgeBorder: 'border-sky-500/30',    dot: 'bg-sky-400',    glow: '#0ea5e9' },
  violet:  { text: 'text-violet-300', bg: 'bg-violet-500/10', border: 'border-violet-500/25', badgeBg: 'bg-violet-500/15', badgeBorder: 'border-violet-500/30', dot: 'bg-violet-400', glow: '#8b5cf6' },
  orange:  { text: 'text-orange-300', bg: 'bg-orange-500/10', border: 'border-orange-500/25', badgeBg: 'bg-orange-500/15', badgeBorder: 'border-orange-500/30', dot: 'bg-orange-400', glow: '#fb923c' },
  emerald: { text: 'text-emerald-300',bg: 'bg-emerald-500/10',border: 'border-emerald-500/25',badgeBg: 'bg-emerald-500/15',badgeBorder: 'border-emerald-500/30',dot: 'bg-emerald-400',glow: '#10b981' },
  rose:    { text: 'text-rose-300',   bg: 'bg-rose-500/10',   border: 'border-rose-500/25',   badgeBg: 'bg-rose-500/15',   badgeBorder: 'border-rose-500/30',   dot: 'bg-rose-400',   glow: '#f43f5e' },
}

export const TECH_STACK_ITEMS = [
  // ── Frontend ────────────────────────────────────────────────────────────────
  {
    id:       'react',
    category: 'frontend',
    title:    'React',
    color:    'sky',
    tagline:  'Component-driven UI, rebuilt from state changes down',
    description:
      'React renders UI as a tree of components that re-render in response to state and prop changes. This project leans on function components, hooks, and React Router for client-side routing — no class components anywhere in the codebase.',
    howItWorks: [
      'A component re-renders whenever its own state changes, its props change, or a parent re-renders — React then diffs the new virtual DOM tree against the previous one.',
      'Hooks (useState, useEffect, useMemo, useCallback) let function components hold state and side effects without ever needing a class.',
      'React Router\'s <Outlet /> pattern (used in this app\'s Layout) lets a shared shell render nested route content without re-mounting the shell on every navigation.',
      'lazy() + Suspense split routes into separate bundles, so a page\'s code (and the registry it imports) only downloads when that route is actually visited.',
    ],
    keyLearnings: [
      'Module-scope constants (like this app\'s SIDEBAR_GROUPS or lazy animation maps) must be created once outside the component — creating them at render time defeats memoization and re-runs expensive work every render.',
      'useMemo is only worth it when the computation is actually expensive or the result identity matters for a dependency array — reaching for it by default adds complexity without payoff.',
      '"Lift state up, push logic down" — keeping registries as plain data modules instead of components makes them trivially importable elsewhere (tests, other pages, build-time tooling).',
    ],
    interviewAngles: [
      'How does React decide whether to re-render a component, and what does the virtual DOM diff actually buy you?',
      'What is the difference between useMemo and useCallback, and when does neither one matter?',
      'Why does code-splitting with lazy() require a Suspense boundary, and what happens without one?',
    ],
  },

  // ── Backend ─────────────────────────────────────────────────────────────────
  {
    id:       'firebase-functions',
    category: 'backend',
    title:    'Firebase Cloud Functions',
    color:    'orange',
    tagline:  'Serverless endpoints that scale to zero between requests',
    description:
      'Cloud Functions run backend code without managing a server — Firebase provisions, scales, and tears down instances per request. Secrets like API keys are managed through Firebase\'s secret manager instead of committed env files.',
    howItWorks: [
      'Each function is deployed independently (`firebase deploy --only functions`) and gets its own HTTPS endpoint or trigger.',
      'Secrets are set once via `firebase functions:secrets:set` and injected into the function\'s environment at invocation — never stored in source control.',
      'Cold starts matter: an idle function spins down to zero, so the first request after inactivity pays a startup cost the rest do not.',
      'Because functions are stateless between invocations, any state that needs to persist (rate limits, caches) has to live in an external store, not in-memory.',
    ],
    keyLearnings: [
      'Keeping an API key server-side in a function — instead of calling a third-party API straight from the browser — is what keeps the secret off the client bundle entirely.',
      'Deploying functions separately from the frontend build (its own `npm install`, own dependency tree) avoids bloating the client bundle with server-only packages.',
      'Cold-start latency is a real UX cost for infrequently-hit endpoints — worth designing around if latency matters.',
    ],
    interviewAngles: [
      'Why keep a third-party API key in a Cloud Function instead of calling the API directly from the frontend?',
      'What is a cold start, and what are the usual mitigations?',
      'How would you handle rate limiting for a stateless serverless function?',
    ],
  },

  // ── Tooling ─────────────────────────────────────────────────────────────────
  {
    id:       'vite',
    category: 'tooling',
    title:    'Vite',
    color:    'violet',
    tagline:  'Native ESM dev server with near-instant hot module reload',
    description:
      'Vite serves source files over native ES modules during development instead of bundling everything upfront, so the dev server starts almost instantly regardless of app size. For production it switches to a Rollup-based bundle.',
    howItWorks: [
      'In dev, the browser requests modules directly; Vite transforms each file on demand instead of pre-bundling the whole app.',
      'Hot Module Replacement (HMR) swaps a changed module in place without a full page reload, preserving component state where possible.',
      '`import.meta.glob` resolves matching files at build time into an object of dynamic imports — the mechanism this app uses to lazy-load every Visualizer/Animation/Diagram component.',
      '`npm run build` switches to Rollup for the production bundle: tree-shaken, code-split, and minified — a different pipeline from the dev server.',
    ],
    keyLearnings: [
      '`import.meta.glob` is what lets this app add a new algorithm/pattern/design just by dropping a file in the right folder — no registry of imports to hand-maintain.',
      'Dev-server behavior and prod-bundle behavior are two different pipelines (esbuild-transformed ESM vs. Rollup) — a bug that only appears in `npm run build` and not `npm run dev` is often a sign the two are diverging.',
    ],
    interviewAngles: [
      'Why is Vite\'s dev server fast even on large apps, and what tradeoff does that make versus a fully pre-bundled dev experience?',
      'What is HMR actually doing under the hood when you save a file?',
    ],
  },
]
