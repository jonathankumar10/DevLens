import { useState, useCallback, useRef, useEffect } from 'react'

const BASE_INTERVAL = 900 // ms at 1×

/**
 * Drives step-by-step playback for any algorithm visualizer.
 * Returns controls and the current step object.
 *
 * speed — playback multiplier (options are listed in StepControls)
 */
export function useStepRunner(steps) {
  const [index,   setIndex]   = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed,   setSpeed]   = useState(1)
  const intervalRef = useRef(null)

  const stop = useCallback(() => {
    setPlaying(false)
    clearInterval(intervalRef.current)
  }, [])

  const reset = useCallback(() => {
    stop()
    setIndex(0)
  }, [stop])

  const next = useCallback(() => {
    setIndex((i) => {
      if (i >= steps.length - 1) { stop(); return i }
      return i + 1
    })
  }, [steps.length, stop])

  const prev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1))
  }, [])

  const play = useCallback(() => {
    if (index >= steps.length - 1) setIndex(0)
    setPlaying(true)
  }, [index, steps.length])

  // Restart the interval whenever playing state or speed changes
  useEffect(() => {
    if (playing) {
      const delay = Math.round(BASE_INTERVAL / speed)
      intervalRef.current = setInterval(() => {
        setIndex((i) => {
          if (i >= steps.length - 1) {
            setPlaying(false)
            clearInterval(intervalRef.current)
            return i
          }
          return i + 1
        })
      }, delay)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing, steps.length, speed])

  return {
    step: steps[index] ?? steps[0],
    index,
    total: steps.length,
    playing,
    speed,
    setSpeed,
    play,
    stop,
    next,
    prev,
    reset,
    setIndex,
  }
}
