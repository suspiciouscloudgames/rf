import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Material, MathUtils, Vector3, type Group, type PointLight } from 'three'
import { useExperienceStore, type SignalId } from '../store/experienceStore'
import { getSignalConfig, hasDepthPortal } from '../signals/signalData'
import { resolvePortalDarkness } from './depth-portal/depthPortalProgress'
import { useTuningStore } from '../store/tuningStore'
import { useRoomVisualModeStore } from '../store/roomVisualModeStore'

const framePositions = [-1.2, -0.72, -0.24, 0.24, 0.72, 1.2]
const frameColors = ['#9c684e', '#687b78', '#b69a69', '#704f48', '#607b85', '#a77955']

const materialProps = (baseOpacity = 1) => ({
  transparent: true,
  opacity: 0,
  depthWrite: false,
  userData: { baseOpacity },
})

export function ObservationLayer() {
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)
  const sequenceProgress = useExperienceStore((store) => store.sequenceProgress)
  const approachToObservationSeconds = useTuningStore((store) => store.approachToObservationSeconds)
  const darkenSeconds = useTuningStore((store) => store.darkenSeconds)
  const roomVisualMode = useRoomVisualModeStore((store) => store.mode)
  const room = useRef<Group>(null)
  const focusGroups = useRef<Partial<Record<SignalId, Group | null>>>({})
  const interiorMaterials = useRef<Material[]>([])
  const focusLight = useRef<PointLight>(null)
  const roomLight = useRef<PointLight>(null)
  const focusPosition = useRef(new Vector3())
  const color = useRef(new Color())

  useEffect(() => {
    if (!room.current) return
    const materials: Material[] = []
    room.current.traverse((object) => {
      if (!('material' in object)) return
      const objectMaterial = object.material as Material | Material[]
      if (Array.isArray(objectMaterial)) materials.push(...objectMaterial)
      else materials.push(objectMaterial)
    })
    interiorMaterials.current = materials
  }, [])

  useFrame(({ camera, clock, gl }, delta) => {
    if (!room.current) return
    const progress = Number(camera.userData.transitionProgress ?? 0)
    const observationElapsed = Number(camera.userData.observationElapsed ?? 0)
    const darkness = hasDepthPortal(selectedSignalId)
      ? resolvePortalDarkness(
        stage,
        transition,
        progress,
        observationElapsed,
        approachToObservationSeconds,
        darkenSeconds,
      )
      : 0
    const reveal = transition === 'returnToHub'
      ? (stage === 'observation' ? 1 : 0.58) * (1 - progress)
      : transition === 'hubToApproach'
      ? progress * 0.58
      : stage === 'approach'
        ? transition === 'approachToObservation' ? 0.58 + progress * 0.42 : 0.58
        : stage === 'observation'
          ? 1
          : 0

    const surroundingVisibility = 1 - darkness
    const classicVisibility = roomVisualMode === 'classic'
      ? 1
      : transition === 'approachToObservation'
        ? progress
        : stage === 'observation'
          ? transition === 'returnToHub' ? 1 - progress : 1
          : 0
    room.current.visible = reveal * surroundingVisibility * classicVisibility > 0.002
    room.current.scale.setScalar(MathUtils.lerp(0.92, 1, reveal))
    interiorMaterials.current.forEach((material) => {
      const baseOpacity = Number(material.userData.baseOpacity ?? 1)
      material.opacity = reveal * baseOpacity * surroundingVisibility * classicVisibility
    })

    Object.entries(focusGroups.current).forEach(([signalId, object]) => {
      if (!object) return
      const selected = signalId === selectedSignalId
      const autoplayPulse = stage === 'observation' && transition === 'none' && selected
        ? Math.sin(clock.elapsedTime * 2.4 + sequenceProgress * Math.PI * 5) * 0.015
        : 0
      const targetScale = selected ? 1.035 + autoplayPulse : 1
      object.scale.lerp(focusPosition.current.setScalar(targetScale), Math.min(delta * 6, 1))
    })

    const signal = getSignalConfig(selectedSignalId)
    if (focusLight.current) {
      focusLight.current.position.set(...signal.focusPosition)
      focusLight.current.intensity = reveal * surroundingVisibility * classicVisibility * (stage === 'observation' ? 4.8 : 2.2)
      focusLight.current.color.copy(color.current.set(signal.accent))
    }
    if (roomLight.current) roomLight.current.intensity = 2.8 * surroundingVisibility * classicVisibility
    gl.domElement.dataset.classicRoomVisibility = classicVisibility.toFixed(3)
    gl.domElement.dataset.interiorReveal = reveal.toFixed(3)
    gl.domElement.dataset.interiorFocus = signal.id
    gl.domElement.dataset.sceneDarkness = darkness.toFixed(3)
  })

  return (
    <group ref={room} name="procedural-house-interior" visible={false}>
      <mesh position={[0, 0.15, -1.18]}>
        <planeGeometry args={[3.45, 2.25]} />
        <meshStandardMaterial color="#232928" roughness={0.94} {...materialProps(0.18)} />
      </mesh>
      <mesh position={[-1.72, 0.15, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.35, 2.25]} />
        <meshStandardMaterial color="#1b2222" roughness={0.96} {...materialProps(0.1)} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[3.48, 2.3, 2.4]} />
        <meshBasicMaterial color="#8aafa9" wireframe {...materialProps(0.12)} />
      </mesh>

      <group
        ref={(node) => { focusGroups.current['signal-01'] = node }}
        name="focus-table-chairs"
        position={[-0.62, 0, 0.02]}
      >
        <mesh position={[0, -0.36, 0]}>
          <boxGeometry args={[1.08, 0.1, 0.68]} />
          <meshStandardMaterial color="#8b6748" roughness={0.75} {...materialProps()} />
        </mesh>
        {[-0.45, 0.45].flatMap((x) => [-0.25, 0.25].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.72, z]}>
            <boxGeometry args={[0.07, 0.67, 0.07]} />
            <meshStandardMaterial color="#59483a" roughness={0.85} {...materialProps()} />
          </mesh>
        )))}
        {[-0.82, 0.82].map((x, index) => (
          <group key={x} position={[x, -0.5, 0]} rotation={[0, index === 0 ? -Math.PI / 2 : Math.PI / 2, 0]}>
            <mesh position={[0, 0.04, 0]}>
              <boxGeometry args={[0.46, 0.08, 0.45]} />
              <meshStandardMaterial color="#596461" roughness={0.84} {...materialProps()} />
            </mesh>
            <mesh position={[0, 0.38, -0.19]}>
              <boxGeometry args={[0.46, 0.62, 0.07]} />
              <meshStandardMaterial color="#65726f" roughness={0.88} {...materialProps()} />
            </mesh>
            {[-0.17, 0.17].flatMap((legX) => [-0.16, 0.16].map((legZ) => (
              <mesh key={`${legX}-${legZ}`} position={[legX, -0.28, legZ]}>
                <boxGeometry args={[0.045, 0.58, 0.045]} />
                <meshStandardMaterial color="#414947" roughness={0.9} {...materialProps()} />
              </mesh>
            )))}
          </group>
        ))}
      </group>

      <group
        ref={(node) => { focusGroups.current['signal-02'] = node }}
        name="focus-smartphone-stand"
        position={[0.92, -0.15, 0.62]}
      >
        <mesh position={[0, -0.75, 0]}>
          <cylinderGeometry args={[0.28, 0.34, 0.08, 24]} />
          <meshStandardMaterial color="#4d5756" metalness={0.65} roughness={0.36} {...materialProps()} />
        </mesh>
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.035, 0.045, 1, 16]} />
          <meshStandardMaterial color="#697473" metalness={0.8} roughness={0.28} {...materialProps()} />
        </mesh>
        <mesh position={[0, 0.25, 0.02]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[0.34, 0.66, 0.055]} />
          <meshStandardMaterial color="#111716" metalness={0.45} roughness={0.28} {...materialProps()} />
        </mesh>
        <mesh position={[0, 0.25, 0.052]} rotation={[-0.08, 0, 0]}>
          <planeGeometry args={[0.29, 0.57]} />
          <meshStandardMaterial color="#5ca497" emissive="#2d716a" emissiveIntensity={2.2} {...materialProps(0.92)} />
        </mesh>
      </group>

      <group
        ref={(node) => { focusGroups.current['signal-03'] = node }}
        name="focus-square-column"
        position={[1.28, 0, -0.48]}
      >
        <mesh>
          <boxGeometry args={[0.42, 2.12, 0.42]} />
          <meshStandardMaterial color="#707773" roughness={0.9} metalness={0.06} {...materialProps()} />
        </mesh>
        <mesh scale={1.018}>
          <boxGeometry args={[0.42, 2.12, 0.42]} />
          <meshBasicMaterial color="#c59561" wireframe {...materialProps(0.38)} />
        </mesh>
      </group>

      {(['signal-04', 'signal-05'] as SignalId[]).map((signalId, groupIndex) => (
        <group
          key={signalId}
          ref={(node) => { focusGroups.current[signalId] = node }}
          name={groupIndex === 0 ? 'focus-left-wall-frames' : 'focus-right-wall-frames'}
        >
          {framePositions.slice(groupIndex * 3, groupIndex * 3 + 3).map((x, localIndex) => {
            const index = groupIndex * 3 + localIndex
            return (
          <group
            key={x}
            name={`wall-frame-${index + 1}`}
            position={[x, 0.42, -1.135]}
          >
            <mesh>
              <boxGeometry args={[0.38, 0.48, 0.045]} />
              <meshStandardMaterial color="#4a4036" roughness={0.8} {...materialProps()} />
            </mesh>
            <mesh position={[0, 0, 0.026]}>
              <planeGeometry args={[0.3, 0.39]} />
              <meshStandardMaterial color={frameColors[index]} emissive={frameColors[index]} emissiveIntensity={0.32} {...materialProps()} />
            </mesh>
            <mesh position={[0, 0, 0.028]} rotation={[0, 0, index % 2 ? -0.45 : 0.45]}>
              <planeGeometry args={[0.018, 0.32]} />
              <meshBasicMaterial color="#d7c29d" {...materialProps(0.7)} />
            </mesh>
          </group>
            )
          })}
        </group>
      ))}

      <pointLight ref={focusLight} intensity={0} distance={3.2} decay={1.7} />
      <pointLight ref={roomLight} position={[-0.35, 0.9, 0.35]} intensity={2.8} distance={4} color="#d5aa72" />
    </group>
  )
}
