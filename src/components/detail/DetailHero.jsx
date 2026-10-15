// Title row with badges, a colored tagline, and a tinted description box.
// Used by the OOD, AI and Tech Stack detail pages.
export default function DetailHero({ title, badges, tagline, description, palette }) {
  return (
    <>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
          {badges}
        </div>
        <p className={`text-base font-medium ${palette.text}`}>{tagline}</p>
      </div>

      <div className={`rounded-xl border px-5 py-4 ${palette.bg} ${palette.border}`}>
        <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
      </div>
    </>
  )
}
