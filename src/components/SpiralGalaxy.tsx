'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

/**
 * Spiral Galaxy — "Gravitational Anomalies" v7
 *
 * Static cinematic camera. No scroll parallax.
 * 3–4 black holes with inverse-square gravitational pull,
 * rotational accretion swirl, spaghettification streaks,
 * event horizon consumption.
 * Deep-space aesthetic: razor-sharp micro-stars, 99% void.
 */

/* ════════════════════════════════════════════════════ */
/*  CONSTANTS                                               */
/* ════════════════════════════════════════════════════ */
const STAR_COUNT    = 60_000;
const DEEP_COUNT   = 10_000;
const HOLE_COUNT     = 4;
const MAX_RADIUS    = 12.0;
const EVENT_HORIZON = 0.35;   // radius at which particles are consumed
const G_CONST       = 3.5;    // gravitational pull strength
const SWIRL_STRENGTH = 1.8;   // rotational accretion force

/* ════════════════════════════════════════════════════ */
/*  BLACK HOLE POSITIONS (static, scattered)              */
/* ════════════════════════════════════════════════════ */
const BLACK_HOLES: THREE.Vector3[] = [
  new THREE.Vector3( 2.5,  1.0, -3.0),
  new THREE.Vector3(-4.0, -0.5,  2.5),
  new THREE.Vector3( 1.0, -2.0, -5.0),
  new THREE.Vector3(-1.5,  2.5,  1.0),
];

/* ════════════════════════════════════════════════════ */
/*  VERTEX SHADER — Gravitational physics                 */
/* ════════════════════════════════════════════════════ */
const GALAXY_VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3  aColor;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec3  uBlackHoles[4];
  uniform float uEventHorizon;
  uniform float uGConst;
  uniform float uSwirl;

  varying vec3 vColor;
  varying float vConsumed;   // 1.0 = past event horizon
  varying float vStretch;    // spaghettification factor

  /* ── 3D hash + noise ── */
  float h31(vec3 p){
    p=fract(p*vec3(443.8975,397.2973,491.1871));
    p+=dot(p,p.yxz+19.19);
    return fract(p.x+p.y+p.z);
  }
  float vnoise3(vec3 p){
    vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),
                   mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),
                   mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z);
  }

  void main() {
    vColor = aColor;
    vec3 pos = position;

    /* ── Gravitational anomaly simulation ── */
    vec3 totalForce = vec3(0.0);
    float minDist = 999.0;

    for (int i = 0; i < 4; i++) {
      vec3 bh  = uBlackHoles[i];
      vec3 dir = bh - pos;
      float dist = max(length(dir), 0.001);
      minDist = min(minDist, dist);

      // Inverse-square gravitational pull
      float grav = uGConst / (dist * dist);

      // Rotational swirl: perpendicular force for accretion disk
      vec3 axis = normalize(cross(dir, vec3(0.0, 1.0, 0.0)));
      vec3 tangential = normalize(cross(axis, dir)) * uSwirl * grav * 0.3;

      totalForce += normalize(dir) * grav + tangential;
    }

    // Apply displacement — particles warp toward holes
    vec3 displaced = pos + totalForce * 0.15;

    // Organic micro-wobble (frame-rate independent via uTime)
    float nT = uTime * 0.12;
    vec3 wp = pos * 0.6 + vec3(13.7, 4.1, 9.3);
    float nx = vnoise3(wp + vec3(0.0, 0.0, nT)) - 0.5;
    float ny = vnoise3(wp + vec3(7.3, 19.7, 2.5) + vec3(0.0, 0.0, nT*0.8)) - 0.5;
    float nz = vnoise3(wp + vec3(4.9, 2.3, 11.1) + vec3(0.0, 0.0, nT*0.6)) - 0.5;
    displaced += vec3(nx, ny, nz) * 0.08;

    /* ── Spaghettification: stretch along pull direction ── */
    // When close to a hole, stretch the particle along the velocity vector
    vStretch = smoothstep(3.0, 0.5, minDist) * 4.0;
    vec3 stretchDir = normalize(-totalForce + vec3(0.001));
    displaced += stretchDir * vStretch * 0.04;

    /* ── Event horizon consumption ── */
    vConsumed = smoothstep(uEventHorizon * 2.0, 0.0, minDist);

    /* ── Projection ── */
    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Depth attenuation + ultra-fine pixel sizes
    float depth = max(-mvPosition.z, 0.5);
    gl_PointSize = aSize * (250.0 / depth) * uPixelRatio;
  }
`;

/* ════════════════════════════════════════════════════ */
/*  FRAGMENT SHADER — Razor-sharp micro-stars            */
/* ════════════════════════════════════════════════════ */
const GALAXY_FRAG = /* glsl */ `
  varying vec3  vColor;
  varying float vConsumed;
  varying float vStretch;

  void main() {
    // Razor-sharp circular disc — no soft bloom
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    if (r > 0.5) discard;

    // Sharp exponential falloff — crisp points, not blobs
    float alpha = exp(-r * 28.0);
    if (alpha < 0.02) discard;

    // Consumed particles: fade to nothing at event horizon
    alpha *= vConsumed;
    if (alpha < 0.005) discard;

    // Slight stretch brightening along spaghettification axis
    float stretchBoost = 1.0 + vStretch * 0.3;

    gl_FragColor = vec4(vColor * stretchBoost, alpha * 0.95);
  }
`;

/* ════════════════════════════════════════════════════ */
/*  DEEP FIELD SHADER (static background)                */
/* ════════════════════════════════════════════════════ */
const DEEP_VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    float depth = max(-mvPosition.z, 0.5);
    gl_PointSize = aSize * (200.0 / depth) * uPixelRatio;
  }
`;

const DEEP_FRAG = /* glsl */ `
  varying vec3 vColor;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    if (r > 0.5) discard;
    float alpha = exp(-r * 22.0);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor, alpha * 0.25);
  }
`;

/* ════════════════════════════════════════════════════ */
/*  PARTICLE GENERATORS                                     */
/* ════════════════════════════════════════════════════ */
function generateStars() {
  const pos = new Float32Array(STAR_COUNT * 3);
  const sz  = new Float32Array(STAR_COUNT);
  const col = new Float32Array(STAR_COUNT * 3);

  const C_CORE_WARM = new THREE.Color(1.00, 0.82, 0.40);
  const C_CORE_HOT  = new THREE.Color(1.00, 0.95, 0.85);
  const C_ARM_BLUE  = new THREE.Color(0.30, 0.62, 1.00);
  const C_OUTER_VIO = new THREE.Color(0.50, 0.28, 0.82);
  const C_VOID      = new THREE.Color(0.03, 0.03, 0.06);

  for (let i = 0; i < STAR_COUNT; i++) {
    // Exponential concentration: dense core, sparse arms
    const r = Math.exp(Math.random() * 2.2) - 1;
    const angle = Math.random() * Math.PI * 2;
    const spin = r * 0.60;
    const arm = Math.floor(Math.random() * 3);
    const branch = (arm / 3) * Math.PI * 2;
    const finalAngle = spin + branch;

    // Spiral arm scatter
    const tight = Math.exp(-r * 0.5);
    const armW = (0.08 + r * 0.06) * (1.0 - tight * 0.9);
    const x = Math.cos(finalAngle) * r + (Math.random() - 0.5) * armW;
    const y = Math.sin(finalAngle) * r + (Math.random() - 0.5) * armW;
    const z = (Math.random() - 0.5) * 0.8 * Math.exp(-r * 0.4);

    pos[i*3] = x; pos[i*3+1] = y; pos[i*3+2] = z;

    // Size: exponential power curve — 95% are sub-pixel micro-stars
    sz[i] = Math.pow(Math.random(), 6) * 1.4;
    // Rare bright stars (0.5%) for visual punch
    if (Math.random() < 0.005) sz[i] = 1.2 + Math.random() * 1.0;

    // Chromatic: warm core → cool arms → void outer
    const t = r / MAX_RADIUS;
    let c;
    if (t < 0.12) {
      c = new THREE.Color().lerpColors(C_CORE_HOT, C_CORE_WARM, t / 0.12);
    } else if (t < 0.45) {
      c = new THREE.Color().lerpColors(C_CORE_WARM, C_ARM_BLUE, (t - 0.12) / 0.33);
    } else if (t < 0.75) {
      c = new THREE.Color().lerpColors(C_ARM_BLUE, C_OUTER_VIO, (t - 0.45) / 0.30);
    } else {
      c = new THREE.Color().lerpColors(C_OUTER_VIO, C_VOID, (t - 0.75) / 0.25);
    }
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }
  return { pos, sz, col };
}

function generateDeepStars() {
  const pos = new Float32Array(DEEP_COUNT * 3);
  const sz  = new Float32Array(DEEP_COUNT);
  const col = new Float32Array(DEEP_COUNT * 3);
  for (let i = 0; i < DEEP_COUNT; i++) {
    const r = 15 + Math.random() * 35;
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = (Math.random() - 0.5) * 10;
    sz[i] = 0.15 + Math.random() * 0.4;
    const c = Math.random() < 0.5 ? new THREE.Color(0.65, 0.80, 1.0) : new THREE.Color(0.88, 0.90, 0.78);
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }
  return { pos, sz, col };
}

/* ════════════════════════════════════════════════════ */
/*  COMPONENTS                                            */
/* ════════════════════════════════════════════════════ */
function StarField() {
  const pts = useRef<THREE.Points>(null);
  const { gl } = useThree();
  const g = useMemo(() => generateStars(), []);
  const geo = useMemo(() => {
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.BufferAttribute(g.pos, 3));
    g2.setAttribute('aSize', new THREE.BufferAttribute(g.sz, 1));
    g2.setAttribute('aColor', new THREE.BufferAttribute(g.col, 3));
    return g2;
  }, [g]);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: GALAXY_VERT,
    fragmentShader: GALAXY_FRAG,
    uniforms: {
      uTime:       { value: 0 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      uBlackHoles: { value: BLACK_HOLES },
      uEventHorizon: { value: EVENT_HORIZON },
      uGConst:     { value: G_CONST },
      uSwirl:      { value: SWIRL_STRENGTH },
    },
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  }), [gl]);

  useFrame(({ clock }, delta) => {
    if (!pts.current) return;
    mat.uniforms.uTime.value = clock.getElapsedTime();
    // Ultra-slow autonomous rotation — majestic, never stops
    pts.current.rotation.y += delta * 0.006;
    pts.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.003) * 0.015;
  });

  return <points ref={pts} geometry={geo} material={mat} />;
}

function DeepStarField() {
  const pts = useRef<THREE.Points>(null);
  const { gl } = useThree();
  const g = useMemo(() => generateDeepStars(), []);
  const geo = useMemo(() => {
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.BufferAttribute(g.pos, 3));
    g2.setAttribute('aSize', new THREE.BufferAttribute(g.sz, 1));
    g2.setAttribute('aColor', new THREE.BufferAttribute(g.col, 3));
    return g2;
  }, [g]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: DEEP_VERT,
    fragmentShader: DEEP_FRAG,
    uniforms: { uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) } },
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  }), [gl]);

  useFrame((_, delta) => {
    if (!pts.current) return;
    pts.current.rotation.y += delta * 0.002;
  });
  return <points ref={pts} geometry={geo} material={mat} />;
}

/* ════════════════════════════════════════════════════ */
/*  ROOT                                                */
/* ════════════════════════════════════════════════════ */
export default function SpiralGalaxyBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        width: '100vw',
        height: '100vh',
        background: '#020305',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 14], fov: 55 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        dpr={[1, 2]}
        onCreated={({ gl }) => gl.setClearColor(0x020305, 1)}
      >
        <StarField />
        <DeepStarField />
        <EffectComposer multisampling={0}>
          {/* Minimal bloom — just enough to catch the brightest 0.5% giant stars */}
          <Bloom
            intensity={0.35}
            luminanceThreshold={0.70}
            luminanceSmoothing={0.6}
            mipmapBlur
            radius={0.5}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
