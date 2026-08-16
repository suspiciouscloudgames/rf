import { create } from 'zustand'

export interface ExperienceTuning {
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
}

interface TuningStore extends ExperienceTuning {
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void
  togglePanel: () => void
  setTuningValue: <Key extends keyof ExperienceTuning>(key: Key, value: ExperienceTuning[Key]) => void
  resetTuning: () => void
}

export const DEFAULT_EXPERIENCE_TUNING: ExperienceTuning = {
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
}

const STORAGE_KEY = 'resonant-field:tuning:v1'

const loadTuning = (): ExperienceTuning => {
  if (typeof window === 'undefined') return DEFAULT_EXPERIENCE_TUNING
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<ExperienceTuning>
    return { ...DEFAULT_EXPERIENCE_TUNING, ...saved }
  } catch {
    return DEFAULT_EXPERIENCE_TUNING
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
})

export const useTuningStore = create<TuningStore>((set, get) => ({
  ...loadTuning(),
  panelOpen: false,
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  togglePanel: () => set((store) => ({ panelOpen: !store.panelOpen })),
  setTuningValue: (key, value) => {
    set({ [key]: value } as Pick<TuningStore, typeof key>)
    saveTuning(selectTuning(get()))
  },
  resetTuning: () => {
    set(DEFAULT_EXPERIENCE_TUNING)
    saveTuning(DEFAULT_EXPERIENCE_TUNING)
  },
}))
