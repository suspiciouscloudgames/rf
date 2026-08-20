import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { MathUtils, Vector3, type Mesh } from 'three'
import { useExperienceStore } from '../../store/experienceStore'
import { useTuningStore } from '../../store/tuningStore'
import { useMorphStabilityExperimentStore } from '../../store/morphStabilityExperimentStore'
import { PlanMorphMaterial } from './PlanMorphMaterial'

const observationEntryRetractPortion = 0.72

export function PlanMorphApproachRoom() {
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const proxy = useRef<Mesh>(null)
  const cameraLocal = useRef(new Vector3())
  const rippleLocal = useRef(new Vector3())
  const rippleStartedAt = useRef(-100)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const reducedMotion = useRef(false)
  const material = useMemo(() => new PlanMorphMaterial(), [])
  const canvas = useThree((state) => state.gl.domElement)
  const stabilityVariant = useMorphStabilityExperimentStore((store) => store.variant)
  const freezeRotation = useMorphStabilityExperimentStore((store) => store.freezeRotation)
  const rotationAngle = useMorphStabilityExperimentStore((store) => store.rotationAngle)
  const freezeTime = useMorphStabilityExperimentStore((store) => store.freezeTime)
  const shaderTime = useMorphStabilityExperimentStore((store) => store.shaderTime)
  const debugView = useMorphStabilityExperimentStore((store) => store.debugView)

  useEffect(() => {
    material.uniforms.uStabilityVariant.value = stabilityVariant === 'stabilized' ? 1 : 0
    material.uniforms.uStabilityDebugView.value = debugView === 'edge-candidate'
      ? 1
      : debugView === 'front-wall-risk'
        ? 2
        : 0
    canvas.dataset.morphStabilityVariant = stabilityVariant
    canvas.dataset.morphStabilityStage = stabilityVariant === 'stabilized'
      ? 'b4-bidirectional-cutaway'
      : 'baseline'
    canvas.dataset.morphStabilityDebug = debugView
    canvas.dataset.morphStabilityFreezeRotation = freezeRotation ? 'on' : 'off'
    canvas.dataset.morphStabilityRotationAngle = rotationAngle.toFixed(2)
    canvas.dataset.morphStabilityFreezeTime = freezeTime ? 'on' : 'off'
    canvas.dataset.morphStabilityShaderTime = shaderTime.toFixed(3)

    return () => {
      delete canvas.dataset.morphStabilityVariant
      delete canvas.dataset.morphStabilityStage
      delete canvas.dataset.morphStabilityDebug
      delete canvas.dataset.morphStabilityFreezeRotation
      delete canvas.dataset.morphStabilityRotationAngle
      delete canvas.dataset.morphStabilityFreezeTime
      delete canvas.dataset.morphStabilityShaderTime
    }
  }, [canvas, debugView, freezeRotation, freezeTime, material, rotationAngle, shaderTime, stabilityVariant])

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotionPreference = () => { reducedMotion.current = motionQuery.matches }
    syncMotionPreference()
    motionQuery.addEventListener('change', syncMotionPreference)
    return () => {
      motionQuery.removeEventListener('change', syncMotionPreference)
      material.dispose()
      delete canvas.dataset.planMorphVisibility
      delete canvas.dataset.planMorphActivation
      delete canvas.dataset.planMorphRotation
      delete canvas.dataset.planMorphTopology
      delete canvas.dataset.planMorphDimensions
      delete canvas.dataset.planMorphWindowRatio
      delete canvas.dataset.planMorphTreeConnection
    }
  }, [canvas, material])

  useFrame(({ camera, clock, gl }, delta) => {
    if (!proxy.current) return
    const transitionProgress = Number(camera.userData.transitionProgress ?? 0)
    const reveal = transition === 'hubToApproach'
      ? transitionProgress
      : stage === 'approach'
        ? transition === 'approachToObservation' ? 1 - transitionProgress : 1
        : 0
    const observationEntryActive = transition === 'approachToObservation'
    const architectureActivation = observationEntryActive
      ? 1 - MathUtils.smoothstep(transitionProgress, 0, observationEntryRetractPortion)
      : transition === 'hubToApproach'
        ? MathUtils.smoothstep(transitionProgress, 0, 0.82)
        : 1
    proxy.current.visible = reveal > 0.002

    const tuning = useTuningStore.getState()
    const experiment = useMorphStabilityExperimentStore.getState()
    const rotationActive = transition === 'hubToApproach' || stage === 'approach'
    if (experiment.freezeRotation) {
      proxy.current.rotation.y = MathUtils.degToRad(experiment.rotationAngle)
    } else if (rotationActive && !reducedMotion.current) {
      const radiansPerSecond = Math.PI * 2 / Math.max(tuning.morphRotationPeriod, 1)
      proxy.current.rotation.y += delta * radiansPerSecond
    }

    proxy.current.worldToLocal(cameraLocal.current.copy(camera.position))
    material.uniforms.uCameraLocal.value.copy(cameraLocal.current)
    material.uniforms.uBaseColor.value.set(tuning.morphBaseColor)
    material.uniforms.uHighlightColor.value.set(tuning.morphHighlightColor)
    material.uniforms.uShadowColor.value.set(tuning.morphShadowColor)
    material.uniforms.uMonochromeMix.value = tuning.morphMonochromeMix
    material.uniforms.uRoomOpacity.value = tuning.morphRoomOpacity
    material.uniforms.uPropOpacity.value = tuning.morphPropOpacity
    material.uniforms.uFrontWallOpacity.value = tuning.morphFrontWallOpacity
    material.uniforms.uFrontWallThreshold.value = Math.cos(
      MathUtils.degToRad(tuning.morphFrontWallFadeAngle),
    )
    material.uniforms.uArchitectureActivation.value = architectureActivation
    material.uniforms.uReveal.value = reveal
    material.uniforms.uTime.value = experiment.freezeTime ? experiment.shaderTime : clock.elapsedTime
    material.uniforms.uFilmGrain.value = tuning.morphFilmGrain * 0.35
    const temporalFilmEnabled = tuning.morphTemporalFlickerEnabled && !reducedMotion.current
    material.uniforms.uFilmFlicker.value = temporalFilmEnabled ? tuning.morphFilmFlicker : 0
    material.uniforms.uFilmTemporalEnabled.value = temporalFilmEnabled ? 1 : 0
    material.uniforms.uWaverAmount.value = reducedMotion.current ? 0 : tuning.morphWaverAmount
    material.uniforms.uWaverScale.value = tuning.morphWaverScale
    material.uniforms.uWaverSpeed.value = reducedMotion.current ? 0 : tuning.morphWaverSpeed
    material.uniforms.uRippleAmount.value = reducedMotion.current ? 0 : tuning.morphRippleAmount
    material.uniforms.uRippleRadius.value = tuning.morphRippleRadius
    const rippleAge = experiment.freezeTime
      ? 99
      : performance.now() / 1000 - rippleStartedAt.current
    material.uniforms.uRippleAge.value = rippleAge
    material.uniforms.uRippleOrigin.value.set(rippleLocal.current.x, rippleLocal.current.z)

    gl.domElement.dataset.planMorphVisibility = reveal.toFixed(3)
    gl.domElement.dataset.planMorphActivation = architectureActivation.toFixed(3)
    gl.domElement.dataset.planMorphRotation = proxy.current.rotation.y.toFixed(4)
    gl.domElement.dataset.planMorphTopology = 'l-plan-architecture'
    gl.domElement.dataset.planMorphDimensions = '4.128,2.832,2.640'
    gl.domElement.dataset.planMorphWindowRatio = '0.333'
    gl.domElement.dataset.planMorphTreeConnection = 'detached'
  })

  const beginPointer = (event: ThreeEvent<PointerEvent>) => {
    pointerStart.current = { x: event.nativeEvent.clientX, y: event.nativeEvent.clientY }
  }

  const finishPointer = (event: ThreeEvent<PointerEvent>) => {
    const start = pointerStart.current
    pointerStart.current = null
    if (!start || !proxy.current || stage !== 'approach' || transition !== 'none') return
    const distance = Math.hypot(event.nativeEvent.clientX - start.x, event.nativeEvent.clientY - start.y)
    if (distance > 8) return
    proxy.current.worldToLocal(rippleLocal.current.copy(event.point))
    rippleStartedAt.current = performance.now() / 1000
  }

  return (
    <mesh
      ref={proxy}
      name="plan-morph-approach-room"
      visible={false}
      renderOrder={1}
      onPointerDown={beginPointer}
      onPointerUp={finishPointer}
      onPointerCancel={() => { pointerStart.current = null }}
    >
      <boxGeometry args={[4.8, 3.3, 5.8]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
