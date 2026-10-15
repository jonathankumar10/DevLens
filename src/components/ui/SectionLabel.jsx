// Small uppercase heading used above most content blocks.
export default function SectionLabel({ children, className = 'text-slate-500' }) {
  return (
    <p className={`text-[11px] font-semibold uppercase tracking-wider ${className}`}>
      {children}
    </p>
  )
}
