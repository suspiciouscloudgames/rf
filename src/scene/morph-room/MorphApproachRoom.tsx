import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { MathUtils, Vector3, type Group } from 'three'
import { useExperienceStore } from '../../store/experienceStore'
import { useTuningStore } from '../../store/tuningStore'
import { MorphRoomMaterial } from './MorphRoomMaterial'

function RootBridge({ position, scale, rotation = [0, 0, 0] as [number, number, number], material }: {
  position: [number, number, number]
  scale: [number, number, number]
  rotation?: [number, number, number]
  material: MorphRoomMaterial
}) {
  return (
    <mesh position={position} scale={scale} rotation={rotation}>
      <sphereGeometry args={[1, 28, 18]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

interface FixturePose {
  position: [number, number, number]
  root: [number, number, number]
  rotationY: number
}

const fixturePresets: FixturePose[][] = [
  [
    { position: [-0.58, 0, 0.06], root: [-0.58, -0.98, 0.06], rotationY: 0 },
    { position: [1.05, -0.03, 0.5], root: [1.05, -0.98, 0.5], rotationY: 0 },
    { position: [1.28, 0, -0.56], root: [1.28, -0.98, -0.56], rotationY: 0 },
    { position: [0, 0, -1.14], root: [0, 0, -1.18], rotationY: 0 },
  ],
  [
    { position: [0.42, 0, 0.26], root: [0.42, -0.98, 0.26], rotationY: 0.42 },
    { position: [-1.18, -0.03, 0.34], root: [-1.18, -0.98, 0.34], rotationY: -0.3 },
    { position: [-1.12, 0, -0.58], root: [-1.12, -0.98, -0.58], rotationY: 0.2 },
    { position: [0.34, 0.12, -1.14], root: [0.34, 0.12, -1.18], rotationY: 0 },
  ],
  [
    { position: [-1.02, 0, 0.42], root: [-1.02, -0.98, 0.42], rotationY: -0.3 },
    { position: [0.58, -0.03, -0.22], root: [0.58, -0.98, -0.22], rotationY: 0.54 },
    { position: [1.3, 0, 0.28], root: [1.3, -0.98, 0.28], rotationY: -0.18 },
    { position: [-0.34, -0.1, -1.14], root: [-0.34, -0.1, -1.18], rotationY: 0 },
  ],
]

function MorphFixtures({ material, fixtureRefs }: {
  material: MorphRoomMaterial
  fixtureRefs: MutableRefObject<Array<Group | null>>
}) {
  const initialPreset = fixturePresets[0]
  return (
    <>
      <group ref={(node) => { fixtureRefs.current[0] = node }} name="morph-table-cluster" position={initialPreset[0].position}>
        <RootBridge material={material} position={[0, -0.86, 0]} scale={[0.7, 0.24, 0.5]} />
        <mesh position={[0, -0.51, 0]} scale={[0.68, 0.1, 0.46]}>
          <sphereGeometry args={[1, 32, 20]} />
          <primitive object={material} attach="material" />
        </mesh>
        {[-0.86, 0.86].map((x) => (
          <group key={x} position={[x, -0.52, 0]}>
            <RootBridge material={material} position={[0, -0.35, 0]} scale={[0.34, 0.3, 0.34]} />
            <mesh position={[0, 0.08, 0]} scale={[0.36, 0.34, 0.36]}>
              <sphereGeometry args={[1, 24, 16]} />
              <primitive object={material} attach="material" />
            </mesh>
          </group>
        ))}
      </group>

      <group ref={(node) => { fixtureRefs.current[1] = node }} name="morph-phone-monolith" position={initialPreset[1].position}>
        <RootBridge material={material} position={[0, -0.76, 0]} scale={[0.36, 0.3, 0.38]} />
        <mesh position={[0, -0.18, 0]} scale={[0.27, 0.64, 0.18]}>
          <sphereGeometry args={[1, 28, 18]} />
          <primitive object={material} attach="material" />
        </mesh>
        <mesh position={[0, -0.14, 0.17]} scale={[0.16, 0.35, 0.035]}>
          <boxGeometry args={[2, 2, 1, 4, 7, 1]} />
          <primitive object={material} attach="material" />
        </mesh>
      </group>

      <group ref={(node) => { fixtureRefs.current[2] = node }} name="morph-column" position={initialPreset[2].position}>
        <RootBridge material={material} position={[0, -0.82, 0]} scale={[0.48, 0.32, 0.48]} />
        <mesh position={[0, 0.02, 0]} scale={[0.31, 1.05, 0.31]}>
          <sphereGeometry args={[1, 28, 20]} />
          <primitive object={material} attach="material" />
        </mesh>
        <RootBridge material={material} position={[0, 0.68, -0.42]} scale={[0.34, 0.28, 0.62]} rotation={[0.6, 0, 0]} />
      </group>

      <group ref={(node) => { fixtureRefs.current[3] = node }} name="morph-wall-reliefs" position={initialPreset[3].position}>
        {[-1.2, -0.72, -0.24, 0.24, 0.72, 1.2].map((x, index) => (
          <group key={x} position={[x, 0.38 + Math.sin(index) * 0.08, 0]}>
            <RootBridge material={material} position={[0, 0, 0.07]} scale={[0.23, 0.29, 0.12]} />
            <mesh position={[0, 0, 0.15]} scale={[0.17, 0.22, 0.06]}>
              <sphereGeometry args={[1, 20, 14]} />
              <primitive object={material} attach="material" />
            </mesh>
          </group>
        ))}
      </group>
    </>
  )
}

export function MorphApproachRoom() {
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const room = useRef<Group>(null)
  const fixtureRefs = useRef<Array<Group | null>>([])
  const reducedMotion = useRef(false)
  const currentPreset = useRef(0)
  const morphAnimation = useRef<{ from: number; to: number; startedAt: number } | null>(null)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const rippleStartedAt = useRef(-100)
  const rippleOrigin = useRef(new Vector3())
  const tempPosition = useRef(new Vector3())
  const tempTargetPosition = useRef(new Vector3())
  const surfaceMaterial = useMemo(() => new MorphRoomMaterial(0.2), [])
  const propMaterial = useMemo(() => new MorphRoomMaterial(0.66), [])

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => { reducedMotion.current = motionQuery.matches }
    updateMotionPreference()
    motionQuery.addEventListener('change', updateMotionPreference)
    return () => {
      motionQuery.removeEventListener('change', updateMotionPreference)
      surfaceMaterial.dispose()
      propMaterial.dispose()
    }
  }, [propMaterial, surfaceMaterial])

  useFrame(({ camera, clock, gl }) => {
    if (!room.current) return
    const transitionProgress = Number(camera.userData.transitionProgress ?? 0)
    const reveal = transition === 'hubToApproach'
      ? transitionProgress
      : stage === 'approach'
        ? transition === 'approachToObservation' ? 1 - transitionProgress : 1
        : 0
    room.current.visible = reveal > 0.002
    room.current.scale.setScalar(MathUtils.lerp(0.96, 1, reveal))
    const tuning = useTuningStore.getState()
    const now = performance.now() / 1000
    const animation = morphAnimation.current
    let morphState = 'stable'
    if (animation) {
      const elapsed = now - animation.startedAt
      const retractSeconds = 1
      const holdSeconds = 0.2
      const emergeSeconds = 1.4
      fixtureRefs.current.forEach((fixture, index) => {
        if (!fixture) return
        const fromPose = fixturePresets[animation.from][index]
        const toPose = fixturePresets[animation.to][index]
        if (elapsed < retractSeconds) {
          morphState = 'retracting'
          const progress = MathUtils.smoothstep(elapsed / retractSeconds, 0, 1)
          fixture.position.lerpVectors(
            tempPosition.current.set(...fromPose.position),
            tempTargetPosition.current.set(...fromPose.root),
            progress,
          )
          fixture.scale.setScalar(MathUtils.lerp(1, 0.04, progress))
          fixture.rotation.y = MathUtils.lerp(fromPose.rotationY, toPose.rotationY, progress * 0.2)
        } else if (elapsed < retractSeconds + holdSeconds) {
          morphState = 'submerged'
          fixture.position.set(...toPose.root)
          fixture.scale.setScalar(0.04)
          fixture.rotation.y = toPose.rotationY
        } else {
          const progress = MathUtils.smoothstep((elapsed - retractSeconds - holdSeconds) / emergeSeconds, 0, 1)
          morphState = 'emerging'
          fixture.position.lerpVectors(
            tempPosition.current.set(...toPose.root),
            tempTargetPosition.current.set(...toPose.position),
            progress,
          )
          fixture.scale.setScalar(MathUtils.lerp(0.04, 1, progress))
          fixture.rotation.y = toPose.rotationY
          if (progress >= 1) {
            currentPreset.current = animation.to
            morphAnimation.current = null
            morphState = 'stable'
          }
        }
      })
    }
    const rippleAge = now - rippleStartedAt.current
    ;[surfaceMaterial, propMaterial].forEach((material) => {
      material.uniforms.uReveal.value = reveal
      material.uniforms.uBaseColor.value.set(tuning.morphBaseColor)
      material.uniforms.uHighlightColor.value.set(tuning.morphHighlightColor)
      material.uniforms.uShadowColor.value.set(tuning.morphShadowColor)
      material.uniforms.uMonochromeMix.value = tuning.morphMonochromeMix
      material.uniforms.uTime.value = clock.elapsedTime
      material.uniforms.uWaverAmount.value = reducedMotion.current ? 0 : tuning.morphWaverAmount
      material.uniforms.uWaverScale.value = tuning.morphWaverScale
      material.uniforms.uWaverSpeed.value = reducedMotion.current ? 0 : tuning.morphWaverSpeed
      material.uniforms.uRippleAmount.value = tuning.morphRippleAmount
      material.uniforms.uRippleRadius.value = tuning.morphRippleRadius
      material.uniforms.uRippleAge.value = rippleAge
      material.uniforms.uRippleOrigin.value.set(rippleOrigin.current.x, rippleOrigin.current.z)
      material.uniforms.uFilmFlicker.value = reducedMotion.current ? 0 : tuning.morphFilmFlicker
      material.uniforms.uFilmGrain.value = tuning.morphFilmGrain
    })
    surfaceMaterial.uniforms.uOpacity.value = tuning.morphRoomOpacity
    propMaterial.uniforms.uOpacity.value = tuning.morphPropOpacity
    gl.domElement.dataset.morphRoomVisibility = reveal.toFixed(3)
    gl.domElement.dataset.morphWaverAmount = (reducedMotion.current ? 0 : tuning.morphWaverAmount).toFixed(3)
    gl.domElement.dataset.morphWaverSpeed = (reducedMotion.current ? 0 : tuning.morphWaverSpeed).toFixed(3)
    gl.domElement.dataset.morphFilmFlicker = (reducedMotion.current ? 0 : tuning.morphFilmFlicker).toFixed(3)
    gl.domElement.dataset.morphFilmGrain = tuning.morphFilmGrain.toFixed(3)
    gl.domElement.dataset.morphPreset = String(currentPreset.current + 1)
    gl.domElement.dataset.morphState = morphState
  })

  const beginPointer = (event: ThreeEvent<PointerEvent>) => {
    pointerStart.current = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY }
  }

  const finishPointer = (event: ThreeEvent<PointerEvent>) => {
    const start = pointerStart.current
    pointerStart.current = null
    if (!start || stage !== 'approach' || transition !== 'none' || morphAnimation.current) return
    const distance = Math.hypot(event.nativeEvent.clientX - start.x, event.nativeEvent.clientY - start.y)
    if (distance > 8) return
    const nextPreset = (currentPreset.current + 1) % fixturePresets.length
    morphAnimation.current = {
      from: currentPreset.current,
      to: nextPreset,
      startedAt: performance.now() / 1000,
    }
    rippleOrigin.current.copy(event.point)
    rippleStartedAt.current = performance.now() / 1000
  }

  return (
    <group
      ref={room}
      name="morph-approach-room"
      visible={false}
      onPointerDown={beginPointer}
      onPointerUp={finishPointer}
      onPointerCancel={() => { pointerStart.current = null }}
    >
      <mesh position={[0, -1.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.5, 2.45, 36, 24]} />
        <primitive object={surfaceMaterial} attach="material" />
      </mesh>
      <mesh position={[0, 0.08, -1.18]}>
        <planeGeometry args={[3.5, 2.28, 36, 24]} />
        <primitive object={surfaceMaterial} attach="material" />
      </mesh>
      <mesh position={[-1.74, 0.08, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.38, 2.28, 24, 24]} />
        <primitive object={surfaceMaterial} attach="material" />
      </mesh>
      <mesh position={[1.74, 0.08, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.38, 2.28, 24, 24]} />
        <primitive object={surfaceMaterial} attach="material" />
      </mesh>
      <MorphFixtures material={propMaterial} fixtureRefs={fixtureRefs} />
      <ambientLight intensity={0.7} color="#d9d8d2" />
      <pointLight position={[-0.2, 1.25, 0.8]} intensity={3.2} distance={5} color="#f1efe7" />
    </group>
  )
}
