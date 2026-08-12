import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, MathUtils, RepeatWrapping, SRGBColorSpace, Vector3, type Group, type MeshBasicMaterial, type MeshStandardMaterial, type PointLight } from 'three'
import { useExperienceStore } from '../store/experienceStore'
import { ObservationSignals } from '../signals/ObservationSignals'
import { setHouseRoot } from './sceneRegistry'
import { getSignalConfig } from '../signals/signalData'
import { ObservationLayer } from './ObservationLayer'

const windowPositions: Array<[number, number, number]> = [
  [-0.82, 0.3, 0.66], [-0.28, 0.3, 0.66], [0.28, 0.3, 0.66], [0.82, 0.3, 0.66],
  [-0.82, -0.28, 0.66], [-0.28, -0.28, 0.66], [0.28, -0.28, 0.66], [0.82, -0.28, 0.66],
]

export function House() {
  const group = useRef<Group>(null)
  const wallMaterial = useRef<MeshStandardMaterial>(null)
  const roofMaterial = useRef<MeshStandardMaterial>(null)
  const wallSignalMaterial = useRef<MeshBasicMaterial>(null)
  const roofSignalMaterial = useRef<MeshBasicMaterial>(null)
  const silhouetteMaterial = useRef<MeshBasicMaterial>(null)
  const surfaceProjectionMaterial = useRef<MeshBasicMaterial>(null)
  const surfaceLight = useRef<PointLight>(null)
  const lightAnchor = useRef(new Vector3())
  const lightNormal = useRef(new Vector3())
  const surfaceTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 192
    canvas.height = 192
    const context = canvas.getContext('2d')!
    context.fillStyle = '#9a9990'
    context.fillRect(0, 0, 192, 192)
    let seed = 821
    const random = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
    for (let index = 0; index < 2400; index += 1) {
      const value = Math.round(55 + random() * 90)
      context.fillStyle = `rgba(${value},${value + 6},${value + 4},${0.05 + random() * 0.1})`
      const size = random() > 0.92 ? 5 : 1.5
      context.fillRect(random() * 192, random() * 192, size, size)
    }
    for (let y = 6; y < 192; y += 12) {
      context.fillStyle = 'rgba(45, 88, 82, 0.16)'
      context.fillRect(0, y, 192, 1)
    }
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(2.5, 1.75)
    return texture
  }, [])
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const dimmed = stage === 'observation' || transition === 'approachToObservation'

  useEffect(() => {
    setHouseRoot(group.current)
    return () => setHouseRoot(null)
  }, [])

  useEffect(() => () => surfaceTexture.dispose(), [surfaceTexture])

  useFrame(({ camera, gl }, delta) => {
    if (!group.current) return
    const speed = stage === 'hub' ? 0.012 : stage === 'approach' ? 0.005 : 0.003
    group.current.rotation.y += delta * speed
    group.current.position.y = Math.sin(performance.now() * 0.00015) * 0.018
    const cameraProgress = Number(camera.userData.transitionProgress ?? 0)
    const approachTarget = stage === 'approach' || transition === 'approachToObservation' || stage === 'observation' ? 1 : 0
    const returnTarget = transition === 'returnToHub' ? 1 - cameraProgress : approachTarget
    const morph = transition === 'hubToApproach' ? cameraProgress : returnTarget
    group.current.userData.surfaceMorph = morph
    gl.domElement.dataset.surfaceMorph = morph.toFixed(3)
    if (wallMaterial.current) {
      wallMaterial.current.color.setRGB(
        MathUtils.lerp(0.53, 0.24, morph),
        MathUtils.lerp(0.52, 0.39, morph),
        MathUtils.lerp(0.49, 0.37, morph),
      )
      wallMaterial.current.roughness = MathUtils.lerp(0.92, 0.63, morph)
      wallMaterial.current.metalness = MathUtils.lerp(0.08, 0.24, morph)
      wallMaterial.current.emissive.setRGB(0.035 * morph, 0.19 * morph, 0.16 * morph)
      wallMaterial.current.emissiveIntensity = 1.35 + Math.sin(performance.now() * 0.0012) * 0.16 * morph
    }
    if (roofMaterial.current) {
      roofMaterial.current.color.setRGB(
        MathUtils.lerp(0.29, 0.12, morph),
        MathUtils.lerp(0.29, 0.24, morph),
        MathUtils.lerp(0.28, 0.25, morph),
      )
      roofMaterial.current.emissive.setRGB(0.025 * morph, 0.12 * morph, 0.14 * morph)
      roofMaterial.current.emissiveIntensity = 1.35
    }
    if (wallSignalMaterial.current) wallSignalMaterial.current.opacity = 0
    if (roofSignalMaterial.current) roofSignalMaterial.current.opacity = 0
    if (silhouetteMaterial.current) silhouetteMaterial.current.opacity = 0
    if (surfaceProjectionMaterial.current) surfaceProjectionMaterial.current.opacity = 0
    if (surfaceLight.current) {
      const signal = getSignalConfig(useExperienceStore.getState().selectedSignalId)
      lightAnchor.current.set(...signal.anchor)
      lightNormal.current.set(...signal.normal).normalize()
      surfaceLight.current.position.copy(lightAnchor.current.addScaledVector(lightNormal.current, 1.25))
      surfaceLight.current.intensity = morph * 12
    }
  })

  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[2.72, 2.62, 1.57]} />
        <meshBasicMaterial ref={silhouetteMaterial} color="#79cabe" transparent opacity={0} depthWrite={false} wireframe />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[2.5, 1.75, 1.35]} />
        <meshStandardMaterial
          ref={wallMaterial}
          map={surfaceTexture}
          emissiveMap={surfaceTexture}
          color={dimmed ? '#252a29' : '#87867e'}
          roughness={0.92}
          metalness={0.08}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -0.12, 0.691]}>
        <planeGeometry args={[2.48, 1.73]} />
        <meshBasicMaterial ref={surfaceProjectionMaterial} map={surfaceTexture} color="#71aaa1" transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.12, 0]} scale={1.008}>
        <boxGeometry args={[2.5, 1.75, 1.35]} />
        <meshBasicMaterial ref={wallSignalMaterial} color="#4faaa0" transparent opacity={0} depthWrite={false} wireframe />
      </mesh>
      <mesh position={[0, 1.05, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.72, 0.92, 4]} />
        <meshStandardMaterial
          ref={roofMaterial}
          map={surfaceTexture}
          emissiveMap={surfaceTexture}
          color={dimmed ? '#1a1e1d' : '#4a4b47'}
          roughness={0.95}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 1.05, 0]} rotation={[0, Math.PI / 4, 0]} scale={1.008}>
        <coneGeometry args={[1.72, 0.92, 4]} />
        <meshBasicMaterial ref={roofSignalMaterial} color="#6da6a0" transparent opacity={0} depthWrite={false} wireframe />
      </mesh>
      <mesh position={[0, -0.53, 0.69]}>
        <planeGeometry args={[0.35, 0.85]} />
        <meshStandardMaterial color="#151818" roughness={0.9} transparent opacity={0} depthWrite={false} />
      </mesh>
      {windowPositions.map((position, index) => (
        <mesh key={index} position={position}>
          <planeGeometry args={[0.26, 0.28]} />
          <meshStandardMaterial
            color={index === 6 ? '#f2a24d' : '#192425'}
            emissive={index === 6 ? '#d26c26' : '#071010'}
            emissiveIntensity={index === 6 ? 2.1 : 0.6}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
      <ObservationSignals />
      <Suspense fallback={null}>
        <ObservationLayer />
      </Suspense>
      <pointLight ref={surfaceLight} color="#8ad8ca" intensity={0} distance={4.5} decay={1.6} />
    </group>
  )
}
