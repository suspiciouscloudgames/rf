import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, PerspectiveCamera, Spherical, Vector3 } from 'three'
import { useExperienceStore } from '../store/experienceStore'
import { suppressSignalTap } from './orbitGesture'

const ORBIT_TARGET = new Vector3(0, 0.35, 0)
const MIN_POLAR = MathUtils.degToRad(58)
const MAX_POLAR = MathUtils.degToRad(98)
const DRAG_THRESHOLD = 8
const SENSITIVITY = MathUtils.degToRad(0.15)

interface PointerSession {
  pointerId: number
  startX: number
  startY: number
  lastX: number
  lastY: number
  dragged: boolean
  startedOnSignal: boolean
}

export function HubOrbitController() {
  const camera = useThree((view) => view.camera as PerspectiveCamera)
  const gl = useThree((view) => view.gl)
  const spherical = useRef(new Spherical())
  const velocity = useRef({ azimuth: 0, polar: 0 })
  const pointer = useRef<PointerSession | null>(null)
  const activeLastFrame = useRef(false)
  const resumeAutoAt = useRef(0)
  const orbitOffset = useRef(new Vector3())

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const snapshot = useExperienceStore.getState()
      if (snapshot.stage !== 'hub' || snapshot.transition !== 'none' || event.pointerType === 'mouse' && event.button !== 0) return
      const target = event.target as HTMLElement | null
      if (target?.closest('.system-controls, .home-button, .orientation-warning')) return
      pointer.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        dragged: false,
        startedOnSignal: Boolean(target?.closest('[data-signal-id]')),
      }
      velocity.current = { azimuth: 0, polar: 0 }
      resumeAutoAt.current = Number.POSITIVE_INFINITY
    }

    const onPointerMove = (event: PointerEvent) => {
      const session = pointer.current
      if (!session || session.pointerId !== event.pointerId) return
      const totalDistance = Math.hypot(event.clientX - session.startX, event.clientY - session.startY)
      if (!session.dragged && totalDistance >= DRAG_THRESHOLD) {
        session.dragged = true
        if (session.startedOnSignal) suppressSignalTap()
      }
      if (!session.dragged) return
      const deltaX = event.clientX - session.lastX
      const deltaY = event.clientY - session.lastY
      velocity.current.azimuth = -deltaX * SENSITIVITY
      velocity.current.polar = deltaY * SENSITIVITY
      spherical.current.theta += velocity.current.azimuth
      spherical.current.phi = MathUtils.clamp(spherical.current.phi + velocity.current.polar, MIN_POLAR, MAX_POLAR)
      session.lastX = event.clientX
      session.lastY = event.clientY
      useExperienceStore.getState().registerInteraction()
    }

    const finishPointer = (event: PointerEvent) => {
      if (!pointer.current || pointer.current.pointerId !== event.pointerId) return
      pointer.current = null
      resumeAutoAt.current = performance.now() + 1_900
    }

    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('pointermove', onPointerMove, true)
    window.addEventListener('pointerup', finishPointer, true)
    window.addEventListener('pointercancel', finishPointer, true)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('pointermove', onPointerMove, true)
      window.removeEventListener('pointerup', finishPointer, true)
      window.removeEventListener('pointercancel', finishPointer, true)
    }
  }, [])

  useFrame((_, delta) => {
    const { stage, transition } = useExperienceStore.getState()
    const active = stage === 'hub' && transition === 'none'
    if (!active) {
      activeLastFrame.current = false
      return
    }

    if (!activeLastFrame.current) {
      spherical.current.setFromVector3(orbitOffset.current.copy(camera.position).sub(ORBIT_TARGET))
      spherical.current.phi = MathUtils.clamp(spherical.current.phi, MIN_POLAR, MAX_POLAR)
      velocity.current = { azimuth: 0, polar: 0 }
      resumeAutoAt.current = performance.now() + 1_900
      activeLastFrame.current = true
    }

    if (!pointer.current) {
      const damping = Math.exp(-delta * 5.8)
      spherical.current.theta += velocity.current.azimuth
      spherical.current.phi = MathUtils.clamp(spherical.current.phi + velocity.current.polar, MIN_POLAR, MAX_POLAR)
      velocity.current.azimuth *= damping
      velocity.current.polar *= damping
      if (performance.now() >= resumeAutoAt.current) spherical.current.theta += delta * 0.018
    }

    camera.position.copy(orbitOffset.current.setFromSpherical(spherical.current).add(ORBIT_TARGET))
    camera.lookAt(ORBIT_TARGET)
    gl.domElement.dataset.orbitAzimuth = spherical.current.theta.toFixed(5)
  }, -1)

  return null
}
