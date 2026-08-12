import { Canvas } from '@react-three/fiber'
import { CameraController } from '../camera/CameraController'
import { World } from './World'
import { HubOrbitController } from '../interaction/HubOrbitController'

export function ExperienceCanvas() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [4.8, 2.45, 6.4], fov: 38, near: 0.05, far: 40 }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      performance={{ min: 0.55 }}
    >
      <CameraController />
      <HubOrbitController />
      <World />
    </Canvas>
  )
}
