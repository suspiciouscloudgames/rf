import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  BackSide,
  ClampToEdgeWrapping,
  LinearFilter,
  SRGBColorSpace,
  ShaderMaterial,
  VideoTexture,
  type Group,
} from 'three'
import { useExperienceStore } from '../store/experienceStore'

const vertexShader = /* glsl */ `
  uniform sampler2D videoMap;
  uniform float displacement;
  uniform float uvOffset;
  varying vec2 vUv;
  varying float vLuma;

  void main() {
    vUv = vec2(fract(uv.x + uvOffset), uv.y);
    vec3 frame = texture2D(videoMap, vUv).rgb;
    vLuma = dot(frame, vec3(0.2126, 0.7152, 0.0722));

    vec3 transformed = position;
    vec2 radial = normalize(transformed.xz);
    float materialFold = sin(vUv.y * 46.0 + vUv.x * 12.0) * 0.035;
    transformed.xz -= radial * ((vLuma - 0.42) * displacement + materialFold * displacement);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D videoMap;
  uniform float opacity;
  uniform float layer;
  varying vec2 vUv;
  varying float vLuma;

  void main() {
    vec3 frame = texture2D(videoMap, vUv).rgb;
    float lifted = pow(clamp(vLuma, 0.0, 1.0), 1.28);
    vec3 monochrome = vec3(lifted);
    vec3 graded = mix(monochrome, frame, 0.32) * vec3(0.52, 0.64, 0.62);
    graded = mix(vec3(0.012, 0.026, 0.027), graded, 0.76);

    float layerAlpha = 1.0;
    if (layer > 0.5 && layer < 1.5) {
      layerAlpha = smoothstep(0.28, 0.68, vLuma) * 0.34;
      graded *= vec3(0.72, 0.93, 0.88);
    } else if (layer >= 1.5) {
      layerAlpha = smoothstep(0.66, 0.96, vLuma) * 0.2;
      graded *= vec3(0.92, 0.72, 0.5);
    }

    gl_FragColor = vec4(graded, opacity * layerAlpha);
  }
`

interface DepthLayer {
  radius: number
  displacement: number
  layer: number
  uvOffset: number
}

const depthLayers: DepthLayer[] = [
  { radius: 12.8, displacement: 0.38, layer: 0, uvOffset: 0 },
  { radius: 11.55, displacement: 0.9, layer: 1, uvOffset: -0.003 },
  { radius: 10.35, displacement: 1.3, layer: 2, uvOffset: 0.004 },
]

function createLayerMaterial(videoTexture: VideoTexture, config: DepthLayer) {
  return new ShaderMaterial({
    uniforms: {
      videoMap: { value: videoTexture },
      displacement: { value: config.displacement },
      uvOffset: { value: config.uvOffset },
      opacity: { value: 0 },
      layer: { value: config.layer },
    },
    vertexShader,
    fragmentShader,
    side: BackSide,
    transparent: true,
    depthWrite: false,
  })
}

export function HubVideoEnvironment() {
  const gl = useThree((view) => view.gl)
  const group = useRef<Group>(null)
  const opacity = useRef(0)
  const video = useMemo(() => {
    const element = document.createElement('video')
    element.src = '/assets/hub-background.mp4'
    element.loop = true
    element.muted = true
    element.playsInline = true
    element.preload = 'auto'
    element.crossOrigin = 'anonymous'
    return element
  }, [])
  const texture = useMemo(() => {
    const nextTexture = new VideoTexture(video)
    nextTexture.colorSpace = SRGBColorSpace
    nextTexture.minFilter = LinearFilter
    nextTexture.magFilter = LinearFilter
    nextTexture.wrapS = ClampToEdgeWrapping
    nextTexture.wrapT = ClampToEdgeWrapping
    return nextTexture
  }, [video])
  const materials = useMemo(
    () => depthLayers.map((config) => createLayerMaterial(texture, config)),
    [texture],
  )

  useEffect(() => {
    const tryPlay = () => void video.play().catch(() => undefined)
    tryPlay()
    window.addEventListener('pointerdown', tryPlay, { once: true, passive: true })
    return () => {
      window.removeEventListener('pointerdown', tryPlay)
      video.pause()
      video.removeAttribute('src')
      video.load()
      texture.dispose()
      materials.forEach((material) => material.dispose())
    }
  }, [materials, texture, video])

  useFrame(({ camera }, delta) => {
    const snapshot = useExperienceStore.getState()
    const transitionProgress = Number(camera.userData.transitionProgress ?? 0)
    let targetOpacity = snapshot.stage === 'hub' ? 0.78 : 0
    if (snapshot.transition === 'hubToApproach') targetOpacity = 0.78 * (1 - transitionProgress)
    if (snapshot.transition === 'returnToHub') targetOpacity = 0.78 * transitionProgress
    opacity.current += (targetOpacity - opacity.current) * Math.min(delta * 4.5, 1)

    materials.forEach((material) => {
      material.uniforms.opacity.value = opacity.current
    })
    if (group.current) {
      group.current.visible = opacity.current > 0.005
      group.current.rotation.y += delta * 0.0008
    }

    if (opacity.current > 0.01 && video.paused) void video.play().catch(() => undefined)
    if (opacity.current <= 0.01 && !video.paused) video.pause()
    gl.domElement.dataset.hubVideoState = video.paused ? 'paused' : 'playing'
    gl.domElement.dataset.hubVideoTime = video.currentTime.toFixed(2)
    gl.domElement.dataset.hubDepthLayers = String(depthLayers.length)
  })

  return (
    <group ref={group} name="hub-video-depth-environment" rotation={[0, -0.72, 0]}>
      {depthLayers.map((config, index) => (
        <mesh key={config.radius} material={materials[index]} renderOrder={-10 + index}>
          <cylinderGeometry args={[config.radius, config.radius, 10, 112, 36, true]} />
        </mesh>
      ))}
    </group>
  )
}
