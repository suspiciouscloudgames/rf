import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
type PanelPosition = { left: number; top: number }

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
  const panelRef = useRef<HTMLElement>(null)
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null)
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

  useLayoutEffect(() => {
    if (!selectedItemId || !panelRef.current) {
      setPanelPosition(null)
      return
    }

    const placePanel = () => {
      const panel = panelRef.current
      if (!panel) return
      const panelRect = panel.getBoundingClientRect()
      const buttonRects = Array.from(document.querySelectorAll<HTMLElement>('.explore-trace[data-item-id]'))
        .map((element) => ({ id: element.dataset.itemId, rect: element.getBoundingClientRect() }))
      const selectedRect = buttonRects.find(({ id }) => id === selectedItemId)?.rect
      if (!selectedRect) return

      const edge = 24
      const gap = 18
      const maxLeft = Math.max(edge, window.innerWidth - panelRect.width - edge)
      const maxTop = Math.max(edge, window.innerHeight - panelRect.height - edge)
      const clampLeft = (left: number) => Math.min(Math.max(left, edge), maxLeft)
      const clampTop = (top: number) => Math.min(Math.max(top, edge), maxTop)
      const xCandidates = [
        edge,
        maxLeft,
        selectedRect.left - panelRect.width - gap,
        selectedRect.right + gap,
        selectedRect.left + selectedRect.width / 2 - panelRect.width / 2,
        ...buttonRects.flatMap(({ rect }) => [rect.left - panelRect.width - gap, rect.right + gap]),
      ].map(clampLeft)
      const yCandidates = [
        edge,
        maxTop,
        selectedRect.top - panelRect.height - gap,
        selectedRect.bottom + gap,
        selectedRect.top + selectedRect.height / 2 - panelRect.height / 2,
        ...buttonRects.flatMap(({ rect }) => [rect.top - panelRect.height - gap, rect.bottom + gap]),
      ].map(clampTop)
      const candidates = xCandidates.flatMap((left) => yCandidates.map((top) => ({ left, top })))
      const selectedCenterX = selectedRect.left + selectedRect.width / 2
      const selectedCenterY = selectedRect.top + selectedRect.height / 2
      const score = ({ left, top }: PanelPosition) => {
        const right = left + panelRect.width
        const bottom = top + panelRect.height
        const overlap = buttonRects.reduce((total, { rect }) => {
          const obstacleLeft = rect.left - gap
          const obstacleTop = rect.top - gap
          const obstacleRight = rect.right + gap
          const obstacleBottom = rect.bottom + gap
          const width = Math.max(0, Math.min(right, obstacleRight) - Math.max(left, obstacleLeft))
          const height = Math.max(0, Math.min(bottom, obstacleBottom) - Math.max(top, obstacleTop))
          return total + width * height
        }, 0)
        const centerX = left + panelRect.width / 2
        const centerY = top + panelRect.height / 2
        return overlap * 10_000 + Math.hypot(centerX - selectedCenterX, centerY - selectedCenterY)
      }
      const best = candidates.reduce((current, candidate) => score(candidate) < score(current) ? candidate : current)
      setPanelPosition(best)
    }

    placePanel()
    window.addEventListener('resize', placePanel)
    return () => window.removeEventListener('resize', placePanel)
  }, [language, selectedItemId])

  return (
    <div className={`explore-interface ${selectedItem ? 'has-open-panel' : ''}`} lang={language}>
      <div className="explore-traces">
        {items.map((item, index) => {
          const memoDelay = 0.3 + index * revealStep
          const memoLength = Array.from(item.previewBody).length
          const veryLongMemo = memoLength >= (language === 'en' ? 520 : 195)
          const longMemo = memoLength >= (language === 'en' ? 380 : 160)
          const memoLengthClass = veryLongMemo ? 'memo-very-long' : longMemo ? 'memo-long' : ''
          const button = (
            <button
              type="button"
              className={`explore-trace ${selectedItemId === item.id ? 'active' : ''}`}
              data-item-id={item.id}
              onClick={() => setSelectedItem(selectedItemId === item.id ? null : item.id)}
              aria-pressed={selectedItemId === item.id}
              aria-label={`${item.label} — ${openRecordLabel}`}
            >
              {item.label}
              <span className="memo-open-symbol" aria-hidden="true">↗</span>
            </button>
          )
          if (!sequentialReveal) return <div key={item.id} className={`memo-cluster ${memoLengthClass} trace-${index + 1}`} data-item-id={item.id}>{button}</div>
          return (
            <button
              key={item.id}
              type="button"
              className={`memo-cluster memo-reveal ${memoLengthClass} trace-${index + 1}`}
              data-item-id={item.id}
              style={{ '--memo-delay': `${memoDelay}s` } as RevealStyle}
              onClick={() => setSelectedItem(selectedItemId === item.id ? null : item.id)}
              aria-pressed={selectedItemId === item.id}
              aria-label={`${item.label} — ${openRecordLabel}`}
            >
              <span className={`explore-trace ${selectedItemId === item.id ? 'active' : ''}`} data-item-id={item.id}>
                {item.label}
                <span className="memo-open-symbol" aria-hidden="true">↗</span>
              </span>
              <MemoTypewriterText text={item.previewBody} startDelay={memoDelay * 1000} />
            </button>
          )
        })}
      </div>
      {selectedItem ? (
        <aside
          ref={panelRef}
          className={`explore-panel panel-trace-${selectedItemNumber}`}
          style={panelPosition
            ? { left: panelPosition.left, top: panelPosition.top, right: 'auto', bottom: 'auto' }
            : { visibility: 'hidden' }}
        >
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
