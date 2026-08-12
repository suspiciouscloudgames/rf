import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { DoubleSide, LinearFilter, SRGBColorSpace, TextureLoader, VideoTexture, type Group } from 'three'
import { useExperienceStore } from '../store/experienceStore'

export function ObservationLayer() {
  const state = useExperienceStore((store) => store.state)
  const effectActive = useExperienceStore((store) => store.effectActive)
  const group = useRef<Group>(null)
  const imageTexture = useLoader(TextureLoader, '/assets/observation-signal.jpg')
  const video = useMemo(() => {
    const element = document.createElement('video')
    element.src = '/assets/archive-signal.mp4'
    element.loop = true
    element.muted = true
    element.playsInline = true
    element.preload = 'auto'
    element.className = 'media-source'
    element.setAttribute('aria-hidden', 'true')
    return element
  }, [])
  const videoTexture = useMemo(() => {
    const texture = new VideoTexture(video)
    texture.colorSpace = SRGBColorSpace
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
    return texture
  }, [video])

  imageTexture.colorSpace = SRGBColorSpace

  useEffect(() => {
    document.body.appendChild(video)
    return () => video.remove()
  }, [video])

  useEffect(() => {
    if (state === 'observation') void video.play().catch(() => undefined)
    else {
      video.pause()
      video.currentTime = 0
    }
  }, [state, video])

  useEffect(() => () => {
    video.pause()
    videoTexture.dispose()
  }, [video, videoTexture])

  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.35) * 0.025
    const unstable = effectActive ? Math.sin(clock.elapsedTime * 17) * 0.025 : 0
    group.current.position.x = 0.23 + unstable
  })

  if (state !== 'observation' && state !== 'returning') return null

  return (
    <group ref={group} position={[0.23, 0.48, 0.82]} rotation={[0, -0.12, 0]}>
      <mesh position={[-0.12, 0.16, 0.02]} rotation={[0, 0.08, -0.03]}>
        <planeGeometry args={[1.45, 1.05]} />
        <meshBasicMaterial map={imageTexture} transparent opacity={effectActive ? 0.78 : 0.38} side={DoubleSide} />
      </mesh>
      <mesh position={[0.16, -0.08, 0.12]} rotation={[0, -0.04, 0.025]}>
        <planeGeometry args={[1.05, 0.59]} />
        <meshBasicMaterial map={videoTexture} transparent opacity={state === 'returning' ? 0.12 : 0.86} side={DoubleSide} />
      </mesh>
      <mesh position={[0.36, -0.44, 0.28]}>
        <icosahedronGeometry args={[0.18, 1]} />
        <meshStandardMaterial color="#e34227" emissive="#a72018" emissiveIntensity={2.4} wireframe />
      </mesh>
      <pointLight position={[0.1, 0, 0.4]} color="#ef5132" intensity={5} distance={2} />
    </group>
  )
}
