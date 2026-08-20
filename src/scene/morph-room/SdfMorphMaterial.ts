import { Color, DoubleSide, GLSL3, ShaderMaterial, Vector2, Vector3 } from 'three'

const vertexShader = /* glsl */ `
  varying vec3 vLocalPosition;

  void main() {
    vLocalPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform mat4 projectionMatrix;
  uniform mat4 modelViewMatrix;
  uniform vec3 uCameraLocal;
  uniform vec3 uBaseColor;
  uniform vec3 uHighlightColor;
  uniform vec3 uShadowColor;
  uniform float uMonochromeMix;
  uniform float uRoomOpacity;
  uniform float uPropOpacity;
  uniform float uReveal;
  uniform float uTime;
  uniform float uFilmGrain;
  uniform float uFilmFlicker;
  uniform float uFilmTemporalEnabled;
  uniform vec3 uFeaturePositions[4];
  uniform float uFeatureActivation[4];
  uniform float uFeatureRotation[4];
  uniform float uWaverAmount;
  uniform float uWaverScale;
  uniform float uWaverSpeed;
  uniform float uRippleAmount;
  uniform float uRippleRadius;
  uniform float uRippleAge;
  uniform vec2 uRippleOrigin;

  varying vec3 vLocalPosition;
  out vec4 fragColor;

  float sdBox(vec3 point, vec3 halfSize) {
    vec3 distanceToEdge = abs(point) - halfSize;
    return length(max(distanceToEdge, 0.0)) + min(max(distanceToEdge.x, max(distanceToEdge.y, distanceToEdge.z)), 0.0);
  }

  float sdRoundBox(vec3 point, vec3 halfSize, float radius) {
    vec3 distanceToEdge = abs(point) - halfSize + radius;
    return min(max(distanceToEdge.x, max(distanceToEdge.y, distanceToEdge.z)), 0.0)
      + length(max(distanceToEdge, 0.0)) - radius;
  }

  float sdEllipsoid(vec3 point, vec3 radius) {
    float firstLength = length(point / radius);
    float secondLength = length(point / (radius * radius));
    return firstLength * (firstLength - 1.0) / max(secondLength, 0.0001);
  }

  float smoothUnion(float firstDistance, float secondDistance, float blendRadius) {
    float blend = clamp(0.5 + 0.5 * (secondDistance - firstDistance) / blendRadius, 0.0, 1.0);
    return mix(secondDistance, firstDistance, blend) - blendRadius * blend * (1.0 - blend);
  }

  vec3 rotateAroundY(vec3 point, float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    return vec3(cosine * point.x - sine * point.z, point.y, sine * point.x + cosine * point.z);
  }

  float roomField(vec3 point) {
    float floorDistance = sdBox(point - vec3(0.0, -1.10, 0.0), vec3(1.72, 0.06, 1.18));
    float backDistance = sdBox(point - vec3(0.0, 0.0, -1.18), vec3(1.72, 1.10, 0.06));
    float leftDistance = sdBox(point - vec3(-1.72, 0.0, 0.0), vec3(0.06, 1.10, 1.18));
    return min(floorDistance, min(backDistance, leftDistance));
  }

  float tableField(vec3 point) {
    float activation = uFeatureActivation[0];
    vec3 localPoint = rotateAroundY(point - uFeaturePositions[0], -uFeatureRotation[0]);
    float top = sdRoundBox(
      localPoint - vec3(0.0, 0.38 * activation, 0.0),
      vec3(0.58, mix(0.025, 0.10, activation), 0.36),
      0.11
    );
    float root = sdEllipsoid(
      localPoint - vec3(0.0, 0.14 * activation, 0.0),
      vec3(0.50, mix(0.035, 0.22, activation), 0.32)
    );
    float leftChair = sdRoundBox(
      localPoint - vec3(-0.82, 0.25 * activation, 0.0),
      vec3(0.26, mix(0.025, 0.28, activation), 0.29),
      0.16
    );
    float rightChair = sdRoundBox(
      localPoint - vec3(0.82, 0.25 * activation, 0.0),
      vec3(0.26, mix(0.025, 0.28, activation), 0.29),
      0.16
    );
    float result = smoothUnion(top, root, 0.16);
    result = smoothUnion(result, leftChair, 0.13);
    return smoothUnion(result, rightChair, 0.13);
  }

  float phoneField(vec3 point) {
    float activation = uFeatureActivation[1];
    vec3 localPoint = rotateAroundY(point - uFeaturePositions[1], -uFeatureRotation[1]);
    float root = sdEllipsoid(
      localPoint - vec3(0.0, 0.12 * activation, 0.0),
      vec3(0.34, mix(0.03, 0.18, activation), 0.31)
    );
    float body = sdRoundBox(
      localPoint - vec3(0.0, 0.48 * activation, 0.0),
      vec3(0.22, mix(0.02, 0.49, activation), 0.15),
      0.12
    );
    return smoothUnion(root, body, 0.14);
  }

  float columnField(vec3 point) {
    float activation = uFeatureActivation[2];
    vec3 localPoint = rotateAroundY(point - uFeaturePositions[2], -uFeatureRotation[2]);
    float root = sdEllipsoid(
      localPoint - vec3(0.0, 0.12 * activation, 0.0),
      vec3(0.42, mix(0.035, 0.19, activation), 0.40)
    );
    float body = sdRoundBox(
      localPoint - vec3(0.0, 0.58 * activation, 0.0),
      vec3(0.28, mix(0.025, 0.62, activation), 0.28),
      0.17
    );
    return smoothUnion(root, body, 0.17);
  }

  float wallReliefField(vec3 point) {
    float activation = uFeatureActivation[3];
    vec3 localPoint = point - uFeaturePositions[3];
    float reliefIndex = clamp(floor(localPoint.x / 0.46 + 0.5), -2.5, 2.5);
    localPoint.x -= reliefIndex * 0.46;
    localPoint.y -= sin((reliefIndex + 2.5) * 1.7) * 0.065;
    localPoint.z -= 0.09 * activation;
    return sdRoundBox(
      localPoint,
      vec3(0.16, 0.21, mix(0.012, 0.075, activation)),
      0.09
    );
  }

  vec2 sceneField(vec3 point) {
    float waveTime = uTime * uWaverSpeed;
    float roomDistance = roomField(point);
    float featureDistance = tableField(point);
    featureDistance = smoothUnion(featureDistance, phoneField(point), 0.10);
    featureDistance = smoothUnion(featureDistance, columnField(point), 0.11);
    featureDistance = smoothUnion(featureDistance, wallReliefField(point), 0.07);
    float combinedDistance = smoothUnion(roomDistance, featureDistance, 0.15);
    float fieldWave = sin((point.x + point.z * 0.67) * uWaverScale + waveTime)
      * cos((point.y - point.z * 0.38) * uWaverScale * 0.73 - waveTime * 0.71);
    combinedDistance += fieldWave * uWaverAmount;
    float rippleDistance = distance(point.xz, uRippleOrigin);
    float rippleFront = abs(rippleDistance - uRippleAge * 1.35);
    float rippleEnvelope = smoothstep(uRippleRadius, 0.0, rippleFront) * exp(-uRippleAge * 0.55);
    combinedDistance -= sin(rippleDistance * 17.0 - uRippleAge * 10.0) * rippleEnvelope * uRippleAmount;
    float featureInfluence = 1.0 - smoothstep(-0.10, 0.12, featureDistance - roomDistance);
    return vec2(combinedDistance, featureInfluence);
  }

  vec3 estimateNormal(vec3 point) {
    const float epsilon = 0.0035;
    const vec2 direction = vec2(1.0, -1.0) * 0.5773 * epsilon;
    return normalize(
      direction.xyy * sceneField(point + direction.xyy).x
      + direction.yyx * sceneField(point + direction.yyx).x
      + direction.yxy * sceneField(point + direction.yxy).x
      + direction.xxx * sceneField(point + direction.xxx).x
    );
  }

  float ambientOcclusion(vec3 point, vec3 normal) {
    float occlusion = 0.0;
    float weight = 1.0;
    for (int sampleIndex = 1; sampleIndex <= 3; sampleIndex += 1) {
      float distanceAlongNormal = 0.045 * float(sampleIndex);
      float sampledDistance = sceneField(point + normal * distanceAlongNormal).x;
      occlusion += max(distanceAlongNormal - sampledDistance, 0.0) * weight;
      weight *= 0.52;
    }
    return clamp(1.0 - occlusion * 2.35, 0.28, 1.0);
  }

  float random(vec2 value) {
    return fract(sin(dot(value, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec3 rayDirection = normalize(vLocalPosition - uCameraLocal);
    vec3 point = vLocalPosition + rayDirection * 0.002;
    bool hit = false;

    for (int stepIndex = 0; stepIndex < 48; stepIndex += 1) {
      float distanceToSurface = sceneField(point).x;
      if (distanceToSurface < 0.004) {
        hit = true;
        break;
      }
      point += rayDirection * max(distanceToSurface * 0.88, 0.0018);
      if (abs(point.x) > 1.9 || point.y < -1.36 || point.y > 1.36 || point.z < -1.38 || point.z > 1.42) break;
    }

    if (!hit) discard;

    vec3 normal = estimateNormal(point);
    float occlusion = ambientOcclusion(point, normal);
    float diffuse = dot(normal, normalize(vec3(-0.45, 0.82, 0.38))) * 0.5 + 0.5;
    vec3 color = mix(uShadowColor, uBaseColor, smoothstep(0.08, 0.72, diffuse));
    color = mix(color, uHighlightColor, smoothstep(0.70, 1.0, diffuse) * 0.65);
    color *= mix(0.58, 1.0, occlusion);
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(color, vec3(luminance), uMonochromeMix);

    float frameTime = floor(uTime * 12.0) / 12.0 * uFilmTemporalEnabled;
    float grain = random(gl_FragCoord.xy + frameTime * 149.0) - 0.5;
    float flicker = (random(vec2(frameTime, 7.31)) - 0.5) * uFilmFlicker;
    color += grain * uFilmGrain + flicker;

    vec4 clipPosition = projectionMatrix * modelViewMatrix * vec4(point, 1.0);
    gl_FragDepth = clipPosition.z / clipPosition.w * 0.5 + 0.5;
    float revealFade = uReveal * uReveal * (3.0 - 2.0 * uReveal);
    float featureInfluence = sceneField(point).y;
    float tunedOpacity = mix(uRoomOpacity, uPropOpacity, featureInfluence);
    float opacity = mix(0.42, 0.98, tunedOpacity) * revealFade;
    fragColor = vec4(max(color, 0.0), opacity);
  }
`

export class SdfMorphMaterial extends ShaderMaterial {
  constructor() {
    super({
      glslVersion: GLSL3,
      uniforms: {
        uCameraLocal: { value: new Vector3(0, 0, 4) },
        uBaseColor: { value: new Color('#66766b') },
        uHighlightColor: { value: new Color('#46e6dd') },
        uShadowColor: { value: new Color('#06133f') },
        uMonochromeMix: { value: 0.04 },
        uRoomOpacity: { value: 0.2 },
        uPropOpacity: { value: 0.66 },
        uReveal: { value: 0 },
        uTime: { value: 0 },
        uFilmGrain: { value: 0.04 },
        uFilmFlicker: { value: 0 },
        uFilmTemporalEnabled: { value: 1 },
        uFeaturePositions: {
          value: [
            new Vector3(-0.58, -1.04, 0.06),
            new Vector3(1.02, -1.04, 0.48),
            new Vector3(1.22, -1.04, -0.48),
            new Vector3(0, 0.42, -1.13),
          ],
        },
        uFeatureActivation: { value: [1, 1, 1, 1] },
        uFeatureRotation: { value: [0, 0, 0, 0] },
        uWaverAmount: { value: 0 },
        uWaverScale: { value: 3.4 },
        uWaverSpeed: { value: 0 },
        uRippleAmount: { value: 0 },
        uRippleRadius: { value: 1.25 },
        uRippleAge: { value: 99 },
        uRippleOrigin: { value: new Vector2() },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: true,
      depthTest: true,
      side: DoubleSide,
      toneMapped: false,
    })
  }
}
