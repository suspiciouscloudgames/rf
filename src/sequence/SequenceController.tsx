import { useEffect } from 'react'
import observations from '../content/observations.json'
import { useExperienceStore } from '../store/experienceStore'

const sequenceDuration = observations.observations[0].duration

export function SequenceController() {
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const setProgress = useExperienceStore((store) => store.setProgress)
  const setEffectActive = useExperienceStore((store) => store.setEffectActive)
  const setObservationMode = useExperienceStore((store) => store.setObservationMode)

  useEffect(() => {
    if (stage !== 'observation' || transition !== 'none') return
    const startedAt = performance.now()
    const timer = window.setInterval(() => {
      const elapsed = (performance.now() - startedAt) / 1000
      const progress = Math.min(elapsed / sequenceDuration, 1)
      setProgress(progress)
      setEffectActive(elapsed >= 10 && elapsed < 19)
      if (progress >= 1) {
        setObservationMode('explore')
        window.clearInterval(timer)
      }
    }, 100)

    return () => {
      window.clearInterval(timer)
      setEffectActive(false)
    }
  }, [setEffectActive, setObservationMode, setProgress, stage, transition])

  return null
}
