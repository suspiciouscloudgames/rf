import type { CSSProperties } from 'react'
import { useRoomVisualModeStore } from '../store/roomVisualModeStore'
import { useTuningStore } from '../store/tuningStore'

type MorphFilmStyle = CSSProperties & {
  '--morph-film-grain': number
  '--morph-film-flicker': number
}

export function MorphFilmOverlay() {
  const mode = useRoomVisualModeStore((store) => store.mode)
  const grain = useTuningStore((store) => store.morphFilmGrain)
  const flicker = useTuningStore((store) => store.morphFilmFlicker)
  const temporalFlickerEnabled = useTuningStore((store) => store.morphTemporalFlickerEnabled)

  if (mode === 'classic') return null

  const style: MorphFilmStyle = {
    '--morph-film-grain': grain,
    '--morph-film-flicker': flicker,
  }
  return (
    <div
      className={`morph-film-overlay${temporalFlickerEnabled ? '' : ' is-temporal-flicker-disabled'}`}
      style={style}
      aria-hidden="true"
    />
  )
}
