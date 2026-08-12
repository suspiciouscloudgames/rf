import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, Vector3 } from 'three'
import { cameraPresets, type CameraPreset } from './cameraPresets'
import { useExperienceStore } from '../store/experienceStore'

interface ActiveTransition {
  fromPosition: Vector3
  fromTarget: Vector3
  fromFov: number
  to: CameraPreset
  toPosition: Vector3
  toTarget: Vector3
  elapsed: number
  returnLeg: number
}

const easeInOutCubic = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2

export function CameraController() {
  const camera = useThree((view) => view.camera as PerspectiveCamera)
  const state = useExperienceStore((store) => store.state)
  const finishTransition = useExperienceStore((store) => store.finishTransition)
  const enterHub = useExperienceStore((store) => store.enterHub)
  const target = useRef(new Vector3(...cameraPresets.hub.target))
  const transition = useRef<ActiveTransition | null>(null)

  useEffect(() => {
    if (state === 'loading' || state === 'hub') return

    const destination = state === 'returning'
      ? { ...cameraPresets.approach, duration: 1.35 }
      : cameraPresets[state]

    transition.current = {
      fromPosition: camera.position.clone(),
      fromTarget: target.current.clone(),
      fromFov: camera.fov,
      to: destination,
      toPosition: new Vector3(...destination.position),
      toTarget: new Vector3(...destination.target),
      elapsed: 0,
      returnLeg: 0,
    }
  }, [camera, state])

  useFrame((_, delta) => {
    const active = transition.current
    if (!active) {
      camera.lookAt(target.current)
      return
    }

    active.elapsed += delta
    const rawProgress = Math.min(active.elapsed / active.to.duration, 1)
    const progress = easeInOutCubic(rawProgress)
    camera.position.lerpVectors(active.fromPosition, active.toPosition, progress)
    target.current.lerpVectors(active.fromTarget, active.toTarget, progress)
    camera.fov = active.fromFov + (active.to.fov - active.fromFov) * progress
    camera.updateProjectionMatrix()
    camera.lookAt(target.current)

    if (rawProgress < 1) return

    if (state === 'returning' && active.returnLeg === 0) {
      transition.current = {
        fromPosition: camera.position.clone(),
        fromTarget: target.current.clone(),
        fromFov: camera.fov,
        to: { ...cameraPresets.hub, duration: 2.4 },
        toPosition: new Vector3(...cameraPresets.hub.position),
        toTarget: new Vector3(...cameraPresets.hub.target),
        elapsed: 0,
        returnLeg: 1,
      }
      return
    }

    transition.current = null
    if (state === 'returning') enterHub()
    else finishTransition()
  })

  return null
}
