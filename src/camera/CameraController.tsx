import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CubicBezierCurve3, MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { cameraPresets } from './cameraPresets'
import { useExperienceStore } from '../store/experienceStore'
import { getSignalConfig } from '../signals/signalData'
import { getHouseRoot } from '../scene/sceneRegistry'
import { smootherStep } from '../sequence/observationTiming'

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

const resolveSignalFrame = () => {
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
  const stage = useExperienceStore((store) => store.stage)
  const transitionKind = useExperienceStore((store) => store.transition)
  const finishTransition = useExperienceStore((store) => store.finishTransition)
  const target = useRef(new Vector3(...cameraPresets.hub.target))
  const transition = useRef<ActiveTransition | null>(null)
  const observationElapsed = useRef(0)
  const observationWasActive = useRef(false)
  const hubPosition = useMemo(() => new Vector3(...cameraPresets.hub.position), [])
  const hubTarget = useMemo(() => new Vector3(...cameraPresets.hub.target), [])

  useEffect(() => {
    const observationActive = stage === 'observation' && transitionKind === 'none'
    if (observationActive && !observationWasActive.current) {
      observationElapsed.current = 0
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
  }, [camera, hubPosition])

  useEffect(() => {
    if (transitionKind === 'none') return
    const base = {
      kind: transitionKind,
      fromPosition: camera.position.clone(),
      fromTarget: target.current.clone(),
      fromFov: camera.fov,
      elapsed: 0,
      duration: transitionKind === 'hubToApproach' ? 3.2 : transitionKind === 'approachToObservation' ? 3.5 : 4.3,
    } as ActiveTransition

    if (transitionKind === 'returnToHub') {
      const exitDirection = camera.position.clone().sub(target.current).normalize()
      const control1 = camera.position.clone().addScaledVector(exitDirection, 1.1).add(new Vector3(0, 0.25, 0))
      const control2 = hubPosition.clone().lerp(camera.position, 0.28).add(new Vector3(0, 0.42, 0))
      base.curve = new CubicBezierCurve3(camera.position.clone(), control1, control2, hubPosition.clone())
    } else if (transitionKind === 'approachToObservation') {
      const { signal, anchor, focus, nearObservationPosition, farObservationPosition } = resolveSignalFrame()
      const observationPosition = signal.depthPortal ? farObservationPosition : nearObservationPosition
      const control1 = camera.position.clone().lerp(anchor, 0.42).add(new Vector3(0, 0.18, 0))
      const control2 = anchor.clone().lerp(observationPosition, 0.62).add(new Vector3(0, 0.08, 0))
      base.curve = new CubicBezierCurve3(camera.position.clone(), control1, control2, observationPosition.clone())
      base.endTarget = focus.clone()
      base.endFov = signal.depthPortal?.farFov ?? 25.5
    }
    transition.current = base
  }, [camera, hubPosition, transitionKind])

  useFrame(({ gl }, delta) => {
    const active = transition.current
    if (!active) {
      if (stage === 'observation' && transitionKind === 'none') {
        const { signal, focus, nearObservationPosition, farObservationPosition } = resolveSignalFrame()
        if (signal.depthPortal) {
          observationElapsed.current = Math.min(
            observationElapsed.current + delta,
            signal.depthPortal.dollyDuration,
          )
          const rawDollyProgress = observationElapsed.current / signal.depthPortal.dollyDuration
          const dollyProgress = smootherStep(rawDollyProgress)
          camera.position.lerpVectors(farObservationPosition, nearObservationPosition, dollyProgress)
          target.current.copy(focus)
          camera.fov = MathUtils.lerp(signal.depthPortal.farFov, signal.depthPortal.nearFov, dollyProgress)
          camera.updateProjectionMatrix()
          camera.userData.observationElapsed = observationElapsed.current
          gl.domElement.dataset.observationElapsed = observationElapsed.current.toFixed(2)
          gl.domElement.dataset.cameraDollyProgress = rawDollyProgress.toFixed(3)
          gl.domElement.dataset.cameraPosition = camera.position.toArray().map((value) => value.toFixed(2)).join(',')
          gl.domElement.dataset.cameraTarget = target.current.toArray().map((value) => value.toFixed(2)).join(',')
        }
      }
      camera.lookAt(target.current)
      return
    }

    active.elapsed += delta
    const rawProgress = Math.min(active.elapsed / active.duration, 1)
    const progress = easeInOutCubic(rawProgress)

    if (active.kind === 'hubToApproach') {
      const { signal, anchor, normal } = resolveSignalFrame()
      tempPosition.copy(anchor).addScaledVector(normal, signal.approachDistance).add(tempApproachLift)
      camera.position.lerpVectors(active.fromPosition, tempPosition, progress)
      target.current.lerpVectors(active.fromTarget, anchor, progress)
      camera.fov = MathUtils.lerp(active.fromFov, 33, progress)
    } else if (active.kind === 'approachToObservation' && active.curve && active.endTarget) {
      active.curve.getPoint(progress, camera.position)
      target.current.lerpVectors(active.fromTarget, active.endTarget, progress)
      camera.fov = MathUtils.lerp(active.fromFov, active.endFov ?? 25.5, progress)
    } else if (active.curve) {
      active.curve.getPoint(progress, camera.position)
      target.current.lerpVectors(active.fromTarget, hubTarget, progress)
      camera.fov = MathUtils.lerp(active.fromFov, cameraPresets.hub.fov, progress)
    }

    camera.updateProjectionMatrix()
    camera.lookAt(target.current)
    camera.userData.transitionProgress = rawProgress
    gl.domElement.dataset.cameraPosition = camera.position.toArray().map((value) => value.toFixed(2)).join(',')
    gl.domElement.dataset.cameraTarget = target.current.toArray().map((value) => value.toFixed(2)).join(',')

    if (rawProgress < 1) return
    transition.current = null
    camera.userData.transitionProgress = 0
    finishTransition()
  }, -2)

  return null
}
