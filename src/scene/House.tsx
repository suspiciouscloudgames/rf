import { lazy, Suspense, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, type Group } from 'three'
import { useExperienceStore } from '../store/experienceStore'
import { ObservationSignals } from '../signals/ObservationSignals'
import { setHouseRoot } from './sceneRegistry'
import { FloorplanHouse } from './FloorplanHouse'
import { DepthPortalBoundary, DepthPortalPreloader } from './depth-portal/DepthPortalBoundary'
import { DepthPortalLayer } from './depth-portal/DepthPortalLayer'
import { getSignalConfig, hasDepthPortal } from '../signals/signalData'

const ObservationModelLayer = lazy(() =>
  import('./ObservationModelLayer').then((module) => ({
    default: module.ObservationModelLayer,
  })),
)

export function House() {
  const group = useRef<Group>(null)
  const signalGroup = useRef<Group>(null)
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)
  const showFloorplan = stage === 'approach'
    || stage === 'observation'
    || transition === 'hubToApproach'
    || transition === 'approachToObservation'
    || transition === 'returnToHub'
  const hasFocusedObservationModel = Boolean(
    getSignalConfig(selectedSignalId).observationModel,
  )

  useEffect(() => {
    setHouseRoot(group.current)
    return () => setHouseRoot(null)
  }, [])

  useFrame(({ camera }, delta) => {
    if (!group.current) return
    const portalFocused = hasDepthPortal(selectedSignalId)
      && (stage === 'observation' || transition === 'approachToObservation' || transition === 'returnToHub')
    const speed = portalFocused ? 0 : 0
    group.current.rotation.y += delta * speed
    group.current.position.y = 0

    group.current.scale.setScalar(1)

    if (signalGroup.current) {
      const progress = Number(camera.userData.transitionProgress ?? 0)
      let signalScale = 0.48
      if (stage === 'loading' || (stage === 'hub' && transition === 'none')) signalScale = 1
      else if (transition === 'hubToApproach') signalScale = MathUtils.lerp(1, 0.48, progress)
      else if (transition === 'returnToHub') signalScale = MathUtils.lerp(0.48, 1, progress)
      signalGroup.current.scale.setScalar(signalScale)
    }
  })

  return (
    <group ref={group} position={[0, 0, 0]}>
      <DepthPortalPreloader />
      {showFloorplan ? <FloorplanHouse /> : null}
      {hasFocusedObservationModel ? (
        <Suspense fallback={null}>
          <ObservationModelLayer />
        </Suspense>
      ) : null}
      <DepthPortalBoundary>
        <DepthPortalLayer />
      </DepthPortalBoundary>
      <group ref={signalGroup}>
        <ObservationSignals />
      </group>
    </group>
  )
}
