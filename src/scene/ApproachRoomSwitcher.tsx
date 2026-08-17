import { useRoomVisualModeStore } from '../store/roomVisualModeStore'
import { MorphApproachRoom } from './morph-room/MorphApproachRoom'
import { SdfMorphApproachRoom } from './morph-room/SdfMorphApproachRoom'

export function ApproachRoomSwitcher() {
  const mode = useRoomVisualModeStore((store) => store.mode)
  if (mode === 'morph-legacy') return <MorphApproachRoom />
  return mode === 'morph' ? <SdfMorphApproachRoom /> : null
}
