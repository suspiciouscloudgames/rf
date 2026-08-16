import { forwardRef, useImperativeHandle, useRef } from 'react'
import { type Group, type MeshBasicMaterial, type Vector2 } from 'three'
import type { DepthPortalTextures } from './DepthPortalAssets'
import type { DepthPortalConfig } from './depthPortalConfig'

export interface DepthPortalCardsFrame {
  reveal: number
  parallax: number
  viewOffset: Vector2
  layerDepth: number
  maxParallax: number
}

export interface DepthPortalCardsHandle {
  update: (frame: DepthPortalCardsFrame) => void
}

interface DepthPortalCardsProps {
  config: DepthPortalConfig
  textures: DepthPortalTextures
}

export const DepthPortalCards = forwardRef<DepthPortalCardsHandle, DepthPortalCardsProps>(
  function DepthPortalCards({ config, textures }, ref) {
    const midground = useRef<Group>(null)
    const foreground = useRef<Group>(null)
    const midgroundMaterial = useRef<MeshBasicMaterial>(null)
    const foregroundMaterial = useRef<MeshBasicMaterial>(null)

    useImperativeHandle(ref, () => ({
      update: ({ reveal, parallax, viewOffset, layerDepth, maxParallax }) => {
        const horizontalShift = config.size[0] * maxParallax * viewOffset.x * parallax
        const verticalShift = config.size[1] * maxParallax * viewOffset.y * parallax
        if (midground.current) {
          midground.current.position.z = layerDepth * 0.45
          midground.current.position.x = horizontalShift * 0.42
          midground.current.position.y = verticalShift * 0.14
        }
        if (foreground.current) {
          foreground.current.position.z = layerDepth
          foreground.current.position.x = horizontalShift * 1.15
          foreground.current.position.y = verticalShift * 0.42
        }
        if (midgroundMaterial.current) midgroundMaterial.current.opacity = reveal
        if (foregroundMaterial.current) foregroundMaterial.current.opacity = reveal
      },
    }), [config.size])

    return (
      <>
        <group ref={midground} name="depth-portal-midground" position={[0, 0, 0.1]}>
          <mesh renderOrder={20}>
            <planeGeometry args={config.size} />
            <meshBasicMaterial
              ref={midgroundMaterial}
              map={textures.midgroundColor}
              alphaMap={textures.midgroundMask}
              transparent
              alphaTest={0.02}
              opacity={0}
              depthTest
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
        <group ref={foreground} name="depth-portal-foreground" position={[0, 0, 0.22]}>
          <mesh renderOrder={30}>
            <planeGeometry args={config.size} />
            <meshBasicMaterial
              ref={foregroundMaterial}
              map={textures.foregroundColor}
              alphaMap={textures.foregroundMask}
              transparent
              alphaTest={0.025}
              opacity={0}
              depthTest
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      </>
    )
  },
)
