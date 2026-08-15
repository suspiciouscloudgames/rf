export const depthPortalFragmentShader = /* glsl */ `
  uniform sampler2D uColorMap;
  uniform vec2 uViewOffset;
  uniform float uParallax;
  uniform float uMaxUvOffset;
  uniform float uEdgeFade;
  uniform float uOpacity;

  varying vec2 vUv;
  varying float vDepth;

  float edgeMask(vec2 uv, float fade) {
    vec2 lower = smoothstep(vec2(0.0), vec2(fade), uv);
    vec2 upper = smoothstep(vec2(0.0), vec2(fade), vec2(1.0) - uv);
    return lower.x * lower.y * upper.x * upper.y;
  }

  void main() {
    vec2 limitedOffset = clamp(uViewOffset, vec2(-1.0), vec2(1.0));
    vec2 parallaxUv = vUv + limitedOffset * (1.0 - vDepth) * uMaxUvOffset * uParallax;
    float alpha = edgeMask(parallaxUv, uEdgeFade) * uOpacity;
    if (alpha <= 0.001) discard;

    vec3 color = texture2D(uColorMap, clamp(parallaxUv, vec2(0.0), vec2(1.0))).rgb;
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`
