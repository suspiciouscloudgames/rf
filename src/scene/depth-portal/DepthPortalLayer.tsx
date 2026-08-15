import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector2, type Group, type MeshBasicMaterial } from 'three'
import { useExperienceStore } from '../../store/experienceStore'
import { getDepthPortalConfig } from '../../signals/signalData'
import { useDepthPortalTextures } from './DepthPortalAssets'
import { DepthPortalCards, type DepthPortalCardsHandle } from './DepthPortalCards'
import { createDepthPortalMaterial, updateDepthPortalMaterial } from './DepthPortalMaterial'
import { DepthPortalMesh } from './DepthPortalMesh'
import type { DepthPortalConfig } from './depthPortalConfig'
import { DepthPortalHotspots } from './DepthPortalHotspots'
import { useDepthPortalCapabilities } from './depthPortalCapabilities'
import { DepthPortalFallback } from './DepthPortalFallback'
import { resolvePortalDarkness, resolvePortalProgress } from './depthPortalProgress'

interface ActiveDepthPortalProps {
  config: DepthPortalConfig
  reducedMotion: boolean
}

function ActiveDepthPortal({ config, reducedMotion }: ActiveDepthPortalProps) {
  const stage = useExperienceStore((store) => store.stage)
  const transition = useExperienceStore((store) => store.transition)
  const observationMode = useExperienceStore((store) => store.observationMode)
  const selectedExploreItemId = useExperienceStore((store) => store.selectedExploreItemId)
  const setVisualStatus = useExperienceStore((store) => store.setObservationVisualStatus)
  const canvas = useThree((state) => state.gl.domElement)
  const textures = useDepthPortalTextures(config.assetId)
  const portal = useRef<Group>(null)
  const cards = useRef<DepthPortalCardsHandle>(null)
  const matte = useRef<MeshBasicMaterial>(null)
  const viewOffset = useRef(new Vector2())
  const targetOffset = useRef(new Vector2())
  const material = useMemo(
    () => createDepthPortalMaterial(textures, config),
    [
      config,
      textures.color,
      textures.depth,
      textures.foregroundColor,
      textures.foregroundMask,
      textures.midgroundColor,
      textures.midgroundMask,
    ],
  )

  useEffect(() => () => material.dispose(), [material])
  useEffect(() => {
    setVisualStatus('ready')
  }, [setVisualStatus])
  useEffect(() => () => {
    delete canvas.dataset.depthPortalState
    delete canvas.dataset.depthPortalReveal
    delete canvas.dataset.depthPortalParallax
    delete canvas.dataset.depthPortalView
  }, [canvas])

  useFrame(({ camera, clock, gl, pointer }, delta) => {
    const transitionProgress = Number(camera.userData.transitionProgress ?? 0)
    const observationElapsed = Number(camera.userData.observationElapsed ?? 0)
    const frame = resolvePortalProgress(stage, transition, transitionProgress, observationElapsed)
    const darkness = resolvePortalDarkness(stage, transition, transitionProgress, observationElapsed)
    const canExplore = stage === 'observation'
      && transition === 'none'
      && observationMode === 'explore'
      && selectedExploreItemId === null
    if (reducedMotion) {
      targetOffset.current.set(0, 0)
    } else if (canExplore) {
      targetOffset.current.set(
        MathUtils.clamp(pointer.x, -0.85, 0.85),
        MathUtils.clamp(pointer.y, -0.72, 0.72),
      )
    } else if (stage === 'observation' && transition === 'none') {
      targetOffset.current.set(
        Math.sin(clock.elapsedTime * 0.34) * 0.16,
        Math.cos(clock.elapsedTime * 0.27) * 0.07,
      )
    } else if (transition === 'approachToObservation') {
      targetOffset.current.set(Math.sin(transitionProgress * Math.PI) * 0.08, 0)
    } else {
      targetOffset.current.set(0, 0)
    }
    viewOffset.current.x = MathUtils.damp(viewOffset.current.x, targetOffset.current.x, 5, delta)
    viewOffset.current.y = MathUtils.damp(viewOffset.current.y, targetOffset.current.y, 5, delta)
    if (portal.current) portal.current.visible = frame.reveal > 0.001
    if (matte.current) matte.current.opacity = darkness
    const effectiveParallax = reducedMotion ? 0 : frame.parallax
    updateDepthPortalMaterial(material, {
      reveal: frame.reveal,
      parallax: effectiveParallax,
      opacity: frame.reveal,
      viewOffset: viewOffset.current,
    })
    cards.current?.update({ reveal: frame.reveal, parallax: effectiveParallax, viewOffset: viewOffset.current })
    gl.domElement.dataset.depthPortalState = frame.reveal <= 0.001
      ? 'hidden'
      : frame.reveal < 0.999
        ? 'revealing'
        : 'active'
    gl.domElement.dataset.depthPortalReveal = frame.reveal.toFixed(3)
    gl.domElement.dataset.depthPortalParallax = effectiveParallax.toFixed(3)
    gl.domElement.dataset.depthPortalView = `${viewOffset.current.x.toFixed(3)},${viewOffset.current.y.toFixed(3)}`
    gl.domElement.dataset.sceneDarkness = darkness.toFixed(3)
  })

  return (
    <group
      ref={portal}
      name={`depth-portal-${config.assetId}`}
      position={config.position}
      rotation={config.rotation}
      visible={false}
    >
      <mesh name="depth-portal-matte" position={[0, 0, -0.025]} renderOrder={5}>
        <planeGeometry args={[14, 8]} />
        <meshBasicMaterial ref={matte} color="#000000" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <DepthPortalMesh config={config} material={material} />
      <DepthPortalCards ref={cards} config={config} textures={textures} />
      <DepthPortalHotspots
        config={config}
        interactive={stage === 'observation' && transition === 'none' && observationMode === 'explore'}
      />
    </group>
  )
}

export function DepthPortalLayer() {
  const selectedSignalId = useExperienceStore((store) => store.selectedSignalId)
  const visualStatus = useExperienceStore((store) => store.observationVisualStatus)
  const capabilities = useDepthPortalCapabilities()
  const config = getDepthPortalConfig(selectedSignalId)
  if (!config) return null
  if (visualStatus === 'fallback' || !capabilities.vertexDisplacement) {
    return <DepthPortalFallback config={config} />
  }
  return <ActiveDepthPortal config={config} reducedMotion={capabilities.reducedMotion} />
}
