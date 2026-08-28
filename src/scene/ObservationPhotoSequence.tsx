import { useEffect, useRef, useState } from 'react'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import {
  ClampToEdgeWrapping,
  Color,
  DoubleSide,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
} from 'three'
import { assetUrl } from '../lib/assetUrl'
import { useExperienceStore, type SignalId } from '../store/experienceStore'

type PhotoPlacement = {
  file: string
  x: number
  y: number
  z: number
  width: number
  tilt: number
  yaw: number
  appear: number
  fade?: number
  travel: number
}

const ENTRY_SHARE = 0.14
const PHOTO_DISPLAY_SCALE = 0.7

const photoSequences: Record<SignalId, PhotoPlacement[]> = {
  'signal-01': [
    { file: '01-1.jpg', x: -0.18, y: 0.02, z: -2.15, width: 1.48, tilt: -0.035, yaw: 0.04, appear: 0.04, fade: 0.66, travel: 1.82 },
    { file: '01-2.jpg', x: 0.16, y: -0.01, z: -3.55, width: 1.62, tilt: 0.025, yaw: -0.035, appear: 0.34, travel: 2.05 },
  ],
  'signal-02': [
    { file: '02-1.jpg', x: -0.42, y: 0.05, z: -2.82, width: 1.54, tilt: -0.055, yaw: 0.2, appear: 0.08, travel: 1.15 },
    { file: '02-2.jpg', x: 0.46, y: -0.04, z: -3.12, width: 1.72, tilt: 0.035, yaw: -0.18, appear: 0.22, travel: 1.42 },
  ],
  'signal-03': [
    {
      file: '03-1.jpg',
      x: -0.34,
      y: 0.14,
      z: -2.5,
      width: 1.38,
      tilt: -0.075,
      yaw: 0.16,
      appear: 0.07,
      fade: 0.65,
      travel: 1.24,
    },
    {
      file: '03-2.jpeg',
      x: 0.3,
      y: -0.11,
      z: -3.42,
      width: 1.5,
      tilt: 0.05,
      yaw: -0.13,
      appear: 0.3,
      travel: 1.75,
    },
  ],
  'signal-04': [
    {
      file: '04-1.jpg',
      x: 0.38,
      y: 0.17,
      z: -2.62,
      width: 1.22,
      tilt: 0.06,
      yaw: -0.22,
      appear: 0.06,
      fade: 0.69,
      travel: 1.2,
    },
    {
      file: '04-2.jpg',
      x: -0.36,
      y: -0.12,
      z: -3.48,
      width: 1.3,
      tilt: -0.045,
      yaw: 0.18,
      appear: 0.28,
      travel: 1.8,
    },
  ],
  'signal-05': [
    { file: '05-1.jpg', x: -0.28, y: 0.08, z: -2.84, width: 1.3, tilt: -0.03, yaw: 0.12, appear: 0.06, travel: 1.18 },
    { file: '05-2.jpg', x: 0.32, y: -0.08, z: -3.38, width: 1.34, tilt: 0.045, yaw: -0.1, appear: 0.28, travel: 1.62 },
  ],
}

const smoothRange = (value: number, start: number, end: number) => (
  MathUtils.smoothstep(value, start, Math.max(end, start + 0.001))
)

function PhotoCard({ placement, index }: { placement: PhotoPlacement; index: number }) {
  const [texture, setTexture] = useState<Texture | null>(null)
  const mesh = useRef<Mesh>(null)
  const material = useRef<MeshBasicMaterial>(null)
  const image = texture?.image as { width?: number; height?: number } | undefined
  const aspect = Math.max((image?.width ?? 1) / Math.max(image?.height ?? 1, 1), 0.35)

  useEffect(() => {
    let alive = true
    const loader = new TextureLoader()
    loader.load(
      assetUrl(`assets/observation-photos/${placement.file}`),
      (loadedTexture) => {
        loadedTexture.colorSpace = SRGBColorSpace
        loadedTexture.wrapS = ClampToEdgeWrapping
        loadedTexture.wrapT = ClampToEdgeWrapping
        loadedTexture.needsUpdate = true
        if (alive) setTexture(loadedTexture)
        else loadedTexture.dispose()
      },
    )
    return () => {
      alive = false
    }
  }, [placement.file])

  useFrame(({ camera, clock }) => {
    if (!mesh.current || !material.current) return
    const transitionProgress = Number(camera.userData.transitionProgress ?? 0)
    const stage = useExperienceStore.getState().stage
    const transition = useExperienceStore.getState().transition
    const active = transition === 'approachToObservation' || stage === 'observation'
    const observationProgress = Number(camera.userData.photoDollyProgress ?? 0)
    const progress = stage === 'observation' && transition === 'none'
      ? ENTRY_SHARE + observationProgress * (1 - ENTRY_SHARE)
      : transitionProgress * ENTRY_SHARE
    const entrance = smoothRange(progress, placement.appear, placement.appear + 0.24)
    const exit = placement.fade == null
      ? 1
      : 1 - smoothRange(progress, placement.fade, Math.min(placement.fade + 0.2, 1))
    const opacity = active ? entrance * exit * (stage === 'observation' ? 0.76 : 0.8) : 0
    mesh.current.visible = opacity > 0.002
    material.current.opacity = opacity
    const drift = Math.sin(clock.elapsedTime * 0.42 + index * 2.1) * 0.012
    mesh.current.position.set(
      placement.x + drift,
      placement.y + Math.cos(clock.elapsedTime * 0.36 + index) * 0.008,
      placement.z + smoothRange(progress, placement.appear, 1) * placement.travel,
    )
    mesh.current.rotation.set(placement.tilt, placement.yaw, placement.tilt * -0.35)
  })

  if (!texture) return null

  return (
    <mesh ref={mesh} visible={false} renderOrder={34}>
      <planeGeometry
        args={[
          placement.width * PHOTO_DISPLAY_SCALE,
          (placement.width / aspect) * PHOTO_DISPLAY_SCALE,
        ]}
      />
      <meshBasicMaterial
        ref={material}
        map={texture}
        color={new Color('#839b91')}
        transparent
        opacity={0}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
        side={DoubleSide}
      />
    </mesh>
  )
}

export function ObservationPhotoSequence() {
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)
  const scene = useThree((state) => state.scene)
  const rig = useRef<Group>(null)
  const sequence = selectedSignalId ? photoSequences[selectedSignalId] : null

  useFrame(({ camera }) => {
    if (!rig.current) return
    rig.current.position.copy(camera.position)
    rig.current.quaternion.copy(camera.quaternion)
  }, -1)

  if (!sequence) return null

  return createPortal(
    <group ref={rig} name="observation-photo-sequence">
      {sequence.map((placement, index) => (
        <PhotoCard key={placement.file} placement={placement} index={index} />
      ))}
    </group>,
    scene,
  )
}
