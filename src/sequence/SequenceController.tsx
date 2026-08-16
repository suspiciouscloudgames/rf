import { useEffect } from 'react'
import { useExperienceStore } from '../store/experienceStore'
import { hasDepthPortal } from '../signals/signalData'
import { useTuningStore } from '../store/tuningStore'

export function SequenceController() {
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const setProgress = useExperienceStore((store) => store.setProgress)
  const setEffectActive = useExperienceStore((store) => store.setEffectActive)
  const setObservationMode = useExperienceStore((store) => store.setObservationMode)
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)
  const visualStatus = useExperienceStore((store) => store.observationVisualStatus)

  useEffect(() => {
    if (stage !== 'observation' || transition !== 'none') return
    const portalRequired = hasDepthPortal(selectedSignalId)
    if (portalRequired && visualStatus !== 'ready' && visualStatus !== 'fallback') return
    const sequenceDuration = useTuningStore.getState().guidedObservationSeconds
    let timer: number | null = null
    const delay = 0
    const kickoff = window.setTimeout(() => {
      const startedAt = performance.now()
      timer = window.setInterval(() => {
        const elapsed = (performance.now() - startedAt) / 1000
        const progress = Math.min(elapsed / sequenceDuration, 1)
        setProgress(progress)
        setEffectActive(!portalRequired && elapsed >= 10 && elapsed < 19)
        if (progress >= 1) {
          setObservationMode('explore')
          if (timer !== null) window.clearInterval(timer)
        }
      }, 100)
    }, delay)

    return () => {
      window.clearTimeout(kickoff)
      if (timer !== null) window.clearInterval(timer)
      setEffectActive(false)
    }
  }, [selectedSignalId, setEffectActive, setObservationMode, setProgress, stage, transition, visualStatus])

  return null
}
