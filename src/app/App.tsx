import { lazy, Suspense, useEffect, useRef } from 'react'
import { SequenceController } from '../sequence/SequenceController'
import { Interface } from '../ui/Interface'
import { HubVideoBackground } from '../ui/HubVideoBackground'
import { TuningPanel } from '../ui/TuningPanel'
import { useExperienceStore } from '../store/experienceStore'
import { useRoomVisualModeStore } from '../store/roomVisualModeStore'
import { useTuningStore } from '../store/tuningStore'
import { MorphFilmOverlay } from '../ui/MorphFilmOverlay'
import { useMorphStabilityExperimentStore } from '../store/morphStabilityExperimentStore'
import { useMorphCameraExperimentStore } from '../store/morphCameraExperimentStore'

const IDLE_TIMEOUT_MS = 90_000
const ExperienceCanvas = lazy(() =>
  import('../scene/ExperienceCanvas').then((module) => ({ default: module.ExperienceCanvas })),
)
const tuningPanelEnabled = import.meta.env.VITE_SHOW_TUNING_PANEL !== 'false'

export function App() {
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const enterHub = useExperienceStore((store) => store.enterHub)
  const beginReturn = useExperienceStore((store) => store.beginReturn)
  const registerInteraction = useExperienceStore((store) => store.registerInteraction)
  const setAudioEnabled = useExperienceStore((store) => store.setAudioEnabled)
  const mediaUnlocked = useRef(false)
  const roomVisualMode = useRoomVisualModeStore((store) => store.mode)
  const syncRoomVisualMode = useRoomVisualModeStore((store) => store.syncFromLocation)
  const syncMorphStabilityExperiment = useMorphStabilityExperimentStore((store) => store.syncFromLocation)
  const syncMorphCameraExperiment = useMorphCameraExperimentStore((store) => store.syncFromLocation)
  const morphTemporalFlickerEnabled = useTuningStore((store) => store.morphTemporalFlickerEnabled)

  useEffect(() => {
    const syncLocationState = () => {
      syncRoomVisualMode()
      syncMorphStabilityExperiment()
      syncMorphCameraExperiment()
    }
    window.addEventListener('popstate', syncLocationState)
    return () => window.removeEventListener('popstate', syncLocationState)
  }, [syncMorphCameraExperiment, syncMorphStabilityExperiment, syncRoomVisualMode])

  useEffect(() => {
    const timer = window.setTimeout(enterHub, 850)
    return () => window.clearTimeout(timer)
  }, [enterHub])

  useEffect(() => {
    const onFirstPointer = () => {
      registerInteraction()
      if (mediaUnlocked.current) return
      mediaUnlocked.current = true
      setAudioEnabled(true)
      const AudioContextClass = window.AudioContext
      if (AudioContextClass) {
        const context = new AudioContextClass()
        void context.resume().finally(() => void context.close())
      }
    }
    window.addEventListener('pointerdown', onFirstPointer, { passive: true })
    return () => window.removeEventListener('pointerdown', onFirstPointer)
  }, [registerInteraction, setAudioEnabled])

  useEffect(() => {
    const timer = window.setInterval(() => {
      const snapshot = useExperienceStore.getState()
      if ((snapshot.stage !== 'hub' || snapshot.transition !== 'none') && snapshot.stage !== 'loading' && Date.now() - snapshot.lastInteractionTime >= IDLE_TIMEOUT_MS) {
        beginReturn()
      }
    }, 1_000)
    return () => window.clearInterval(timer)
  }, [beginReturn])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') registerInteraction()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [registerInteraction])

  return (
    <main
      className={`experience-shell state-${stage} transition-${transition}`}
      data-room-visual-mode={roomVisualMode}
      data-morph-temporal-flicker={morphTemporalFlickerEnabled ? 'on' : 'off'}
    >
      <HubVideoBackground />
      <Suspense fallback={null}>
        <ExperienceCanvas />
      </Suspense>
      <MorphFilmOverlay />
      <SequenceController />
      <Interface />
      {tuningPanelEnabled ? <TuningPanel /> : null}
      <div className="scanlines" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
      {stage === 'loading' ? (
        <div className="loader" role="status">
          <span className="loader-mark" />
          <span>観測領域を調整しています</span>
        </div>
      ) : null}
    </main>
  )
}
