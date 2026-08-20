export interface MorphCameraPreset {
  position: [number, number, number]
  target: [number, number, number]
  fov: number
}

/**
 * Stable 2step Plan Morph camera baseline. Keep this preset unchanged so the
 * camera experiment can always return to the pre-experiment composition.
 */
export const CURRENT_PLAN_MORPH_CAMERA: MorphCameraPreset = {
  position: [5.65, 3.85, 7.35],
  target: [0, -0.16, 0.42],
  fov: 42,
}
