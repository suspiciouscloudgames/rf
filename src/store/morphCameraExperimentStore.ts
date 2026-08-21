import { create } from 'zustand'

export type MorphCameraVariant = 'current' | 'low'

export interface LowMorphCameraTuning {
  lowHeight: number
  lowTargetHeight: number
  lowDistance: number
  lowFov: number
}

export const DEFAULT_LOW_MORPH_CAMERA_TUNING: LowMorphCameraTuning = {
  lowHeight: 0.91,
  lowTargetHeight: -0.16,
  lowDistance: 6.15,
  lowFov: 36.4,
}

interface MorphCameraExperimentState extends LowMorphCameraTuning {
  variant: MorphCameraVariant
  setVariant: (variant: MorphCameraVariant) => void
  setLowCameraTuning: <Key extends keyof LowMorphCameraTuning>(
    key: Key,
    value: LowMorphCameraTuning[Key],
  ) => void
  resetLowCameraTuning: () => void
  syncFromLocation: () => void
}

type MorphCameraExperimentValues = Pick<
  MorphCameraExperimentState,
  'variant' | keyof LowMorphCameraTuning
>

const readFiniteNumber = (params: URLSearchParams, key: string, fallback: number) => {
  const rawValue = params.get(key)
  if (rawValue === null || rawValue.trim() === '') return fallback
  const value = Number(rawValue)
  return Number.isFinite(value) ? value : fallback
}

const clampCameraTuning = (values: LowMorphCameraTuning): LowMorphCameraTuning => ({
  lowHeight: Math.min(2.4, Math.max(0.35, values.lowHeight)),
  lowTargetHeight: Math.min(1.2, Math.max(-0.4, values.lowTargetHeight)),
  lowDistance: Math.min(12, Math.max(3.5, values.lowDistance)),
  lowFov: Math.min(50, Math.max(24, values.lowFov)),
})

const readMorphCameraExperiment = (): MorphCameraExperimentValues => {
  if (typeof window === 'undefined') {
    return { variant: 'low', ...DEFAULT_LOW_MORPH_CAMERA_TUNING }
  }
  const params = new URLSearchParams(window.location.search)
  return {
    variant: params.get('cameraView') === 'current' ? 'current' : 'low',
    ...clampCameraTuning({
      lowHeight: readFiniteNumber(params, 'lowHeight', DEFAULT_LOW_MORPH_CAMERA_TUNING.lowHeight),
      lowTargetHeight: readFiniteNumber(params, 'lowTargetHeight', DEFAULT_LOW_MORPH_CAMERA_TUNING.lowTargetHeight),
      lowDistance: readFiniteNumber(params, 'lowDistance', DEFAULT_LOW_MORPH_CAMERA_TUNING.lowDistance),
      lowFov: readFiniteNumber(params, 'lowFov', DEFAULT_LOW_MORPH_CAMERA_TUNING.lowFov),
    }),
  }
}

const updateCameraQuery = (values: MorphCameraExperimentValues) => {
  const url = new URL(window.location.href)
  if (values.variant === 'current') url.searchParams.set('cameraView', 'current')
  else url.searchParams.delete('cameraView')

  const tuningKeys = Object.keys(DEFAULT_LOW_MORPH_CAMERA_TUNING) as Array<keyof LowMorphCameraTuning>
  tuningKeys.forEach((key) => {
    if (values[key] === DEFAULT_LOW_MORPH_CAMERA_TUNING[key]) url.searchParams.delete(key)
    else url.searchParams.set(key, String(values[key]))
  })
  window.history.replaceState(window.history.state, '', url)
}

export const useMorphCameraExperimentStore = create<MorphCameraExperimentState>((set, get) => {
  const update = (patch: Partial<MorphCameraExperimentValues>) => {
    const merged = { ...get(), ...patch }
    const tuning = clampCameraTuning(merged)
    const values: MorphCameraExperimentValues = {
      variant: merged.variant,
      ...tuning,
    }
    set(values)
    updateCameraQuery(values)
  }

  return {
    ...readMorphCameraExperiment(),
    setVariant: (variant) => update({ variant }),
    setLowCameraTuning: (key, value) => update({ [key]: value }),
    resetLowCameraTuning: () => update(DEFAULT_LOW_MORPH_CAMERA_TUNING),
    syncFromLocation: () => set(readMorphCameraExperiment()),
  }
})
