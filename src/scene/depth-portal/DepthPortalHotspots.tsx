import { useEffect } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useExperienceStore } from '../../store/experienceStore'
import type { DepthPortalConfig } from './depthPortalConfig'

interface DepthPortalHotspotsProps {
  config: DepthPortalConfig
  interactive: boolean
}

interface PortalHotspot {
  id: string
  center: [number, number]
  radius: number
}

const hotspots: PortalHotspot[] = [
  { id: 'trace-text', center: [0.5, 0.69], radius: 0.15 },
  { id: 'trace-detail', center: [0.37, 0.38], radius: 0.16 },
  { id: 'trace-video', center: [0.67, 0.49], radius: 0.15 },
]

const resolveHotspot = (x: number, y: number) => hotspots.find((hotspot) => {
  const deltaX = x - hotspot.center[0]
  const deltaY = y - hotspot.center[1]
  return Math.hypot(deltaX, deltaY) <= hotspot.radius
})

export function DepthPortalHotspots({ config, interactive }: DepthPortalHotspotsProps) {
  const setSelectedExploreItem = useExperienceStore((store) => store.setSelectedExploreItem)

  useEffect(() => () => {
    document.body.style.cursor = ''
  }, [])

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!interactive || !event.uv) return
    document.body.style.cursor = resolveHotspot(event.uv.x, event.uv.y) ? 'pointer' : ''
  }

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    if (!interactive || !event.uv) return
    const hotspot = resolveHotspot(event.uv.x, event.uv.y)
    if (!hotspot) return
    event.stopPropagation()
    setSelectedExploreItem(hotspot.id)
  }

  return (
    <mesh
      name="depth-portal-hotspots"
      position={[0, 0, 0.29]}
      visible={interactive}
      onPointerMove={handlePointerMove}
      onPointerOut={() => { document.body.style.cursor = '' }}
      onPointerDown={handlePointerDown}
      renderOrder={40}
    >
      <planeGeometry args={config.size} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
    </mesh>
  )
}
