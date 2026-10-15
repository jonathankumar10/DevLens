const CHEVRON_PATHS = {
  left:  'M15 19l-7-7 7-7',
  right: 'M9 5l7 7-7 7',
  down:  'M19 9l-7 7-7-7',
  up:    'M5 15l7-7 7 7',
}

export default function ChevronIcon({ direction = 'right', className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={CHEVRON_PATHS[direction]} />
    </svg>
  )
}
