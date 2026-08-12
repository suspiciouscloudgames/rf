import type { SignalId } from '../store/experienceStore'

export interface ObservationSignalConfig {
  id: SignalId
  observationId: string
  anchor: [number, number, number]
  normal: [number, number, number]
  approachDistance: number
  observationDepth: number
  accent: string
  phase: number
}

export const observationSignals: ObservationSignalConfig[] = [
  {
    id: 'signal-01',
    observationId: 'observation-01',
    anchor: [0.82, 0.38, 0.73],
    normal: [0, 0, 1],
    approachDistance: 3.55,
    observationDepth: 0.88,
    accent: '#f0a251',
    phase: 0,
  },
  {
    id: 'signal-02',
    observationId: 'observation-02',
    anchor: [-0.68, -0.32, 0.73],
    normal: [0, 0, 1],
    approachDistance: 3.4,
    observationDepth: 0.82,
    accent: '#b9d6c8',
    phase: 1.15,
  },
  {
    id: 'signal-03',
    observationId: 'observation-03',
    anchor: [1.28, -0.08, 0.12],
    normal: [1, 0, 0],
    approachDistance: 3.45,
    observationDepth: 0.9,
    accent: '#e7704d',
    phase: 2.3,
  },
  {
    id: 'signal-04',
    observationId: 'observation-04',
    anchor: [0.02, 1.48, 0.18],
    normal: [0, 0.72, 0.69],
    approachDistance: 3.65,
    observationDepth: 1,
    accent: '#d4b76d',
    phase: 3.45,
  },
  {
    id: 'signal-05',
    observationId: 'observation-05',
    anchor: [-1.28, 0.12, -0.16],
    normal: [-1, 0, 0],
    approachDistance: 3.5,
    observationDepth: 0.86,
    accent: '#809fb0',
    phase: 4.6,
  },
]

export const getSignalConfig = (signalId: SignalId | null) =>
  observationSignals.find((signal) => signal.id === signalId) ?? observationSignals[0]
