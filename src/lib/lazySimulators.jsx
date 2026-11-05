import { lazy } from 'react'

// Turns an `import.meta.glob('.../scenario.js')` result into lazy simulator
// components keyed by file path, so the engine and each scenario load only on
// pages that use them. Call it at module scope, like lazyGlob.
export function lazySimulators(scenarios) {
  return Object.fromEntries(
    Object.entries(scenarios).map(([path, loadScenario]) => [
      path,
      lazy(async () => {
        const [{ default: Simulator }, { default: scenario }] = await Promise.all([
          import('../components/system-design/sim/Simulator'),
          loadScenario(),
        ])
        return { default: () => <Simulator scenario={scenario} /> }
      }),
    ]),
  )
}
