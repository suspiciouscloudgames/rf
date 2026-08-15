import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { type Group } from 'three'
import { useExperienceStore } from '../store/experienceStore'
import { ObservationSignals } from '../signals/ObservationSignals'
import { setHouseRoot } from './sceneRegistry'
import { ObservationLayer } from './ObservationLayer'
import { DepthPortalBoundary, DepthPortalPreloader } from './depth-portal/DepthPortalBoundary'
import { DepthPortalLayer } from './depth-portal/DepthPortalLayer'
import { hasDepthPortal } from '../signals/signalData'

export function House() {
  const group = useRef<Group>(null)
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)

  useEffect(() => {
    setHouseRoot(group.current)
    return () => setHouseRoot(null)
  }, [])

  useFrame((_, delta) => {
    if (!group.current) return
    const portalFocused = hasDepthPortal(selectedSignalId)
      && (stage === 'observation' || transition === 'approachToObservation' || transition === 'returnToHub')
    const speed = portalFocused ? 0 : stage === 'hub' ? 0.012 : stage === 'approach' ? 0.005 : 0.003
    group.current.rotation.y += delta * speed
    group.current.position.y = Math.sin(performance.now() * 0.00015) * 0.018
  })

  return (
    <group ref={group} position={[0, 0, 0]}>
      <DepthPortalPreloader />
      <ObservationLayer />
      <DepthPortalBoundary>
        <DepthPortalLayer />
      </DepthPortalBoundary>
      <ObservationSignals />
    </group>
  )
}
