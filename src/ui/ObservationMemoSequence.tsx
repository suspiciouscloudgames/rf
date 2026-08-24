import { useEffect, useState } from 'react'
import { getObservationMemos } from '../content/observationMemos'
import { useExperienceStore } from '../store/experienceStore'

const MEMO_INTERVAL_MS = 6_600

export function ObservationMemoSequence() {
  const language = useExperienceStore((store) => store.language)
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)
  const memos = getObservationMemos(language, selectedSignalId) ?? []
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex(0)
    if (memos.length < 2) return
    const timer = window.setInterval(() => {
      setActiveIndex((index) => Math.min(index + 1, memos.length - 1))
    }, MEMO_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [selectedSignalId, memos.length])

  const memo = memos[activeIndex]
  if (!memo) return null

  return (
    <aside key={memo.id} className="observation-memo" lang={language} role="status" aria-live="polite">
      <span className="observation-memo-resident">{memo.resident}</span>
      <h2>{memo.title}</h2>
      <p>{memo.body}</p>
    </aside>
  )
}
