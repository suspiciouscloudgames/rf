import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { localeCopy } from '../locales'
import { useExperienceStore } from '../store/experienceStore'
import { getObservationMemos } from '../content/observationMemos'
import { useTuningStore } from '../store/tuningStore'
import { getResidentProfile } from '../content/residentProfiles'
import { assetUrl } from '../lib/assetUrl'

const exploreItems = [
  { id: 'trace-text', label: 'traceText', title: 'traceTextTitle', body: 'traceTextBody', type: 'text' },
  { id: 'trace-detail', label: 'traceImage', title: 'traceImageTitle', body: 'traceImageBody', type: 'detail' },
  { id: 'trace-video', label: 'traceVideo', title: 'traceVideoTitle', body: 'traceVideoBody', type: 'video' },
] as const

interface ExploreInterfaceProps {
  sequentialReveal?: boolean
}

type RevealStyle = CSSProperties & { '--memo-delay'?: string }

const memoCharacterDelay = (character: string) => {
  if (/[.!?。！？]/.test(character)) return 300
  if (/[,、]/.test(character)) return 130
  if (/\s/.test(character)) return 28
  return 44
}

function MemoTypewriterText({ text, startDelay }: { text: string; startDelay: number }) {
  const [visibleLength, setVisibleLength] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    setVisibleLength(0)
    setShowCursor(true)
  }, [text])

  useEffect(() => {
    if (visibleLength >= text.length) return
    const delay = visibleLength === 0
      ? startDelay
      : memoCharacterDelay(text[visibleLength - 1] ?? '')
    const timer = window.setTimeout(() => setVisibleLength((length) => length + 1), delay)
    return () => window.clearTimeout(timer)
  }, [startDelay, text, visibleLength])

  return (
    <span className="resident-introduction">
      <span className="resident-record-body">
        {text.slice(0, visibleLength)}
        {showCursor && (
          <span
            className={`memo-type-cursor ${visibleLength >= text.length ? 'typing-complete' : ''}`}
            aria-hidden="true"
            onAnimationEnd={() => {
              if (visibleLength >= text.length) setShowCursor(false)
            }}
          />
        )}
      </span>
    </span>
  )
}

export function ExploreInterface({ sequentialReveal = false }: ExploreInterfaceProps) {
  const language = useExperienceStore((store) => store.language)
  const selectedItemId = useExperienceStore((store) => store.selectedExploreItemId)
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)
  const zoomDuration = useTuningStore((store) => store.approachToObservationSeconds)
  const setSelectedItem = useExperienceStore((store) => store.setSelectedExploreItem)
  const copy = localeCopy[language]
  const openRecordLabel = language === 'ko' ? '기록 열기' : language === 'ja' ? '記録を開く' : 'OPEN RECORD'
  const residentMemos = getObservationMemos(language, selectedSignalId)
  const items = residentMemos?.map((memo) => ({
    id: memo.id,
    label: memo.resident,
    title: memo.title,
    body: getResidentProfile(language, memo.id),
    previewBody: memo.body,
    type: 'text' as const,
    resident: memo.resident,
  })) ?? exploreItems.map((item) => ({
    ...item,
    label: copy[item.label],
    title: copy[item.title],
    body: copy[item.body],
    previewBody: copy[item.body],
    resident: null,
  }))
  const videoRef = useRef<HTMLVideoElement>(null)
  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null
  const selectedItemNumber = selectedItem ? items.findIndex((item) => item.id === selectedItem.id) + 1 : 0
  const revealSpan = Math.max(zoomDuration - 0.65, 0.8)
  const revealStep = items.length > 1 ? revealSpan / (items.length - 1) : 0

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
      if (target instanceof Element && target.closest('.explore-panel, .explore-trace, .memo-cluster')) return
      setSelectedItem(null)
    }
    document.addEventListener('pointerdown', closeOutsideMemo)
    return () => document.removeEventListener('pointerdown', closeOutsideMemo)
  }, [selectedItemId, setSelectedItem])

  return (
    <div className={`explore-interface ${selectedItem ? 'has-open-panel' : ''}`} lang={language}>
      <div className="explore-traces">
        {items.map((item, index) => {
          const memoDelay = 0.3 + index * revealStep
          const button = (
            <button
              type="button"
              className={`explore-trace ${selectedItemId === item.id ? 'active' : ''}`}
              onClick={() => setSelectedItem(selectedItemId === item.id ? null : item.id)}
              aria-pressed={selectedItemId === item.id}
              aria-label={`${item.label} — ${openRecordLabel}`}
            >
              {item.label}
              <span className="memo-open-symbol" aria-hidden="true">↗</span>
            </button>
          )
          if (!sequentialReveal) return <div key={item.id} className={`memo-cluster trace-${index + 1}`}>{button}</div>
          return (
            <button
              key={item.id}
              type="button"
              className={`memo-cluster memo-reveal trace-${index + 1}`}
              style={{ '--memo-delay': `${memoDelay}s` } as RevealStyle}
              onClick={() => setSelectedItem(selectedItemId === item.id ? null : item.id)}
              aria-pressed={selectedItemId === item.id}
              aria-label={`${item.label} — ${openRecordLabel}`}
            >
              <span className={`explore-trace ${selectedItemId === item.id ? 'active' : ''}`}>
                {item.label}
                <span className="memo-open-symbol" aria-hidden="true">↗</span>
              </span>
              <MemoTypewriterText text={item.previewBody} startDelay={memoDelay * 1000} />
            </button>
          )
        })}
      </div>
      {selectedItem ? (
        <aside className={`explore-panel panel-trace-${selectedItemNumber}`}>
          <button type="button" className="explore-close" onClick={() => setSelectedItem(null)} aria-label={copy.closeTrace}>×</button>
          <span className="narration-index">{selectedItem.resident ?? `${copy.trace} / ${String(selectedItemNumber).padStart(2, '0')}`}</span>
          {selectedItem.type === 'video' ? (
            <video ref={videoRef} src={assetUrl('assets/archive-signal.mp4')} muted loop playsInline preload="auto" />
          ) : null}
          <p>{selectedItem.body}</p>
        </aside>
      ) : null}
    </div>
  )
}
