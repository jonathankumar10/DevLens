// Generates the data the Cloud Functions need from the frontend registries,
// so the backend can never drift from what the site actually contains:
//
//   functions/generated/catalog.json  — every topic on the site, for the chatbot prompt
//   functions/generated/rubrics.json  — mock interview rubrics, keyed by design id
//
// The registries use Vite-style extensionless imports, so they are loaded
// through Vite's SSR module loader rather than plain Node.
//
// Runs automatically before `firebase deploy --only functions` (see firebase.json).
// Run by hand with: npm run functions:data

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const OUT_DIR = fileURLToPath(new URL('../functions/generated/', import.meta.url))

// Fields from a design's index.js that make up its interview rubric.
const RUBRIC_FIELDS = [
  'title', 'description', 'requirements', 'dataModel', 'apiDesign',
  'hldFlows', 'deepDive', 'levelExpectations', 'keyPoints',
]

const server = await createServer({
  server:   { middlewareMode: true },
  appType:  'custom',
  logLevel: 'error',
})
const load = (name) => server.ssrLoadModule(`/src/constants/${name}.js`)

try {
  const { ALGORITHMS, CATEGORY_LABELS }    = await load('algorithmRegistry')
  const { PATTERNS }                       = await load('patternsRegistry')
  const { SYSTEM_DESIGN, TYPE_LABEL, loadSystemDesignItem } = await load('systemDesignRegistry')
  const { OOD_ITEMS, OOD_CATEGORY_LABELS } = await load('oodRegistry')
  const { AI_ITEMS, AI_CATEGORY_LABELS }   = await load('aiRegistry')
  const { TECH_STACK_ITEMS, TECH_STACK_CATEGORY_LABELS } = await load('techStackRegistry')

  const catalog = [
    {
      section: 'Algorithms',
      items: ALGORITHMS.map((a) => ({
        title: a.title,
        path:  a.path,
        meta:  `${a.difficulty} · ${CATEGORY_LABELS[a.category] ?? a.category}`,
      })),
    },
    {
      section: 'DSA Patterns',
      items: PATTERNS.map((p) => ({ title: p.title, path: `/patterns/${p.id}`, meta: 'Pattern' })),
    },
    {
      section: 'System Design',
      items: SYSTEM_DESIGN.map((s) => ({
        title: s.title,
        path:  s.path,
        meta:  TYPE_LABEL[s.type] ?? s.type,
      })),
    },
    {
      section: 'Object-Oriented Design',
      items: OOD_ITEMS.map((o) => ({
        title: o.title,
        path:  `/ood/${o.id}`,
        meta:  OOD_CATEGORY_LABELS[o.category] ?? o.category,
      })),
    },
    {
      section: 'AI Engineering',
      items: AI_ITEMS.map((a) => ({
        title: a.title,
        path:  `/ai/${a.id}`,
        meta:  AI_CATEGORY_LABELS[a.category] ?? a.category,
      })),
    },
    {
      section: 'Tech Stack',
      items: TECH_STACK_ITEMS.map((t) => ({
        title: t.title,
        path:  `/tech-stack/${t.id}`,
        meta:  TECH_STACK_CATEGORY_LABELS[t.category] ?? t.category,
      })),
    },
  ]

  // The registry holds metadata only; rubric fields live in each design's full content.
  const designs = await Promise.all(
    SYSTEM_DESIGN.filter((s) => s.type === 'design').map(loadSystemDesignItem)
  )
  const rubrics = Object.fromEntries(
    designs
      .filter((d) => d.interviewEnabled)
      .map((d) => [d.id, Object.fromEntries(RUBRIC_FIELDS.map((f) => [f, d[f]]))])
  )

  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(join(OUT_DIR, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n')
  await writeFile(join(OUT_DIR, 'rubrics.json'), JSON.stringify(rubrics, null, 2) + '\n')

  const topicCount = catalog.reduce((n, s) => n + s.items.length, 0)
  console.log(`functions data: ${topicCount} topics, ${Object.keys(rubrics).length} interview rubric(s) → functions/generated/`)
} finally {
  await server.close()
}
