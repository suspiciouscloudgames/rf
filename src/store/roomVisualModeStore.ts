import { create } from 'zustand'

export type RoomVisualMode = 'classic' | 'morph' | 'morph-plan' | 'morph-legacy'

const isRoomVisualMode = (value: unknown): value is RoomVisualMode =>
  value === 'classic' || value === 'morph' || value === 'morph-plan' || value === 'morph-legacy'

const getFallbackMode = (): RoomVisualMode => {
  const configuredMode = import.meta.env.VITE_ROOM_VISUAL_DEFAULT
  return isRoomVisualMode(configuredMode) ? configuredMode : 'classic'
}

export const readRoomVisualMode = (): RoomVisualMode => {
  if (typeof window === 'undefined') return getFallbackMode()
  const queryMode = new URLSearchParams(window.location.search).get('room')
  return isRoomVisualMode(queryMode) ? queryMode : getFallbackMode()
}

interface RoomVisualModeStore {
  mode: RoomVisualMode
  setMode: (mode: RoomVisualMode) => void
  syncFromLocation: () => void
}

export const useRoomVisualModeStore = create<RoomVisualModeStore>((set) => ({
  mode: readRoomVisualMode(),
  setMode: (mode) => {
    const url = new URL(window.location.href)
    url.searchParams.set('room', mode)
    window.history.replaceState(window.history.state, '', url)
    set({ mode })
  },
  syncFromLocation: () => set({ mode: readRoomVisualMode() }),
}))
