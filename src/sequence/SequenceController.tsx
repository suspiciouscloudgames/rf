import { useEffect } from 'react'
import observations from '../content/observations.json'
import { useExperienceStore } from '../store/experienceStore'

const sequenceDuration = observations.observations[0].duration

export function SequenceController() {
  const state = useExperienceStore((store) => store.state)
  const isTransitioning = useExperienceStore((store) => store.isTransitioning)
  const setProgress = useExperienceStore((store) => store.setProgress)
  const setEffectActive = useExperienceStore((store) => store.setEffectActive)

  useEffect(() => {
    if (state !== 'observation' || isTransitioning) return
    const startedAt = performance.now()
    const timer = window.setInterval(() => {
      const elapsed = (performance.now() - startedAt) / 1000
      const progress = Math.min(elapsed / sequenceDuration, 1)
      setProgress(progress)
      setEffectActive(elapsed >= 10 && elapsed < 19)
      if (progress >= 1) window.clearInterval(timer)
    }, 100)

    return () => {
      window.clearInterval(timer)
      setEffectActive(false)
    }
  }, [isTransitioning, setEffectActive, setProgress, state])

  return null
}
