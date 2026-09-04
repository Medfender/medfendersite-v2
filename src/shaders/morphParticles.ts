// morphParticles.ts
// Raw GLSL shader strings — imported as ESM string exports.
// Kept separate from component logic for easy editing.

export const vertexShader = /* glsl */`
precision highp float;

uniform float uTime;
uniform float uScroll;
uniform vec2  uMouse;
uniform float uAudioLow;
uniform float uAudioMid;
uniform float uAudioHigh;

attribute vec3 positionA;
attribute vec3 positionB;
attribute vec3 positionC;

varying vec3  vColor;
varying float vAlpha;

void main() {
  float t = clamp(uScroll, 0.0, 1.0);

  // Morph: Waveform (A) -> Vinyl (B) -> Nebula (C)
  float blendAB = smoothstep(0.15, 0.42, t);
  float blendBC = smoothstep(0.58, 0.85, t);

  vec3 pos = mix(positionA, positionB, blendAB);
  pos = mix(pos, positionC, blendBC);

  // Audio-reactive multiplicative displacement
  float bassPump  = 1.0 + uAudioLow  * 0.45 * sin(pos.y * 7.0  + uTime * 2.1);
  float midPulse  = 1.0 + uAudioMid  * 0.25 * sin(pos.x * 11.0 + uTime * 3.3);
  float highSpark = 1.0 + uAudioHigh * 0.12 * sin(pos.z * 15.0 + uTime * 4.7);
  pos *= bassPump * midPulse * highSpark;

  // GPU mouse repulsion (smoothstep spring-back)
  vec2 mouseNDC = uMouse * 2.0 - 1.0;
  vec2 particleScreen = pos.xy * 0.6;
  vec2 toMouse = particleScreen - mouseNDC;
  float dist = length(toMouse);
  float repulsion = smoothstep(0.45, 0.0, dist);
  vec2 repulseDir = normalize(toMouse + vec2(0.0001));
  pos.xy += repulseDir * repulsion * 0.35;

  // ── BRIGHT VISIBILITY COLORS ──────────────────────────────────────────────
  float energy = (uAudioLow + uAudioMid + uAudioHigh) * 0.33;
  vec3 cyanAccent = vec3(0.0,   0.90,  0.80);   // bright teal #00E6CC
  vec3 goldAccent = vec3(0.90,  0.73,  0.00);   // bright gold #E6B800
  vec3 whiteHot   = vec3(1.0,   1.0,   1.0);    // white highlight

  // Mix cyan -> gold -> white based on position + audio
  float mixT = clamp(length(pos) * 0.08 + energy * 0.6, 0.0, 1.0);
  vec3 col = mix(cyanAccent, goldAccent, mixT);
  col = mix(col, whiteHot, clamp(energy * 2.0, 0.0, 0.7));
  vColor = col;

  vAlpha = clamp(1.0 - repulsion * 0.4, 0.0, 1.0) * 0.92;

  // ── EXPLICIT POINT SIZE ────────────────────────────────────────────────────
  // Each particle renders as gl_PointCoord disc in frag shader.
  // Base size 4.0px, scaled by audio energy for visual pulse.
  float baseSize = 4.0 + uAudioLow * 3.0 + uAudioMid * 2.0 + uAudioHigh * 1.5;
  gl_PointSize = baseSize;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const fragmentShader = /* glsl */`
precision highp float;

varying vec3  vColor;
varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);

  // Circular disc with sharp edge
  float disc = smoothstep(0.5, 0.30, dist);
  if (disc < 0.01) discard;

  // Bright additive glow in the center
  float glow = smoothstep(0.5, 0.0, dist);
  vec3 col = vColor + glow * 0.5;

  gl_FragColor = vec4(col, disc * vAlpha);
}
`;
