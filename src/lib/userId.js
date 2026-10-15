// The legacy 'algviz-' prefix is kept so returning visitors keep their id.
const STORAGE_KEY = 'algviz-uid'

// Stable per-browser id the Cloud Functions use for rate limiting.
// It is never tied to a login.
export function getUserId() {
  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}
