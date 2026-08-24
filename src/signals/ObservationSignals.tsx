import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Color, MeshBasicMaterial, Quaternion, Vector3, type Group, type Mesh } from 'three'
import { localeCopy } from '../locales'
import { useExperienceStore } from '../store/experienceStore'
import { observationSignals, type ObservationSignalConfig } from './signalData'
import { consumeSignalTapSuppression } from '../interaction/orbitGesture'
import { useTuningStore } from '../store/tuningStore'
import { useRoomVisualModeStore } from '../store/roomVisualModeStore'

const forward = new Vector3(0, 0, 1)

function ObservationSignal({ signal }: { signal: ObservationSignalConfig }) {
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)
  const language = useExperienceStore((store) => store.language)
  const enterApproach = useExperienceStore((store) => store.enterApproach)
  const enterObservation = useExperienceStore((store) => store.enterObservation)
  const preserveFullHub = useTuningStore((store) => store.hubPersistenceMode === 'fullHub')
  const roomVisualMode = useRoomVisualModeStore((store) => store.mode)
  const group = useRef<Group>(null)
  const ring = useRef<Mesh>(null)
  const core = useRef<Mesh>(null)
  const targetScaleVector = useRef(new Vector3(1, 1, 1))
  const hubPosition = useMemo(() => new Vector3(...signal.hubAnchor), [signal.hubAnchor])
  const approachPosition = useMemo(() => new Vector3(), [])
  const approachOrientation = useMemo(() => new Quaternion(), [])
  const orientation = useMemo(() => {
    const normal = new Vector3(...signal.normal).normalize()
    return new Quaternion().setFromUnitVectors(forward, normal)
  }, [signal.normal])
  const accent = useMemo(() => new Color(signal.accent), [signal.accent])
  const isSelected = selectedSignalId === signal.id
  const inHub = stage === 'hub'
  const inApproach = stage === 'approach'
  const observationLayerHidden = stage === 'observation'
    || transition === 'approachToObservation'
    || transition === 'returnToApproach'
  const isActionable = transition === 'none' && (inHub || inApproach)
  const visuallyActive = !observationLayerHidden && (inHub || preserveFullHub || isSelected)
  const copy = localeCopy[language]
  const actionLabel = inApproach ? copy.approachAction : copy.hubAction

  useFrame(({ clock, camera, scene }, delta) => {
    if (!group.current || !ring.current || !core.current) return
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.05 + signal.phase) * 0.1
    const transitionProgress = Number(camera.userData.transitionProgress ?? 0)
    const planRoom = roomVisualMode === 'morph-plan'
      ? scene.getObjectByName('plan-morph-approach-room')
      : null
    approachPosition.set(...signal.anchor)
    approachOrientation.copy(orientation)
    if (planRoom) {
      approachPosition.applyQuaternion(planRoom.quaternion)
      approachOrientation.premultiply(planRoom.quaternion)
    }
    if (transition === 'hubToApproach') {
      group.current.position.lerpVectors(hubPosition, approachPosition, transitionProgress)
      group.current.quaternion.copy(orientation).slerp(approachOrientation, transitionProgress)
    } else if (transition === 'returnToHub') {
      group.current.position.lerpVectors(approachPosition, hubPosition, transitionProgress)
      group.current.quaternion.copy(approachOrientation).slerp(orientation, transitionProgress)
    } else if (stage === 'hub') {
      group.current.position.copy(hubPosition)
      group.current.quaternion.copy(orientation)
    } else {
      group.current.position.copy(approachPosition)
      group.current.quaternion.copy(approachOrientation)
    }
    const apertureProgress = transition === 'approachToObservation' && isSelected ? transitionProgress : 0
    const targetScale = apertureProgress > 0 ? 1.2 + apertureProgress * 5.8 : isSelected && transition !== 'none' ? 1.24 : 1
    group.current.scale.lerp(targetScaleVector.current.setScalar(targetScale), Math.min(delta * 5, 1))
    ring.current.scale.setScalar(pulse)
    ring.current.rotation.z += delta * (0.16 + signal.phase * 0.006)
    const observationFade = apertureProgress > 0.62 ? 1 - (apertureProgress - 0.62) / 0.38 : 1
    const targetOpacity = visuallyActive
      ? (isSelected || selectedSignalId === null ? 0.82 * observationFade : 0.14)
      : 0
    const ringMaterial = ring.current.material as MeshBasicMaterial
    const coreMaterial = core.current.material as MeshBasicMaterial
    ringMaterial.opacity += (targetOpacity - ringMaterial.opacity) * Math.min(delta * 7, 1)
    coreMaterial.opacity += (Math.min(1, targetOpacity + 0.16) - coreMaterial.opacity) * Math.min(delta * 7, 1)
  })

  const selectSignal = () => {
    if (consumeSignalTapSuppression()) return
    if (!isActionable) return
    if (inHub || !isSelected) enterApproach(signal.id)
    else enterObservation()
  }

  return (
    <group
      ref={group}
      name={signal.id}
      position={signal.hubAnchor}
      quaternion={orientation}
      userData={{ signalId: signal.id, observationId: signal.observationId }}
    >
      <mesh ref={ring}>
        <torusGeometry args={[0.16, 0.011, 8, 40]} />
        <meshBasicMaterial color={accent} transparent opacity={0.82} depthWrite={false} />
      </mesh>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.055, 1]} />
        <meshBasicMaterial color={accent} transparent opacity={0.98} wireframe depthWrite={false} />
      </mesh>
      <pointLight intensity={observationLayerHidden ? 0 : isSelected ? 3.2 : 1.25} distance={0.9} color={accent} />
      <Html center transform={false} zIndexRange={[8, 3]}>
        <button
          type="button"
          className={`scene-signal-button ${isSelected ? 'selected' : ''} ${observationLayerHidden ? 'observation-hidden' : ''}`}
          data-signal-id={signal.id}
          aria-label={`${actionLabel} ${signal.id.slice(-2)}`}
          aria-hidden={observationLayerHidden}
          tabIndex={observationLayerHidden ? -1 : 0}
          disabled={!isActionable}
          onClick={selectSignal}
        >
          <span className="scene-signal-label">{isSelected && inApproach ? actionLabel : signal.id.slice(-2)}</span>
        </button>
      </Html>
    </group>
  )
}

export function ObservationSignals() {
  return observationSignals.map((signal) => <ObservationSignal key={signal.id} signal={signal} />)
}
