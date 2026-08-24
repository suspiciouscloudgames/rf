import { lazy, Suspense, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { type Group } from 'three'
import { useExperienceStore } from '../store/experienceStore'
import { ObservationSignals } from '../signals/ObservationSignals'
import { setHouseRoot } from './sceneRegistry'
import { ObservationLayer } from './ObservationLayer'
import { DepthPortalBoundary, DepthPortalPreloader } from './depth-portal/DepthPortalBoundary'
import { DepthPortalLayer } from './depth-portal/DepthPortalLayer'
import { getSignalConfig, hasDepthPortal } from '../signals/signalData'
import { ApproachRoomSwitcher } from './ApproachRoomSwitcher'
import { useRoomVisualModeStore } from '../store/roomVisualModeStore'

const ObservationModelLayer = lazy(() =>
  import('./ObservationModelLayer').then((module) => ({
    default: module.ObservationModelLayer,
  })),
)

export function House() {
  const group = useRef<Group>(null)
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)
  const roomVisualMode = useRoomVisualModeStore((store) => store.mode)
  const hasFocusedObservationModel = Boolean(
    getSignalConfig(selectedSignalId).observationModel,
  )

  useEffect(() => {
    setHouseRoot(group.current)
    return () => setHouseRoot(null)
  }, [])

  useFrame((_, delta) => {
    if (!group.current) return
    const portalFocused = hasDepthPortal(selectedSignalId)
      && (stage === 'observation' || transition === 'approachToObservation' || transition === 'returnToApproach' || transition === 'returnToHub')
    const planRoomOwnsRotation = roomVisualMode === 'morph-plan'
      && (stage === 'approach' || transition === 'hubToApproach')
    const speed = portalFocused || planRoomOwnsRotation
      ? 0
      : stage === 'hub' ? 0.012 : stage === 'approach' ? 0.005 : 0.003
    group.current.rotation.y += delta * speed
    group.current.position.y = 0

    group.current.scale.setScalar(1)
  })

  return (
    <group ref={group} position={[0, 0, 0]}>
      <DepthPortalPreloader />
      <ApproachRoomSwitcher />
      <ObservationLayer />
      {hasFocusedObservationModel ? (
        <Suspense fallback={null}>
          <ObservationModelLayer />
        </Suspense>
      ) : null}
      <DepthPortalBoundary>
        <DepthPortalLayer />
      </DepthPortalBoundary>
      <ObservationSignals />
    </group>
  )
}
