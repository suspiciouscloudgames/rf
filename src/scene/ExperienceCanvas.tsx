import { Canvas } from '@react-three/fiber'
import { CameraController } from '../camera/CameraController'
import { World } from './World'
import { HubOrbitController } from '../interaction/HubOrbitController'

export function ExperienceCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [5.6, 5.1, 6.7], fov: 36, near: 0.05, far: 40 }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      performance={{ min: 0.55 }}
    >
      <CameraController />
      <HubOrbitController />
      <World />
    </Canvas>
  )
}
