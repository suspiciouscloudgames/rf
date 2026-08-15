export const depthPortalVertexShader = /* glsl */ `
  uniform sampler2D uDepthMap;
  uniform float uReveal;
  uniform float uDepthScale;
  uniform float uDepthGamma;

  varying vec2 vUv;
  varying float vDepth;

  void main() {
    vUv = uv;
    float sampledDepth = texture2D(uDepthMap, uv).r;
    vDepth = pow(clamp(sampledDepth, 0.0001, 1.0), uDepthGamma);

    vec3 displacedPosition = position;
    displacedPosition.z += (1.0 - vDepth) * uDepthScale * uReveal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
  }
`
