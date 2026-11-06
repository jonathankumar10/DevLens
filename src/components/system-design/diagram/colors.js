// Colours for system design diagrams. `hex` paints lines and dots, `glow` is
// the drop-shadow around them. Written out in full so every diagram matches.
export const FLOW = {
  violet:  { hex: '#8b5cf6', glow: 'rgba(139,92,246,0.85)' },
  purple:  { hex: '#a855f7', glow: 'rgba(168,85,247,0.85)' },
  fuchsia: { hex: '#e879f9', glow: 'rgba(232,121,249,0.85)' },
  pink:    { hex: '#ec4899', glow: 'rgba(236,72,153,0.85)' },
  red:     { hex: '#f43f5e', glow: 'rgba(244,63,94,0.85)' },
  amber:   { hex: '#f59e0b', glow: 'rgba(245,158,11,0.85)' },
  emerald: { hex: '#10b981', glow: 'rgba(16,185,129,0.85)' },
  cyan:    { hex: '#06b6d4', glow: 'rgba(6,182,212,0.85)' },
  sky:     { hex: '#0ea5e9', glow: 'rgba(14,165,233,0.85)' },
  blue:    { hex: '#3b82f6', glow: 'rgba(59,130,246,0.85)' },
  slate:   { hex: '#64748b', glow: 'rgba(100,116,139,0.85)' },
}

// Default meaning of a step's `connections[edgeId]` value: which colour of dot
// travels forward (x1,y1 → x2,y2) and which travels back.
export const DEFAULT_DIRECTIONS = {
  request:  { fwd: FLOW.violet,  bwd: null },
  response: { fwd: FLOW.emerald, bwd: null },
  both:     { fwd: FLOW.violet,  bwd: FLOW.emerald },
}
