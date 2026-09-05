'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

/**
 * Spiral Galaxy Background — fixed-position multi-layer GLSL pass.
 *
 * Architecture:
 *   1. Stellar Arm Disk        ~100,000 particles
 *      - Logarithmic spiral with 4 arms
 *      - Radius = pow(rand, 3.0) * maxRadius  → dense core
 *      - angle = radius * spinFactor
 *      - branchAngle = (branchIndex / ARMS) * 2π
 *      - tight scattering near the spiral line
 *      - colors: incandescent white-gold core → electric blue → indigo → cosmic violet
 *
 *   2. Core Bulge              bright fresnel sphere at the galactic center
 *
 * No audio APIs. Mounted once in src/app/layout.tsx.
 */

const STELLAR_COUNT = 100_000;
const ARMS = 4;                     // 4-arm logarithmic spiral
const SPIN_FACTOR = 0.55;           // radians per unit radius
const DISC_RADIUS = 9.0;            // ↓ pulled in to keep the galaxy framed
const CORE_BOOST = 1.6;             // half-width of the dense core region

/* ═══════════════════════════════════════════════════════════════════
   Stellar Arm Disk — vertex shader
   Per-particle attributes:
     aScale          — point size multiplier
     aArmIndex       — which spiral arm (0..ARMS-1)
     aRadius         — base radius along the spiral (for color & size)
     aColor          — base color (CPU-interpolated along the gradient)
     aCoreBoost      — additive size boost near the center
═══════════════════════════════════════════════════════════════════ */
const STELLAR_VERT = /* glsl */ `
  attribute float aScale;
  attribute float aArmIndex;
  attribute float aRadius;
  attribute vec3  aColor;
  attribute float aCoreBoost;

  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;

  varying vec3  vColor;
  varying float vT;          // normalized radial position (0=core, 1=outer)
  varying float vCore;       // 1 at core, 0 at the edge

  void main() {
    vColor = aColor;
    vT     = clamp(aRadius / ${DISC_RADIUS.toFixed(8)}, 0.0, 1.0);
    vCore  = aCoreBoost;

    // Pass-through: spiral position is fully baked on the CPU.
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // Size: core stars are large, outer stars are small.
    // Boosted by pixel ratio for retina sharpness.
    float sizePx = uSize * aScale * (1.0 / -mvPos.z) * uPixelRatio;
    gl_PointSize = clamp(sizePx, 0.5, 6.0);
  }
`;

/* ═══════════════════════════════════════════════════════════════════
   Stellar Arm Disk — fragment shader
   Soft circular glow, no square pixels. Color is baked on the CPU
   to match the GLSL gradient stop logic; here we only shape the glow.
═══════════════════════════════════════════════════════════════════ */
const STELLAR_FRAG = /* glsl */ `
  varying vec3  vColor;
  varying float vT;
  varying float vCore;

  void main() {
    // Soft radial glow from the point center.
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    float strength = 1.0 - r * 2.0;
    strength = pow(strength, 2.6);
    if (strength < 0.015) discard;

    // Core stars get a hotter, brighter tint on top of their base color.
    vec3 col = mix(vColor, vec3(1.0, 0.98, 0.92), vCore * 0.55);

    // Alpha: fade out gently toward the rim.
    float alpha = strength * (0.85 - vT * 0.35);
    gl_FragColor = vec4(col * strength, alpha);
  }
`;

/* ═══════════════════════════════════════════════════════════════════
   Core Bulge — intense incandescent sphere at the galactic center
═══════════════════════════════════════════════════════════════════ */
const BULGE_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal  = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir  = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const BULGE_FRAG = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  uniform float uTime;
  void main() {
    // Fresnel: bright at the rim, dim at the very center → corona look
    float fres = 1.0 - abs(dot(vNormal, vViewDir));
    fres = pow(fres, 2.0);
    vec3 hot  = vec3(1.0, 0.97, 0.90);   // incandescent white-gold
    vec3 cold = vec3(0.31, 0.76, 0.96);  // electric blue
    vec3 col  = mix(hot, cold, fres * 0.35);
    float intensity = fres * (1.4 + 0.25 * sin(uTime * 0.4));
    gl_FragColor = vec4(col * intensity, intensity);
  }
`;

/* ═══════════════════════════════════════════════════════════════════
   Layer 1 — Stellar Arm Disk (CPU generation)
═══════════════════════════════════════════════════════════════════ */
function StellarDisk() {
  const pointsRef = useRef<THREE.Points>(null);
  const { gl } = useThree();

  const { positions, scales, armIndices, radii, colors, coreBoosts } = useMemo(() => {
    const pos  = new Float32Array(STELLAR_COUNT * 3);
    const sc   = new Float32Array(STELLAR_COUNT);
    const ai   = new Float32Array(STELLAR_COUNT);
    const rd   = new Float32Array(STELLAR_COUNT);
    const col  = new Float32Array(STELLAR_COUNT * 3);
    const cb   = new Float32Array(STELLAR_COUNT);

    // Palette tokens
    const CORE  = new THREE.Color(1.00, 0.97, 0.90); // incandescent white-gold
    const BLUE  = new THREE.Color(0.31, 0.76, 0.96); // electric blue
    const INDIGO = new THREE.Color(0.42, 0.46, 0.85); // indigo
    const VIOLET = new THREE.Color(0.34, 0.18, 0.58); // deep cosmic violet

    for (let i = 0; i < STELLAR_COUNT; i++) {
      // 4% sparse 3D field, 96% spiral disc
      const isForeground = Math.random() < 0.04;
      let x = 0, y = 0, z = 0;
      let radius = 0;

      if (isForeground) {
        // Loose 3D halo around the galaxy
        const r = 6 + Math.random() * 22;
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = Math.random() * Math.PI * 2;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        radius = 8 + Math.random() * 4;  // for color, treat as "outer" stars
      } else {
        // ---- Spiral math (per spec) --------------------------------------
        // pow(3.0) clusters HEAVILY at the center, so the core is a solid mass.
        radius     = Math.pow(Math.random(), 3.0) * DISC_RADIUS;
        const spin = radius * SPIN_FACTOR;
        const arm  = Math.floor(Math.random() * ARMS);
        const branchAngle = (arm / ARMS) * Math.PI * 2;
        const finalAngle  = spin + branchAngle;

        // ---- Tight scattering --------------------------------------------
        // Center (r→0): near-zero scatter, solid mass of light.
        // Outer (r→DISC_RADIUS): wider scatter, arms soften.
        const tightness = Math.exp(-radius * 0.5);            // 1.0 at r=0, 0.011 at r=9
        const armWidth  = (0.18 + radius * 0.10) * (1.0 - tightness * 0.85);

        // Local frame: radial (perpendicular to arm) + tangential (along arm)
        const radialNoise    = (Math.random() + Math.random() - 1) * armWidth;          // sum of two uniforms → triangle dist
        const tangentialNoise = (Math.random() - 0.5) * armWidth * 0.6;

        // Build local (radial, tangential) offset, rotate into world
        const armDir = finalAngle;              // tangent direction
        const armR   = finalAngle + Math.PI / 2; // radial direction
        const ox = Math.cos(armR) * radialNoise + Math.cos(armDir) * tangentialNoise;
        const oy = Math.sin(armR) * radialNoise + Math.sin(armDir) * tangentialNoise;

        x = Math.cos(finalAngle) * radius + ox;
        y = Math.sin(finalAngle) * radius + oy;
        z = (Math.random() - 0.5) * 0.22;        // thin disc thickness
      }

      pos[i * 3]     = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Per-particle scale: large in the core, small at the rim.
      const t   = Math.min(1, radius / DISC_RADIUS);
      const tBoost = Math.pow(1.0 - t, 1.6);                  // sharp falloff from core
      sc[i] = 0.55 + tBoost * 1.6 + Math.random() * 0.35;

      ai[i] = Math.floor(Math.random() * ARMS);
      rd[i] = radius;
      cb[i] = Math.pow(1.0 - t, 2.0);                          // 1 in core → 0 at rim

      // ---- Color gradient (matches GLSL mix() plan) ----------------------
      // Center:    incandescent white-gold   (#FFF7E6)
      // Mid:       electric blue              (#4FC2F5)
      // Outer:     deep cosmic violet         (#5730 93)
      let c: THREE.Color;
      if (t < 0.18) {
        c = new THREE.Color().lerpColors(CORE, BLUE, t / 0.18);
      } else if (t < 0.55) {
        c = new THREE.Color().lerpColors(BLUE, INDIGO, (t - 0.18) / 0.37);
      } else {
        c = new THREE.Color().lerpColors(INDIGO, VIOLET, (t - 0.55) / 0.45);
      }
      // Sprinkle a few hot core stars (pure white)
      if (t < 0.07 && Math.random() < 0.45) {
        c = new THREE.Color(1.0, 1.0, 1.0);
      }
      col[i * 3]     = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return { positions: pos, scales: sc, armIndices: ai, radii: rd, colors: col, coreBoosts: cb };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',   new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aScale',     new THREE.BufferAttribute(scales, 1));
    geo.setAttribute('aArmIndex',  new THREE.BufferAttribute(armIndices, 1));
    geo.setAttribute('aRadius',    new THREE.BufferAttribute(radii, 1));
    geo.setAttribute('aColor',     new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aCoreBoost', new THREE.BufferAttribute(coreBoosts, 1));
    return geo;
  }, [positions, scales, armIndices, radii, colors, coreBoosts]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader:   STELLAR_VERT,
        fragmentShader: STELLAR_FRAG,
        uniforms: {
          uTime:       { value: 0 },
          uSize:       { value: 240 },
          uPixelRatio: { value: gl.getPixelRatio() },
        },
        transparent: true,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending,
      }),
    [gl]
  );

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    material.uniforms.uTime.value = clock.getElapsedTime();
    // Slow, elegant tilt of the whole disc
    pointsRef.current.rotation.z = clock.getElapsedTime() * 0.012;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

/* ═══════════════════════════════════════════════════════════════════
   Layer 2 — Core Galactic Bulge
═══════════════════════════════════════════════════════════════════ */
function GalacticBulge() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[2.4, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={BULGE_VERT}
        fragmentShader={BULGE_FRAG}
        uniforms={{ uTime: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Subtle group rotation for the slow, drifting disc
═══════════════════════════════════════════════════════════════════ */
function DriftingGroup({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.05) * 0.04;
    groupRef.current.rotation.x = THREE.MathUtils.degToRad(15) + Math.sin(t * 0.07) * 0.02;
  });
  return <group ref={groupRef}>{children}</group>;
}

/* ═══════════════════════════════════════════════════════════════════
   WebGL context cleanup on unmount
═══════════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════════
   Root export — single Canvas, two layers, bloom
   Camera pushed back to (0, 0, 22) so the disc sits elegantly in frame.
═══════════════════════════════════════════════════════════════════ */
export default function SpiralGalaxyBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(ellipse at center, #05060a 0%, #000000 80%)',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 22], fov: 55 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ContextCleanup />
        <DriftingGroup>
          <GalacticBulge />
          <StellarDisk />
        </DriftingGroup>
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.6}
            luminanceThreshold={0.18}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
