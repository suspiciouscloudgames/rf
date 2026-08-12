import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import {
  AdditiveBlending,
  DoubleSide,
  LinearFilter,
  Quaternion,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  VideoTexture,
  type Group,
  type MeshBasicMaterial,
  type PointsMaterial,
} from 'three'
import { useExperienceStore } from '../store/experienceStore'
import { getSignalConfig } from '../signals/signalData'

const forward = new Vector3(0, 0, 1)

export function ObservationLayer() {
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)
  const effectActive = useExperienceStore((store) => store.effectActive)
  const group = useRef<Group>(null)
  const fieldMaterial = useRef<MeshBasicMaterial>(null)
  const imageMaterial = useRef<MeshBasicMaterial>(null)
  const videoMaterial = useRef<MeshBasicMaterial>(null)
  const particleMaterial = useRef<PointsMaterial>(null)
  const signal = getSignalConfig(selectedSignalId)
  const normal = useMemo(() => new Vector3(...signal.normal).normalize(), [signal.normal])
  const orientation = useMemo(() => new Quaternion().setFromUnitVectors(forward, normal), [normal])
  const localPosition = useMemo(
    () => new Vector3(...signal.anchor).addScaledVector(normal, -2.05),
    [normal, signal.anchor],
  )
  const imageTexture = useLoader(TextureLoader, '/assets/observation-signal.jpg')
  const particlePositions = useMemo(() => {
    const values = new Float32Array(260 * 3)
    let seed = 4721
    const random = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
    for (let index = 0; index < values.length; index += 3) {
      values[index] = (random() - 0.5) * 5.5
      values[index + 1] = (random() - 0.5) * 3.6
      values[index + 2] = -random() * 5
    }
    return values
  }, [])
  const video = useMemo(() => {
    const element = document.createElement('video')
    element.src = '/assets/archive-signal.mp4'
    element.loop = true
    element.muted = true
    element.playsInline = true
    element.preload = 'auto'
    element.className = 'media-source'
    element.setAttribute('aria-hidden', 'true')
    return element
  }, [])
  const videoTexture = useMemo(() => {
    const texture = new VideoTexture(video)
    texture.colorSpace = SRGBColorSpace
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
    return texture
  }, [video])

  imageTexture.colorSpace = SRGBColorSpace

  useEffect(() => {
    document.body.appendChild(video)
    return () => video.remove()
  }, [video])

  useEffect(() => {
    if (stage === 'observation' && transition === 'none') void video.play().catch(() => undefined)
    else {
      video.pause()
      video.currentTime = 0
    }
  }, [stage, transition, video])

  useEffect(() => () => {
    video.pause()
    videoTexture.dispose()
  }, [video, videoTexture])

  useFrame(({ clock, camera }, delta) => {
    if (!group.current) return
    const progress = Number(camera.userData.transitionProgress ?? 0)
    const morph = transition === 'approachToObservation'
      ? progress
      : stage === 'observation'
        ? transition === 'returnToHub' ? 1 - progress : 1
        : 0
    group.current.visible = morph > 0.01
    group.current.scale.setScalar(0.35 + morph * 0.65)
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.28) * 0.018
    group.current.position.x = localPosition.x + (effectActive ? Math.sin(clock.elapsedTime * 17) * 0.025 : 0)
    if (fieldMaterial.current) fieldMaterial.current.opacity = morph * 0.74
    if (imageMaterial.current) imageMaterial.current.opacity = morph * (effectActive ? 0.7 : 0.38)
    if (videoMaterial.current) videoMaterial.current.opacity = morph * 0.82
    if (particleMaterial.current) particleMaterial.current.opacity = morph * 0.75
    group.current.children[3]?.rotation.set(0, 0, clock.elapsedTime * 0.015)
    group.current.position.z = localPosition.z
    group.current.position.y = localPosition.y
    group.current.quaternion.slerp(orientation, Math.min(delta * 8, 1))
  })

  return (
    <group ref={group} position={localPosition} quaternion={orientation} visible={false}>
      <mesh position={[0, 0, -1.9]}>
        <planeGeometry args={[7, 4.6]} />
        <meshBasicMaterial ref={fieldMaterial} color="#090d1a" transparent opacity={0} side={DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[-0.9, 0.35, -0.95]} rotation={[0, 0.08, -0.035]}>
        <planeGeometry args={[2.25, 1.55]} />
        <meshBasicMaterial ref={imageMaterial} map={imageTexture} transparent opacity={0} side={DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0.85, -0.25, -0.52]} rotation={[0, -0.06, 0.028]}>
        <planeGeometry args={[1.65, 0.93]} />
        <meshBasicMaterial ref={videoMaterial} map={videoTexture} transparent opacity={0} side={DoubleSide} depthWrite={false} />
      </mesh>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={particleMaterial}
          size={0.035}
          color={signal.accent}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <mesh position={[0.45, -0.55, -0.05]}>
        <icosahedronGeometry args={[0.24, 2]} />
        <meshStandardMaterial color="#ef3f2d" emissive="#b41e18" emissiveIntensity={2.8} wireframe />
      </mesh>
      <pointLight position={[0, 0, 0.4]} color={signal.accent} intensity={6} distance={4.5} />
    </group>
  )
}
