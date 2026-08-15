import { DEPTH_PORTAL_DOLLY_SECONDS } from '../../sequence/observationTiming'

export interface DepthPortalConfig {
  assetId: 'construction-space'
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number]
  depthScale: number
  depthGamma: number
  maxParallax: number
  edgeFade: number
  farObservationOffset: [number, number, number]
  farFov: number
  nearFov: number
  dollyDuration: number
}

export const constructionSpacePortal: DepthPortalConfig = {
  assetId: 'construction-space',
  position: [0.78, 0.25, -1.105],
  rotation: [0, 0, 0],
  size: [1.15, 2.035],
  depthScale: 0.18,
  depthGamma: 1.05,
  maxParallax: 0.032,
  edgeFade: 0.018,
  farObservationOffset: [-0.06, 0.3, 3.25],
  farFov: 35,
  nearFov: 25.5,
  dollyDuration: DEPTH_PORTAL_DOLLY_SECONDS,
}
