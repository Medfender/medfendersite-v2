'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

/**
 * Spiral Galaxy Background v3 — "Galactic Depth, Polished"
 *
 *   Layer 1 — Stellar Disk     85,000 particles
 *     · 3-arm logarithmic spiral
 *     · Depth attenuation: size & opacity scale with Z-depth (volumetric feel)
 *     · Per-vertex simplex-ish noise offsets for organic orbital motion
 *     · aTwinkle attribute: per-particle sine-wave pulse on size
 *     · Softer blowout (alpha cut ~35%) — never washes out hero text
 *
 *   Layer 2 — Event-Horizon Core
 *     · Dark central sphere (Schwarzschild feeling)
 *     · Multi-layer accretion halo (3 falloff layers)
 *     · Gentle opacity pulse, soft radial falloff — no hard ring
 *
 *   Layer 3 — Micro-Dust     (revealed at scroll depth > 0.25)
 *     · 4,000 fine dust motes, sphere-distributed, parallax with scroll
 *
 *   Layer 4 — Orbital Rings   (revealed at scroll depth > 0.45)
 *     · 2 thin tilted rings, additive cyan/violet, opacity ramps with depth
 *
 *   Layer 5 — Scroll-Driven Camera
 *     · Camera Z interpolated from 22 (hero) → 8 (deep in spiral)
 *     · Smoothed with critically-damped spring (no jitter on rapid scroll)
 *
 *   Layer 6 — Parallax
 *     · Heavy cinematic mouse inertia on the disc (THREE.MathUtils.damp λ=0.04)
 *
 *   Layer 7 — CSS Vignette
 *     · Radial dark mask overlaid on the hero region for text legibility
 *
 * Mounted once in src/app/layout.tsx. pointer-events: none always.
 */

const STELLAR_COUNT     = 85_000;
const DUST_COUNT        = 4_000;
const ARMS              = 3;
const SPIN_FACTOR       = 0.62;
const DISC_RADIUS       = 9.5;
const BULGE_RADIUS      = 2.6;
const CAMERA_START_Z    = 22;
const CAMERA_END_Z      = 8;
const SCROLL_SECTION_1  = 0.25;   // reveal micro-dust
const SCROLL_SECTION_2  = 0.45;   // reveal orbital rings

/* ═══════════════════════════════════════════════════════════════════════
   STELLAR DISK — VERTEX SHADER
   · depth attenuation: z-aware size + opacity
   · organic simplex-ish 3D noise offset for orbital wobble
═══════════════════════════════════════════════════════════════════════ */
const STELLAR_VERT = /* glsl */ `
  attribute float aScale;
  attribute float aArmIndex;
  attribute float aRadius;
  attribute vec3  aColor;
  attribute float aCoreWeight;   // 1=core star, 0=outer
  attribute float aTwinkle;      // random phase [0, 2π]
  attribute vec3  aNoiseSeed;    // per-particle pseudo-random vector

  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;

  varying vec3  vColor;
  varying float vT;            // normalized radial position 0=core, 1=outer
  varying float vCoreWeight;
  varying vec3  vPosition;     // model-space pos, passed to fragment for core blowout
  varying float vDepth01;      // 0 = near, 1 = far (post-projection depth)

  // ── Cheap hash + value-noise (no external libs) ─────────────────────
  float hash31(vec3 p) {
    p = fract(p * vec3(443.8975, 397.2973, 491.1871));
    p += dot(p, p.yxz + 19.19);
    return fract((p.x + p.y) * p.z);
  }
  float vnoise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);          // smoothstep
    float n000 = hash31(i + vec3(0,0,0));
    float n100 = hash31(i + vec3(1,0,0));
    float n010 = hash31(i + vec3(0,1,0));
    float n110 = hash31(i + vec3(1,1,0));
    float n001 = hash31(i + vec3(0,0,1));
    float n101 = hash31(i + vec3(1,0,1));
    float n011 = hash31(i + vec3(0,1,1));
    float n111 = hash31(i + vec3(1,1,1));
    float nx00 = mix(n000, n100, f.x);
    float nx10 = mix(n010, n110, f.x);
    float nx01 = mix(n001, n101, f.x);
    float nx11 = mix(n011, n111, f.x);
    float nxy0 = mix(nx00, nx10, f.y);
    float nxy1 = mix(nx01, nx11, f.y);
    return mix(nxy0, nxy1, f.z);          // [0,1]
  }

  void main() {
    vColor      = aColor;
    vT          = clamp(aRadius / ${DISC_RADIUS.toFixed(8)}, 0.0, 1.0);
    vCoreWeight = aCoreWeight;

    // ── Twinkle: per-particle sine pulse on size ───────────────────────
    float twinkleAmp = 0.06 + aCoreWeight * 0.18;
    float twinkle    = 1.0 + sin(uTime * 2.0 + aTwinkle) * twinkleAmp;
    float flare      = sin(uTime * 7.3 + aTwinkle * 3.1) * 0.025 * aCoreWeight;
    float sizeScale  = (twinkle + flare) * aScale;

    // ── Organic volumetric wobble ─────────────────────────────────────
    // Sample value-noise at low frequency × per-particle seed → each star
    // orbits on its own noisy vector field instead of a rigid circle.
    float nT = uTime * 0.18;
    vec3  np = position * 0.55 + aNoiseSeed + vec3(0.0, 0.0, nT);
    float nx = vnoise3(np)                       - 0.5;
    float ny = vnoise3(np + vec3(13.7, 4.1, 9.3)) - 0.5;
    float nz = vnoise3(np + vec3(7.3, 19.7, 2.5)) - 0.5;
    float wobbleAmp = 0.35 + aCoreWeight * 0.6;   // core stars wobble more
    vec3  wobble    = vec3(nx, ny, nz) * wobbleAmp;

    vec3 displaced = position + wobble;
    vPosition = displaced;

    // ── Projection ───────────────────────────────────────────────────
    vec4 mvPos = modelViewMatrix * vec4(displaced, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // ── Depth attenuation: closer = bigger & brighter, farther = dim
    // mvPos.z is negative in front of camera (Three.js convention)
    float depth = clamp(-mvPos.z, 1.0, 80.0);
    float depthNear01 = 1.0 - smoothstep(1.0, 60.0, depth);   // 0=far, 1=near
    vDepth01 = 1.0 - depthNear01;                             // 0=near, 1=far

    float base = uSize * sizeScale;
    gl_PointSize = clamp(base * uPixelRatio / depth * (0.7 + depthNear01 * 0.6), 0.4, 7.0);
  }
`;

const STELLAR_FRAG = /* glsl */ `
  varying vec3  vColor;
  varying float vT;
  varying float vCoreWeight;
  varying vec3  vPosition;
  varying float vDepth01;

  void main() {
    // ── Soft radial glow (circular, no square pixels) ───────────────
    float r       = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    float strength = pow(1.0 - r * 2.0, 2.4);
    if (strength < 0.012) discard;

    // ── Core blowout: incandescent center ────────────────────────────
    float dist2D  = length(vPosition.xy);
    float blowout = 1.0 - smoothstep(0.0, 1.5, dist2D);
    blowout       = pow(blowout, 2.8);

    vec3 hotCore  = vec3(1.00, 0.96, 0.88);
    vec3 col      = mix(vColor, hotCore, blowout * 0.7);
    col += hotCore * vCoreWeight * blowout * 0.45;

    // ── Alpha: opacity reduced ~35% vs v2; depth fade-out ───────────
    float baseAlpha = strength * (0.58 - vT * 0.30);
    float depthFade = mix(1.0, 0.45, vDepth01);    // far stars dimmer
    float alpha     = baseAlpha * depthFade;
    gl_FragColor    = vec4(col * strength * 0.85, alpha);
  }
`;

/* ═══════════════════════════════════════════════════════════════════════
   EVENT-HORIZON CORE — VERTEX / FRAGMENT
   Layered accretion halo + dark core, no hard ring edges.
═══════════════════════════════════════════════════════════════════════ */
const CORE_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;
  void main() {
    vNormal   = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir  = normalize(-mvPos.xyz);
    vLocalPos = position;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const CORE_FRAG = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;
  uniform float uTime;

  void main() {
    // ── Fresnel: rim glow for accretion corona ───────────────────────
    float fres = 1.0 - abs(dot(vNormal, vViewDir));
    fres = pow(fres, 1.4);

    // ── Multi-layer halo falloff (3 nested rings of decreasing power) ─
    // layer 1: outer wide corona, gentle, low amplitude
    // layer 2: mid halo, slightly hotter
    // layer 3: inner hot glow kissing the dark core
    float layer1 = pow(fres, 4.0) * 0.55;
    float layer2 = pow(fres, 2.2) * 0.30;
    float layer3 = pow(fres, 1.1) * 0.10;

    // ── Gentle opacity pulse ─────────────────────────────────────────
    float breathe = 1.0 + sin(uTime * 0.32) * 0.10;
    float halo    = (layer1 + layer2 + layer3) * breathe;

    // ── Color: hot gold at the core, deep blue at the corona rim ────
    vec3 hot  = vec3(1.00, 0.92, 0.78);
    vec3 cold = vec3(0.30, 0.65, 0.95);
    vec3 violet = vec3(0.55, 0.40, 0.95);
    vec3 col  = mix(hot, cold, fres);
    col       = mix(col, violet, layer1 * 0.4);

    // ── Dark central core (event horizon) ────────────────────────────
    // When looking straight on (fres → 0) we go DEEP into the core.
    // Pure black + faint warm undertone prevents an actual hard ring.
    float coreDepth = 1.0 - fres;
    vec3  coreCol   = mix(vec3(0.02, 0.04, 0.07), vec3(0.05, 0.02, 0.10), coreDepth);

    vec3 finalCol = mix(coreCol, col * halo * 1.6, halo);

    // ── Alpha: smooth radial fade-in then fade-out, never hard ring ─
    float alpha = halo * (1.0 - coreDepth * 0.7);
    alpha = clamp(alpha, 0.0, 0.95);

    gl_FragColor = vec4(finalCol, alpha);
  }
`;

/* ═══════════════════════════════════════════════════════════════════════
   MICRO-DUST — VERTEX / FRAGMENT
   Tiny motes scattered in a sphere. Fades in with scroll depth.
═══════════════════════════════════════════════════════════════════════ */
const DUST_VERT = /* glsl */ `
  attribute vec3  aColor;
  attribute float aScale;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uOpacity;     // 0 → 1, driven by scroll depth

  varying vec3  vColor;
  varying float vOpacity;

  void main() {
    vColor   = aColor;
    vOpacity = uOpacity;

    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPos;

    float depth = -mvPos.z;
    gl_PointSize = clamp(aScale * uPixelRatio / depth, 0.4, 2.4);
  }
`;

const DUST_FRAG = /* glsl */ `
  varying vec3  vColor;
  varying float vOpacity;

  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    float strength = pow(1.0 - r * 2.0, 1.6);
    gl_FragColor = vec4(vColor * strength, strength * vOpacity * 0.55);
  }
`;

/* ═══════════════════════════════════════════════════════════════════════
   ORBITAL RING — FRAGMENT
   Two nested tilted rings; opacity ramped by scroll.
═══════════════════════════════════════════════════════════════════════ */
const RING_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RING_FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform float uOpacity;
  uniform vec3  uColor;

  void main() {
    // Distance from ring center (0.5 along V axis on a ring geometry)
    float d = abs(vUv.y - 0.5) * 2.0;
    float glow = exp(-d * 12.0);
    gl_FragColor = vec4(uColor * glow, glow * uOpacity);
  }
`;

/* ═══════════════════════════════════════════════════════════════════════
   PARTICLE GENERATION — STELLAR DISK
═══════════════════════════════════════════════════════════════════════ */
function generateStellarParticles() {
  const pos    = new Float32Array(STELLAR_COUNT * 3);
  const sc     = new Float32Array(STELLAR_COUNT);
  const ai     = new Float32Array(STELLAR_COUNT);
  const rd     = new Float32Array(STELLAR_COUNT);
  const col    = new Float32Array(STELLAR_COUNT * 3);
  const cw     = new Float32Array(STELLAR_COUNT);
  const twk    = new Float32Array(STELLAR_COUNT);
  const nsd    = new Float32Array(STELLAR_COUNT * 3);

  const C0 = new THREE.Color(1.00, 0.97, 0.90);
  const C1 = new THREE.Color(0.31, 0.76, 0.96);
  const C2 = new THREE.Color(0.40, 0.44, 0.88);
  const C3 = new THREE.Color(0.28, 0.14, 0.60);

  for (let i = 0; i < STELLAR_COUNT; i++) {
    const isHalo = Math.random() < 0.04;
    let x = 0, y = 0, z = 0, radius = 0;

    if (isHalo) {
      const r     = 7 + Math.random() * 24;
      const phi   = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      x = r * Math.sin(phi) * Math.cos(theta);
      y = r * Math.sin(phi) * Math.sin(theta);
      z = r * Math.cos(phi) * 0.25;
      radius = 8.5 + Math.random() * 4;
    } else {
      radius     = Math.pow(Math.random(), 3.0) * DISC_RADIUS;
      const spin = radius * SPIN_FACTOR;
      const arm  = Math.floor(Math.random() * ARMS);
      const branchAngle = (arm / ARMS) * Math.PI * 2;
      const finalAngle  = spin + branchAngle;

      const tNorm      = Math.min(1, radius / DISC_RADIUS);
      const coreWeight = Math.pow(1.0 - tNorm, 2.2);
      const zSpread    = 1.3 * coreWeight;
      const zOff = (Math.random() + Math.random() - 1) * zSpread;

      const tightness = Math.exp(-radius * 0.55);
      const armWidth  = (0.14 + radius * 0.09) * (1.0 - tightness * 0.88);
      const rNoise    = (Math.random() + Math.random() - 1) * armWidth;
      const tNoise    = (Math.random() - 0.5) * armWidth * 0.55;

      const armDir = finalAngle;
      const armR   = finalAngle + Math.PI / 2;
      const ox = Math.cos(armR) * rNoise + Math.cos(armDir) * tNoise;
      const oy = Math.sin(armR) * rNoise + Math.sin(armDir) * tNoise;

      x = Math.cos(finalAngle) * radius + ox;
      y = Math.sin(finalAngle) * radius + oy;
      z = zOff;
    }

    pos[i * 3]     = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    rd[i]           = radius;

    const t      = Math.min(1, radius / DISC_RADIUS);
    const tBoost = Math.pow(1.0 - t, 1.8);
    sc[i]        = 0.5 + tBoost * 1.8 + Math.random() * 0.3;

    ai[i]  = Math.floor(Math.random() * ARMS);
    const coreNorm = Math.min(1, radius / DISC_RADIUS);
    cw[i]   = Math.pow(1.0 - coreNorm, 2.2);
    twk[i]  = Math.random() * Math.PI * 2;

    // Per-particle noise seed (pseudo-random vec3)
    nsd[i * 3]     = Math.random() * 100;
    nsd[i * 3 + 1] = Math.random() * 100;
    nsd[i * 3 + 2] = Math.random() * 100;

    let c: THREE.Color;
    if (t < 0.18) {
      c = new THREE.Color().lerpColors(C0, C1, t / 0.18);
    } else if (t < 0.55) {
      c = new THREE.Color().lerpColors(C1, C2, (t - 0.18) / 0.37);
    } else {
      c = new THREE.Color().lerpColors(C2, C3, (t - 0.55) / 0.45);
    }
    if (t < 0.06 && Math.random() < 0.4) {
      c = new THREE.Color(1.0, 1.0, 1.0);
    }
    col[i * 3]     = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }

  return { positions: pos, scales: sc, armIndices: ai, radii: rd, colors: col, coreWeights: cw, twinkles: twk, noiseSeeds: nsd };
}

/* ═══════════════════════════════════════════════════════════════════════
   PARTICLE GENERATION — MICRO-DUST
   Fine sphere-distributed motes.
═══════════════════════════════════════════════════════════════════════ */
function generateDustParticles() {
  const pos = new Float32Array(DUST_COUNT * 3);
  const col = new Float32Array(DUST_COUNT * 3);
  const sc  = new Float32Array(DUST_COUNT);

  const tintA = new THREE.Color(0.65, 0.78, 1.00);   // cool blue
  const tintB = new THREE.Color(0.85, 0.78, 1.00);   // soft violet
  const tintC = new THREE.Color(1.00, 0.92, 0.78);   // warm gold

  for (let i = 0; i < DUST_COUNT; i++) {
    // Wide sphere distribution, biased to outer shell
    const r     = 12 + Math.random() * 22;
    const phi   = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);

    const choice = Math.random();
    const c = choice < 0.5
      ? new THREE.Color().lerpColors(tintA, tintB, Math.random())
      : new THREE.Color().lerpColors(tintA, tintC, Math.random());
    col[i * 3]     = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;

    sc[i] = 0.4 + Math.random() * 0.8;
  }

  return { positions: pos, colors: col, scales: sc };
}

/* ═══════════════════════════════════════════════════════════════════════
   SCROLL CONTEXT — single source of truth, shared by all subcomponents.
═══════════════════════════════════════════════════════════════════════ */
type ScrollState = {
  current: React.MutableRefObject<number>;   // raw [0..1]
  smooth:  React.MutableRefObject<number>;   // damped [0..1]
};

function useScrollDepth(): ScrollState {
  const state = useMemo<ScrollState>(() => ({
    current: { current: 0 },
    smooth:  { current: 0 },
  }), []);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      const raw = maxScroll > 0
        ? Math.min(1, Math.max(0, window.scrollY / maxScroll))
        : 0;
      state.current.current = raw;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [state]);

  return state;
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYER 1 — STELLAR DISK
═══════════════════════════════════════════════════════════════════════ */
function StellarDisk({ scroll }: { scroll: ScrollState }) {
  const pointsRef   = useRef<THREE.Points>(null);
  const { gl }      = useThree();
  const mouseTarget = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseTarget.current = {
        x: (e.clientX / window.innerWidth  - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const { positions, scales, armIndices, radii, colors, coreWeights, twinkles, noiseSeeds } =
    useMemo(() => generateStellarParticles(), []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',    new THREE.BufferAttribute(positions,    3));
    geo.setAttribute('aScale',      new THREE.BufferAttribute(scales,       1));
    geo.setAttribute('aArmIndex',   new THREE.BufferAttribute(armIndices,   1));
    geo.setAttribute('aRadius',     new THREE.BufferAttribute(radii,        1));
    geo.setAttribute('aColor',      new THREE.BufferAttribute(colors,       3));
    geo.setAttribute('aCoreWeight', new THREE.BufferAttribute(coreWeights,  1));
    geo.setAttribute('aTwinkle',    new THREE.BufferAttribute(twinkles,     1));
    geo.setAttribute('aNoiseSeed',  new THREE.BufferAttribute(noiseSeeds,   3));
    return geo;
  }, [positions, scales, armIndices, radii, colors, coreWeights, twinkles, noiseSeeds]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader:   STELLAR_VERT,
        fragmentShader: STELLAR_FRAG,
        uniforms: {
          uTime:       { value: 0 },
          uSize:       { value: 260 },
          uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
        },
        transparent: true,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending,
      }),
    [gl]
  );

  useFrame(({ clock }, delta) => {
    if (!pointsRef.current) return;

    const t = clock.getElapsedTime();
    material.uniforms.uTime.value = t;

    // Critically-damped mouse parallax (cinematic inertia)
    pointsRef.current.rotation.x = THREE.MathUtils.damp(
      pointsRef.current.rotation.x,
      mouseTarget.current.y * 0.18,
      1,
      delta * 0.04
    );
    pointsRef.current.rotation.y = THREE.MathUtils.damp(
      pointsRef.current.rotation.y,
      mouseTarget.current.x * 0.22,
      1,
      delta * 0.04
    );

    // Slow ambient drift (always-on)
    pointsRef.current.rotation.z = t * 0.008;

    // Counter-zoom: as we fly forward, scale the disc up so it doesn't shrink
    const targetScale = 1.0 + scroll.smooth.current * 0.45;
    pointsRef.current.scale.setScalar(
      THREE.MathUtils.damp(pointsRef.current.scale.x, targetScale, 1, delta * 0.06)
    );
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYER 2 — EVENT-HORIZON CORE
═══════════════════════════════════════════════════════════════════════ */
function EventHorizonCore() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[BULGE_RADIUS, 96, 96]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={CORE_VERT}
        fragmentShader={CORE_FRAG}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYER 3 — MICRO-DUST (scroll-revealed)
═══════════════════════════════════════════════════════════════════════ */
function MicroDust({ scroll }: { scroll: ScrollState }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { gl }    = useThree();

  const { positions, colors, scales } = useMemo(() => generateDustParticles(), []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColor',   new THREE.BufferAttribute(colors,    3));
    geo.setAttribute('aScale',   new THREE.BufferAttribute(scales,    1));
    return geo;
  }, [positions, colors, scales]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader:   DUST_VERT,
        fragmentShader: DUST_FRAG,
        uniforms: {
          uTime:       { value: 0 },
          uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
          uOpacity:    { value: 0 },
        },
        transparent: true,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending,
      }),
    [gl]
  );

  useFrame(({ clock }, delta) => {
    if (!pointsRef.current) return;
    material.uniforms.uTime.value = clock.getElapsedTime();

    // Reveal opacity ramp: 0 until SCROLL_SECTION_1, then smooth to 1
    const target = THREE.MathUtils.smoothstep(scroll.smooth.current, SCROLL_SECTION_1, SCROLL_SECTION_1 + 0.3);
    material.uniforms.uOpacity.value = THREE.MathUtils.damp(
      material.uniforms.uOpacity.value,
      target,
      1,
      delta * 0.08
    );

    // Gentle drift
    pointsRef.current.rotation.y = clock.getElapsedTime() * 0.012;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYER 4 — ORBITAL RINGS (scroll-revealed)
═══════════════════════════════════════════════════════════════════════ */
function OrbitalRings({ scroll }: { scroll: ScrollState }) {
  const ring1Mat = useRef<THREE.ShaderMaterial>(null);
  const ring2Mat = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const target = THREE.MathUtils.smoothstep(scroll.smooth.current, SCROLL_SECTION_2, SCROLL_SECTION_2 + 0.3);

    if (ring1Mat.current) {
      ring1Mat.current.uniforms.uOpacity.value = THREE.MathUtils.damp(
        ring1Mat.current.uniforms.uOpacity.value, target, 1, delta * 0.08
      );
    }
    if (ring2Mat.current) {
      ring2Mat.current.uniforms.uOpacity.value = THREE.MathUtils.damp(
        ring2Mat.current.uniforms.uOpacity.value, target * 0.7, 1, delta * 0.08
      );
    }
  });

  return (
    <group>
      {/* Outer cyan ring, tilted */}
      <mesh rotation={[Math.PI / 2.4, 0, Math.PI / 8]} position={[0, 0, 0]}>
        <ringGeometry args={[13.5, 14.2, 192, 1]} />
        <shaderMaterial
          ref={ring1Mat}
          vertexShader={RING_VERT}
          fragmentShader={RING_FRAG}
          uniforms={{
            uOpacity: { value: 0 },
            uColor:   { value: new THREE.Color(0.20, 0.72, 0.96) },
          }}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Inner violet ring, opposite tilt */}
      <mesh rotation={[Math.PI / 2.2, 0, -Math.PI / 6]} position={[0, 0, 0]}>
        <ringGeometry args={[10.8, 11.4, 192, 1]} />
        <shaderMaterial
          ref={ring2Mat}
          vertexShader={RING_VERT}
          fragmentShader={RING_FRAG}
          uniforms={{
            uOpacity: { value: 0 },
            uColor:   { value: new THREE.Color(0.55, 0.40, 0.95) },
          }}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYER 5 — SCROLL CAMERA RIG
   Drives camera Z based on scroll depth (smoothed).
═══════════════════════════════════════════════════════════════════════ */
function ScrollCameraRig({ scroll }: { scroll: ScrollState }) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    // Critically-damped smoothing of the raw scroll signal
    scroll.smooth.current = THREE.MathUtils.damp(
      scroll.smooth.current,
      scroll.current.current,
      1,
      delta * 0.06
    );

    const t = scroll.smooth.current;
    const targetZ = THREE.MathUtils.lerp(CAMERA_START_Z, CAMERA_END_Z, t);
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      targetZ,
      1,
      delta * 0.06
    );
    // Subtle downward tilt as we go deeper — keeps horizon visible
    camera.rotation.x = THREE.MathUtils.damp(
      camera.rotation.x,
      t * 0.08,
      1,
      delta * 0.06
    );
    camera.updateProjectionMatrix();
  });

  return null;
}

/* ═══════════════════════════════════════════════════════════════════════
   LAYER 6 — AMBIENT DRIFT GROUP
═══════════════════════════════════════════════════════════════════════ */
function AmbientDrift({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.x = Math.sin(t * 0.04) * 0.04 + 0.08;
  });

  return <group ref={groupRef}>{children}</group>;
}

/* ═══════════════════════════════════════════════════════════════════════
   WEBGL CONTEXT CLEANUP
═══════════════════════════════════════════════════════════════════════ */
function ContextCleanup() {
  const { gl } = useThree();
  useEffect(() => {
    return () => {
      const ext = gl.getContext().getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    };
  }, [gl]);
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════════════════════════ */
export default function SpiralGalaxyBackground() {
  const scroll = useScrollDepth();

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(ellipse 120% 80% at 50% 50%, #060810 0%, #020305 55%, #000000 100%)',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, CAMERA_START_Z], fov: 55 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ContextCleanup />
        <ScrollCameraRig scroll={scroll} />
        <AmbientDrift>
          <OrbitalRings scroll={scroll} />
          <MicroDust scroll={scroll} />
          <StellarDisk scroll={scroll} />
        </AmbientDrift>
        <EffectComposer multisampling={0}>
          {/* Bloom: intensity ~35% lower (1.8 → 1.15); higher threshold so only
             the brightest accretion layer blooms — text stays crisp. */}
          <Bloom
            intensity={1.15}
            luminanceThreshold={0.22}
            luminanceSmoothing={0.85}
            mipmapBlur
            radius={0.85}
          />
        </EffectComposer>
      </Canvas>

      {/* CSS radial vignette: ensures hero text stays legible over the
         brightest part of the spiral without darkening the rest of the page.
         Pointer-events disabled above. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 45% at 50% 45%, rgba(2,4,8,0.55) 0%, rgba(2,4,8,0.30) 40%, transparent 75%)',
        }}
      />
    </div>
  );
}