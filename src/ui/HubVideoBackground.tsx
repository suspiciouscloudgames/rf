import { useEffect, useRef } from 'react'
import { useExperienceStore } from '../store/experienceStore'
import { useTuningStore } from '../store/tuningStore'

export function HubVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const shouldPlay = useExperienceStore(
    (store) => store.stage === 'hub' || store.transition === 'returnToHub',
  )
  const preserveFullHub = useTuningStore((store) => store.hubPersistenceMode === 'fullHub')
  const keepPlaying = shouldPlay || preserveFullHub

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (keepPlaying) void video.play().catch(() => undefined)
    else video.pause()
  }, [keepPlaying])

  return (
    <div className={`hub-video-background ${preserveFullHub ? 'is-persistent' : ''}`} aria-hidden="true">
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
