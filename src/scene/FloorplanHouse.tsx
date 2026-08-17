import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  BoxGeometry,
  BufferGeometry,
  ExtrudeGeometry,
  MeshStandardMaterial,
  Shape,
} from 'three'
import { mergeGeometries, mergeVertices, toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { useExperienceStore } from '../store/experienceStore'

const plasterColor = '#d8d6cf'

function solidGeometry(
  size: [number, number, number],
  position: [number, number, number],
  _radius = 0.06,
) {
  // Wall pieces must meet on perfectly flat planes. Bevelled boxes create a
  // raised double edge wherever two walls touch, which reads as a visible seam.
  const geometry = new BoxGeometry(...size)
  geometry.translate(...position)
  return geometry
}

function floorGeometry() {
  const outline = new Shape()
  // Match the exact outside faces of the 22 cm walls. The previous outline
  // stopped inside them and exposed a stepped ledge around the base.
  outline.moveTo(-2.61, -1.81)
  outline.lineTo(2.61, -1.81)
  outline.lineTo(2.61, 1.81)
  outline.lineTo(-0.44, 1.81)
  outline.lineTo(-0.44, 0.74)
  outline.lineTo(-2.61, 0.74)
  outline.closePath()
  const geometry = new ExtrudeGeometry(outline, {
    depth: 0.2,
    bevelEnabled: false,
    curveSegments: 8,
  })
  geometry.rotateX(Math.PI / 2)
  geometry.translate(0, -0.95, 0)
  return geometry
}

function buildManifoldShell() {
  // The shell is assembled directly, instead of boolean-unioning overlapping
  // rounded solids. This avoids coplanar faces and the long CSG triangles that
  // previously showed up as seams and broken window corners.
  const solids: BufferGeometry[] = [
    floorGeometry(),

    // Rear wall: four pieces form a clean rectangular opening.
    solidGeometry([0.53, 2.17, 0.22], [-2.275, 0.095, -1.7], 0.025),
    solidGeometry([3.43, 2.17, 0.22], [0.825, 0.095, -1.7], 0.025),
    solidGeometry([1.12, 0.68, 0.22], [-1.45, -0.65, -1.7], 0.025),
    solidGeometry([1.12, 0.47, 0.22], [-1.45, 0.945, -1.7], 0.025),

    // Left wall: the second window is also built as a frame, not cut by CSG.
    solidGeometry([0.22, 2.17, 0.29], [-2.5, 0.095, -1.605], 0.025),
    solidGeometry([0.22, 2.17, 1.09], [-2.5, 0.095, 0.205], 0.025),
    solidGeometry([0.22, 0.68, 1.12], [-2.5, -0.65, -0.9], 0.025),
    solidGeometry([0.22, 0.47, 1.12], [-2.5, 0.945, -0.9], 0.025),

    solidGeometry([0.22, 2.17, 3.5], [2.5, 0.095, 0], 0.025),
    solidGeometry([2.02, 2.17, 0.22], [-1.53, 0.095, 0.7], 0.025),
    solidGeometry([0.6, 2.17, 0.22], [1.1, 0.095, 1.7], 0.025),
    solidGeometry([0.38, 2.17, 0.22], [2.35, 0.095, 1.7], 0.025),
    solidGeometry([0.22, 2.17, 1.1], [-0.43, 0.095, 1.2], 0.025),
    solidGeometry([0.22, 2.17, 1.1], [0.71, 0.095, 1.2], 0.025),
    solidGeometry([1.36, 2.17, 0.22], [0.14, 0.095, 1.7], 0.025),
  ]

  const normalizedSolids = solids.map((solid) => (
    solid.index ? solid.toNonIndexed() : solid.clone()
  ))
  const rawGeometry = mergeGeometries(normalizedSolids, false)
  if (!rawGeometry) throw new Error('Could not assemble house shell geometry')
  rawGeometry.clearGroups()
  const geometry = mergeVertices(rawGeometry, 0.0001)
  rawGeometry.dispose()
  const creasedGeometry = toCreasedNormals(geometry, Math.PI / 5)
  if (creasedGeometry !== geometry) geometry.dispose()
  creasedGeometry.computeBoundingSphere()
  solids.forEach((solid) => solid.dispose())
  normalizedSolids.forEach((solid) => solid.dispose())
  return creasedGeometry
}

function createShellMaterial() {
  const material = new MeshStandardMaterial({
    color: plasterColor,
    roughness: 1,
    metalness: 0,
  })
  return material
}

export function FloorplanHouse() {
  const geometry = useMemo(() => buildManifoldShell(), [])
  const material = useMemo(() => createShellMaterial(), [])
  const camera = useThree((state) => state.camera)
  const transition = useExperienceStore((store) => store.transition)

  useFrame(() => {
    if (transition === 'hubToApproach') {
      const progress = Number(camera.userData.transitionProgress ?? 0)
      const reveal = Math.max(0, Math.min(1, (progress - 0.16) / 0.7))
      const easedReveal = reveal * reveal * (3 - 2 * reveal)
      material.transparent = true
      material.opacity = easedReveal
      material.depthWrite = easedReveal > 0.82
      return
    }
    if (transition === 'returnToHub') {
      const progress = Number(camera.userData.transitionProgress ?? 0)
      const opacity = 1 - progress * progress * (3 - 2 * progress)
      material.transparent = true
      material.opacity = opacity
      material.depthWrite = opacity > 0.82
      return
    }
    material.opacity = 1
    material.transparent = false
    material.depthWrite = true
  })

  useEffect(() => () => {
    geometry.dispose()
    material.dispose()
  }, [geometry, material])

  return (
    <group name="floorplan-house-model" position={[0, -0.02, 0]} scale={0.48}>
      <mesh name="manifold-house-shell" geometry={geometry} material={material} castShadow receiveShadow />

      <group name="courtyard-tree" position={[-1.32, -0.02, 1.2]}>
        <mesh position={[0, -0.45, 0]} material={material} castShadow>
          <cylinderGeometry args={[0.12, 0.17, 1.08, 18]} />
        </mesh>
        <mesh position={[0, 0.3, 0]} material={material} castShadow>
          <sphereGeometry args={[0.56, 28, 20]} />
        </mesh>
        <mesh position={[-0.24, 0.16, 0.08]} material={material} castShadow>
          <sphereGeometry args={[0.34, 20, 16]} />
        </mesh>
        <mesh position={[0.3, 0.1, -0.02]} material={material} castShadow>
          <sphereGeometry args={[0.38, 20, 16]} />
        </mesh>
      </group>

      <hemisphereLight intensity={1.35} color="#f4f3ee" groundColor="#aaa9a4" />
      <directionalLight
        position={[-3.5, 5.5, 4]}
        intensity={0.82}
        color="#dedcd5"
        castShadow
        shadow-radius={12}
        shadow-bias={-0.0004}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </group>
  )
}
