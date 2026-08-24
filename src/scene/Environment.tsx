import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Fog, type Points } from 'three'
import { useExperienceStore } from '../store/experienceStore'
import { useTuningStore } from '../store/tuningStore'

const HUB_PARTICLE_COUNT = 180

export function Environment() {
  const scene = useThree((view) => view.scene)
  const persistenceMode = useTuningStore((store) => store.hubPersistenceMode)
  const points = useRef<Points>(null)
  const positions = useMemo(() => {
    const values = new Float32Array(HUB_PARTICLE_COUNT * 3)
    let seed = 9147
    const random = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
    for (let index = 0; index < values.length; index += 3) {
      values[index] = (random() - 0.5) * 20
      values[index + 1] = (random() - 0.35) * 10
      values[index + 2] = (random() - 0.5) * 14
    }
    return values
  }, [])

  useFrame(({ camera, gl }, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.002
    const snapshot = useExperienceStore.getState()
    const progress = Number(camera.userData.transitionProgress ?? 0)
    const particlesAboveBlackout = snapshot.transition === 'approachToObservation'
      || snapshot.stage === 'observation'
    const observationMorph = persistenceMode === 'fullHub'
      ? 0
      : snapshot.transition === 'approachToObservation'
      ? progress
      : snapshot.stage === 'observation'
        ? snapshot.transition === 'returnToHub' || snapshot.transition === 'returnToApproach' ? 1 - progress : 1
        : 0
    const fog = scene.fog as Fog
    fog.color.setRGB(
      0.027 + observationMorph * 0.015,
      0.035 + observationMorph * 0.002,
      0.039 + observationMorph * 0.045,
    )
    fog.near = 5.5 - observationMorph * 4.2
    fog.far = 15 - observationMorph * 8
    if (points.current) {
      const material = points.current.material
      if (!Array.isArray(material)) {
        material.opacity = 0.62
        material.depthTest = !particlesAboveBlackout
      }
      points.current.scale.z = 1
    }
    gl.domElement.dataset.hubPersistenceMode = persistenceMode
    gl.domElement.dataset.hubParticleOpacity = '0.620'
    gl.domElement.dataset.hubParticleCount = String(HUB_PARTICLE_COUNT)
    gl.domElement.dataset.hubParticlesAboveBlackout = String(particlesAboveBlackout)
    gl.domElement.dataset.hubEnvironmentMorph = observationMorph.toFixed(3)
  })

  return (
    <>
      <fog attach="fog" args={['#07090a', 5.5, 15]} />
      <ambientLight intensity={0.48} color="#97a5a4" />
      <directionalLight position={[3, 5, 4]} intensity={2.4} color="#ffd3a0" />
      <pointLight position={[-3, 1, -2]} intensity={8} distance={8} color="#4a7a73" />
      <points ref={points} renderOrder={6}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.025}
          color="#d6ab68"
          transparent
          opacity={0.62}
          sizeAttenuation
          depthTest
          depthWrite={false}
          fog={false}
        />
      </points>
    </>
  )
}
