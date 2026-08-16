import { MathUtils } from 'three'
import type { ExperienceStage, TransitionKind } from '../../store/experienceStore'
import { DEPTH_PORTAL_PARALLAX_START_SECONDS } from '../../sequence/observationTiming'

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
  observationEntrySeconds = 3.5,
  approachToObservationSeconds = 3.5,
): PortalProgress => {
  if (transition === 'approachToObservation') {
    const entryElapsed = progress * approachToObservationSeconds
    const visualProgress = entryElapsed / Math.max(observationEntrySeconds, 0.01)
    return {
      reveal: MathUtils.smoothstep(visualProgress, 0.78, 1),
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
  const reveal = MathUtils.smoothstep(
    (observationElapsed + approachToObservationSeconds) / Math.max(observationEntrySeconds, 0.01),
    0.78,
    1,
  )
  return {
    reveal,
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
  approachToObservationSeconds = 3.5,
  darkenSeconds = 10,
) => {
  if (transition === 'approachToObservation') {
    const entryElapsed = progress * approachToObservationSeconds
    return MathUtils.smoothstep(entryElapsed, 0, darkenSeconds)
  }
  if (stage !== 'observation') return 0
  const darkness = MathUtils.smoothstep(
    observationElapsed + approachToObservationSeconds,
    0,
    darkenSeconds,
  )
  return transition === 'returnToHub' ? darkness * (1 - progress) : darkness
}
