import { create } from 'zustand'

export type ExperienceStage = 'loading' | 'hub' | 'approach' | 'observation'
export type TransitionKind = 'none' | 'hubToApproach' | 'approachToObservation' | 'returnToHub'
export type ObservationMode = 'guided' | 'explore'
export type Language = 'en' | 'ja'
export type SignalId = 'signal-01' | 'signal-02' | 'signal-03' | 'signal-04' | 'signal-05'
export type ObservationVisualStatus = 'idle' | 'loading' | 'ready' | 'fallback'

interface ExperienceStore {
  stage: ExperienceStage
  transition: TransitionKind
  selectedSignalId: SignalId | null
  currentObservationId: string | null
  observationMode: ObservationMode
  selectedExploreItemId: string | null
  language: Language
  sequenceProgress: number
  isAudioEnabled: boolean
  effectActive: boolean
  observationVisualStatus: ObservationVisualStatus
  lastInteractionTime: number
  enterHub: () => void
  enterApproach: (signalId?: SignalId) => void
  enterObservation: () => void
  beginReturn: () => void
  finishTransition: () => void
  setObservationMode: (mode: ObservationMode) => void
  setSelectedExploreItem: (itemId: string | null) => void
  setLanguage: (language: Language) => void
  setProgress: (progress: number) => void
  setEffectActive: (active: boolean) => void
  setObservationVisualStatus: (status: ObservationVisualStatus) => void
  setAudioEnabled: (enabled: boolean) => void
  registerInteraction: () => void
}

const resetExperience = {
  transition: 'none' as const,
  selectedSignalId: null,
  currentObservationId: null,
  observationMode: 'guided' as const,
  selectedExploreItemId: null,
  sequenceProgress: 0,
  effectActive: false,
  observationVisualStatus: 'idle' as const,
}

export const useExperienceStore = create<ExperienceStore>((set, get) => ({
  stage: 'loading',
  language: 'ja',
  isAudioEnabled: false,
  lastInteractionTime: Date.now(),
  ...resetExperience,
  enterHub: () => set({ stage: 'hub', ...resetExperience, lastInteractionTime: Date.now() }),
  enterApproach: (signalId = 'signal-01') => {
    const { stage, transition } = get()
    if (stage !== 'hub' || transition !== 'none') return
    set({
      transition: 'hubToApproach',
      selectedSignalId: signalId,
      currentObservationId: `observation-${signalId.slice(-2)}`,
      observationVisualStatus: 'loading',
      lastInteractionTime: Date.now(),
    })
  },
  enterObservation: () => {
    const { stage, transition } = get()
    if (stage !== 'approach' || transition !== 'none') return
    set({ transition: 'approachToObservation', sequenceProgress: 0, lastInteractionTime: Date.now() })
  },
  beginReturn: () => {
    const { stage, transition } = get()
    if (stage === 'loading' || (stage === 'hub' && transition === 'none') || transition === 'returnToHub') return
    set({
      transition: 'returnToHub',
      effectActive: false,
      selectedExploreItemId: null,
      lastInteractionTime: Date.now(),
    })
    window.dispatchEvent(new CustomEvent('experience-transition', { detail: 'returnToHub' }))
  },
  finishTransition: () => {
    const { transition } = get()
    if (transition === 'hubToApproach') set({ stage: 'approach', transition: 'none' })
    else if (transition === 'approachToObservation') set({ stage: 'observation', transition: 'none' })
    else if (transition === 'returnToHub') set({ stage: 'hub', ...resetExperience, lastInteractionTime: Date.now() })
  },
  setObservationMode: (observationMode) => set({ observationMode }),
  setSelectedExploreItem: (selectedExploreItemId) => set({ selectedExploreItemId, lastInteractionTime: Date.now() }),
  setLanguage: (language) => set({ language, lastInteractionTime: Date.now() }),
  setProgress: (sequenceProgress) => set({ sequenceProgress }),
  setEffectActive: (effectActive) => set({ effectActive }),
  setObservationVisualStatus: (observationVisualStatus) => set({ observationVisualStatus }),
  setAudioEnabled: (isAudioEnabled) => set({ isAudioEnabled }),
  registerInteraction: () => set({ lastInteractionTime: Date.now() }),
}))
