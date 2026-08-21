import { create } from 'zustand'

export type MorphNightOpticsVariant = 'current' | 'night-film'
export type MorphNightOpticsDebugView = 'none' | 'bloom-mask' | 'vignette-mask'

export interface MorphNightOpticsTuning {
  lookMix: number
  exposure: number
  shadowLift: number
  localGrain: number
  vignetteStrength: number
  vignetteSoftness: number
  vignetteIrregularity: number
  vignetteOffsetX: number
  vignetteOffsetY: number
  bloomStrength: number
  bloomRadius: number
  bloomCore: number
}

export const DEFAULT_MORPH_NIGHT_OPTICS_TUNING: MorphNightOpticsTuning = {
  lookMix: 1,
  exposure: 1.69,
  shadowLift: 0.07,
  localGrain: 0.055,
  vignetteStrength: 1,
  vignetteSoftness: 0.7,
  vignetteIrregularity: 0.45,
  vignetteOffsetX: 0.03,
  vignetteOffsetY: 0.025,
  bloomStrength: 0.3,
  bloomRadius: 1.2,
  bloomCore: 0.87,
}

interface MorphNightOpticsState extends MorphNightOpticsTuning {
  variant: MorphNightOpticsVariant
  debugView: MorphNightOpticsDebugView
  setVariant: (variant: MorphNightOpticsVariant) => void
  setTuning: <Key extends keyof MorphNightOpticsTuning>(key: Key, value: MorphNightOpticsTuning[Key]) => void
  resetTuning: () => void
  setDebugView: (debugView: MorphNightOpticsDebugView) => void
  syncFromLocation: () => void
}

type MorphNightOpticsValues = Pick<MorphNightOpticsState, 'variant' | 'debugView' | keyof MorphNightOpticsTuning>

const queryKeys: Record<keyof MorphNightOpticsTuning, string> = {
  lookMix: 'nightMix',
  exposure: 'nightExposure',
  shadowLift: 'nightLift',
  localGrain: 'nightGrain',
  vignetteStrength: 'nightVignette',
  vignetteSoftness: 'nightVignetteSoftness',
  vignetteIrregularity: 'nightVignetteIrregularity',
  vignetteOffsetX: 'nightVignetteX',
  vignetteOffsetY: 'nightVignetteY',
  bloomStrength: 'nightBloom',
  bloomRadius: 'nightBloomRadius',
  bloomCore: 'nightBloomCore',
}

const readFiniteNumber = (params: URLSearchParams, key: string, fallback: number) => {
  const raw = params.get(key)
  if (raw === null || raw.trim() === '') return fallback
  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

const clampTuning = (values: MorphNightOpticsTuning): MorphNightOpticsTuning => ({
  lookMix: Math.min(1, Math.max(0, values.lookMix)),
  exposure: Math.min(2, Math.max(0.35, values.exposure)),
  shadowLift: Math.min(0.3, Math.max(0, values.shadowLift)),
  localGrain: Math.min(0.2, Math.max(0, values.localGrain)),
  vignetteStrength: Math.min(1, Math.max(0, values.vignetteStrength)),
  vignetteSoftness: Math.min(0.8, Math.max(0.05, values.vignetteSoftness)),
  vignetteIrregularity: Math.min(0.5, Math.max(0, values.vignetteIrregularity)),
  vignetteOffsetX: Math.min(0.25, Math.max(-0.25, values.vignetteOffsetX)),
  vignetteOffsetY: Math.min(0.25, Math.max(-0.25, values.vignetteOffsetY)),
  bloomStrength: Math.min(2, Math.max(0, values.bloomStrength)),
  bloomRadius: Math.min(1.2, Math.max(0.05, values.bloomRadius)),
  bloomCore: Math.min(1.5, Math.max(0, values.bloomCore)),
})

const readValues = (): MorphNightOpticsValues => {
  if (typeof window === 'undefined') {
    return { variant: 'night-film', debugView: 'none', ...DEFAULT_MORPH_NIGHT_OPTICS_TUNING }
  }
  const params = new URLSearchParams(window.location.search)
  const tuning = {} as MorphNightOpticsTuning
  ;(Object.keys(queryKeys) as Array<keyof MorphNightOpticsTuning>).forEach((key) => {
    tuning[key] = readFiniteNumber(params, queryKeys[key], DEFAULT_MORPH_NIGHT_OPTICS_TUNING[key])
  })
  return {
    variant: params.get('nightLook') === 'current' ? 'current' : 'night-film',
    debugView: params.get('nightDebug') === 'bloom'
      ? 'bloom-mask'
      : params.get('nightDebug') === 'vignette'
        ? 'vignette-mask'
        : 'none',
    ...clampTuning(tuning),
  }
}

const updateQuery = (values: MorphNightOpticsValues) => {
  const url = new URL(window.location.href)
  if (values.variant === 'current') url.searchParams.set('nightLook', 'current')
  else url.searchParams.delete('nightLook')
  if (values.debugView === 'bloom-mask') url.searchParams.set('nightDebug', 'bloom')
  else if (values.debugView === 'vignette-mask') url.searchParams.set('nightDebug', 'vignette')
  else url.searchParams.delete('nightDebug')
  ;(Object.keys(queryKeys) as Array<keyof MorphNightOpticsTuning>).forEach((key) => {
    if (values[key] === DEFAULT_MORPH_NIGHT_OPTICS_TUNING[key]) url.searchParams.delete(queryKeys[key])
    else url.searchParams.set(queryKeys[key], String(values[key]))
  })
  window.history.replaceState(window.history.state, '', url)
}

export const useMorphNightOpticsStore = create<MorphNightOpticsState>((set, get) => {
  const update = (patch: Partial<MorphNightOpticsValues>) => {
    const merged = { ...get(), ...patch }
    const next: MorphNightOpticsValues = {
      variant: merged.variant,
      debugView: merged.debugView,
      ...clampTuning(merged),
    }
    set(next)
    updateQuery(next)
  }

  return {
    ...readValues(),
    setVariant: (variant) => update({ variant }),
    setTuning: (key, value) => update({ [key]: value }),
    resetTuning: () => update(DEFAULT_MORPH_NIGHT_OPTICS_TUNING),
    setDebugView: (debugView) => update({ debugView }),
    syncFromLocation: () => set(readValues()),
  }
})
