import { useEffect, useRef } from 'react'
import { useExperienceStore } from '../store/experienceStore'

export function HubVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const shouldPlay = useExperienceStore(
    (store) => store.stage === 'hub' || store.transition === 'returnToHub',
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (shouldPlay) void video.play().catch(() => undefined)
    else video.pause()
  }, [shouldPlay])

  return (
    <div className="hub-video-background" aria-hidden="true">
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
