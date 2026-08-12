import { lazy, Suspense, useEffect, useRef } from 'react'
import { SequenceController } from '../sequence/SequenceController'
import { Interface } from '../ui/Interface'
import { useExperienceStore } from '../store/experienceStore'

const IDLE_TIMEOUT_MS = 90_000
const ExperienceCanvas = lazy(() =>
  import('../scene/ExperienceCanvas').then((module) => ({ default: module.ExperienceCanvas })),
)

export function App() {
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const enterHub = useExperienceStore((store) => store.enterHub)
  const beginReturn = useExperienceStore((store) => store.beginReturn)
  const registerInteraction = useExperienceStore((store) => store.registerInteraction)
  const setAudioEnabled = useExperienceStore((store) => store.setAudioEnabled)
  const mediaUnlocked = useRef(false)

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
    <main className="experience-shell">
      <Suspense fallback={null}>
        <ExperienceCanvas />
      </Suspense>
      <SequenceController />
      <Interface />
      <div className="scanlines" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
      {stage === 'loading' ? (
        <div className="loader" role="status">
          <span className="loader-mark" />
          <span>CALIBRATING OBSERVATION FIELD</span>
        </div>
      ) : null}
    </main>
  )
}
