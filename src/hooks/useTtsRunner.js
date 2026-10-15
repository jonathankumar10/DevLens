import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useStepRunner } from './useStepRunner'
import { useSpeech } from './useSpeech'

function toSpeechText(text) {
  return text
    .replace(/↔/g, 'and')
    .replace(/→/g, 'to')
    .replace(/—/g, ',')
    .replace(/–/g, ' to ')
    .replace(/~(\d)/g, 'about $1')
    .replace(/×/g, ' times')
    .replace(/µs/g, 'microseconds')
    .replace(/\bns\b/g, 'nanoseconds')
    .replace(/\bms\b/g, 'milliseconds')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const hasSpeech = typeof window !== 'undefined' && !!window.speechSynthesis

/**
 * Drop-in replacement for useStepRunner that adds opt-in TTS narration.
 *
 * Returns the same runner shape as useStepRunner, plus:
 *   runner.tts = { enabled: bool, toggle: fn }  — when browser supports speech
 *   runner.tts = null                            — when browser has no speech API
 *
 * StepControls renders a toggle button automatically when runner.tts is non-null.
 *
 * @param {Array}    steps    - step array (same as useStepRunner)
 * @param {Function} getText  - (step) => string — what to narrate per step
 */
export function useTtsRunner(steps, getText) {
  const runner = useStepRunner(steps)
  const { enabled: ttsEnabled, speak, cancel, toggle: rawToggle, voices, selectedVoice, setVoice } = useSpeech()

  const [ttsPlaying, setTTSPlaying]   = useState(false)
  const ttsPlayingRef                  = useRef(false)

  const indexRef = useRef(runner.index)
  useEffect(() => { indexRef.current = runner.index }, [runner.index])

  const stopTTSPlay = useCallback(() => {
    ttsPlayingRef.current = false
    setTTSPlaying(false)
    cancel()
  }, [cancel])

  const handleSpeechEnd = useCallback(() => {
    if (!ttsPlayingRef.current) return
    if (indexRef.current >= steps.length - 1) {
      ttsPlayingRef.current = false
      setTTSPlaying(false)
      return
    }
    runner.next()
  }, [steps.length, runner])

  // Speak on step change (manual nav or TTS-driven advance)
  useEffect(() => {
    if (!ttsEnabled) return
    const onEnd = ttsPlayingRef.current ? handleSpeechEnd : undefined
    speak(toSpeechText(getText(runner.step)), runner.speed, onEnd)
  }, [runner.step, ttsEnabled, runner.speed, speak, handleSpeechEnd, getText])

  // Speak immediately when TTS playback starts (step may not have changed).
  // Keyed on ttsPlaying only: step/speed changes are handled by the effect
  // above, and re-running here too would speak the same step twice.
  useEffect(() => {
    if (!ttsEnabled || !ttsPlaying) return
    speak(toSpeechText(getText(runner.step)), runner.speed, handleSpeechEnd)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ttsPlaying])

  const toggleTTS = useCallback(() => {
    if (ttsEnabled) stopTTSPlay()
    rawToggle()
  }, [ttsEnabled, stopTTSPlay, rawToggle])

  return useMemo(() => ({
    ...runner,
    ...(ttsEnabled ? {
      playing: ttsPlaying,
      play: () => {
        if (runner.index >= steps.length - 1) runner.setIndex(0)
        ttsPlayingRef.current = true
        setTTSPlaying(true)
      },
      stop: stopTTSPlay,
    } : {}),
    tts: hasSpeech ? { enabled: ttsEnabled, toggle: toggleTTS, voices, selectedVoice, setVoice } : null,
  }), [runner, ttsEnabled, ttsPlaying, steps.length, stopTTSPlay, toggleTTS, voices, selectedVoice, setVoice])
}
