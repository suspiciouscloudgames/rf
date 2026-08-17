export const DEPTH_PORTAL_DOLLY_SECONDS = 30
export const DEPTH_PORTAL_DARKEN_SECONDS = 10
export const DEPTH_PORTAL_ENTRY_TRANSITION_SECONDS = 3.5
export const DEPTH_PORTAL_PARALLAX_START_SECONDS = 1.5
export const DEPTH_PORTAL_SUBTITLE_START_SECONDS = 10

export const smootherStep = (value: number) => {
  const clamped = Math.min(Math.max(value, 0), 1)
  return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10)
}
