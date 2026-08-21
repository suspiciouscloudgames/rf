import { useEffect, useRef } from 'react'
import { localeCopy } from '../locales'
import { useExperienceStore } from '../store/experienceStore'

const exploreItems = [
  { id: 'trace-text', label: 'traceText', title: 'traceTextTitle', body: 'traceTextBody', type: 'text' },
  { id: 'trace-detail', label: 'traceImage', title: 'traceImageTitle', body: 'traceImageBody', type: 'detail' },
  { id: 'trace-video', label: 'traceVideo', title: 'traceVideoTitle', body: 'traceVideoBody', type: 'video' },
] as const

export function ExploreInterface() {
  const language = useExperienceStore((store) => store.language)
  const selectedItemId = useExperienceStore((store) => store.selectedExploreItemId)
  const setSelectedItem = useExperienceStore((store) => store.setSelectedExploreItem)
  const copy = localeCopy[language]
  const videoRef = useRef<HTMLVideoElement>(null)
  const selectedItem = exploreItems.find((item) => item.id === selectedItemId) ?? null
  const selectedItemNumber = selectedItem ? exploreItems.findIndex((item) => item.id === selectedItem.id) + 1 : 0

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (selectedItem?.type === 'video') void video.play().catch(() => undefined)
    else {
      video.pause()
      video.currentTime = 0
    }
  }, [selectedItem])

  useEffect(() => {
    const video = videoRef.current
    return () => {
    if (!video) return
    video.pause()
    video.currentTime = 0
    }
  }, [])

  return (
    <div className="explore-interface" lang={language}>
      <p className="explore-hint">{copy.exploreHint}</p>
      <div className="explore-traces">
        {exploreItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`explore-trace trace-${index + 1} ${selectedItemId === item.id ? 'active' : ''}`}
            onClick={() => setSelectedItem(selectedItemId === item.id ? null : item.id)}
            aria-pressed={selectedItemId === item.id}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {copy[item.label]}
          </button>
        ))}
      </div>
      {selectedItem ? (
        <aside className="explore-panel">
          <button type="button" className="explore-close" onClick={() => setSelectedItem(null)} aria-label={copy.closeTrace}>×</button>
          <span className="narration-index">{copy.trace} / {String(selectedItemNumber).padStart(2, '0')}</span>
          <h2>{copy[selectedItem.title]}</h2>
          {selectedItem.type === 'video' ? (
            <video ref={videoRef} src="/assets/archive-signal.mp4" muted loop playsInline preload="auto" />
          ) : null}
          <p>{copy[selectedItem.body]}</p>
        </aside>
      ) : null}
    </div>
  )
}
