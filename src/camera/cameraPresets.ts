import type { ExperienceState } from '../store/experienceStore'

export interface CameraPreset {
  position: [number, number, number]
  target: [number, number, number]
  fov: number
  duration: number
}

export const cameraPresets: Record<Exclude<ExperienceState, 'loading' | 'returning'>, CameraPreset> = {
  hub: {
    position: [4.8, 2.45, 6.4],
    target: [0, 0.35, 0],
    fov: 38,
    duration: 0,
  },
  approach: {
    position: [2.45, 1.45, 3.15],
    target: [0.42, 0.48, 0.08],
    fov: 30,
    duration: 3.2,
  },
  observation: {
    position: [1.24, 0.92, 1.5],
    target: [0.38, 0.42, 0.06],
    fov: 24,
    duration: 2.8,
  },
}
