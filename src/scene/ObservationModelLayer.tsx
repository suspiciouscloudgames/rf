import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import {
  Box3,
  MathUtils,
  Mesh,
  Vector3,
  type Group,
  type Material,
} from 'three'
import { useExperienceStore } from '../store/experienceStore'
import {
  getSignalConfig,
  type ObservationModelConfig,
} from '../signals/signalData'

interface ActiveObservationModelProps {
  config: ObservationModelConfig
}

function ActiveObservationModel({ config }: ActiveObservationModelProps) {
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)
  const { scene } = useGLTF(config.assetUrl)
  const canvas = useThree((state) => state.gl.domElement)
  const root = useRef<Group>(null)
  const currentOpacity = useRef(0)
  const currentScale = useRef(0.72)

  const prepared = useMemo(() => {
    const model = scene.clone(true)
    const materials: Material[] = []

    model.traverse((object) => {
      if (!(object instanceof Mesh)) return
      const sourceMaterials = Array.isArray(object.material)
        ? object.material
        : [object.material]
      const clonedMaterials = sourceMaterials.map((sourceMaterial) => {
        const material = sourceMaterial.clone()
        material.userData.baseOpacity = material.opacity
        material.transparent = true
        material.opacity = 0
        materials.push(material)
        return material
      })
      object.material = Array.isArray(object.material)
        ? clonedMaterials
        : clonedMaterials[0]
    })

    model.updateWorldMatrix(true, true)
    const bounds = new Box3().setFromObject(model)
    const center = bounds.getCenter(new Vector3())
    const size = bounds.getSize(new Vector3())
    const longestSide = Math.max(size.x, size.y, size.z, 0.0001)
    model.position.sub(center)

    return {
      model,
      materials,
      normalizedScale: config.maxSize / longestSide,
    }
  }, [config.maxSize, scene])

  useEffect(() => () => {
    prepared.materials.forEach((material) => material.dispose())
    delete canvas.dataset.observationModelState
    delete canvas.dataset.observationModelOpacity
    delete canvas.dataset.observationModelScale
  }, [canvas, prepared.materials])

  useFrame(({ camera }, delta) => {
    if (!root.current) return
    const selected = selectedSignalId === 'signal-04'
    const transitionProgress = Number(camera.userData.transitionProgress ?? 0)
    const entering = selected && transition === 'approachToObservation'
    const observing = selected && stage === 'observation' && transition === 'none'
    const returning = selected && (transition === 'returnToHub' || transition === 'returnToApproach')
    const targetOpacity = entering
      ? MathUtils.smoothstep(transitionProgress, 0, 0.22)
      : observing
        ? 1
        : returning
          ? 1 - transitionProgress
          : 0

    currentOpacity.current = MathUtils.damp(currentOpacity.current, targetOpacity, 9, delta)
    currentScale.current = MathUtils.damp(
      currentScale.current,
      MathUtils.lerp(0.72, 1, targetOpacity),
      7,
      delta,
    )

    root.current.visible = currentOpacity.current > 0.002
    root.current.scale.setScalar(prepared.normalizedScale * currentScale.current)
    prepared.materials.forEach((material) => {
      const baseOpacity = Number(material.userData.baseOpacity ?? 1)
      material.opacity = baseOpacity * currentOpacity.current
    })

    canvas.dataset.observationModelState = root.current.visible ? 'visible' : 'hidden'
    canvas.dataset.observationModelOpacity = currentOpacity.current.toFixed(3)
    canvas.dataset.observationModelScale = (
      prepared.normalizedScale * currentScale.current
    ).toFixed(5)
  })

  return (
    <group
      ref={root}
      name="signal-04-observation-model"
      position={config.position}
      rotation={config.rotation}
      visible={false}
    >
      <primitive object={prepared.model} dispose={null} />
    </group>
  )
}

export function ObservationModelLayer() {
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)
  const config = getSignalConfig(selectedSignalId).observationModel
  return config ? <ActiveObservationModel config={config} /> : null
}
