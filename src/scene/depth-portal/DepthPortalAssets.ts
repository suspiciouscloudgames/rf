import { useEffect } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import {
  ClampToEdgeWrapping,
  LinearFilter,
  NoColorSpace,
  SRGBColorSpace,
  TextureLoader,
  type Texture,
} from 'three'
import type { DepthPortalConfig } from './depthPortalConfig'

interface DepthPortalAssetPaths {
  color: string
  depth: string
  foregroundColor: string
  foregroundMask: string
  midgroundColor: string
  midgroundMask: string
  fallback: string
}

export interface DepthPortalTextures {
  color: Texture
  depth: Texture
  foregroundColor: Texture
  foregroundMask: Texture
  midgroundColor: Texture
  midgroundMask: Texture
}

const assetManifest: Record<DepthPortalConfig['assetId'], DepthPortalAssetPaths> = {
  'construction-space': {
    color: '/assets/depth-portal/construction-space/color.webp',
    depth: '/assets/depth-portal/construction-space/depth.png',
    foregroundColor: '/assets/depth-portal/construction-space/foreground-color.webp',
    foregroundMask: '/assets/depth-portal/construction-space/foreground-mask.png',
    midgroundColor: '/assets/depth-portal/construction-space/midground-color.webp',
    midgroundMask: '/assets/depth-portal/construction-space/midground-mask.png',
    fallback: '/assets/depth-portal/construction-space/fallback.webp',
  },
}

const portalTextureUrls = (assetId: DepthPortalConfig['assetId']) => {
  const paths = assetManifest[assetId]
  return [
    paths.color,
    paths.depth,
    paths.foregroundColor,
    paths.foregroundMask,
    paths.midgroundColor,
    paths.midgroundMask,
  ] as const
}

export const getDepthPortalFallbackUrl = (assetId: DepthPortalConfig['assetId']) =>
  assetManifest[assetId].fallback

export const preloadDepthPortalAssets = (assetId: DepthPortalConfig['assetId']) => {
  useLoader.preload(TextureLoader, [...portalTextureUrls(assetId)])
}

const configureDataTexture = (texture: Texture) => {
  texture.colorSpace = NoColorSpace
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
}

export function useDepthPortalTextures(assetId: DepthPortalConfig['assetId']): DepthPortalTextures {
  const maxAnisotropy = useThree((state) => state.gl.capabilities.getMaxAnisotropy())
  const [color, depth, foregroundColor, foregroundMask, midgroundColor, midgroundMask] = useLoader(
    TextureLoader,
    [...portalTextureUrls(assetId)],
  )

  useEffect(() => {
    color.colorSpace = SRGBColorSpace
    foregroundColor.colorSpace = SRGBColorSpace
    midgroundColor.colorSpace = SRGBColorSpace
    ;[color, foregroundColor, midgroundColor].forEach((texture) => {
      texture.wrapS = ClampToEdgeWrapping
      texture.wrapT = ClampToEdgeWrapping
      texture.anisotropy = Math.min(maxAnisotropy, 4)
      texture.needsUpdate = true
    })
    ;[depth, foregroundMask, midgroundMask].forEach(configureDataTexture)
  }, [color, depth, foregroundColor, foregroundMask, maxAnisotropy, midgroundColor, midgroundMask])

  return { color, depth, foregroundColor, foregroundMask, midgroundColor, midgroundMask }
}
