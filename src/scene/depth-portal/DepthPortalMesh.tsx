import type { ShaderMaterial } from 'three'
import type { DepthPortalConfig } from './depthPortalConfig'

interface DepthPortalMeshProps {
  config: DepthPortalConfig
  material: ShaderMaterial
}

export function DepthPortalMesh({ config, material }: DepthPortalMeshProps) {
  return (
    <mesh name="depth-portal-background" material={material} renderOrder={10}>
      <planeGeometry args={[config.size[0], config.size[1], 128, 224]} />
    </mesh>
  )
}
