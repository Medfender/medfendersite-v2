'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

/**
 * Spiral Galaxy — "Linear Deep Space" v8
 *
 * Static cinematic camera. No scroll physics. No black holes.
 * 18k organic micro-stars with razor-sharp optical points.
 * Ultra-slow ambient drift on Y-axis.
 */

const STAR_COUNT = 18_000;
const MAX_SIZE    = 2.0;

/* ════════════════════════════════════════════════════ */
/*  VERTEX SHADER — depth attenuation                        */
/* ════════════════════════════════════════════════════ */
const STAR_VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3  aColor;

  uniform float uTime;
  uniform float uPixelRatio;

  varying vec3  vColor;
  varying float vDepth01;

  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float depth = max(-mvPosition.z, 0.5);
    vDepth01 = smoothstep(2.0, 80.0, depth);  // 0=near, 1=far

    // Standard depth scaling + pixel ratio
    gl_PointSize = aSize * (300.0 / depth) * uPixelRatio;
  }
`;

/* ════════════════════════════════════════════════════ */
/*  FRAGMENT SHADER — razor-sharp optical points          */
/* ════════════════════════════════════════════════════ */
const STAR_FRAG = /* glsl */ `
  varying vec3  vColor;
  varying float vDepth01;

  void main() {
    // Distance from center of point
    float r = length(gl_PointCoord.xy - vec2(0.5));
    if (r > 0.5) discard;

    // Gaussian optical falloff — crisp, not plastic
    float alpha = exp(-r * 15.0);
    if (alpha < 0.05) discard;

    // Far stars dim naturally
    float depthFade = mix(1.0, 0.4, vDepth01);
    alpha *= depthFade;

    // Subtle brightening for tiny bright stars
    vec3 col = vColor * (1.0 + (1.0 - vDepth01) * 0.3);

    gl_FragColor = vec4(col, alpha * 0.92);
  }
`;

/* ════════════════════════════════════════════════════ */
/*  GENERATORS                                              */
/* ════════════════════════════════════════════════════ */
function generateStarfield() {
  const pos = new Float32Array(STAR_COUNT * 3);
  const sz  = new Float32Array(STAR_COUNT);
  const col = new Float32Array(STAR_COUNT * 3);

  // 90% dim white/grey, 10% icy blue / warm tungsten
  const C_WHITE    = new THREE.Color(0.90, 0.92, 0.96);
  const C_GREY     = new THREE.Color(0.55, 0.58, 0.65);
  const C_BLUE     = new THREE.Color(0.40, 0.62, 1.00);
  const C_WARM     = new THREE.Color(1.00, 0.85, 0.55);

  for (let i = 0; i < STAR_COUNT; i++) {
    // Organic spread: mix of sphere and disk
    const r = Math.exp(Math.random() * 1.8) * 0.7 + Math.random() * 5.0;
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;

    pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = (Math.random() - 0.5) * 3.0;

    // Size: heavy weight toward microscopic
    const isGiant = Math.random() < 0.008;  // 0.8% are visible stars
    sz[i] = isGiant ? (0.8 + Math.random() * 1.2) : (0.15 + Math.pow(Math.random(), 5) * 0.6);

    // Color temperature
    const roll = Math.random();
    let c: THREE.Color;
    if (roll < 0.90) {
      // 90% dim neutral
      c = roll < 0.70 ? C_WHITE : C_GREY;
    } else if (roll < 0.95) {
      c = C_BLUE;  // icy blue
    } else {
      c = C_WARM;  // warm tungsten
    }
    // Slight brightness variation
    c.multiplyScalar(0.5 + Math.random() * 0.5);
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }
  return { pos, sz, col };
}

/* ════════════════════════════════════════════════════ */
/*  STAR FIELD                                              */
/* ════════════════════════════════════════════════════ */
function StarField() {
  const pts = useRef<THREE.Points>(null);
  const { gl } = useThree();
  const g = useMemo(() => generateStarfield(), []);

  const geo = useMemo(() => {
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.BufferAttribute(g.pos, 3));
    g2.setAttribute('aSize',    new THREE.BufferAttribute(g.sz,  1));
    g2.setAttribute('aColor',   new THREE.BufferAttribute(g.col, 3));
    return g2;
  }, [g]);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   STAR_VERT,
    fragmentShader: STAR_FRAG,
    uniforms: {
      uTime:       { value: 0 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
    },
    transparent:  true,
    depthWrite:   false,
    blending:     THREE.AdditiveBlending,
  }), [gl]);

  useFrame(({ clock }, delta) => {
    if (!pts.current) return;
    mat.uniforms.uTime.value = clock.getElapsedTime();

    // Majestic slow drift — delta independent
    pts.current.rotation.y += delta * 0.015;
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
        <EffectComposer multisampling={0}>
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