import { create } from 'zustand'
import { isAppleTouchDevice } from '../lib/device'

export type HubPersistenceMode = 'particles' | 'fullHub'

export interface ExperienceTuning {
  hubPersistenceMode: HubPersistenceMode
  hubVideoBrightness: number
  hubVideoScrimOpacity: number
  hubVideoOpacity: number
  hubVideoFadeOutSeconds: number
  hubToApproachSeconds: number
  approachToObservationSeconds: number
  observationEntrySeconds: number
  entryTravelDistance: number
  entryCurveStrength: number
  entryFov: number
  targetRotationDelay: number
  guidedObservationSeconds: number
  darkenSeconds: number
  perceivedDepth: number
  worldDepth: number
  layerDepth: number
  parallaxStrength: number
  morphBaseColor: string
  morphHighlightColor: string
  morphShadowColor: string
  morphMonochromeMix: number
  morphRoomOpacity: number
  morphPropOpacity: number
  morphRotationPeriod: number
  morphFrontWallOpacity: number
  morphFrontWallFadeAngle: number
  morphWaverAmount: number
  morphWaverScale: number
  morphWaverSpeed: number
  morphRippleAmount: number
  morphRippleRadius: number
  morphTemporalFlickerEnabled: boolean
  morphFilmFlicker: number
  morphFilmGrain: number
}

interface TuningStore extends ExperienceTuning {
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void
  togglePanel: () => void
  setTuningValue: <Key extends keyof ExperienceTuning>(key: Key, value: ExperienceTuning[Key]) => void
  resetTuning: () => void
  resetMorphVisuals: () => void
}

export const DEFAULT_MORPH_VISUAL_TUNING = {
  morphBaseColor: '#66766b',
  morphHighlightColor: '#46e6dd',
  morphShadowColor: '#06133f',
  morphMonochromeMix: 0.04,
  morphRoomOpacity: 0.2,
  morphPropOpacity: 0.66,
  morphRotationPeriod: 210,
  morphFrontWallOpacity: 0.12,
  morphFrontWallFadeAngle: 58,
  morphWaverAmount: 0.018,
  morphWaverScale: 3.4,
  morphWaverSpeed: 0.18,
  morphRippleAmount: 0.04,
  morphRippleRadius: 1.25,
  morphTemporalFlickerEnabled: true,
  morphFilmFlicker: 0.025,
  morphFilmGrain: 0.12,
} as const

export const DEFAULT_EXPERIENCE_TUNING: ExperienceTuning = {
  hubPersistenceMode: 'particles',
  hubVideoBrightness: 0.5,
  hubVideoScrimOpacity: 1,
  hubVideoOpacity: 0.82,
  hubVideoFadeOutSeconds: 5,
  hubToApproachSeconds: 3.2,
  approachToObservationSeconds: 3.5,
  observationEntrySeconds: 3.5,
  entryTravelDistance: 1.4,
  entryCurveStrength: 0.18,
  entryFov: 37,
  targetRotationDelay: 25,
  guidedObservationSeconds: 30,
  darkenSeconds: 10,
  perceivedDepth: 0.18,
  worldDepth: 6.2,
  layerDepth: 0.22,
  parallaxStrength: 0.032,
  ...DEFAULT_MORPH_VISUAL_TUNING,
}

const stabilizeAppleTouchTuning = (tuning: ExperienceTuning): ExperienceTuning => (
  isAppleTouchDevice()
    ? {
        ...tuning,
        morphWaverAmount: 0,
        morphWaverSpeed: 0,
        morphRippleAmount: 0,
        morphTemporalFlickerEnabled: false,
        morphFilmFlicker: 0,
        morphFilmGrain: 0,
      }
    : tuning
)

const STORAGE_KEY = 'resonant-field:tuning:v1'

const loadTuning = (): ExperienceTuning => {
  if (typeof window === 'undefined') return DEFAULT_EXPERIENCE_TUNING
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<ExperienceTuning>
    const usesLegacyMorphPalette = saved.morphBaseColor === '#c8c7c0'
      && saved.morphHighlightColor === '#f1efe7'
      && saved.morphShadowColor === '#151515'
    const usesPreviousGreenPalette = saved.morphBaseColor === '#5f8f7b'
      && saved.morphHighlightColor === '#c6dfcf'
      && saved.morphShadowColor === '#071a15'
    const usesRadarGreenPalette = saved.morphBaseColor === '#00c85a'
      && saved.morphHighlightColor === '#b7ffc4'
      && saved.morphShadowColor === '#003b26'
    const usesCobaltPalette = saved.morphBaseColor === '#1253c7'
      && saved.morphHighlightColor === '#46e6dd'
      && saved.morphShadowColor === '#06133f'
    const migrated = usesLegacyMorphPalette || usesPreviousGreenPalette || usesRadarGreenPalette || usesCobaltPalette
      ? { ...saved, ...DEFAULT_MORPH_VISUAL_TUNING }
      : saved
    return stabilizeAppleTouchTuning({ ...DEFAULT_EXPERIENCE_TUNING, ...migrated })
  } catch {
    return stabilizeAppleTouchTuning(DEFAULT_EXPERIENCE_TUNING)
  }
}

const saveTuning = (tuning: ExperienceTuning) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tuning))
  } catch {
    // The controls still work when browser storage is unavailable.
  }
}

const selectTuning = (store: TuningStore): ExperienceTuning => ({
  hubPersistenceMode: store.hubPersistenceMode,
  hubVideoBrightness: store.hubVideoBrightness,
  hubVideoScrimOpacity: store.hubVideoScrimOpacity,
  hubVideoOpacity: store.hubVideoOpacity,
  hubVideoFadeOutSeconds: store.hubVideoFadeOutSeconds,
  hubToApproachSeconds: store.hubToApproachSeconds,
  approachToObservationSeconds: store.approachToObservationSeconds,
  observationEntrySeconds: store.observationEntrySeconds,
  entryTravelDistance: store.entryTravelDistance,
  entryCurveStrength: store.entryCurveStrength,
  entryFov: store.entryFov,
  targetRotationDelay: store.targetRotationDelay,
  guidedObservationSeconds: store.guidedObservationSeconds,
  darkenSeconds: store.darkenSeconds,
  perceivedDepth: store.perceivedDepth,
  worldDepth: store.worldDepth,
  layerDepth: store.layerDepth,
  parallaxStrength: store.parallaxStrength,
  morphBaseColor: store.morphBaseColor,
  morphHighlightColor: store.morphHighlightColor,
  morphShadowColor: store.morphShadowColor,
  morphMonochromeMix: store.morphMonochromeMix,
  morphRoomOpacity: store.morphRoomOpacity,
  morphPropOpacity: store.morphPropOpacity,
  morphRotationPeriod: store.morphRotationPeriod,
  morphFrontWallOpacity: store.morphFrontWallOpacity,
  morphFrontWallFadeAngle: store.morphFrontWallFadeAngle,
  morphWaverAmount: store.morphWaverAmount,
  morphWaverScale: store.morphWaverScale,
  morphWaverSpeed: store.morphWaverSpeed,
  morphRippleAmount: store.morphRippleAmount,
  morphRippleRadius: store.morphRippleRadius,
  morphTemporalFlickerEnabled: store.morphTemporalFlickerEnabled,
  morphFilmFlicker: store.morphFilmFlicker,
  morphFilmGrain: store.morphFilmGrain,
})

export const useTuningStore = create<TuningStore>((set, get) => ({
  ...loadTuning(),
  panelOpen: false,
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  togglePanel: () => set((store) => ({ panelOpen: !store.panelOpen })),
  setTuningValue: (key, value) => {
    const tuning = stabilizeAppleTouchTuning({
      ...selectTuning(get()),
      [key]: value,
    })
    set(tuning)
    saveTuning(tuning)
  },
  resetTuning: () => {
    const tuning = stabilizeAppleTouchTuning(DEFAULT_EXPERIENCE_TUNING)
    set(tuning)
    saveTuning(tuning)
  },
  resetMorphVisuals: () => {
    const tuning = stabilizeAppleTouchTuning({
      ...selectTuning(get()),
      ...DEFAULT_MORPH_VISUAL_TUNING,
    })
    set(tuning)
    saveTuning(tuning)
  },
}))
