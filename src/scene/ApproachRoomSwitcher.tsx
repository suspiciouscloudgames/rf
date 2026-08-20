import { useRoomVisualModeStore } from '../store/roomVisualModeStore'
import { MorphApproachRoom } from './morph-room/MorphApproachRoom'
import { SdfMorphApproachRoom } from './morph-room/SdfMorphApproachRoom'
import { PlanMorphApproachRoom } from './morph-room/PlanMorphApproachRoom'

export function ApproachRoomSwitcher() {
  const mode = useRoomVisualModeStore((store) => store.mode)
  if (mode === 'morph-legacy') return <MorphApproachRoom />
  if (mode === 'morph-plan') return <PlanMorphApproachRoom />
  return mode === 'morph' ? <SdfMorphApproachRoom /> : null
}
