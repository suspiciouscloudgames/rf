import { useEffect, useRef } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { ClampToEdgeWrapping, SRGBColorSpace, TextureLoader, type Group, type MeshBasicMaterial } from 'three'
import { useExperienceStore } from '../../store/experienceStore'
import { getDepthPortalFallbackUrl } from './DepthPortalAssets'
import { resolvePortalDarkness, resolvePortalProgress } from './depthPortalProgress'
import { DepthPortalHotspots } from './DepthPortalHotspots'
import type { DepthPortalConfig } from './depthPortalConfig'
import { useTuningStore } from '../../store/tuningStore'
import { DepthPortalBlackout, type DepthPortalBlackoutHandle } from './DepthPortalBlackout'

interface DepthPortalFallbackProps {
  config: DepthPortalConfig
}

export function DepthPortalFallback({ config }: DepthPortalFallbackProps) {
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const observationMode = useExperienceStore((store) => store.observationMode)
  const observationEntrySeconds = useTuningStore((store) => store.observationEntrySeconds)
  const approachToObservationSeconds = useTuningStore((store) => store.approachToObservationSeconds)
  const darkenSeconds = useTuningStore((store) => store.darkenSeconds)
  const setVisualStatus = useExperienceStore((store) => store.setObservationVisualStatus)
  const canvas = useThree((state) => state.gl.domElement)
  const portal = useRef<Group>(null)
  const portalVisuals = useRef<Group>(null)
  const material = useRef<MeshBasicMaterial>(null)
  const blackout = useRef<DepthPortalBlackoutHandle>(null)
  const texture = useLoader(TextureLoader, getDepthPortalFallbackUrl(config.assetId))

  useEffect(() => {
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = ClampToEdgeWrapping
    texture.wrapT = ClampToEdgeWrapping
    texture.needsUpdate = true
    setVisualStatus('fallback')
  }, [setVisualStatus, texture])
  useEffect(() => () => {
    delete canvas.dataset.depthPortalState
    delete canvas.dataset.depthPortalReveal
    delete canvas.dataset.depthPortalParallax
    delete canvas.dataset.depthPortalView
    delete canvas.dataset.blackoutLayerVisible
    delete canvas.dataset.blackoutMode
    delete canvas.dataset.blackoutOpacity
  }, [canvas])

  useFrame(({ camera, gl }) => {
    const progress = Number(camera.userData.transitionProgress ?? 0)
    const observationElapsed = Number(camera.userData.observationElapsed ?? 0)
    const frame = resolvePortalProgress(
      stage,
      transition,
      progress,
      observationElapsed,
      observationEntrySeconds,
      approachToObservationSeconds,
    )
    const darkness = resolvePortalDarkness(
      stage,
      transition,
      progress,
      observationElapsed,
      approachToObservationSeconds,
      darkenSeconds,
    )
    const layerVisible = frame.reveal > 0.001 || darkness > 0.001
    if (portal.current) portal.current.visible = layerVisible
    if (portalVisuals.current) portalVisuals.current.visible = frame.reveal > 0.001
    if (material.current) material.current.opacity = frame.reveal
    blackout.current?.updateOpacity(darkness)
    gl.domElement.dataset.depthPortalState = 'fallback'
    gl.domElement.dataset.depthPortalReveal = frame.reveal.toFixed(3)
    gl.domElement.dataset.depthPortalParallax = '0.000'
    gl.domElement.dataset.depthPortalView = '0.000,0.000'
    gl.domElement.dataset.sceneDarkness = darkness.toFixed(3)
    gl.domElement.dataset.blackoutLayerVisible = String(layerVisible)
    gl.domElement.dataset.blackoutMode = 'screen-space'
    gl.domElement.dataset.blackoutOpacity = darkness.toFixed(3)
  })

  return (
    <group
      ref={portal}
      name={`depth-portal-fallback-${config.assetId}`}
      position={config.position}
      rotation={config.rotation}
      visible={false}
    >
      <DepthPortalBlackout ref={blackout} />
      <group ref={portalVisuals} name="depth-portal-fallback-visuals" visible={false}>
        <mesh renderOrder={10}>
          <planeGeometry args={config.size} />
          <meshBasicMaterial
            ref={material}
            map={texture}
            transparent
            opacity={0}
            depthTest
            depthWrite
            toneMapped={false}
          />
        </mesh>
        <DepthPortalHotspots
          config={config}
          interactive={stage === 'observation' && transition === 'none' && observationMode === 'explore'}
        />
      </group>
    </group>
  )
}
