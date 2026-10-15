import { lazy } from 'react'

// Turns an `import.meta.glob(...)` result into lazy components keyed by the
// same file paths. Call it at module scope: creating lazy components during
// render would remount them on every render.
export function lazyGlob(modules) {
  return Object.fromEntries(
    Object.entries(modules).map(([path, loader]) => [path, lazy(loader)])
  )
}
