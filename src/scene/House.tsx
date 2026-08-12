import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { useExperienceStore } from '../store/experienceStore'

const windowPositions: Array<[number, number, number]> = [
  [-0.82, 0.3, 0.66], [-0.28, 0.3, 0.66], [0.28, 0.3, 0.66], [0.82, 0.3, 0.66],
  [-0.82, -0.28, 0.66], [-0.28, -0.28, 0.66], [0.28, -0.28, 0.66], [0.82, -0.28, 0.66],
]

function SignalBeacon() {
  const state = useExperienceStore((store) => store.state)
  const isTransitioning = useExperienceStore((store) => store.isTransitioning)
  const ring = useRef<Mesh>(null)
  const active = (state === 'hub' || state === 'approach') && !isTransitioning

  useFrame(({ clock }) => {
    if (!ring.current) return
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.11
    ring.current.scale.setScalar(pulse)
    ring.current.rotation.z += 0.003
  })

  if (!active) return null

  return (
    <group position={[1.06, 0.42, 0.72]}>
      <mesh ref={ring}>
        <torusGeometry args={[0.18, 0.012, 8, 48]} />
        <meshBasicMaterial color="#df9347" transparent opacity={0.88} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.065, 1]} />
        <meshBasicMaterial color="#ffd07f" wireframe />
      </mesh>
      <pointLight intensity={3} distance={1.3} color="#f5a04f" />
    </group>
  )
}

export function House() {
  const group = useRef<Group>(null)
  const state = useExperienceStore((store) => store.state)
  const dimmed = state === 'observation' || state === 'returning'

  useFrame((_, delta) => {
    if (!group.current) return
    const speed = state === 'hub' ? 0.012 : state === 'approach' ? 0.005 : 0.003
    group.current.rotation.y += delta * speed
    group.current.position.y = Math.sin(performance.now() * 0.00015) * 0.018
  })

  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh position={[0, -0.12, 0]} castShadow>
        <boxGeometry args={[2.5, 1.75, 1.35]} />
        <meshStandardMaterial
          color={dimmed ? '#252a29' : '#87867e'}
          roughness={0.92}
          metalness={0.08}
          transparent
          opacity={dimmed ? 0.12 : 1}
          depthWrite={!dimmed}
        />
      </mesh>
      <mesh position={[0, 1.05, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.72, 0.92, 4]} />
        <meshStandardMaterial
          color={dimmed ? '#1a1e1d' : '#4a4b47'}
          roughness={0.95}
          transparent
          opacity={dimmed ? 0.1 : 1}
          depthWrite={!dimmed}
        />
      </mesh>
      <mesh position={[0, -0.53, 0.69]}>
        <planeGeometry args={[0.35, 0.85]} />
        <meshStandardMaterial color="#151818" roughness={0.9} />
      </mesh>
      {windowPositions.map((position, index) => (
        <mesh key={index} position={position}>
          <planeGeometry args={[0.26, 0.28]} />
          <meshStandardMaterial
            color={index === 6 ? '#f2a24d' : '#192425'}
            emissive={index === 6 ? '#d26c26' : '#071010'}
            emissiveIntensity={index === 6 ? 2.1 : 0.6}
          />
        </mesh>
      ))}
      <mesh position={[0, -1.02, 0]}>
        <cylinderGeometry args={[1.65, 1.82, 0.12, 6]} />
        <meshStandardMaterial color="#272a29" roughness={1} />
      </mesh>
      <SignalBeacon />
    </group>
  )
}
