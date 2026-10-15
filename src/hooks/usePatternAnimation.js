import { useState, useEffect, useRef, useCallback } from 'react'

// Auto-cycles through animation phases for the pattern pages.
// `durations[i]` is how long phase i stays on screen at 1× speed (ms).
export function usePatternAnimation(durations) {
  const [phase,     setPhase]     = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed,     setSpeed]     = useState(1)

  const phaseRef = useRef(0)
  const speedRef = useRef(1)

  useEffect(() => { phaseRef.current = phase    }, [phase])
  useEffect(() => { speedRef.current = speed    }, [speed])

  useEffect(() => {
    if (!isPlaying) return
    let tid
    const tick = () => {
      tid = setTimeout(() => {
        const next = (phaseRef.current + 1) % durations.length
        setPhase(next)
        tick()
      }, durations[phaseRef.current] / speedRef.current)
    }
    tick()
    return () => clearTimeout(tid)
  // Only (re)start the timer loop on play/pause. Phase and speed are read via
  // refs so a speed change doesn't reset the current phase's timer.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying])

  const togglePlay = useCallback(() => setIsPlaying((v) => !v), [])

  return { phase, isPlaying, speed, setSpeed, togglePlay }
}
