import { Color, ShaderMaterial, Vector2 } from 'three'

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWaverAmount;
  uniform float uWaverScale;
  uniform float uWaverSpeed;
  uniform float uRippleAmount;
  uniform float uRippleRadius;
  uniform float uRippleAge;
  uniform vec2 uRippleOrigin;

  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldBase = modelMatrix * vec4(position, 1.0);
    float slowTime = uTime * uWaverSpeed;
    float organicWave = sin(worldBase.x * uWaverScale + slowTime)
      * cos(worldBase.z * (uWaverScale * 0.73) - slowTime * 0.81);
    organicWave += sin((worldBase.y + worldBase.x) * uWaverScale * 1.37 - slowTime * 0.62) * 0.45;

    float rippleDistance = distance(worldBase.xz, uRippleOrigin);
    float rippleEnvelope = smoothstep(uRippleRadius, 0.0, abs(rippleDistance - uRippleAge * 1.4));
    float ripple = sin(rippleDistance * 18.0 - uRippleAge * 11.0) * rippleEnvelope * uRippleAmount;
    vec3 displaced = position + normal * (organicWave * uWaverAmount + ripple);
    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);

    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uHighlightColor;
  uniform vec3 uShadowColor;
  uniform float uMonochromeMix;
  uniform float uOpacity;
  uniform float uReveal;
  uniform float uFilmFlicker;
  uniform float uFilmGrain;
  uniform float uTime;

  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  float random(vec2 value) {
    return fract(sin(dot(value, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec3 normal = normalize(vWorldNormal);
    float diffuse = dot(normal, normalize(vec3(-0.42, 0.8, 0.55))) * 0.5 + 0.5;
    float lowBand = smoothstep(0.08, 0.62, diffuse);
    float highBand = smoothstep(0.64, 0.96, diffuse);
    vec3 color = mix(uShadowColor, uBaseColor, lowBand);
    color = mix(color, uHighlightColor, highBand * 0.7);
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(color, vec3(luminance), uMonochromeMix);

    float frameTime = floor(uTime * 12.0) / 12.0;
    float grain = random(gl_FragCoord.xy + frameTime * 173.0) - 0.5;
    float flicker = (random(vec2(frameTime, 4.17)) - 0.5) * uFilmFlicker;
    color += grain * uFilmGrain + flicker;

    float revealFade = uReveal * uReveal * (3.0 - 2.0 * uReveal);
    gl_FragColor = vec4(max(color, 0.0), uOpacity * revealFade);
  }
`

export class MorphRoomMaterial extends ShaderMaterial {
  constructor(opacity: number) {
    super({
      uniforms: {
        uTime: { value: 0 },
        uBaseColor: { value: new Color('#66766b') },
        uHighlightColor: { value: new Color('#46e6dd') },
        uShadowColor: { value: new Color('#06133f') },
        uMonochromeMix: { value: 0.04 },
        uOpacity: { value: opacity },
        uReveal: { value: 0 },
        uWaverAmount: { value: 0 },
        uWaverScale: { value: 3.4 },
        uWaverSpeed: { value: 0 },
        uRippleAmount: { value: 0 },
        uRippleRadius: { value: 1.25 },
        uRippleAge: { value: 99 },
        uRippleOrigin: { value: new Vector2() },
        uFilmFlicker: { value: 0 },
        uFilmGrain: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    })
  }
}
