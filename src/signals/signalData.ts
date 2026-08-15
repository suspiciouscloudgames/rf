import type { SignalId } from '../store/experienceStore'
import { constructionSpacePortal, type DepthPortalConfig } from '../scene/depth-portal/depthPortalConfig'

export interface ObservationSignalConfig {
  id: SignalId
  observationId: string
  anchor: [number, number, number]
  normal: [number, number, number]
  approachDistance: number
  observationDepth: number
  focusPosition: [number, number, number]
  observationOffset: [number, number, number]
  accent: string
  phase: number
  depthPortal?: DepthPortalConfig
}

export const observationSignals: ObservationSignalConfig[] = [
  {
    id: 'signal-01',
    observationId: 'observation-01',
    anchor: [-0.62, -0.18, 0.82],
    normal: [0, 0, 1],
    approachDistance: 3.55,
    observationDepth: 0.88,
    focusPosition: [-0.62, -0.48, 0.02],
    observationOffset: [1.15, 0.78, 1.58],
    accent: '#f0a251',
    phase: 0,
  },
  {
    id: 'signal-02',
    observationId: 'observation-02',
    anchor: [0.92, -0.12, 0.82],
    normal: [0, 0, 1],
    approachDistance: 3.4,
    observationDepth: 0.82,
    focusPosition: [0.92, -0.16, 0.62],
    observationOffset: [-0.9, 0.48, 1.34],
    accent: '#b9d6c8',
    phase: 1.15,
  },
  {
    id: 'signal-03',
    observationId: 'observation-03',
    anchor: [1.46, 0.12, -0.48],
    normal: [1, 0, 0],
    approachDistance: 3.45,
    observationDepth: 0.9,
    focusPosition: [1.28, 0, -0.48],
    observationOffset: [-1.48, 0.38, 1.08],
    accent: '#e7704d',
    phase: 2.3,
  },
  {
    id: 'signal-04',
    observationId: 'observation-04',
    anchor: [-0.78, 0.46, -1.05],
    normal: [0, 0, 1],
    approachDistance: 3.65,
    observationDepth: 1,
    focusPosition: [-0.78, 0.38, -1.08],
    observationOffset: [0.15, 0.16, 1.42],
    accent: '#d4b76d',
    phase: 3.45,
  },
  {
    id: 'signal-05',
    observationId: 'observation-05',
    anchor: [0.78, 0.46, -1.05],
    normal: [0, 0, 1],
    approachDistance: 3.5,
    observationDepth: 0.86,
    focusPosition: [0.78, 0.28, -1.08],
    observationOffset: [-0.08, 0.14, 1.52],
    accent: '#809fb0',
    phase: 4.6,
    depthPortal: constructionSpacePortal,
  },
]

export const getSignalConfig = (signalId: SignalId | null) =>
  observationSignals.find((signal) => signal.id === signalId) ?? observationSignals[0]

export const getDepthPortalConfig = (signalId: SignalId | null) =>
  getSignalConfig(signalId).depthPortal ?? null

export const hasDepthPortal = (signalId: SignalId | null) =>
  getDepthPortalConfig(signalId) !== null
