import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'
import type { ShaderMaterial } from 'three'

export interface DepthPortalBlackoutHandle {
  updateOpacity: (opacity: number) => void
}

const blackoutVertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const blackoutFragmentShader = /* glsl */ `
  uniform float uOpacity;

  void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, uOpacity);
  }
`

export const DepthPortalBlackout = forwardRef<DepthPortalBlackoutHandle>(
  function DepthPortalBlackout(_, ref) {
    const material = useRef<ShaderMaterial>(null)
    const uniforms = useMemo(() => ({ uOpacity: { value: 0 } }), [])

    useImperativeHandle(ref, () => ({
      updateOpacity: (opacity) => {
        if (material.current) material.current.uniforms.uOpacity.value = opacity
      },
    }), [])

    return (
      <mesh name="depth-portal-screen-blackout" renderOrder={5} frustumCulled={false}>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={blackoutVertexShader}
          fragmentShader={blackoutFragmentShader}
          transparent
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    )
  },
)

