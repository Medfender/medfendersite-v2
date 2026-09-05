'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

/**
 * Spiral Galaxy Background — Cosmic Deep-Space v5 "Nexus"
 *
 * Architecture: 3-layer scroll parallax (background / midground / foreground)
 * · Main Galaxy: 75k stars in 3 logarithmic spiral arms + ultra-dense core bulge
 * · Deep Field: 10k distant faint stars at ultra-low alpha
 * · Foreground: 3k passing stardust, fast tilt on scroll
 *
 * Key design goals:
 * · Scroll inverted: down → camera Z increases (zoom OUT, reveals cosmos)
 * · ALL animations frame-rate independent: multiplied by delta × targetFPS
 * · Soft anti-aliased circular particles via distance-based smoothstep
 * · Core: ultra-dense exponential cluster, seamless radial bloom fade
 */

const MAIN_COUNT  = 75_000;
const DEEP_COUNT = 10_000;
const DUST_COUNT = 3_000;
const ARMS       = 3;
const DISC_RADIUS = 9.5;
const CAM_START   = 20;
const CAM_END     = 30;   // inverted: scroll → zoom OUT, cosmos expands
const TARGET_FPS  = 60;   // normalize all delta-driven values to 60 Hz
const VIGNETTE    = true;

/* ════════════════════════════════════════════════════ */
/*  GALAXY — VERTEX SHADER                              */
/*  Frame-rate independent: wobble × delta × TARGET_FPS  */
/* ════════════════════════════════════════════════════ */
const GALAXY_VERT = /* glsl */ `
  attribute float aScale;
  attribute float aRadius;
  attribute vec3  aColor;
  attribute float aTwinkle;
  attribute float aCoreW;

  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;

  varying vec3  vColor;
  varying float vCoreW;
  varying float vDepth01;

  /* ── Lightweight 3D value noise (no external lib) ── */
  float h31(vec3 p){
    p=fract(p*vec3(443.8975,397.2973,491.1871)); p+=dot(p,p.yxz+19.19);
    return fract(p.x+p.y+p.z);
  }
  float vnoise3(vec3 p){
    vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    #define H(x,y,z) h31(i+vec3(x,y,z))
    float n000=H(0,0,0),n100=H(1,0,0),n010=H(0,1,0),n110=H(1,1,0);
    float n001=H(0,0,1),n101=H(1,0,1),n011=H(0,1,1),n111=H(1,1,1);
    #undef H
    return mix(mix(mix(n000,n100,f.x),mix(n010,n110,f.x),f.y),
               mix(mix(n001,n101,f.x),mix(n011,n111,f.x),f.y),f.z);
  }

  void main() {
    vColor = aColor;
    vCoreW = aCoreW;

    /* ── Organic orbital wobble (frame-rate independent) ── */
    float nT = uTime;
    vec3 np = position * 0.5 + vec3(13.7, 4.1, 9.3);
    float nx = vnoise3(np + vec3(0.0,0.0,nT*0.16)) - 0.5;
    float ny = vnoise3(np + vec3(7.3,19.7,2.5) + vec3(0.0,0.0,nT*0.11)) - 0.5;
    float nz = vnoise3(np + vec3(4.9, 2.3,11.1) + vec3(0.0,0.0,nT*0.09)) - 0.5;
    vec3 wobble = vec3(nx,ny,nz) * (0.25 + aCoreW * 0.55);
    vec3 displaced = position + wobble;

    /* ── Projection with depth attenuation ── */
    vec4 mvPos = modelViewMatrix * vec4(displaced, 1.0);
    gl_Position = projectionMatrix * mvPos;

    float depth = max(-mvPos.z, 0.5);
    float near01 = 1.0 - smoothstep(2.0, 60.0, depth);
    vDepth01 = 1.0 - near01;

    /* ── Twinkle (frame-rate independent) ── */
    float tw = 1.0 + sin(uTime*2.0 + aTwinkle) * (0.05 + aCoreW * 0.14);
    gl_PointSize = clamp(uSize * aScale * tw * uPixelRatio / depth * (0.65 + near01*0.45), 0.4, 7.0);
  }
`;

/* ════════════════════════════════════════════════════ */
/*  GALAXY — FRAGMENT SHADER                            */
/*  · Soft anti-aliased circular glow via distance calc  */
/*  · Exponential core glow: e^(-r²·k) Gaussian density  */
/*  · Chromatic: warm gold core → cool blue arms         */
/*  · No hard edges — seamless Gaussian radial falloff     */
/* ════════════════════════════════════════════════════ */
const GALAXY_FRAG = /* glsl */ `
  varying vec3  vColor;
  varying float vCoreW;
  varying float vDepth01;

  void main() {
    /* ── Soft anti-aliased circular particle ── */
    /* Use length from gl_PointCoord center, NOT distance() */
    vec2 uv = gl_PointCoord - 0.5;
    float r  = length(uv) * 2.0;          /* 0 at center, 1 at edge */
    if (r > 1.0) discard;

    /* Exponential soft falloff — no hard ring, no discard cliff */
    float strength = exp(-r * r * 4.0);    /* Gaussian: bright core, feathered edge */
    float alpha   = strength * (0.55 - vDepth01 * 0.28) * (0.6 - vCoreW * 0.18);
    if (alpha < 0.008) discard;

    /* ── Photorealistic galactic core ── */
    /* Core: blindingly bright at origin, exponential radial fade */
    float coreR    = length(uv) * 2.0;
    float coreGlow = exp(-coreR * coreR * 8.0);   /* e^(-r²·8) — tight, blazing center */

    /* Warm golden-white at absolute core, cool blue at outer */
    vec3 hotWhite  = vec3(1.00, 0.96, 0.88);
    vec3 warmGold  = vec3(1.00, 0.85, 0.55);
    vec3 coldBlue = vec3(0.28, 0.65, 1.00);
    vec3 coldViolet = vec3(0.50, 0.38, 0.90);

    vec3 col = vColor;
    /* Core stars: blend warm gold → hot white at the very center */
    col = mix(col, warmGold, coreGlow * vCoreW * 0.6);
    col = mix(col, hotWhite, coreGlow * coreGlow * vCoreW * 0.4);
    /* Outer arms: cool blue/violet scatter */
    col = mix(col, coldViolet, vDepth01 * 0.2);

    gl_FragColor = vec4(col * strength * 0.85, alpha);
  }
`;

/* ════════════════════════════════════════════════════ */
/*  DEEP FIELD — VERTEX / FRAGMENT                      */
/*  Faint distant stars, very slow, ultra-low alpha      */
/* ════════════════════════════════════════════════════ */
const DEEP_VERT = /* glsl */ `
  attribute float aScale;
  attribute vec3  aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vDepth01;
  void main() {
    vColor = aColor;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPos;
    float depth = max(-mvPos.z, 0.5);
    float near01 = 1.0 - smoothstep(2.0, 80.0, depth);
    vDepth01 = 1.0 - near01;
    gl_PointSize = clamp(aScale * uPixelRatio / depth, 0.2, 2.0);
  }
`;

const DEEP_FRAG = /* glsl */ `
  varying vec3  vColor;
  varying float vDepth01;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv) * 2.0;
    if (r > 1.0) discard;
    float s = exp(-r * r * 3.5);
    float alpha = s * 0.32 * (0.30 + 0.70 * (1.0 - vDepth01));
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(vColor * s, alpha);
  }
`;

/* ════════════════════════════════════════════════════ */
/*  FOREGROUND DUST — VERTEX / FRAGMENT                */
/*  Fast-moving, soft, passes by the camera            */
/* ════════════════════════════════════════════════════ */
const DUST_VERT = /* glsl */ `
  attribute vec3  aColor;
  attribute float aScale;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPos;
    float d = max(-mvPos.z, 0.5);
    gl_PointSize = clamp(aScale * uPixelRatio / d, 0.3, 2.2);
  }
`;

const DUST_FRAG = /* glsl */ `
  varying vec3 vColor;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv) * 2.0;
    if (r > 1.0) discard;
    float s = exp(-r * r * 3.5);
    float alpha = s * 0.45;
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(vColor * s, alpha);
  }
`;

/* ════════════════════════════════════════════════════ */
/*  PARTICLE GENERATORS                                 */
/* ════════════════════════════════════════════════════ */
function generateGalaxy() {
  const pos = new Float32Array(MAIN_COUNT * 3);
  const sc  = new Float32Array(MAIN_COUNT);
  const col = new Float32Array(MAIN_COUNT * 3);
  const cw  = new Float32Array(MAIN_COUNT);
  const twk = new Float32Array(MAIN_COUNT);
  const rd  = new Float32Array(MAIN_COUNT);

  /* Colour palette */
  const C0 = new THREE.Color(1.00, 0.97, 0.90);   /* white-gold core */
  const C1 = new THREE.Color(1.00, 0.82, 0.50);   /* warm gold */
  const C2 = new THREE.Color(0.28, 0.65, 1.00);   /* hot blue arm */
  const C3 = new THREE.Color(0.50, 0.38, 0.90);   /* violet outer */
  const C4 = new THREE.Color(0.05, 0.05, 0.10);   /* dark dust lane */

  for (let i = 0; i < MAIN_COUNT; i++) {
    const isHalo = Math.random() < 0.04;
    let x = 0, y = 0, z = 0, radius = 0;

    if (isHalo) {
      /* Spherical halo — adds volumetric depth to outer shell */
      const r = 8 + Math.random() * 28;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      x = r * Math.sin(phi) * Math.cos(theta);
      y = r * Math.sin(phi) * Math.sin(theta);
      z = r * Math.cos(phi) * 0.28;
      radius = 9 + Math.random() * 5;
    } else {
      /* Logarithmic spiral arms */
      radius = Math.pow(Math.random(), 3.0) * DISC_RADIUS;
      const spin = radius * 0.62;
      const arm  = Math.floor(Math.random() * ARMS);
      const angle = spin + (arm / ARMS) * Math.PI * 2;

      const t = Math.min(1, radius / DISC_RADIUS);
      const coreW = Math.pow(1 - t, 2.2);
      const zSpread = 1.3 * coreW;
      const zOff = (Math.random() + Math.random() - 1) * zSpread;

      /* Arm scatter: tight at core, spread at rim */
      const tight = Math.exp(-radius * 0.55);
      const armW = (0.12 + radius * 0.08) * (1.0 - tight * 0.9);
      const rN = (Math.random() + Math.random() - 1) * armW;
      const tN = (Math.random() - 0.5) * armW * 0.55;
      const armR = angle + Math.PI / 2;

      x = Math.cos(angle) * radius + Math.cos(armR) * rN + Math.cos(angle) * tN;
      y = Math.sin(angle) * radius + Math.sin(armR) * rN + Math.sin(angle) * tN;
      z = zOff;
    }

    pos[i*3] = x; pos[i*3+1] = y; pos[i*3+2] = z;
    rd[i] = radius;

    /* ── Size: huge variance — a few giants, sea of micro-dust ── */
    const t = Math.min(1, radius / DISC_RADIUS);
    const tB = Math.pow(1 - t, 1.8);
    const giant = Math.random() < 0.012;          /* 1.2% are giant stars */
    sc[i] = giant
      ? 1.8 + Math.random() * 1.4               /* giants: 1.8–3.2 */
      : 0.4 + tB * 1.4 + Math.random() * 0.25;  /* normal: 0.4–2.1 */

    cw[i]  = Math.pow(1 - Math.min(1, radius / DISC_RADIUS), 2.2);
    twk[i] = Math.random() * Math.PI * 2;

    /* ── Chromatic gradient: gold core → blue arms → violet rim ── */
    let c: THREE.Color;
    if (t < 0.12)      c = new THREE.Color().lerpColors(C0, C1, t / 0.12);
    else if (t < 0.45) c = new THREE.Color().lerpColors(C1, C2, (t - 0.12) / 0.33);
    else if (t < 0.75) c = new THREE.Color().lerpColors(C2, C3, (t - 0.45) / 0.30);
    else                c = new THREE.Color().lerpColors(C3, C4, (t - 0.75) / 0.25);

    /* Sprinkle white-hot giant stars at the core */
    if (t < 0.05 && (Math.random() < 0.35 || giant)) c = new THREE.Color(1, 1, 1);

    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }

  return { pos, sc, col, cw, twk, rd };
}

/* ── Deep field: scattered across a wide sphere shell ── */
function generateDeepField() {
  const pos = new Float32Array(DEEP_COUNT * 3);
  const col = new Float32Array(DEEP_COUNT * 3);
  const sc  = new Float32Array(DEEP_COUNT);
  for (let i = 0; i < DEEP_COUNT; i++) {
    const r = 18 + Math.random() * 40;
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = (Math.random() - 0.5) * 10;
    sc[i] = 0.12 + Math.random() * 0.3;
    const c = Math.random() < 0.5
      ? new THREE.Color(0.65, 0.75, 1.00)   /* blue-white */
      : new THREE.Color(0.90, 0.88, 0.70);   /* warm white */
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }
  return { pos, col, sc };
}

/* ── Foreground dust: tight shell, fast orbit ── */
function generateDust() {
  const pos = new Float32Array(DUST_COUNT * 3);
  const col = new Float32Array(DUST_COUNT * 3);
  const sc  = new Float32Array(DUST_COUNT);
  for (let i = 0; i < DUST_COUNT; i++) {
    const r = 5 + Math.random() * 20;
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = (Math.random() - 0.5) * 5;
    sc[i] = 0.35 + Math.random() * 0.55;
    const c = new THREE.Color(0.55 + Math.random()*0.45, 0.65 + Math.random()*0.30, 1.0);
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }
  return { pos, col, sc };
}

/* ════════════════════════════════════════════════════ */
/*  GALAXY DISK — Main midground spiral                */
/* ════════════════════════════════════════════════════ */
function GalaxyDisk() {
  const pts  = useRef<THREE.Points>(null);
  const { gl } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const m = (e: MouseEvent) => {
      mouse.current = { x: (e.clientX / innerWidth  - 0.5) * 2,
                        y: (e.clientY / innerHeight - 0.5) * 2 };
    };
    window.addEventListener('mousemove', m, { passive: true });
    return () => window.removeEventListener('mousemove', m);
  }, []);

  const g = useMemo(() => generateGalaxy(), []);
  const geo = useMemo(() => {
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.BufferAttribute(g.pos, 3));
    g2.setAttribute('aScale',   new THREE.BufferAttribute(g.sc,  1));
    g2.setAttribute('aRadius',  new THREE.BufferAttribute(g.rd,  1));
    g2.setAttribute('aColor',   new THREE.BufferAttribute(g.col, 3));
    g2.setAttribute('aCoreW',   new THREE.BufferAttribute(g.cw,  1));
    g2.setAttribute('aTwinkle', new THREE.BufferAttribute(g.twk, 1));
    return g2;
  }, [g]);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   GALAXY_VERT,
    fragmentShader: GALAXY_FRAG,
    uniforms: {
      uTime:       { value: 0 },
      uSize:       { value: 260 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
    },
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  }), [gl]);

  useFrame(({ clock }, delta) => {
    if (!pts.current) return;
    const t = clock.getElapsedTime();
    const dt = delta * TARGET_FPS;   /* frame-rate normalised delta */
    mat.uniforms.uTime.value = t;

    /* Mouse parallax — frame-rate independent */
    pts.current.rotation.x = THREE.MathUtils.damp(
      pts.current.rotation.x, mouse.current.y * 0.18, 1, delta * 0.04);
    pts.current.rotation.y = THREE.MathUtils.damp(
      pts.current.rotation.y, mouse.current.x * 0.22, 1, delta * 0.04);

    /* Ambient spin — multiplied by dt × TARGET_FPS so same speed at 60/120/240 Hz */
    pts.current.rotation.z = t * 0.008 * TARGET_FPS;   /* normalize to 60 Hz */
  });

  return <points ref={pts} geometry={geo} material={mat} />;
}

/* ════════════════════════════════════════════════════ */
/*  DEEP FIELD — Background layer (slow, faint)        */
/* ════════════════════════════════════════════════════ */
function DeepField() {
  const pts  = useRef<THREE.Points>(null);
  const { gl } = useThree();
  const g = useMemo(() => generateDeepField(), []);
  const geo = useMemo(() => {
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.BufferAttribute(g.pos, 3));
    g2.setAttribute('aColor',   new THREE.BufferAttribute(g.col, 3));
    g2.setAttribute('aScale',   new THREE.BufferAttribute(g.sc,  1));
    return g2;
  }, [g]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   DEEP_VERT,
    fragmentShader: DEEP_FRAG,
    uniforms: {
      uTime:       { value: 0 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
    },
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  }), [gl]);

  useFrame(({ clock }, delta) => {
    if (!pts.current) return;
    mat.uniforms.uTime.value = clock.getElapsedTime();
    /* Ultra-slow rotation: multiplied by delta × TARGET_FPS */
    pts.current.rotation.y += delta * 0.008 * TARGET_FPS;
    pts.current.visible = true;   /* always visible, ultra-faint */
  });

  return <points ref={pts} geometry={geo} material={mat} />;
}

/* ════════════════════════════════════════════════════ */
/*  FOREGROUND DUST — Fast-moving layer                */
/* ════════════════════════════════════════════════════ */
function ForegroundDust() {
  const pts  = useRef<THREE.Points>(null);
  const { gl } = useThree();
  const g = useMemo(() => generateDust(), []);
  const geo = useMemo(() => {
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.BufferAttribute(g.pos, 3));
    g2.setAttribute('aColor',   new THREE.BufferAttribute(g.col, 3));
    g2.setAttribute('aScale',   new THREE.BufferAttribute(g.sc,  1));
    return g2;
  }, [g]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   DUST_VERT,
    fragmentShader: DUST_FRAG,
    uniforms: {
      uTime:       { value: 0 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
    },
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  }), [gl]);

  useFrame(({ clock }, delta) => {
    if (!pts.current) return;
    mat.uniforms.uTime.value = clock.getElapsedTime();
    /* Fast orbit — frame-rate independent */
    pts.current.rotation.y += delta * 0.055 * TARGET_FPS;
    pts.current.rotation.x  = Math.sin(clock.getElapsedTime() * 0.025 * TARGET_FPS) * 0.06;
  });

  return <points ref={pts} geometry={geo} material={mat} />;
}

/* ════════════════════════════════════════════════════ */
/*  SCROLL CAMERA RIG — Inverted: scroll → zoom OUT   */
/*  Frame-rate independent lerp via damp × delta       */
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
    return () => {
      window.removeEventListener('scroll', s);
      window.removeEventListener('resize', s);
    };
  }, []);

  useFrame((_, delta) => {
    /* Invert: scroll 0 → CAM_START (close), scroll 1 → CAM_END (far/zoomed-out) */
    const targetZ = THREE.MathUtils.lerp(CAM_START, CAM_END, scrollRef.current);
    /* Frame-rate independent damp — same feel at 60/120/240 Hz */
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z, targetZ, 1, delta * 0.06);
    /* Subtle tilt as we pull back */
    camera.rotation.x = THREE.MathUtils.damp(
      camera.rotation.x, scrollRef.current * 0.05, 1, delta * 0.06);
    camera.updateProjectionMatrix();
  });

  return null;
}

/* ════════════════════════════════════════════════════ */
/*  WEBGL CLEANUP                                       */
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
/*  ROOT EXPORT                                         */
/* ════════════════════════════════════════════════════ */
export default function SpiralGalaxyBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(ellipse 140% 90% at 50% 50%, #060810 0%, #020305 50%, #000000 100%)',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, CAM_START], fov: 55 }}
        gl={{
          alpha: true,
          antialias: false,      /* off — particle circles are hand-drawn in GLSL */
          powerPreference: 'high-performance',
          stencil: false,
        }}
        dpr={[1, 2]}             /* native on HiDPI/4K */
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ContextCleanup />
        <ScrollCameraRig />
        <DeepField />
        <GalaxyDisk />
        <ForegroundDust />
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.20}
            luminanceSmoothing={0.88}
            mipmapBlur
            radius={0.9}
          />
        </EffectComposer>
      </Canvas>

      {VIGNETTE && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 55% 50% at 50% 48%, rgba(2,4,8,0.58) 0%, rgba(2,4,8,0.30) 38%, transparent 72%)',
          }}
        />
      )}
    </div>
  );
}
