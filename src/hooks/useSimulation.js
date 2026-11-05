import { useCallback, useMemo, useState } from 'react'
import { getInsight, initialState, simulate } from '../lib/sim/model'
import { useStepRunner } from './useStepRunner'

// Slow enough to read a guide step at the default playback speed.
const GUIDE_SPEED = 0.25

function guideState(step) {
  return { failed: [], ...step.state }
}

// Owns a simulator's state. In guide mode the state comes from the current
// step. Changing any control hands over to explore mode from that same state,
// so the diagram never jumps when someone takes over.
export function useSimulation(scenario) {
  const [mode, setMode] = useState('guide')
  const [explored, setExplored] = useState(() => initialState(scenario))
  const runner = useStepRunner(scenario.guide, GUIDE_SPEED)
  const { stop, reset: resetRunner } = runner

  const state = mode === 'guide' ? guideState(runner.step) : explored
  const result = useMemo(() => simulate(scenario, state), [scenario, state])
  const insight = useMemo(() => getInsight(scenario, result), [scenario, result])

  const takeOver = useCallback((change) => {
    stop()
    setExplored(change(state))
    setMode('explore')
  }, [state, stop])

  const setTraffic = useCallback((traffic) => {
    takeOver((s) => ({ ...s, traffic }))
  }, [takeOver])

  const setValue = useCallback((id, value) => {
    takeOver((s) => ({ ...s, values: { ...s.values, [id]: value } }))
  }, [takeOver])

  const toggleFailure = useCallback((id) => {
    takeOver((s) => ({
      ...s,
      failed: s.failed.includes(id) ? s.failed.filter((f) => f !== id) : [...s.failed, id],
    }))
  }, [takeOver])

  const explore = useCallback(() => {
    takeOver((s) => s)
  }, [takeOver])

  const startGuide = useCallback(() => {
    resetRunner()
    setMode('guide')
  }, [resetRunner])

  const resetExplore = useCallback(() => {
    setExplored(initialState(scenario))
  }, [scenario])

  return {
    mode, state, result, insight, runner,
    setTraffic, setValue, toggleFailure, explore, startGuide, resetExplore,
  }
}
