import { MathUtils } from 'three'
import type { ExperienceStage, TransitionKind } from '../../store/experienceStore'
import {
  DEPTH_PORTAL_DARKEN_SECONDS,
  DEPTH_PORTAL_ENTRY_TRANSITION_SECONDS,
  DEPTH_PORTAL_PARALLAX_START_SECONDS,
} from '../../sequence/observationTiming'

export interface PortalProgress {
  reveal: number
  parallax: number
}

const hiddenProgress: PortalProgress = { reveal: 0, parallax: 0 }

export const resolvePortalProgress = (
  stage: ExperienceStage,
  transition: TransitionKind,
  progress: number,
  observationElapsed = 0,
): PortalProgress => {
  if (transition === 'approachToObservation') {
    return {
      reveal: MathUtils.smoothstep(progress, 0.78, 1),
      parallax: 0,
    }
  }
  if (transition === 'returnToHub') {
    if (stage !== 'observation') return hiddenProgress
    const reverse = 1 - progress
    const parallax = MathUtils.smoothstep(
      observationElapsed,
      DEPTH_PORTAL_PARALLAX_START_SECONDS,
      6,
    )
    return { reveal: reverse, parallax: parallax * reverse }
  }
  if (stage !== 'observation') return hiddenProgress
  return {
    reveal: 1,
    parallax: MathUtils.smoothstep(
      observationElapsed,
      DEPTH_PORTAL_PARALLAX_START_SECONDS,
      6,
    ),
  }
}

export const resolvePortalDarkness = (
  stage: ExperienceStage,
  transition: TransitionKind,
  progress: number,
  observationElapsed = 0,
) => {
  if (transition === 'approachToObservation') {
    const entryElapsed = progress * DEPTH_PORTAL_ENTRY_TRANSITION_SECONDS
    return MathUtils.smoothstep(entryElapsed, 0, DEPTH_PORTAL_DARKEN_SECONDS)
  }
  if (stage !== 'observation') return 0
  const darkness = MathUtils.smoothstep(
    observationElapsed + DEPTH_PORTAL_ENTRY_TRANSITION_SECONDS,
    0,
    DEPTH_PORTAL_DARKEN_SECONDS,
  )
  return transition === 'returnToHub' ? darkness * (1 - progress) : darkness
}
