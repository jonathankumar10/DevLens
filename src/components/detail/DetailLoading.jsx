// Suspense fallback for a detail page's lazily loaded content. Rendered inside
// DetailPageLayout, so the sidebar and breadcrumb stay put while it loads.
export default function DetailLoading() {
  return <div className="py-16 text-center text-slate-500 text-sm">Loading…</div>
}
