import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Fog, type Points } from 'three'
import { useExperienceStore } from '../store/experienceStore'

export function Environment() {
  const scene = useThree((view) => view.scene)
  const points = useRef<Points>(null)
  const positions = useMemo(() => {
    const values = new Float32Array(420 * 3)
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

  useFrame(({ camera }, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.002
    const snapshot = useExperienceStore.getState()
    const progress = Number(camera.userData.transitionProgress ?? 0)
    const observationMorph = snapshot.transition === 'approachToObservation'
      ? progress
      : snapshot.stage === 'observation'
        ? snapshot.transition === 'returnToHub' ? 1 - progress : 1
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
      if (!Array.isArray(material)) material.opacity = 0.62 + observationMorph * 0.28
      points.current.scale.z = 1 + observationMorph * 2.8
    }
  })

  return (
    <>
      <fog attach="fog" args={['#07090a', 5.5, 15]} />
      <ambientLight intensity={0.48} color="#97a5a4" />
      <directionalLight position={[3, 5, 4]} intensity={2.4} color="#ffd3a0" />
      <pointLight position={[-3, 1, -2]} intensity={8} distance={8} color="#4a7a73" />
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.025} color="#d6ab68" transparent opacity={0.62} sizeAttenuation />
      </points>
      <mesh position={[0, -1.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5, 64]} />
        <meshStandardMaterial color="#090c0d" roughness={0.95} metalness={0.08} />
      </mesh>
      <mesh position={[0, -1.055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.215, 96]} />
        <meshBasicMaterial color="#74502e" transparent opacity={0.42} />
      </mesh>
    </>
  )
}
