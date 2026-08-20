import { create } from 'zustand'

export type MorphStabilityVariant = 'baseline' | 'stabilized'
export type MorphStabilityDebugView = 'none' | 'edge-candidate' | 'front-wall-risk'

interface MorphStabilityExperimentState {
  variant: MorphStabilityVariant
  freezeRotation: boolean
  rotationAngle: number
  freezeTime: boolean
  shaderTime: number
  debugView: MorphStabilityDebugView
  setVariant: (variant: MorphStabilityVariant) => void
  setFreezeRotation: (freezeRotation: boolean) => void
  setRotationAngle: (rotationAngle: number) => void
  setFreezeTime: (freezeTime: boolean) => void
  setShaderTime: (shaderTime: number) => void
  setDebugView: (debugView: MorphStabilityDebugView) => void
  syncFromLocation: () => void
}

type MorphStabilityExperimentValues = Pick<
  MorphStabilityExperimentState,
  'variant' | 'freezeRotation' | 'rotationAngle' | 'freezeTime' | 'shaderTime' | 'debugView'
>

const DEFAULT_EXPERIMENT_VALUES: MorphStabilityExperimentValues = {
  variant: 'baseline',
  freezeRotation: false,
  rotationAngle: 45,
  freezeTime: false,
  shaderTime: 0,
  debugView: 'none',
}

const readBooleanQuery = (params: URLSearchParams, key: string, legacyFreeze: boolean) => {
  const value = params.get(key)
  if (value === '1' || value === 'true') return true
  if (value === '0' || value === 'false') return false
  return legacyFreeze
}

const readFiniteNumber = (params: URLSearchParams, key: string, fallback: number) => {
  const rawValue = params.get(key)
  if (rawValue === null || rawValue.trim() === '') return fallback
  const value = Number(rawValue)
  return Number.isFinite(value) ? value : fallback
}

const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360

export const readMorphStabilityExperiment = (): MorphStabilityExperimentValues => {
  if (typeof window === 'undefined') return DEFAULT_EXPERIMENT_VALUES

  const params = new URLSearchParams(window.location.search)
  const legacyFreeze = params.get('freeze') === '1'
  const requestedVariant = params.get('stability')
  const useStabilizedVariant = requestedVariant === 'b'
    || (requestedVariant !== 'a' && params.get('room') === 'morph-plan')
  return {
    variant: useStabilizedVariant ? 'stabilized' : 'baseline',
    freezeRotation: readBooleanQuery(params, 'freezeRotation', legacyFreeze),
    rotationAngle: normalizeAngle(readFiniteNumber(params, 'angle', DEFAULT_EXPERIMENT_VALUES.rotationAngle)),
    freezeTime: readBooleanQuery(params, 'freezeTime', legacyFreeze),
    shaderTime: Math.max(0, readFiniteNumber(params, 'time', DEFAULT_EXPERIMENT_VALUES.shaderTime)),
    debugView: params.get('debug') === 'edge'
      ? 'edge-candidate'
      : params.get('debug') === 'front-wall'
        ? 'front-wall-risk'
        : 'none',
  }
}

const updateExperimentQuery = (values: MorphStabilityExperimentValues) => {
  const url = new URL(window.location.href)
  url.searchParams.delete('freeze')
  url.searchParams.set('stability', values.variant === 'stabilized' ? 'b' : 'a')

  if (values.freezeRotation) url.searchParams.set('freezeRotation', '1')
  else url.searchParams.delete('freezeRotation')
  if (values.rotationAngle !== DEFAULT_EXPERIMENT_VALUES.rotationAngle || values.freezeRotation) {
    url.searchParams.set('angle', String(values.rotationAngle))
  } else {
    url.searchParams.delete('angle')
  }

  if (values.freezeTime) url.searchParams.set('freezeTime', '1')
  else url.searchParams.delete('freezeTime')
  if (values.shaderTime !== DEFAULT_EXPERIMENT_VALUES.shaderTime || values.freezeTime) {
    url.searchParams.set('time', String(values.shaderTime))
  } else {
    url.searchParams.delete('time')
  }

  if (values.debugView === 'edge-candidate') url.searchParams.set('debug', 'edge')
  else if (values.debugView === 'front-wall-risk') url.searchParams.set('debug', 'front-wall')
  else url.searchParams.delete('debug')

  window.history.replaceState(window.history.state, '', url)
}

export const useMorphStabilityExperimentStore = create<MorphStabilityExperimentState>((set, get) => {
  const update = (patch: Partial<MorphStabilityExperimentValues>) => {
    const values = { ...get(), ...patch }
    const nextValues: MorphStabilityExperimentValues = {
      variant: values.variant,
      freezeRotation: values.freezeRotation,
      rotationAngle: values.rotationAngle,
      freezeTime: values.freezeTime,
      shaderTime: values.shaderTime,
      debugView: values.debugView,
    }
    set(nextValues)
    updateExperimentQuery(nextValues)
  }

  return {
    ...readMorphStabilityExperiment(),
    setVariant: (variant) => update({ variant }),
    setFreezeRotation: (freezeRotation) => update({ freezeRotation }),
    setRotationAngle: (rotationAngle) => update({ rotationAngle: normalizeAngle(rotationAngle) }),
    setFreezeTime: (freezeTime) => update({ freezeTime }),
    setShaderTime: (shaderTime) => update({ shaderTime: Math.max(0, shaderTime) }),
    setDebugView: (debugView) => update({ debugView }),
    syncFromLocation: () => set(readMorphStabilityExperiment()),
  }
})
