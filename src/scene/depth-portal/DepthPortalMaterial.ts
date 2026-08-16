import { ShaderMaterial, Vector2 } from 'three'
import type { DepthPortalTextures } from './DepthPortalAssets'
import type { DepthPortalConfig } from './depthPortalConfig'
import { depthPortalVertexShader } from './shaders/depthPortal.vert'
import { depthPortalFragmentShader } from './shaders/depthPortal.frag'

export interface DepthPortalFrameState {
  reveal: number
  parallax: number
  opacity: number
  viewOffset: Vector2
  depthScale: number
  maxParallax: number
}

export const createDepthPortalMaterial = (
  textures: DepthPortalTextures,
  config: DepthPortalConfig,
) => new ShaderMaterial({
  name: 'DepthPortalMaterial',
  transparent: true,
  depthTest: true,
  depthWrite: true,
  toneMapped: false,
  uniforms: {
    uColorMap: { value: textures.color },
    uDepthMap: { value: textures.depth },
    uReveal: { value: 0 },
    uDepthScale: { value: config.depthScale },
    uDepthGamma: { value: config.depthGamma },
    uViewOffset: { value: new Vector2() },
    uParallax: { value: 0 },
    uMaxUvOffset: { value: config.maxParallax },
    uEdgeFade: { value: config.edgeFade },
    uOpacity: { value: 0 },
  },
  vertexShader: depthPortalVertexShader,
  fragmentShader: depthPortalFragmentShader,
})

export const updateDepthPortalMaterial = (
  material: ShaderMaterial,
  frame: DepthPortalFrameState,
) => {
  material.uniforms.uReveal.value = frame.reveal
  material.uniforms.uParallax.value = frame.parallax
  material.uniforms.uOpacity.value = frame.opacity
  material.uniforms.uDepthScale.value = frame.depthScale
  material.uniforms.uMaxUvOffset.value = frame.maxParallax
  ;(material.uniforms.uViewOffset.value as Vector2).copy(frame.viewOffset)
}
