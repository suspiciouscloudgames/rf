import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'
import { Quaternion, Vector3, type Group } from 'three'
import { localeCopy } from '../locales'
import { useExperienceStore } from '../store/experienceStore'
import { observationSignals, type ObservationSignalConfig } from './signalData'
import { consumeSignalTapSuppression } from '../interaction/orbitGesture'
import { useRoomVisualModeStore } from '../store/roomVisualModeStore'

const forward = new Vector3(0, 0, 1)

type SignalButtonStyle = CSSProperties & { '--signal-phase'?: string }

function ObservationSignal({ signal }: { signal: ObservationSignalConfig }) {
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)
  const language = useExperienceStore((store) => store.language)
  const enterApproach = useExperienceStore((store) => store.enterApproach)
  const enterObservation = useExperienceStore((store) => store.enterObservation)
  const roomVisualMode = useRoomVisualModeStore((store) => store.mode)
  const group = useRef<Group>(null)
  const targetScaleVector = useRef(new Vector3(1, 1, 1))
  const hubPosition = useMemo(() => new Vector3(...signal.hubAnchor), [signal.hubAnchor])
  const approachPosition = useMemo(() => new Vector3(), [])
  const approachOrientation = useMemo(() => new Quaternion(), [])
  const orientation = useMemo(() => {
    const normal = new Vector3(...signal.normal).normalize()
    return new Quaternion().setFromUnitVectors(forward, normal)
  }, [signal.normal])
  const isSelected = selectedSignalId === signal.id
  const inHub = stage === 'hub'
  const inApproach = stage === 'approach'
  const observationLayerHidden = stage === 'observation'
    || transition === 'approachToObservation'
    || transition === 'returnToApproach'
  const isActionable = transition === 'none' && (inHub || inApproach)
  const copy = localeCopy[language]
  const actionLabel = inApproach ? copy.approachAction : copy.hubAction

  useFrame(({ clock, camera, scene }, delta) => {
    if (!group.current) return
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
    if (inApproach && transition === 'none') {
      const driftTime = clock.elapsedTime
      const driftRadius = 0.072
      const secondaryDrift = 0.014
      group.current.position.x += Math.sin(driftTime * 0.31 + signal.phase) * driftRadius
        + Math.sin(driftTime * 0.67 + signal.phase * 1.37) * secondaryDrift
      group.current.position.y += Math.sin(driftTime * 0.24 + signal.phase * 0.73) * driftRadius * 0.42
      group.current.position.z += Math.cos(driftTime * 0.27 + signal.phase * 1.11) * driftRadius * 0.88
        + Math.cos(driftTime * 0.59 + signal.phase * 0.81) * secondaryDrift
    }
    const apertureProgress = transition === 'approachToObservation' && isSelected ? transitionProgress : 0
    const targetScale = apertureProgress > 0 ? 1.2 + apertureProgress * 5.8 : isSelected && transition !== 'none' ? 1.24 : 1
    group.current.scale.lerp(targetScaleVector.current.setScalar(targetScale), Math.min(delta * 5, 1))
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
          style={{ '--signal-phase': `${-signal.phase * 0.55}s` } as SignalButtonStyle}
        >
          <span className="scene-signal-lens" aria-hidden="true" />
          <span className="scene-signal-label">{isSelected && inApproach ? actionLabel : signal.id.slice(-2)}</span>
        </button>
      </Html>
    </group>
  )
}

export function ObservationSignals() {
  return observationSignals.map((signal) => <ObservationSignal key={signal.id} signal={signal} />)
}
