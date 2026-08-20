import { useEffect, useRef, type CSSProperties } from 'react'
import { useExperienceStore } from '../store/experienceStore'
import { useTuningStore } from '../store/tuningStore'

type HubVideoStyle = CSSProperties & {
  '--hub-video-brightness': number
  '--hub-video-scrim-opacity': number
  '--hub-video-opacity': number
  '--hub-video-fade-out-seconds': string
}

export function HubVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const shouldPlay = useExperienceStore(
    (store) => store.stage === 'hub' || store.transition === 'returnToHub',
  )
  const preserveFullHub = useTuningStore((store) => store.hubPersistenceMode === 'fullHub')
  const brightness = useTuningStore((store) => store.hubVideoBrightness)
  const scrimOpacity = useTuningStore((store) => store.hubVideoScrimOpacity)
  const opacity = useTuningStore((store) => store.hubVideoOpacity)
  const fadeOutSeconds = useTuningStore((store) => store.hubVideoFadeOutSeconds)
  const hubToApproachSeconds = useTuningStore((store) => store.hubToApproachSeconds)
  const keepPlaying = shouldPlay || preserveFullHub
  const style: HubVideoStyle = {
    '--hub-video-brightness': brightness,
    '--hub-video-scrim-opacity': scrimOpacity,
    '--hub-video-opacity': opacity,
    '--hub-video-fade-out-seconds': `${fadeOutSeconds}s`,
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (keepPlaying) {
      void video.play().catch(() => undefined)
      return
    }
    const remainingFadeMs = Math.max(0, fadeOutSeconds - hubToApproachSeconds) * 1_000
    const pauseTimer = window.setTimeout(() => video.pause(), remainingFadeMs)
    return () => window.clearTimeout(pauseTimer)
  }, [fadeOutSeconds, hubToApproachSeconds, keepPlaying])

  return (
    <div
      className={`hub-video-background ${preserveFullHub ? 'is-persistent' : ''}`}
      style={style}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        src="/assets/hub-background.mp4"
        muted
        loop
        playsInline
        preload="auto"
      />
      <span className="hub-video-scrim" />
    </div>
  )
}
