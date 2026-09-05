'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

/**
 * Spiral Galaxy Background — Cosmic Deep-Space v4
 *
 * Architecture: 3-layer scroll parallax (foreground / midground / background)
 *  · Main Galaxy: 85k stars in 3 logarithmic spiral arms + dense bulge + dust lanes
 *  · Deep Field: 12k distant faint stars + micro-galaxy dots at very low alpha
 *  · Foreground: 4k passing stardust, moves fast, slight tilt on scroll
 *
 * Midground camera dives along Z (22 → 7) via lerp on scroll depth.
 * All additive blending, controlled alpha (text stays crisp).
 */

/* ════════════════════════════════════════════════════════════════════ */
const MAIN_COUNT     = 85_000;
const DEEP_COUNT     = 12_000;
const DUST_COUNT     = 4_000;
const ARMS           = 3;
const DISC_RADIUS    = 9.5;
const BULGE_RADIUS   = 2.6;
const CAM_START      = 22;
const CAM_END        = 7;
/* ════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════ SHADERS ══════════════════════════════ */
const GALAXY_VERT = /* glsl */ `
  attribute float aScale;
  attribute float aRadius;
  attribute vec3  aColor;
  attribute float aTwinkle;
  attribute float aCoreW;
  attribute float aDust;      // 0 = galaxy, 1 = dark lane

  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uScroll;      // 0 = hero, 1 = deep

  varying vec3 vColor;
  varying float vCoreW;
  varying float vDepth01;

  /* Lightweight 3D value noise (no lib) */
  float hash31(vec3 p){ p = fract(p * vec3(443.8975, 397.2973, 491.1871)); p += dot(p, p.yxz+19.19); return fract(p.x+p.y); }
  float vnoise3(vec3 p){
    vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    float n000=hash31(i), n100=hash31(i+vec3(1,0,0)), n010=hash31(i+vec3(0,1,0)), n110=hash31(i+vec3(1,1,0));
    float n001=hash31(i+vec3(0,0,1)), n101=hash31(i+vec3(1,0,1)), n011=hash31(i+vec3(0,1,1)), n111=hash31(i+vec3(1,1,1));
    float nx00=mix(n000,n100,f.x), nx10=mix(n010,n110,f.x), nx01=mix(n001,n101,f.x), nx11=mix(n011,n111,f.x);
    float nxy0=mix(nx00,nx10,f.y), nxy1=mix(nx01,nx11,f.y);
    return mix(nxy0,nxy1,f.z);
  }

  void main() {
    vColor = aColor;
    vCoreW = aCoreW;

    /* Organic orbital wobble: noise samples at low freq */
    float nT = uTime * 0.16 + uScroll * 1.2;
    vec3  np = position * 0.48 + vec3(13.7, 4.1, 9.3);
    float nx = vnoise3(np + vec3(0,0,nT)) - 0.5;
    float ny = vnoise3(np + vec3(7.3,19.7,2.5)) - 0.5;
    float nz = vnoise3(np + vec3(4.9, 2.3, 11.1)) - 0.5;
    vec3 wobble = vec3(nx, ny, nz) * (0.3 + aCoreW * 0.5);

    vec3 displaced = position + wobble;

    /* Project with depth attenuation */
    vec4 mvPos = modelViewMatrix * vec4(displaced, 1.0);
    gl_Position = projectionMatrix * mvPos;

    float depth = -mvPos.z;
    float near01 = 1.0 - smoothstep(2.0, 60.0, depth);
    vDepth01 = 1.0 - near01;   // 0 = near, 1 = far

    /* Twinkle */
    float tw = 1.0 + sin(uTime * 2.0 + aTwinkle) * (0.05 + aCoreW * 0.15);
    float sz = uSize * aScale * tw;

    gl_PointSize = clamp(sz * uPixelRatio / depth * (0.7 + near01 * 0.5), 0.4, 7.0);
  }
`;

const GALAXY_FRAG = /* glsl */ `
  varying vec3  vColor;
  varying float vCoreW;
  varying float vDepth01;

  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    float strength = pow(1.0 - r * 2.0, 2.4);
    if (strength < 0.012) discard;

    /* Dark dust lanes: desaturate + slight dark tint */
    vec3 dustCol = mix(vColor, vec3(0.08, 0.08, 0.12), 0.55);
    vec3 col = mix(dustCol, vColor, 0.85);

    /* Core blowout (soft falloff, no sharp ring) */
    float dist2D = length(vec2(gl_PointCoord.x - 0.5, gl_PointCoord.y - 0.5) * 2.0);
    float coreGlow = 1.0 - smoothstep(0.0, 0.7, dist2D);
    coreGlow = pow(coreGlow, 2.8);
    vec3 hot = vec3(1.00, 0.96, 0.88);
    col = mix(col, hot, coreGlow * vCoreW * 0.5);

    /* Alpha: reduced ~35%, depth fade for spatial feel */
    float alpha = strength * (0.55 - vDepth01 * 0.28) * (0.55 - vCoreW * 0.2);
    gl_FragColor = vec4(col * strength * 0.82, alpha);
  }
`;

const DEEP_VERT = /* glsl */ `
  attribute float aScale;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vDepth01;
  void main() {
    vColor = aColor;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPos;
    float depth = -mvPos.z;
    float near01 = 1.0 - smoothstep(2.0, 80.0, depth);
    vDepth01 = 1.0 - near01;
    gl_PointSize = clamp(aScale * uPixelRatio / depth, 0.2, 2.0);
  }
`;

const DEEP_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vDepth01;
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    float s = pow(1.0 - r * 2.0, 1.6);
    float alpha = s * 0.35 * (0.35 + 0.65 * (1.0 - vDepth01));
    gl_FragColor = vec4(vColor * s, alpha);
  }
`;

const DUST_VERT = /* glsl */ `
  attribute vec3 aColor; attribute float aScale;
  uniform float uTime; uniform float uPixelRatio; uniform float uOpacity;
  varying vec3 vColor; varying float vOpacity;
  void main() {
    vColor = aColor; vOpacity = uOpacity;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPos;
    float d = -mvPos.z;
    gl_PointSize = clamp(aScale * uPixelRatio / d, 0.3, 2.0);
  }
`;

const DUST_FRAG = /* glsl */ `
  varying vec3 vColor; varying float vOpacity;
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    float s = pow(1.0 - r * 2.0, 1.6);
    gl_FragColor = vec4(vColor * s, s * vOpacity * 0.5);
  }
`;

/* ════════════════════════════════════════════════════════ */
function generateGalaxy() {
  const pos = new Float32Array(MAIN_COUNT * 3);
  const sc  = new Float32Array(MAIN_COUNT);
  const col = new Float32Array(MAIN_COUNT * 3);
  const cw  = new Float32Array(MAIN_COUNT);
  const twk = new Float32Array(MAIN_COUNT);
  const rd  = new Float32Array(MAIN_COUNT);
  const dust = new Float32Array(MAIN_COUNT); // 1 = dark lane

  const C_CORE = new THREE.Color(1.00, 0.97, 0.90);
  const C_ARM  = new THREE.Color(0.28, 0.72, 1.00);
  const C_OUT  = new THREE.Color(0.35, 0.42, 0.88);
  const C_DARK = new THREE.Color(0.08, 0.08, 0.12);

  for (let i = 0; i < MAIN_COUNT; i++) {
    const isHalo = Math.random() < 0.035;
    let x = 0, y = 0, z = 0, radius = 0;

    if (isHalo) {
      const r = 8 + Math.random() * 28;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      x = r * Math.sin(phi) * Math.cos(theta);
      y = r * Math.sin(phi) * Math.sin(theta);
      z = r * Math.cos(phi) * 0.3;
      radius = 9 + Math.random() * 5;
    } else {
      radius = Math.pow(Math.random(), 3.0) * DISC_RADIUS;
      const spin = radius * 0.62;
      const arm = Math.floor(Math.random() * ARMS);
      const branch = (arm / ARMS) * Math.PI * 2;
      const angle = spin + branch;

      const t = Math.min(1, radius / DISC_RADIUS);
      const coreW = Math.pow(1 - t, 2.2);
      const zSpread = 1.3 * coreW;
      const zOff = (Math.random() + Math.random() - 1) * zSpread;

      const tight = Math.exp(-radius * 0.55);
      const armW = (0.14 + radius * 0.09) * (1.0 - tight * 0.88);
      const rN = (Math.random() + Math.random() - 1) * armW;
      const tN = (Math.random() - 0.5) * armW * 0.55;

      const armDir = angle;
      const armR = angle + Math.PI / 2;
      const ox = Math.cos(armR) * rN + Math.cos(armDir) * tN;
      const oy = Math.sin(armR) * rN + Math.sin(armDir) * tN;

      x = Math.cos(angle) * radius + ox;
      y = Math.sin(angle) * radius + oy;
      z = zOff;
    }

    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    rd[i] = radius;

    const t = Math.min(1, radius / DISC_RADIUS);
    const tB = Math.pow(1 - t, 1.8);
    sc[i] = 0.5 + tB * 1.8 + Math.random() * 0.3;

    cw[i] = Math.pow(1 - Math.min(1, radius / DISC_RADIUS), 2.2);
    twk[i] = Math.random() * Math.PI * 2;

    // Dark dust lanes: ~15% of particles desaturated
    dust[i] = Math.random() < 0.15 ? 1.0 : 0.0;

    let c;
    if (t < 0.18) c = new THREE.Color().lerpColors(C_CORE, C_ARM, t / 0.18);
    else if (t < 0.55) c = new THREE.Color().lerpColors(C_ARM, C_OUT, (t - 0.18) / 0.37);
    else c = new THREE.Color().lerpColors(C_OUT, C_DARK, (t - 0.55) / 0.45);
    if (t < 0.06 && Math.random() < 0.4) c = new THREE.Color(1, 1, 1);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }

  return { pos, sc, col, cw, twk, rd, dust };
}

function generateDeepField() {
  const pos = new Float32Array(DEEP_COUNT * 3);
  const col = new Float32Array(DEEP_COUNT * 3);
  const sc  = new Float32Array(DEEP_COUNT);
  for (let i = 0; i < DEEP_COUNT; i++) {
    const r = 16 + Math.random() * 35;
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i*3+2] = (Math.random() - 0.5) * 8;
    sc[i] = 0.15 + Math.random() * 0.35;
    const c = Math.random() < 0.5 ? new THREE.Color(0.7,0.8,1.0) : new THREE.Color(0.9,0.85,0.7);
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }
  return { pos, col, sc };
}

function generateDust() {
  const pos = new Float32Array(DUST_COUNT * 3);
  const col = new Float32Array(DUST_COUNT * 3);
  const sc  = new Float32Array(DUST_COUNT);
  for (let i = 0; i < DUST_COUNT; i++) {
    const r = 4 + Math.random() * 18;
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    pos[i*3] = r*Math.sin(phi)*Math.cos(theta);
    pos[i*3+1] = r*Math.sin(phi)*Math.sin(theta);
    pos[i*3+2] = (Math.random()-0.5) * 4;
    sc[i] = 0.4 + Math.random() * 0.6;
    const c = new THREE.Color(0.65 + Math.random()*0.35, 0.70 + Math.random()*0.25, 1.0);
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
  }
  return { pos, col, sc };
}

/* ════════════════════════════════════════════════════════════════════ */
function GalaxyDisk() {
  const pts = useRef<THREE.Points>(null);
  const { gl } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const m = (e: MouseEvent) => { mouse.current = { x: (e.clientX/innerWidth-0.5)*2, y: (e.clientY/innerHeight-0.5)*2 }; };
    window.addEventListener('mousemove', m, { passive: true });
    return () => window.removeEventListener('mousemove', m);
  }, []);

  const g = useMemo(() => generateGalaxy(), []);
  const geo = useMemo(() => {
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.BufferAttribute(g.pos, 3));
    g2.setAttribute('aScale', new THREE.BufferAttribute(g.sc, 1));
    g2.setAttribute('aRadius', new THREE.BufferAttribute(g.rd, 1));
    g2.setAttribute('aColor', new THREE.BufferAttribute(g.col, 3));
    g2.setAttribute('aCoreW', new THREE.BufferAttribute(g.cw, 1));
    g2.setAttribute('aTwinkle', new THREE.BufferAttribute(g.twk, 1));
    g2.setAttribute('aDust', new THREE.BufferAttribute(g.dust, 1));
    return g2;
  }, [g]);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: GALAXY_VERT, fragmentShader: GALAXY_FRAG,
    uniforms: { uTime:{value:0}, uSize:{value:260}, uPixelRatio:{value:Math.min(gl.getPixelRatio(),2)}, uScroll:{value:0} },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }), [gl]);

  const scrollRef = useRef(0);
  useEffect(() => {
    const s = () => { const d = document.documentElement; const mx = Math.max(1, d.scrollHeight - innerHeight); scrollRef.current = mx>0 ? Math.min(1, scrollY/mx) : 0; };
    s(); window.addEventListener('scroll', s, { passive: true }); window.addEventListener('resize', s); return () => { window.removeEventListener('scroll', s); window.removeEventListener('resize', s); };
  }, []);

  useFrame(({ clock }, delta) => {
    if (!pts.current) return;
    mat.uniforms.uTime.value = clock.getElapsedTime();
    mat.uniforms.uScroll.value = THREE.MathUtils.damp(mat.uniforms.uScroll.value, scrollRef.current, 1, delta*0.05);

    pts.current.rotation.x = THREE.MathUtils.damp(pts.current.rotation.x, mouse.current.y * 0.18, 1, delta*0.04);
    pts.current.rotation.y = THREE.MathUtils.damp(pts.current.rotation.y, mouse.current.x * 0.22, 1, delta*0.04);
    pts.current.rotation.z = clock.getElapsedTime() * 0.008;
    pts.current.scale.setScalar(THREE.MathUtils.damp(pts.current.scale.x, 1 + scrollRef.current * 0.45, 1, delta*0.06));
  });

  return <points ref={pts} geometry={geo} material={mat} />;
}

/* ════════════════════════════════════════════════════════════════════ */
function DeepField() {
  const pts = useRef<THREE.Points>(null);
  const { gl } = useThree();
  const g = useMemo(() => generateDeepField(), []);
  const geo = useMemo(() => {
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.BufferAttribute(g.pos, 3));
    g2.setAttribute('aColor', new THREE.BufferAttribute(g.col, 3));
    g2.setAttribute('aScale', new THREE.BufferAttribute(g.sc, 1));
    return g2;
  }, [g]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: DEEP_VERT, fragmentShader: DEEP_FRAG,
    uniforms: { uTime:{value:0}, uPixelRatio:{value:Math.min(gl.getPixelRatio(),2)} },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }), [gl]);

  const scrollRef = useRef(0);
  useEffect(() => {
    const s = () => { const d = document.documentElement; const mx = Math.max(1, d.scrollHeight - innerHeight); scrollRef.current = mx>0 ? Math.min(1, scrollY/mx) : 0; };
    s(); window.addEventListener('scroll', s, { passive: true }); window.addEventListener('resize', s); return () => { window.removeEventListener('scroll', s); window.removeEventListener('resize', s); };
  }, []);

  useFrame(({ clock }, delta) => {
    if (!pts.current) return;
    mat.uniforms.uTime.value = clock.getElapsedTime();
    // Background layer: very slow parallax (1/4 speed of scroll) — immense scale
    pts.current.rotation.y = clock.getElapsedTime() * 0.003 + scrollRef.current * 0.08;
    pts.current.position.z = THREE.MathUtils.damp(pts.current.position.z, -scrollRef.current * 6, 1, delta*0.03);
    // Opacity rises subtly with scroll (deep exploration reveals field)
    const t = scrollRef.current;
    pts.current.visible = t > 0.15;
  });

  return <points ref={pts} geometry={geo} material={mat} />;
}

/* ════════════════════════════════════════════════════════════════════ */
function ForegroundDust() {
  const pts = useRef<THREE.Points>(null);
  const { gl } = useThree();
  const g = useMemo(() => generateDust(), []);
  const geo = useMemo(() => {
    const g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.BufferAttribute(g.pos, 3));
    g2.setAttribute('aColor', new THREE.BufferAttribute(g.col, 3));
    g2.setAttribute('aScale', new THREE.BufferAttribute(g.sc, 1));
    return g2;
  }, [g]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: DUST_VERT, fragmentShader: DUST_FRAG,
    uniforms: { uTime:{value:0}, uPixelRatio:{value:Math.min(gl.getPixelRatio(),2)}, uOpacity:{value:0.6} },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }), [gl]);

  const scrollRef = useRef(0);
  useEffect(() => {
    const s = () => { const d = document.documentElement; const mx = Math.max(1, d.scrollHeight - innerHeight); scrollRef.current = mx>0 ? Math.min(1, scrollY/mx) : 0; };
    s(); window.addEventListener('scroll', s, { passive: true }); window.addEventListener('resize', s); return () => { window.removeEventListener('scroll', s); window.removeEventListener('resize', s); };
  }, []);

  useFrame(({ clock }, delta) => {
    if (!pts.current) return;
    mat.uniforms.uTime.value = clock.getElapsedTime();
    // Foreground: fast movement, tilt with scroll depth
    pts.current.rotation.y = clock.getElapsedTime() * 0.05 + scrollRef.current * 0.35;
    pts.current.rotation.x = THREE.MathUtils.damp(pts.current.rotation.x, scrollRef.current * 0.15, 1, delta*0.05);
    pts.current.position.z = THREE.MathUtils.damp(pts.current.position.z, -scrollRef.current * 3, 1, delta*0.04);
  });

  return <points ref={pts} geometry={geo} material={mat} />;
}

/* ════════════════════════════════════════════════════════════════════ */
function ScrollCameraRig() {
  const { camera } = useThree();
  const scrollRef = useRef(0);
  useEffect(() => {
    const s = () => { const d = document.documentElement; const mx = Math.max(1, d.scrollHeight - innerHeight); scrollRef.current = mx>0 ? Math.min(1, scrollY/mx) : 0; };
    s(); window.addEventListener('scroll', s, { passive: true }); window.addEventListener('resize', s); return () => { window.removeEventListener('scroll', s); window.removeEventListener('resize', s); };
  }, []);

  useFrame((_, delta) => {
    const t = THREE.MathUtils.lerp(0, 1, THREE.MathUtils.smoothstep(scrollRef.current, 0, 1));
    // Lerp camera Z smoothly — weightless flight-through
    const targetZ = THREE.MathUtils.lerp(CAM_START, CAM_END, t);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 1, delta*0.05);
    camera.rotation.x = THREE.MathUtils.damp(camera.rotation.x, t * 0.06, 1, delta*0.05);
    camera.updateProjectionMatrix();
  });
  return null;
}

/* ════════════════════════════════════════════════════════════════════ */
function ContextCleanup() {
  const { gl } = useThree();
  useEffect(() => (() => { const ext = gl.getContext().getExtension('WEBGL_lose_context'); if(ext) ext.loseContext(); }), [gl]);
  return null;
}

/* ════════════════════════════════════════════════════════════════════ */
export default function SpiralGalaxyBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none"
      style={{ width:'100vw', height:'100vh', background:'radial-gradient(ellipse 120% 80% at 50% 50%, #060810 0%, #020305 55%, #000000 100%)' }}>
      <Canvas camera={{ position:[0,0,CAM_START], fov:55 }}
        gl={{ alpha:true, antialias:true, powerPreference:'high-performance', stencil:false }}
        dpr={[1,1.5]} onCreated={({gl})=>gl.setClearColor(0x000000,0)}>
        <ContextCleanup />
        <ScrollCameraRig />
        {/* 3-layer parallax: background (slow, distant) / mid (galaxy) / foreground (dust, fast) */}
        <DeepField />
        <GalaxyDisk />
        <ForegroundDust />
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.15} luminanceThreshold={0.22} luminanceSmoothing={0.85} mipmapBlur radius={0.85} />
        </EffectComposer>
      </Canvas>
      {/* Vignette for hero text readability */}
      <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 50% 45% at 50% 45%, rgba(2,4,8,0.55) 0%, rgba(2,4,8,0.30) 40%, transparent 75%)' }} />
    </div>
  );
}
