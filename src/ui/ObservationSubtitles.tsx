import { useEffect, useState } from 'react'
import observations from '../content/observations.json'
import { depthPortalSubtitles, type ObservationSubtitleCue } from '../content/observationSubtitles'
import { useExperienceStore } from '../store/experienceStore'
import {
  DEPTH_PORTAL_ENTRY_TRANSITION_SECONDS,
  DEPTH_PORTAL_SUBTITLE_START_SECONDS,
} from '../sequence/observationTiming'

const sequenceDuration = observations.observations[0].duration

const delayForCharacter = (character: string) => {
  if (/[.!?。！？]/.test(character)) return 650
  if (/[,、]/.test(character)) return 280
  if (/\s/.test(character)) return 70
  return 115
}

function SlowSubtitleLine({ cue }: { cue: ObservationSubtitleCue }) {
  const [visibleLength, setVisibleLength] = useState(0)

  useEffect(() => {
    if (visibleLength >= cue.text.length) return
    const timer = window.setTimeout(
      () => setVisibleLength((length) => length + 1),
      delayForCharacter(cue.text[visibleLength] ?? ''),
    )
    return () => window.clearTimeout(timer)
  }, [cue.text, visibleLength])

  return (
    <>
      <span className="sr-only">{cue.text}</span>
      <p className="observation-subtitle-line" aria-hidden="true">
        {cue.text.slice(0, visibleLength)}
        <span className="observation-subtitle-cursor" />
      </p>
    </>
  )
}

export function ObservationSubtitles() {
  const language = useExperienceStore((store) => store.language)
  const progress = useExperienceStore((store) => store.sequenceProgress)
  const elapsed = progress * sequenceDuration + DEPTH_PORTAL_ENTRY_TRANSITION_SECONDS
  if (elapsed < DEPTH_PORTAL_SUBTITLE_START_SECONDS) return null

  const cues = depthPortalSubtitles[language]
  let activeCue = cues[0]
  for (const cue of cues) {
    if (elapsed < cue.start) break
    activeCue = cue
  }

  return (
    <aside className="observation-subtitles" lang={language} role="status" aria-live="polite" aria-atomic="true">
      <SlowSubtitleLine key={activeCue.start} cue={activeCue} />
    </aside>
  )
}
