import { Canvas, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { CameraController } from '../camera/CameraController'
import { World } from './World'
import { HubOrbitController } from '../interaction/HubOrbitController'
import { useRoomVisualModeStore } from '../store/roomVisualModeStore'

function CanvasModeDataset() {
  const mode = useRoomVisualModeStore((store) => store.mode)
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    gl.domElement.dataset.roomVisualMode = mode
  }, [gl, mode])

  return null
}

export function ExperienceCanvas() {
  const roomVisualMode = useRoomVisualModeStore((store) => store.mode)
  const dpr: [number, number] = roomVisualMode === 'morph' ? [0.65, 1] : [1, 1.5]

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [4.8, 2.45, 6.4], fov: 38, near: 0.05, far: 40 }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      performance={{ min: 0.55 }}
    >
      <CanvasModeDataset />
      <CameraController />
      <HubOrbitController />
      <World />
    </Canvas>
  )
}
