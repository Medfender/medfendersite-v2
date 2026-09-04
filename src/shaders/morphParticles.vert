// morphParticles.vert
// GPU-driven 3-shape morph with audio + mouse interactions.
// Three position attributes (A=waveform, B=vinyl, C=nebula) are interpolated
// in the vertex shader. All position math is GPU-side — JS never touches
// geometry attributes per frame.

precision highp float;

uniform float uTime;
uniform float uScroll;
uniform vec2  uMouse;       // [0,1] normalized screen coords
uniform float uAudioLow;
uniform float uAudioMid;
uniform float uAudioHigh;

attribute vec3 positionA;  // waveform grid
attribute vec3 positionB;  // vinyl record
attribute vec3 positionC;  // nebula sphere

varying vec3  vColor;
varying float vAlpha;

void main() {
  // --- Morph interpolation with smoothstep easing ---
  float t = clamp(uScroll, 0.0, 1.0);

  // Waveform -> Vinyl: 0.0 - 0.33
  float blendAB = smoothstep(0.15, 0.42, t);
  // Vinyl -> Nebula: 0.33 - 0.66
  float blendBC = smoothstep(0.58, 0.85, t);

  vec3 pos = mix(positionA, positionB, blendAB);
  pos = mix(pos, positionC, blendBC);

  // --- Audio-reactive displacement (multiplicative pulse) ---
  float bassPump  = 1.0 + uAudioLow  * 0.45 * sin(pos.y * 7.0  + uTime * 2.1);
  float midPulse  = 1.0 + uAudioMid  * 0.25 * sin(pos.x * 11.0 + uTime * 3.3);
  float highSpark = 1.0 + uAudioHigh * 0.12 * sin(pos.z * 15.0 + uTime * 4.7);
  pos *= bassPump * midPulse * highSpark;

  // --- Mouse repulsion (smoothstep, springs back when mouse leaves) ---
  // uMouse is [0,1]; convert to [-1,1] NDC
  vec2 mouseNDC = uMouse * 2.0 - 1.0;
  // Project particle XY into a normalized space comparable to the mouse
  vec2 particleScreen = pos.xy * 0.6;
  vec2 toMouse = particleScreen - mouseNDC;
  float dist = length(toMouse);
  float repulsion = smoothstep(0.45, 0.0, dist);
  vec2 repulseDir = normalize(toMouse + vec2(0.0001));
  pos.xy += repulseDir * repulsion * 0.35;

  // --- Color gradient based on radial distance + audio energy ---
  float energy = (uAudioLow + uAudioMid + uAudioHigh) * 0.33;
  vec3 darkBase   = vec3(0.043, 0.059, 0.098);  // #0b0f19
  vec3 cyanAccent = vec3(0.0,   0.847, 0.965);  // #00d8f6
  vec3 goldAccent = vec3(0.961, 0.784, 0.259);  // #f5c842

  float radial = length(pos) * 0.08;
  vec3 col = mix(darkBase, cyanAccent, radial);
  col = mix(col, goldAccent, clamp(energy * 1.8 + pos.z * 0.15, 0.0, 0.6));
  vColor = col;

  // Alpha fades particles that are being pushed hard by the mouse
  vAlpha = clamp(1.0 - repulsion * 0.4, 0.0, 1.0) * 0.92;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
