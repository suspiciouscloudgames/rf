import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { MathUtils, Vector2, Vector3, type Mesh } from 'three'
import { useExperienceStore } from '../../store/experienceStore'
import { useTuningStore } from '../../store/tuningStore'
import { useMorphStabilityExperimentStore } from '../../store/morphStabilityExperimentStore'
import { PlanMorphMaterial } from './PlanMorphMaterial'
import { useMorphNightOpticsStore } from '../../store/morphNightOpticsStore'

const observationEntryRetractPortion = 0.94
const observationResidueReveal = 0.18

export function PlanMorphApproachRoom() {
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const proxy = useRef<Mesh>(null)
  const cameraLocal = useRef(new Vector3())
  const rippleLocal = useRef(new Vector3())
  const nightResolution = useRef(new Vector2())
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
  const nightOpticsVariant = useMorphNightOpticsStore((store) => store.variant)
  const nightLookMix = useMorphNightOpticsStore((store) => store.lookMix)
  const nightExposure = useMorphNightOpticsStore((store) => store.exposure)
  const nightShadowLift = useMorphNightOpticsStore((store) => store.shadowLift)
  const nightLocalGrain = useMorphNightOpticsStore((store) => store.localGrain)
  const nightVignetteStrength = useMorphNightOpticsStore((store) => store.vignetteStrength)
  const nightVignetteSoftness = useMorphNightOpticsStore((store) => store.vignetteSoftness)
  const nightVignetteIrregularity = useMorphNightOpticsStore((store) => store.vignetteIrregularity)
  const nightVignetteOffsetX = useMorphNightOpticsStore((store) => store.vignetteOffsetX)
  const nightVignetteOffsetY = useMorphNightOpticsStore((store) => store.vignetteOffsetY)
  const nightBloomStrength = useMorphNightOpticsStore((store) => store.bloomStrength)
  const nightBloomRadius = useMorphNightOpticsStore((store) => store.bloomRadius)
  const nightBloomCore = useMorphNightOpticsStore((store) => store.bloomCore)
  const nightDebugView = useMorphNightOpticsStore((store) => store.debugView)

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
    canvas.dataset.morphNightOpticsStage = nightOpticsVariant === 'night-film' ? 'n4-opening-halation' : 'current'
    canvas.dataset.morphNightOpticsDebug = nightDebugView

    return () => {
      delete canvas.dataset.morphStabilityVariant
      delete canvas.dataset.morphStabilityStage
      delete canvas.dataset.morphStabilityDebug
      delete canvas.dataset.morphStabilityFreezeRotation
      delete canvas.dataset.morphStabilityRotationAngle
      delete canvas.dataset.morphStabilityFreezeTime
      delete canvas.dataset.morphStabilityShaderTime
      delete canvas.dataset.morphNightOpticsStage
      delete canvas.dataset.morphNightOpticsDebug
    }
  }, [canvas, debugView, freezeRotation, freezeTime, material, nightDebugView, nightOpticsVariant, rotationAngle, shaderTime, stabilityVariant])

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
      delete canvas.dataset.planMorphTreeDetail
      delete canvas.dataset.planMorphFurnitureGroups
      delete canvas.dataset.planMorphFurnitureDetail
      delete canvas.dataset.planMorphFurnitureSink
      delete canvas.dataset.planMorphFurnitureState
    }
  }, [canvas, material])

  useFrame(({ camera, clock, gl }, delta) => {
    if (!proxy.current) return
    const transitionProgress = Number(camera.userData.transitionProgress ?? 0)
    const reveal = transition === 'hubToApproach'
      ? transitionProgress
      : transition === 'returnToHub'
        ? 1 - transitionProgress
      : transition === 'returnToApproach'
        ? MathUtils.lerp(observationResidueReveal, 1, transitionProgress)
      : stage === 'approach'
        ? transition === 'approachToObservation'
          ? MathUtils.lerp(1, observationResidueReveal, MathUtils.smoothstep(transitionProgress, 0.34, 1))
          : 1
        : stage === 'observation'
          ? observationResidueReveal
          : 0
    const observationEntryActive = transition === 'approachToObservation'
    const architectureActivation = observationEntryActive
      ? 1 - MathUtils.smoothstep(transitionProgress, 0, observationEntryRetractPortion)
      : transition === 'hubToApproach'
        ? MathUtils.smoothstep(transitionProgress, 0, 0.82)
      : transition === 'returnToApproach'
          ? MathUtils.smoothstep(transitionProgress, 0, 0.82)
        : stage === 'observation'
          ? 0
          : 1
    const furnitureSinkProgress = observationEntryActive
      ? 1 - MathUtils.smoothstep(transitionProgress, 0.34, 0.92)
      : transition === 'returnToApproach'
        ? MathUtils.smoothstep(transitionProgress, 0.08, 0.82)
        : stage === 'observation'
          ? 0
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
    material.uniforms.uFurnitureSinkProgress.value = furnitureSinkProgress
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
    material.uniforms.uNightLookEnabled.value = nightOpticsVariant === 'night-film' ? 1 : 0
    material.uniforms.uNightLookMix.value = nightLookMix
    material.uniforms.uNightExposure.value = nightExposure
    material.uniforms.uNightShadowLift.value = nightShadowLift
    material.uniforms.uNightLocalGrain.value = nightLocalGrain
    gl.getDrawingBufferSize(nightResolution.current)
    material.uniforms.uNightResolution.value.copy(nightResolution.current)
    material.uniforms.uNightVignetteStrength.value = nightVignetteStrength
    material.uniforms.uNightVignetteSoftness.value = nightVignetteSoftness
    material.uniforms.uNightVignetteIrregularity.value = nightVignetteIrregularity
    material.uniforms.uNightVignetteOffset.value.set(nightVignetteOffsetX, nightVignetteOffsetY)
    material.uniforms.uNightBloomStrength.value = nightBloomStrength
    material.uniforms.uNightBloomRadius.value = nightBloomRadius
    material.uniforms.uNightBloomCore.value = nightBloomCore
    material.uniforms.uNightDebugView.value = nightDebugView === 'bloom-mask'
      ? 1
      : nightDebugView === 'vignette-mask'
        ? 2
        : 0

    gl.domElement.dataset.planMorphVisibility = reveal.toFixed(3)
    gl.domElement.dataset.planMorphActivation = architectureActivation.toFixed(3)
    gl.domElement.dataset.planMorphRotation = proxy.current.rotation.y.toFixed(4)
    gl.domElement.dataset.planMorphTopology = 'l-plan-architecture'
    gl.domElement.dataset.planMorphDimensions = '4.128,2.832,2.640'
    gl.domElement.dataset.planMorphWindowRatio = '0.333'
    gl.domElement.dataset.planMorphTreeConnection = 'detached'
    gl.domElement.dataset.planMorphTreeDetail = 'simple-soft-canopy'
    gl.domElement.dataset.planMorphFurnitureGroups = 'flowerpot,desk-chair,cat-bed,bed,cabinet'
    gl.domElement.dataset.planMorphFurnitureDetail = 'recognizable-sdf-v1'
    gl.domElement.dataset.planMorphFurnitureSink = furnitureSinkProgress.toFixed(3)
    gl.domElement.dataset.planMorphFurnitureState = furnitureSinkProgress >= 0.999
      ? 'concealed'
      : furnitureSinkProgress > 0.001
        ? 'transitioning'
        : 'revealed'
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
