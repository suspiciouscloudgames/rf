import { create } from 'zustand'

export type ExperienceState = 'loading' | 'hub' | 'approach' | 'observation' | 'returning'
export type Language = 'en' | 'ja'

interface ExperienceStore {
  state: ExperienceState
  currentObservationId: string | null
  language: Language
  sequenceProgress: number
  isTransitioning: boolean
  isAudioEnabled: boolean
  effectActive: boolean
  lastInteractionTime: number
  enterHub: () => void
  enterApproach: () => void
  enterObservation: () => void
  beginReturn: () => void
  finishTransition: () => void
  setLanguage: (language: Language) => void
  setProgress: (progress: number) => void
  setEffectActive: (active: boolean) => void
  setAudioEnabled: (enabled: boolean) => void
  registerInteraction: () => void
}

const initialExperience = {
  currentObservationId: null,
  sequenceProgress: 0,
  isTransitioning: false,
  effectActive: false,
}

export const useExperienceStore = create<ExperienceStore>((set, get) => ({
  state: 'loading',
  language: 'en',
  isAudioEnabled: false,
  lastInteractionTime: Date.now(),
  ...initialExperience,
  enterHub: () => set({ state: 'hub', ...initialExperience, lastInteractionTime: Date.now() }),
  enterApproach: () => {
    if (get().state !== 'hub' || get().isTransitioning) return
    set({
      state: 'approach',
      currentObservationId: 'observation-01',
      isTransitioning: true,
      lastInteractionTime: Date.now(),
    })
  },
  enterObservation: () => {
    if (get().state !== 'approach' || get().isTransitioning) return
    set({ state: 'observation', isTransitioning: true, sequenceProgress: 0, lastInteractionTime: Date.now() })
  },
  beginReturn: () => {
    const { state, isTransitioning } = get()
    if (state === 'hub' || state === 'loading' || state === 'returning' || isTransitioning) return
    set({ state: 'returning', isTransitioning: true, effectActive: false, lastInteractionTime: Date.now() })
  },
  finishTransition: () => set({ isTransitioning: false }),
  setLanguage: (language) => set({ language, lastInteractionTime: Date.now() }),
  setProgress: (sequenceProgress) => set({ sequenceProgress }),
  setEffectActive: (effectActive) => set({ effectActive }),
  setAudioEnabled: (isAudioEnabled) => set({ isAudioEnabled }),
  registerInteraction: () => set({ lastInteractionTime: Date.now() }),
}))
