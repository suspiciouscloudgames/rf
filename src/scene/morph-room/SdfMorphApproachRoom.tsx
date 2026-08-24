import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { MathUtils, Vector3, type Mesh } from 'three'
import { useExperienceStore } from '../../store/experienceStore'
import { useTuningStore } from '../../store/tuningStore'
import { SdfMorphMaterial } from './SdfMorphMaterial'

interface SdfFeaturePose {
  position: [number, number, number]
  rotationY: number
}

const sdfFeaturePresets: SdfFeaturePose[][] = [
  [
    { position: [-0.58, -1.04, 0.06], rotationY: 0 },
    { position: [1.02, -1.04, 0.48], rotationY: 0 },
    { position: [1.22, -1.04, -0.48], rotationY: 0 },
    { position: [0, 0.42, -1.13], rotationY: 0 },
  ],
  [
    { position: [0.36, -1.04, 0.24], rotationY: 0.32 },
    { position: [-1.16, -1.04, 0.30], rotationY: -0.28 },
    { position: [-1.12, -1.04, -0.54], rotationY: 0.16 },
    { position: [0.24, 0.34, -1.13], rotationY: 0 },
  ],
  [
    { position: [-0.74, -1.04, 0.42], rotationY: -0.24 },
    { position: [0.50, -1.04, -0.18], rotationY: 0.42 },
    { position: [1.18, -1.04, 0.20], rotationY: -0.14 },
    { position: [-0.22, 0.50, -1.13], rotationY: 0 },
  ],
]

// Finish the physical retraction before the Approach → Observation transition
// ends, leaving the room surface visible briefly after its features submerge.
const observationEntryRetractPortion = 0.72

export function SdfMorphApproachRoom() {
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const proxy = useRef<Mesh>(null)
  const cameraLocal = useRef(new Vector3())
  const rippleLocal = useRef(new Vector3())
  const rippleStartedAt = useRef(-100)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const reducedMotion = useRef(false)
  const currentPreset = useRef(0)
  const morphAnimation = useRef<{ from: number; to: number; startedAt: number } | null>(null)
  const material = useMemo(() => new SdfMorphMaterial(), [])
  const canvas = useThree((state) => state.gl.domElement)

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotionPreference = () => { reducedMotion.current = motionQuery.matches }
    syncMotionPreference()
    motionQuery.addEventListener('change', syncMotionPreference)
    return () => {
      motionQuery.removeEventListener('change', syncMotionPreference)
      material.dispose()
      delete canvas.dataset.sdfMorphVersion
      delete canvas.dataset.sdfMorphVisibility
      delete canvas.dataset.sdfMorphTopology
      delete canvas.dataset.sdfMorphFeatureCount
      delete canvas.dataset.sdfMorphWaverAmount
      delete canvas.dataset.sdfMorphRippleAge
      delete canvas.dataset.sdfMorphState
      delete canvas.dataset.sdfMorphPreset
      delete canvas.dataset.sdfMorphActivation
    }
  }, [canvas, material])

  useFrame(({ camera, clock, gl }) => {
    if (!proxy.current) return
    const transitionProgress = Number(camera.userData.transitionProgress ?? 0)
    const reveal = transition === 'hubToApproach'
      ? transitionProgress
      : transition === 'returnToHub'
        ? 1 - transitionProgress
      : transition === 'returnToApproach'
        ? transitionProgress
      : stage === 'approach'
        ? transition === 'approachToObservation' ? 1 - transitionProgress : 1
        : 0
    proxy.current.visible = reveal > 0.002
    proxy.current.worldToLocal(cameraLocal.current.copy(camera.position))
    const tuning = useTuningStore.getState()
    const now = performance.now() / 1000
    const animation = morphAnimation.current
    const featurePositions = material.uniforms.uFeaturePositions.value as Vector3[]
    const featureActivations = material.uniforms.uFeatureActivation.value as number[]
    const featureRotations = material.uniforms.uFeatureRotation.value as number[]
    let morphState = 'stable'
    let morphActivation = 1
    const observationEntryActive = transition === 'approachToObservation'
    if (observationEntryActive) {
      // Observation Entry always takes precedence over an in-progress touch
      // morph so the clicked transition starts retracting on its first frame.
      morphAnimation.current = null
      morphActivation = 1 - MathUtils.smoothstep(
        transitionProgress,
        0,
        observationEntryRetractPortion,
      )
      morphState = morphActivation > 0.001 ? 'observation-retracting' : 'submerged'
      sdfFeaturePresets[currentPreset.current].forEach((pose, index) => {
        featurePositions[index].set(...pose.position)
        featureActivations[index] = morphActivation
        featureRotations[index] = pose.rotationY
      })
    } else if (animation) {
      const elapsed = now - animation.startedAt
      const retractSeconds = 1
      const holdSeconds = 0.2
      const emergeSeconds = 1.4
      if (elapsed < retractSeconds) {
        morphState = 'retracting'
        morphActivation = 1 - MathUtils.smoothstep(elapsed / retractSeconds, 0, 1)
      } else if (elapsed < retractSeconds + holdSeconds) {
        morphState = 'submerged'
        morphActivation = 0
      } else {
        morphState = 'emerging'
        morphActivation = MathUtils.smoothstep(
          (elapsed - retractSeconds - holdSeconds) / emergeSeconds,
          0,
          1,
        )
      }
      const activePreset = elapsed < retractSeconds ? animation.from : animation.to
      sdfFeaturePresets[activePreset].forEach((pose, index) => {
        featurePositions[index].set(...pose.position)
        featureActivations[index] = morphActivation
        featureRotations[index] = pose.rotationY
      })
      if (elapsed >= retractSeconds + holdSeconds + emergeSeconds) {
        currentPreset.current = animation.to
        morphAnimation.current = null
        morphState = 'stable'
        morphActivation = 1
      }
    } else {
      // Restore a fully emerged stable preset when Morph Room is entered again
      // after a completed Observation/return cycle.
      sdfFeaturePresets[currentPreset.current].forEach((pose, index) => {
        featurePositions[index].set(...pose.position)
        featureActivations[index] = 1
        featureRotations[index] = pose.rotationY
      })
    }
    material.uniforms.uCameraLocal.value.copy(cameraLocal.current)
    material.uniforms.uBaseColor.value.set(tuning.morphBaseColor)
    material.uniforms.uHighlightColor.value.set(tuning.morphHighlightColor)
    material.uniforms.uShadowColor.value.set(tuning.morphShadowColor)
    material.uniforms.uMonochromeMix.value = tuning.morphMonochromeMix
    material.uniforms.uRoomOpacity.value = tuning.morphRoomOpacity
    material.uniforms.uPropOpacity.value = tuning.morphPropOpacity
    material.uniforms.uReveal.value = reveal
    material.uniforms.uTime.value = clock.elapsedTime
    material.uniforms.uFilmGrain.value = tuning.morphFilmGrain * 0.35
    const temporalFilmEnabled = tuning.morphTemporalFlickerEnabled && !reducedMotion.current
    material.uniforms.uFilmFlicker.value = temporalFilmEnabled ? tuning.morphFilmFlicker : 0
    material.uniforms.uFilmTemporalEnabled.value = temporalFilmEnabled ? 1 : 0
    material.uniforms.uWaverAmount.value = reducedMotion.current ? 0 : tuning.morphWaverAmount
    material.uniforms.uWaverScale.value = tuning.morphWaverScale
    material.uniforms.uWaverSpeed.value = reducedMotion.current ? 0 : tuning.morphWaverSpeed
    material.uniforms.uRippleAmount.value = reducedMotion.current ? 0 : tuning.morphRippleAmount
    material.uniforms.uRippleRadius.value = tuning.morphRippleRadius
    const rippleAge = performance.now() / 1000 - rippleStartedAt.current
    material.uniforms.uRippleAge.value = rippleAge
    material.uniforms.uRippleOrigin.value.set(rippleLocal.current.x, rippleLocal.current.z)
    gl.domElement.dataset.sdfMorphVersion = '2'
    gl.domElement.dataset.sdfMorphVisibility = reveal.toFixed(3)
    gl.domElement.dataset.sdfMorphTopology = 'single-field'
    gl.domElement.dataset.sdfMorphFeatureCount = '4'
    gl.domElement.dataset.sdfMorphWaverAmount = (reducedMotion.current ? 0 : tuning.morphWaverAmount).toFixed(3)
    gl.domElement.dataset.sdfMorphRippleAge = rippleAge.toFixed(3)
    gl.domElement.dataset.sdfMorphState = morphState
    gl.domElement.dataset.sdfMorphPreset = String(currentPreset.current + 1)
    gl.domElement.dataset.sdfMorphActivation = morphActivation.toFixed(3)
  })

  const beginPointer = (event: ThreeEvent<PointerEvent>) => {
    pointerStart.current = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY }
  }

  const finishPointer = (event: ThreeEvent<PointerEvent>) => {
    const start = pointerStart.current
    pointerStart.current = null
    if (!start || !proxy.current || stage !== 'approach' || transition !== 'none' || morphAnimation.current) return
    const distance = Math.hypot(event.nativeEvent.clientX - start.x, event.nativeEvent.clientY - start.y)
    if (distance > 8) return
    proxy.current.worldToLocal(rippleLocal.current.copy(event.point))
    rippleStartedAt.current = performance.now() / 1000
    morphAnimation.current = {
      from: currentPreset.current,
      to: (currentPreset.current + 1) % sdfFeaturePresets.length,
      startedAt: performance.now() / 1000,
    }
  }

  return (
    <mesh
      ref={proxy}
      name="sdf-morph-approach-room"
      visible={false}
      renderOrder={1}
      onPointerDown={beginPointer}
      onPointerUp={finishPointer}
      onPointerCancel={() => { pointerStart.current = null }}
    >
      <boxGeometry args={[3.72, 2.52, 2.68]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
