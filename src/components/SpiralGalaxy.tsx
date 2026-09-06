'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

/**
 * Spiral Galaxy — Optical Cosmic v6
 * Photorealistic, majestic ultra-slow spin, exponential core, soft Gaussian glow.
 */

const MAIN_COUNT = 80_000;
const DEEP_COUNT = 12_000;
const DUST_COUNT = 3_000;
const ARMS = 3;
const DISC_RADIUS = 10.0;
const MAX_SIZE = 4.0;

/* ════════════════════════════════════════════════════ */
/*  VERTEX SHADER — depth attenuation + aSize          */
/* ════════════════════════════════════════════════════ */
const GALAXY_VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3  aColor;
  uniform float uTime;
  uniform float uPixelRatio;

  varying vec3 vColor;

  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // Photorealistic depth attenuation: shrink with distance
    gl_PointSize = aSize * (300.0 / -mvPosition.z) * uPixelRatio;
  }
`;

/* ════════════════════════════════════════════════════ */
/*  FRAGMENT SHADER — Gaussian optical glow, no hard cut */
/* ════════════════════════════════════════════════════ */
const GALAXY_FRAG = /* glsl */ `
  varying vec3 vColor;

  void main() {
    // Soft Gaussian exponential falloff — true optical glow
    float alpha = exp(-length(gl_PointCoord.xy - vec2(0.5)) * 15.0);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

/* ════════════════════════════════════════════════════ */
/*  DEEP FIELD SHADER                                  */
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
    gl_PointSize = aSize * (300.0 / -mvPosition.z) * uPixelRatio;
  }
`;

const DEEP_FRAG = /* glsl */ `
  varying vec3 vColor;
  void main() {
    float alpha = exp(-length(gl_PointCoord.xy - vec2(0.5)) * 15.0);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor, alpha * 0.35);
  }
`;

/* ════════════════════════════════════════════════════ */
/*  DUST SHADER                                        */
/* ════════════════════════════════════════════════════ */
const DUST_VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * (300.0 / -mvPosition.z) * uPixelRatio;
  }
`;

const DUST_FRAG = /* glsl */ `
  varying vec3 vColor;
  void main() {
    float alpha = exp(-length(gl_PointCoord.xy - vec2(0.5)) * 15.0);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(vColor, alpha * 0.55);
  }
`;

/* ════════════════════════════════════════════════════ */
/*  EXponential particle generation — heavy at origin   */
/* ════════════════════════════════════════════════════ */
function generateGalaxy() {
  const pos = new Float32Array(MAIN_COUNT * 3);
  const sz  = new Float32Array(MAIN_COUNT);
  const col = new Float32Array(MAIN_COUNT * 3);

  const C_WARM_CORE = new THREE.Color(1.00, 0.85, 0.45);   // warm gold
  const C_HOT_CORE  = new THREE.Color(1.00, 0.96, 0.88);   // white-hot
  const C_BLUE_ARM  = new THREE.Color(0.28, 0.65, 1.00);  // cool blue
  const C_PURPLE    = new THREE.Color(0.50, 0.30, 0.85);  // violet

  for (let i = 0; i < MAIN_COUNT; i++) {
    // Exponential distribution: heavily concentrated near origin
    const r = Math.exp(Math.random() * 2.5) - 1;  // 0 → ~11.2, dense near 0
    const angle = Math.random() * Math.PI * 2;
    const spin = r * 0.62;
    const arm = Math.floor(Math.random() * ARMS);
    const branch = (arm / ARMS) * Math.PI * 2;
    const finalAngle = spin + branch;

    // Spiral math
    const x = Math.cos(finalAngle) * r + (Math.random()-0.5)*0.3;
    const y = Math.sin(finalAngle) * r + (Math.random()-0.5)*0.3;
    const z = (Math.random() - 0.5) * 1.5 * Math.exp(-r * 0.3); // thin at core, spread outer

    pos[i*3] = x; pos[i*3+1] = y; pos[i*3+2] = z;

    // Size: 95% microscopic (power curve), 5% large
    sz[i] = Math.pow(Math.random(), 5) * MAX_SIZE;
    // Ensure some genuine giants for visual punch
    if (Math.random() < 0.015) sz[i] = 2.5 + Math.random() * 2.0;

    // Chromatic temperature based on distance from center
    const t = r / DISC_RADIUS;
    let c;
    if (t < 0.15) {
      c = new THREE.Color().lerpColors(C_HOT_CORE, C_WARM_CORE, t / 0.15);
    } else if (t < 0.50) {
      c = new THREE.Color().lerpColors(C_WARM_CORE, C_BLUE_ARM, (t - 0.15) / 0.35);
    } else {
      c = new THREE.Color().lerpColors(C_BLUE_ARM, C_PURPLE, (t - 0.50) / 0.50);
    }
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }
  return { pos, sz, col };
}

function generateDeepField() {
  const pos = new Float32Array(DEEP_COUNT * 3);
  const sz  = new Float32Array(DEEP_COUNT);
  const col = new Float32Array(DEEP_COUNT * 3);
  for (let i = 0; i < DEEP_COUNT; i++) {
    const r = 12 + Math.random() * 30;
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = (Math.random() - 0.5) * 8;
    sz[i] = 0.2 + Math.random() * 0.8;
    const c = Math.random() < 0.5 ? new THREE.Color(0.70, 0.85, 1.0) : new THREE.Color(0.90, 0.88, 0.75);
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }
  return { pos, sz, col };
}

function generateDust() {
  const pos = new Float32Array(DUST_COUNT * 3);
  const sz  = new Float32Array(DUST_COUNT);
  const col = new Float32Array(DUST_COUNT * 3);
  for (let i = 0; i < DUST_COUNT; i++) {
    const r = 3 + Math.random() * 15;
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = (Math.random() - 0.5) * 4;
    sz[i] = 0.15 + Math.random() * 0.5;
    const c = new THREE.Color(0.60 + Math.random()*0.30, 0.70 + Math.random()*0.20, 1.0);
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }
  return { pos, sz, col };
}

/* ════════════════════════════════════════════════════ */
/*  GALAXY DISK                                         */
/* ════════════════════════════════════════════════════ */
function GalaxyDisk() {
  const pts = useRef<THREE.Points>(null);
  const { gl } = useThree();
  const mouseTarget = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const m = (e: MouseEvent) => {
      mouseTarget.current = {
        x: (e.clientX / innerWidth - 0.5) * 2,
        y: (e.clientY / innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener('mousemove', m, { passive: true });
    return () => window.removeEventListener('mousemove', m);
  }, []);

  const g = useMemo(() => generateGalaxy(), []);
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
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [gl]);

  useFrame(({ clock }, delta) => {
    if (!pts.current) return;
    mat.uniforms.uTime.value = clock.getElapsedTime();

    /* Majestic ultra-slow spin — exactly 0.015 per delta */
    pts.current.rotation.z += delta * 0.015;

    /* Gentle mouse tilt */
    pts.current.rotation.x = THREE.MathUtils.damp(
      pts.current.rotation.x, mouseTarget.current.y * 0.12, 1, delta * 0.04);
    pts.current.rotation.y = THREE.MathUtils.damp(
      pts.current.rotation.y, mouseTarget.current.x * 0.15, 1, delta * 0.04);
  });

  return <points ref={pts} geometry={geo} material={mat} />;
}

/* ════════════════════════════════════════════════════ */
/*  DEEP FIELD                                         */
/* ════════════════════════════════════════════════════ */
function DeepField() {
  const pts = useRef<THREE.Points>(null);
  const { gl } = useThree();
  const g = useMemo(() => generateDeepField(), []);
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
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [gl]);

  useFrame((_, delta) => {
    if (!pts.current) return;
    pts.current.rotation.y += delta * 0.004;  /* very slow */
  });
  return <points ref={pts} geometry={geo} material={mat} />;
}

/* ════════════════════════════════════════════════════ */
/*  FOREGROUND DUST                                    */
/* ════════════════════════════════════════════════════ */
function ForegroundDust() {
  const pts = useRef<THREE.Points>(null);
  const { gl } = useThree();
  const g = useMemo(() => generateDust(), []);
  const geo = useMemo(() => {
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.BufferAttribute(g.pos, 3));
    g2.setAttribute('aSize', new THREE.BufferAttribute(g.sz, 1));
    g2.setAttribute('aColor', new THREE.BufferAttribute(g.col, 3));
    return g2;
  }, [g]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: DUST_VERT,
    fragmentShader: DUST_FRAG,
    uniforms: { uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [gl]);

  useFrame(({ clock }, delta) => {
    if (!pts.current) return;
    pts.current.rotation.y += delta * 0.02;
    pts.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.01) * 0.08;
  });
  return <points ref={pts} geometry={geo} material={mat} />;
}

/* ════════════════════════════════════════════════════ */
/*  SCROLL CAMERA — Aggressive Inverted Zoom            */
/*  Scroll 0 (top): Z=1.5 (deep in core)              */
/*  Scroll 1 (bottom): Z=25 (pull back, reveal cosmos) */
/* ════════════════════════════════════════════════════ */
function ScrollCameraRig() {
  const { camera } = useThree();
  const scrollRef = useRef(0);
  useEffect(() => {
    const s = () => {
      const d = document.documentElement;
      const mx = Math.max(1, d.scrollHeight - innerHeight);
      scrollRef.current = mx > 0 ? Math.min(1, Math.max(0, scrollY / mx)) : 0;
    };
    s();
    window.addEventListener('scroll', s, { passive: true });
    window.addEventListener('resize', s);
    return () => { window.removeEventListener('scroll', s); window.removeEventListener('resize', s); };
  }, []);

  useFrame((_, delta) => {
    // Aggressive inverted parallax: start deep, pull out
    const targetZ = THREE.MathUtils.lerp(1.5, 25.0, scrollRef.current);
    // Smooth lerp for weightless feel
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 1, delta * 0.08);
    // Gentle tilt increases as we reveal the full cosmos
    camera.rotation.x = THREE.MathUtils.damp(camera.rotation.x, scrollRef.current * 0.08, 1, delta * 0.08);
    camera.updateProjectionMatrix();
  });
  return null;
}

/* ════════════════════════════════════════════════════ */
/*  CLEANUP                                            */
/* ════════════════════════════════════════════════════ */
function ContextCleanup() {
  const { gl } = useThree();
  useEffect(() => () => {
    const ext = gl.getContext().getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
  }, [gl]);
  return null;
}

/* ════════════════════════════════════════════════════ */
/*  ROOT                                                */
/* ════════════════════════════════════════════════════ */
export default function SpiralGalaxyBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none"
      style={{ width:'100vw', height:'100vh', background:'radial-gradient(ellipse 120% 80% at 50% 50%, #060810 0%, #020305 55%, #000000 100%)' }}>
      <Canvas
        camera={{ position:[0, 0, 1.5], fov: 55 }}
        gl={{ alpha:true, antialias:true, powerPreference:'high-performance', stencil:false }}
        dpr={[1, 2]}
        onCreated={({gl})=>gl.setClearColor(0x000000,0)}>
        <ContextCleanup />
        <ScrollCameraRig />
        <DeepField />
        <GalaxyDisk />
        <ForegroundDust />
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.2} luminanceThreshold={0.20} luminanceSmoothing={0.88} mipmapBlur radius={0.9} />
        </EffectComposer>
      </Canvas>
      <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 50% 45% at 50% 45%, rgba(2,4,8,0.55) 0%, rgba(2,4,8,0.30) 40%, transparent 75%)' }} />
    </div>
  );
}
