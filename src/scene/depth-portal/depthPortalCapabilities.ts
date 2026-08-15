import { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { useExperienceStore } from '../../store/experienceStore'

export interface DepthPortalCapabilities {
  reducedMotion: boolean
  vertexDisplacement: boolean
}

export function useDepthPortalCapabilities(): DepthPortalCapabilities {
  const gl = useThree((state) => state.gl)
  const setVisualStatus = useExperienceStore((store) => store.setObservationVisualStatus)
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReducedMotion(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const onContextLost = () => setVisualStatus('fallback')
    gl.domElement.addEventListener('webglcontextlost', onContextLost)
    return () => gl.domElement.removeEventListener('webglcontextlost', onContextLost)
  }, [gl, setVisualStatus])

  return {
    reducedMotion,
    vertexDisplacement: gl.capabilities.maxVertexTextures > 0,
  }
}
