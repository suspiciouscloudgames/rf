import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CubicBezierCurve3, MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { cameraPresets } from './cameraPresets'
import { useExperienceStore } from '../store/experienceStore'
import { getSignalConfig } from '../signals/signalData'
import { getHouseRoot } from '../scene/sceneRegistry'
import { smootherStep } from '../sequence/observationTiming'
import { useTuningStore } from '../store/tuningStore'
import { useRoomVisualModeStore } from '../store/roomVisualModeStore'
import { useMorphCameraExperimentStore } from '../store/morphCameraExperimentStore'
import {
  CURRENT_PLAN_MORPH_CAMERA,
  type MorphCameraPreset,
} from './morphCameraPresets'

interface ActiveTransition {
  kind: 'hubToApproach' | 'approachToObservation' | 'returnToHub'
  fromPosition: Vector3
  fromTarget: Vector3
  fromFov: number
  elapsed: number
  duration: number
  curve?: CubicBezierCurve3
  endTarget?: Vector3
  endFov?: number
  targetRotationDelay?: number
}

interface CameraPresetTransition {
  fromPosition: Vector3
  fromTarget: Vector3
  fromFov: number
  toPosition: Vector3
  toTarget: Vector3
  toFov: number
  elapsed: number
  duration: number
}

const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2

const tempAnchor = new Vector3()
const tempNormal = new Vector3()
const tempPosition = new Vector3()
const tempTarget = new Vector3()
const tempFocus = new Vector3()
const tempNearObservationPosition = new Vector3()
const tempFarObservationPosition = new Vector3()
const tempObservationOffset = new Vector3()
const tempApproachLift = new Vector3(0, 0.16, 0)
const tempMorphApproachPosition = new Vector3(4.2, 2.75, 5.15)
const tempMorphApproachTarget = new Vector3(0, -0.08, 0)
const tempPlanMorphApproachPosition = new Vector3(...CURRENT_PLAN_MORPH_CAMERA.position)
const tempPlanMorphApproachTarget = new Vector3(...CURRENT_PLAN_MORPH_CAMERA.target)
const lowPlanMorphCameraPreset: MorphCameraPreset = {
  position: [0, 0, 0],
  target: [0.7, 0, 0.42],
  fov: 36,
}
const lowCameraDirectionX = 3.7 / Math.hypot(3.7, 4.7)
const lowCameraDirectionZ = 4.7 / Math.hypot(3.7, 4.7)

const resolvePlanMorphCameraPreset = () => {
  const experiment = useMorphCameraExperimentStore.getState()
  if (experiment.variant !== 'low') return CURRENT_PLAN_MORPH_CAMERA
  lowPlanMorphCameraPreset.position[0] = lowPlanMorphCameraPreset.target[0] + lowCameraDirectionX * experiment.lowDistance
  lowPlanMorphCameraPreset.position[1] = experiment.lowHeight
  lowPlanMorphCameraPreset.position[2] = lowPlanMorphCameraPreset.target[2] + lowCameraDirectionZ * experiment.lowDistance
  lowPlanMorphCameraPreset.target[1] = experiment.lowTargetHeight
  lowPlanMorphCameraPreset.fov = experiment.lowFov
  return lowPlanMorphCameraPreset
}

const resolvePlanMorphCameraFrame = (preset: MorphCameraPreset) => {
  const house = getHouseRoot()
  tempPlanMorphApproachPosition.set(...preset.position)
  tempPlanMorphApproachTarget.set(...preset.target)
  if (house) {
    house.updateWorldMatrix(true, false)
    tempPlanMorphApproachPosition.applyMatrix4(house.matrixWorld)
    tempPlanMorphApproachTarget.applyMatrix4(house.matrixWorld)
  }
  return {
    position: tempPlanMorphApproachPosition,
    target: tempPlanMorphApproachTarget,
    fov: preset.fov,
  }
}

const writeCameraDataset = (canvas: HTMLCanvasElement, camera: PerspectiveCamera, target: Vector3) => {
  canvas.dataset.cameraPosition = camera.position.toArray().map((value) => value.toFixed(2)).join(',')
  canvas.dataset.cameraTarget = target.toArray().map((value) => value.toFixed(2)).join(',')
  canvas.dataset.cameraFov = camera.fov.toFixed(2)
  canvas.dataset.cameraAspect = camera.aspect.toFixed(4)
}

const resolveSignalFrame = (worldDepth = useTuningStore.getState().worldDepth) => {
  const selectedSignal = getSignalConfig(useExperienceStore.getState().selectedSignalId)
  const house = getHouseRoot()
  tempAnchor.set(...selectedSignal.anchor)
  tempNormal.set(...selectedSignal.normal).normalize()
  tempFocus.set(...selectedSignal.focusPosition)
  tempNearObservationPosition
    .set(...selectedSignal.focusPosition)
    .add(tempObservationOffset.set(...selectedSignal.observationOffset))
  tempFarObservationPosition
    .set(...selectedSignal.focusPosition)
    .add(tempObservationOffset.set(...(selectedSignal.depthPortal?.farObservationOffset ?? selectedSignal.observationOffset)))
  if (selectedSignal.depthPortal) {
    tempFarObservationPosition.z = selectedSignal.focusPosition[2] + worldDepth
  }
  if (house) {
    house.updateWorldMatrix(true, false)
    tempAnchor.applyMatrix4(house.matrixWorld)
    tempNormal.transformDirection(house.matrixWorld)
    tempFocus.applyMatrix4(house.matrixWorld)
    tempNearObservationPosition.applyMatrix4(house.matrixWorld)
    tempFarObservationPosition.applyMatrix4(house.matrixWorld)
  }
  return {
    signal: selectedSignal,
    anchor: tempAnchor,
    normal: tempNormal,
    focus: tempFocus,
    nearObservationPosition: tempNearObservationPosition,
    farObservationPosition: tempFarObservationPosition,
  }
}

export function CameraController() {
  const camera = useThree((view) => view.camera as PerspectiveCamera)
  const gl = useThree((view) => view.gl)
  const stage = useExperienceStore((store) => store.stage)
  const transitionKind = useExperienceStore((store) => store.transition)
  const cameraVariant = useMorphCameraExperimentStore((store) => store.variant)
  const lowHeight = useMorphCameraExperimentStore((store) => store.lowHeight)
  const lowTargetHeight = useMorphCameraExperimentStore((store) => store.lowTargetHeight)
  const lowDistance = useMorphCameraExperimentStore((store) => store.lowDistance)
  const lowFov = useMorphCameraExperimentStore((store) => store.lowFov)
  const finishTransition = useExperienceStore((store) => store.finishTransition)
  const target = useRef(new Vector3(...cameraPresets.hub.target))
  const transition = useRef<ActiveTransition | null>(null)
  const cameraPresetTransition = useRef<CameraPresetTransition | null>(null)
  const previousCameraVariant = useRef(cameraVariant)
  const observationElapsed = useRef(0)
  const guidedObservationDuration = useRef(useTuningStore.getState().guidedObservationSeconds)
  const guidedStartPosition = useRef(camera.position.clone())
  const guidedStartFov = useRef(camera.fov)
  const observationWasActive = useRef(false)
  const hubPosition = useMemo(() => new Vector3(...cameraPresets.hub.position), [])
  const hubTarget = useMemo(() => new Vector3(...cameraPresets.hub.target), [])

  useEffect(() => {
    if (
      stage !== 'approach'
      || transitionKind !== 'none'
      || useRoomVisualModeStore.getState().mode !== 'morph-plan'
    ) return
    const frame = resolvePlanMorphCameraFrame(resolvePlanMorphCameraPreset())
    const variantChanged = previousCameraVariant.current !== cameraVariant
    previousCameraVariant.current = cameraVariant
    if (variantChanged) {
      cameraPresetTransition.current = {
        fromPosition: camera.position.clone(),
        fromTarget: target.current.clone(),
        fromFov: camera.fov,
        toPosition: frame.position.clone(),
        toTarget: frame.target.clone(),
        toFov: frame.fov,
        elapsed: 0,
        duration: 0.4,
      }
      gl.domElement.dataset.morphCameraTransition = 'running'
      return
    }
    cameraPresetTransition.current = null
    camera.position.copy(frame.position)
    target.current.copy(frame.target)
    camera.fov = frame.fov
    camera.updateProjectionMatrix()
    camera.lookAt(target.current)
    writeCameraDataset(gl.domElement, camera, target.current)
    gl.domElement.dataset.morphCameraTransition = 'settled'
  }, [
    camera,
    cameraVariant,
    gl,
    lowDistance,
    lowFov,
    lowHeight,
    lowTargetHeight,
    stage,
    transitionKind,
  ])

  useEffect(() => {
    const observationActive = stage === 'observation' && transitionKind === 'none'
    if (transitionKind === 'none') {
      camera.userData.transitionProgress = 0
    }
    if (observationActive && !observationWasActive.current) {
      observationElapsed.current = 0
      guidedObservationDuration.current = useTuningStore.getState().guidedObservationSeconds
      camera.userData.observationElapsed = 0
    }
    if (stage === 'hub' && transitionKind === 'none') {
      observationElapsed.current = 0
      camera.userData.observationElapsed = 0
    }
    observationWasActive.current = observationActive
  }, [camera, stage, transitionKind])

  useEffect(() => {
    const onTransition = (event: Event) => {
      const kind = (event as CustomEvent).detail
      if (kind !== 'returnToHub') return
      const exitDirection = camera.position.clone().sub(target.current).normalize()
      const control1 = camera.position.clone().addScaledVector(exitDirection, 1.1).add(new Vector3(0, 0.25, 0))
      const control2 = hubPosition.clone().lerp(camera.position, 0.28).add(new Vector3(0, 0.42, 0))
      transition.current = {
        kind: 'returnToHub',
        fromPosition: camera.position.clone(),
        fromTarget: target.current.clone(),
        fromFov: camera.fov,
        elapsed: 0,
        duration: 4.3,
        curve: new CubicBezierCurve3(camera.position.clone(), control1, control2, hubPosition.clone()),
      }
    }
    window.addEventListener('experience-transition', onTransition)
    return () => window.removeEventListener('experience-transition', onTransition)
  }, [camera, hubPosition, hubTarget])

  useEffect(() => {
    if (transitionKind === 'none') return
    const tuning = useTuningStore.getState()
    const base = {
      kind: transitionKind,
      fromPosition: camera.position.clone(),
      fromTarget: target.current.clone(),
      fromFov: camera.fov,
      elapsed: 0,
      duration: transitionKind === 'hubToApproach'
        ? tuning.hubToApproachSeconds
        : transitionKind === 'approachToObservation'
          ? tuning.approachToObservationSeconds
          : 4.3,
    } as ActiveTransition

    if (transitionKind === 'returnToHub') {
      const exitDirection = camera.position.clone().sub(target.current).normalize()
      const control1 = camera.position.clone().addScaledVector(exitDirection, 1.1).add(new Vector3(0, 0.25, 0))
      const control2 = hubPosition.clone().lerp(camera.position, 0.28).add(new Vector3(0, 0.42, 0))
      base.curve = new CubicBezierCurve3(camera.position.clone(), control1, control2, hubPosition.clone())
    } else if (transitionKind === 'approachToObservation') {
      const { signal, anchor, focus, nearObservationPosition, farObservationPosition } = resolveSignalFrame(
        tuning.worldDepth,
      )
      const desiredPosition = signal.depthPortal ? farObservationPosition : nearObservationPosition
      const startPosition = camera.position.clone()
      const entryDirection = desiredPosition.clone().sub(startPosition)
      const entryDistance = Math.min(tuning.entryTravelDistance, entryDirection.length())
      const observationPosition = startPosition.clone().add(entryDirection.normalize().multiplyScalar(entryDistance))
      const midpoint = startPosition.clone().lerp(observationPosition, 0.5)
      const pathDirection = observationPosition.clone().sub(startPosition).normalize()
      const curveOffset = anchor.clone().sub(midpoint)
      curveOffset.addScaledVector(pathDirection, -curveOffset.dot(pathDirection))
      curveOffset.clampLength(0, entryDistance * 0.28).multiplyScalar(tuning.entryCurveStrength)
      const control1 = startPosition.clone().lerp(observationPosition, 0.33).add(curveOffset)
      const control2 = startPosition.clone().lerp(observationPosition, 0.67).add(curveOffset)
      base.curve = new CubicBezierCurve3(startPosition, control1, control2, observationPosition.clone())
      base.endTarget = focus.clone()
      base.endFov = tuning.entryFov
      base.targetRotationDelay = tuning.targetRotationDelay / 100
      guidedStartPosition.current.copy(observationPosition)
      guidedStartFov.current = tuning.entryFov
    }
    transition.current = base
  }, [camera, hubPosition, hubTarget, transitionKind])

  useFrame(({ gl }, delta) => {
    const active = transition.current
    if (!active) {
      const presetTransition = cameraPresetTransition.current
      if (presetTransition && stage === 'approach' && transitionKind === 'none') {
        presetTransition.elapsed += delta
        const rawPresetProgress = Math.min(presetTransition.elapsed / presetTransition.duration, 1)
        const presetProgress = easeInOutCubic(rawPresetProgress)
        camera.position.lerpVectors(presetTransition.fromPosition, presetTransition.toPosition, presetProgress)
        target.current.lerpVectors(presetTransition.fromTarget, presetTransition.toTarget, presetProgress)
        camera.fov = MathUtils.lerp(presetTransition.fromFov, presetTransition.toFov, presetProgress)
        camera.updateProjectionMatrix()
        camera.lookAt(target.current)
        writeCameraDataset(gl.domElement, camera, target.current)
        if (rawPresetProgress >= 1) {
          cameraPresetTransition.current = null
          gl.domElement.dataset.morphCameraTransition = 'settled'
        }
        return
      }
      if (presetTransition) cameraPresetTransition.current = null
      if (stage === 'observation' && transitionKind === 'none') {
        const { signal, focus, nearObservationPosition } = resolveSignalFrame()
        if (signal.depthPortal) {
          observationElapsed.current = Math.min(
            observationElapsed.current + delta,
            guidedObservationDuration.current,
          )
          const rawDollyProgress = observationElapsed.current / guidedObservationDuration.current
          const dollyProgress = smootherStep(rawDollyProgress)
          camera.position.lerpVectors(guidedStartPosition.current, nearObservationPosition, dollyProgress)
          target.current.copy(focus)
          camera.fov = MathUtils.lerp(guidedStartFov.current, signal.depthPortal.nearFov, dollyProgress)
          camera.updateProjectionMatrix()
          camera.userData.observationElapsed = observationElapsed.current
          gl.domElement.dataset.observationElapsed = observationElapsed.current.toFixed(2)
          gl.domElement.dataset.cameraDollyProgress = rawDollyProgress.toFixed(3)
          gl.domElement.dataset.cameraPosition = camera.position.toArray().map((value) => value.toFixed(2)).join(',')
          gl.domElement.dataset.cameraTarget = target.current.toArray().map((value) => value.toFixed(2)).join(',')
          gl.domElement.dataset.cameraFov = camera.fov.toFixed(2)
        }
      }
      camera.lookAt(target.current)
      return
    }

    active.elapsed += delta
    const rawProgress = Math.min(active.elapsed / active.duration, 1)
    const progress = easeInOutCubic(rawProgress)

    if (active.kind === 'hubToApproach') {
      const roomMode = useRoomVisualModeStore.getState().mode
      const morphRoomActive = roomMode === 'morph' || roomMode === 'morph-plan'
      if (morphRoomActive) {
        const planMorphActive = roomMode === 'morph-plan'
        const planMorphFrame = planMorphActive
          ? resolvePlanMorphCameraFrame(resolvePlanMorphCameraPreset())
          : null
        const house = getHouseRoot()
        tempPosition.copy(planMorphFrame?.position ?? tempMorphApproachPosition)
        tempTarget.copy(planMorphFrame?.target ?? tempMorphApproachTarget)
        if (!planMorphActive && house) {
          house.updateWorldMatrix(true, false)
          tempPosition.applyMatrix4(house.matrixWorld)
          tempTarget.applyMatrix4(house.matrixWorld)
        }
        camera.position.lerpVectors(active.fromPosition, tempPosition, progress)
        target.current.lerpVectors(active.fromTarget, tempTarget, progress)
        camera.fov = MathUtils.lerp(
          active.fromFov,
          planMorphFrame?.fov ?? 40,
          progress,
        )
      } else {
        const { signal, anchor, normal } = resolveSignalFrame()
        tempPosition.copy(anchor).addScaledVector(normal, signal.approachDistance).add(tempApproachLift)
        camera.position.lerpVectors(active.fromPosition, tempPosition, progress)
        target.current.lerpVectors(active.fromTarget, anchor, progress)
        camera.fov = MathUtils.lerp(active.fromFov, 33, progress)
      }
    } else if (active.kind === 'approachToObservation' && active.curve && active.endTarget) {
      active.curve.getPoint(progress, camera.position)
      const targetDelay = active.targetRotationDelay ?? 0
      const targetRawProgress = MathUtils.clamp((rawProgress - targetDelay) / Math.max(1 - targetDelay, 0.001), 0, 1)
      target.current.lerpVectors(active.fromTarget, active.endTarget, easeInOutCubic(targetRawProgress))
      camera.fov = MathUtils.lerp(active.fromFov, active.endFov ?? 25.5, progress)
    } else if (active.curve) {
      active.curve.getPoint(progress, camera.position)
      target.current.lerpVectors(active.fromTarget, hubTarget, progress)
      camera.fov = MathUtils.lerp(active.fromFov, cameraPresets.hub.fov, progress)
    }

    camera.updateProjectionMatrix()
    camera.lookAt(target.current)
    camera.userData.transitionProgress = rawProgress
    writeCameraDataset(gl.domElement, camera, target.current)

    if (rawProgress < 1) return
    transition.current = null
    // Preserve the completed frame until React commits the next stage.
    // Resetting here makes dependent layers replay progress 0 for one frame.
    finishTransition()
  }, -2)

  return null
}
