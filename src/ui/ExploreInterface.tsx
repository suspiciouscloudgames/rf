import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { localeCopy } from '../locales'
import { useExperienceStore } from '../store/experienceStore'
import { getObservationMemos } from '../content/observationMemos'

const exploreItems = [
  { id: 'trace-text', label: 'traceText', title: 'traceTextTitle', body: 'traceTextBody', type: 'text' },
  { id: 'trace-detail', label: 'traceImage', title: 'traceImageTitle', body: 'traceImageBody', type: 'detail' },
  { id: 'trace-video', label: 'traceVideo', title: 'traceVideoTitle', body: 'traceVideoBody', type: 'video' },
] as const

interface ExploreInterfaceProps {
  sequentialReveal?: boolean
}

type RevealStyle = CSSProperties & { '--memo-delay'?: string }

export function ExploreInterface({ sequentialReveal = false }: ExploreInterfaceProps) {
  const language = useExperienceStore((store) => store.language)
  const selectedItemId = useExperienceStore((store) => store.selectedExploreItemId)
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)
  const setSelectedItem = useExperienceStore((store) => store.setSelectedExploreItem)
  const copy = localeCopy[language]
  const residentMemos = getObservationMemos(language, selectedSignalId)
  const items = residentMemos?.map((memo) => ({
    id: memo.id,
    label: memo.resident,
    title: memo.title,
    body: memo.body,
    type: 'text' as const,
    resident: memo.resident,
  })) ?? exploreItems.map((item) => ({
    ...item,
    label: copy[item.label],
    title: copy[item.title],
    body: copy[item.body],
    resident: null,
  }))
  const videoRef = useRef<HTMLVideoElement>(null)
  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null
  const selectedItemNumber = selectedItem ? items.findIndex((item) => item.id === selectedItem.id) + 1 : 0

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

  useEffect(() => {
    if (!selectedItemId) return
    const closeOutsideMemo = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Element && target.closest('.explore-panel, .explore-trace')) return
      setSelectedItem(null)
    }
    document.addEventListener('pointerdown', closeOutsideMemo)
    return () => document.removeEventListener('pointerdown', closeOutsideMemo)
  }, [selectedItemId, setSelectedItem])

  return (
    <div className="explore-interface" lang={language}>
      <p className="explore-hint">{copy.exploreHint}</p>
      <div className="explore-traces">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`explore-trace trace-${index + 1} ${sequentialReveal ? 'memo-reveal' : ''} ${selectedItemId === item.id ? 'active' : ''}`}
            style={sequentialReveal ? { '--memo-delay': `${0.2 + index * 0.78}s` } as RevealStyle : undefined}
            onClick={() => setSelectedItem(selectedItemId === item.id ? null : item.id)}
            aria-pressed={selectedItemId === item.id}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {item.label}
          </button>
        ))}
      </div>
      {selectedItem ? (
        <aside className="explore-panel">
          <button type="button" className="explore-close" onClick={() => setSelectedItem(null)} aria-label={copy.closeTrace}>×</button>
          <span className="narration-index">{selectedItem.resident ?? `${copy.trace} / ${String(selectedItemNumber).padStart(2, '0')}`}</span>
          <h2>{selectedItem.title}</h2>
          {selectedItem.type === 'video' ? (
            <video ref={videoRef} src="/assets/archive-signal.mp4" muted loop playsInline preload="auto" />
          ) : null}
          <p>{selectedItem.body}</p>
        </aside>
      ) : null}
    </div>
  )
}
