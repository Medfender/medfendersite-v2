"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const STAR_COUNT = 18_000;
const NEBULA_COUNT = 2_500;
const STRING_COUNT = 40;
const SEGMENTS = 36;

function generateGalaxy() {
  const pos = new Float32Array(STAR_COUNT * 3);
  const sz = new Float32Array(STAR_COUNT);
  const col = new Float32Array(STAR_COUNT * 3);

  const core = new THREE.Color(1.0, 0.82, 0.55);
  const arm = new THREE.Color(0.35, 0.62, 1.0);
  const halo = new THREE.Color(0.75, 0.78, 0.92);

  for (let i = 0; i < STAR_COUNT; i++) {
    const radius = Math.pow(Math.random(), 0.55) * 14;
    const armIndex = Math.floor(Math.random() * 4);
    const armAngle = armIndex * (Math.PI / 2);
    const spiral = radius * 0.38;
    const angle = armAngle + spiral + (Math.random() - 0.5) * 0.55;
    const thickness = (Math.random() - 0.5) * (0.35 + radius * 0.04);

    pos[i * 3] = Math.cos(angle) * radius;
    pos[i * 3 + 1] = thickness * 1.2 + (Math.random() - 0.5) * 0.25;
    pos[i * 3 + 2] = Math.sin(angle) * radius;

    const isGiant = Math.random() < 0.006;
    sz[i] = isGiant ? 0.5 + Math.random() * 0.8 : 0.06 + Math.pow(Math.random(), 4) * 0.32;

    const t = radius / 14;
    let c: THREE.Color;
    if (radius < 1.6) c = core.clone();
    else if (t < 0.6) c = arm.clone().lerp(halo, t * 0.6);
    else c = halo.clone();

    c.multiplyScalar(0.45 + Math.random() * 0.6);
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  return { pos, sz, col };
}

function generateNebula() {
  const pos = new Float32Array(NEBULA_COUNT * 3);
  const col = new Float32Array(NEBULA_COUNT * 3);
  const c1 = new THREE.Color(0.05, 0.45, 0.95);
  const c2 = new THREE.Color(0.6, 0.2, 0.95);
  const c3 = new THREE.Color(0.1, 0.85, 0.85);

  for (let i = 0; i < NEBULA_COUNT; i++) {
    const radius = Math.pow(Math.random(), 0.6) * 12;
    const armIndex = Math.floor(Math.random() * 4);
    const angle = armIndex * (Math.PI / 2) + radius * 0.38 + (Math.random() - 0.5) * 0.8;
    const spread = (Math.random() - 0.5) * (0.8 + radius * 0.08);

    pos[i * 3] = Math.cos(angle) * radius;
    pos[i * 3 + 1] = spread * 1.4;
    pos[i * 3 + 2] = Math.sin(angle) * radius;

    const pick = Math.random();
    const color = pick < 0.33 ? c1 : pick < 0.66 ? c2 : c3;
    color.multiplyScalar(0.6 + Math.random() * 0.4);
    col[i * 3] = color.r;
    col[i * 3 + 1] = color.g;
    col[i * 3 + 2] = color.b;
  }
  return { pos, col };
}

function generateStrings() {
  const pointCount = STRING_COUNT * (SEGMENTS + 1) * 2;
  const pos = new Float32Array(pointCount * 3);
  const col = new Float32Array(pointCount * 3);
  const phases = new Float32Array(STRING_COUNT);

  for (let s = 0; s < STRING_COUNT; s++) {
      const layer = Math.floor(s / Math.max(1, Math.floor(STRING_COUNT / 12)));
    const perLayer = Math.max(1, Math.floor(STRING_COUNT / 12));
    const idxInLayer = s % perLayer;
    const angle = (idxInLayer / perLayer) * Math.PI * 2 + layer * 0.37;
    const radius = 3.0 + (idxInLayer % 4) * 0.45;
    const origin = new THREE.Vector3(
      Math.cos(angle) * radius,
      9 - layer * 2.3,
      Math.sin(angle) * radius
    );
    // Tangent direction: strings wrap around each tower level
    const dir = new THREE.Vector3(-Math.sin(angle), 0.05 * ((s % 3) - 1), Math.cos(angle)).normalize();
    const length = 5 + Math.random() * 9;
    phases[s] = Math.random() * Math.PI * 2;

    const cyan = new THREE.Color(0.0, 0.85, 0.95);
    const violet = new THREE.Color(0.55, 0.25, 0.95);
    const color = Math.random() < 0.5 ? cyan : violet;

    for (let k = 0; k <= SEGMENTS; k++) {
      const t = k / SEGMENTS;
      const along = (t - 0.5) * length;
      const point = origin.clone().addScaledVector(dir, along);
      const idx = (s * (SEGMENTS + 1) + k) * 3;
      pos[idx] = point.x;
      pos[idx + 1] = point.y;
      pos[idx + 2] = point.z;

      const c = color.clone().multiplyScalar(0.35 + Math.random() * 0.5);
      col[idx] = c.r;
      col[idx + 1] = c.g;
      col[idx + 2] = c.b;
    }
  }

  return { pos, col, phases };
}

function makeNoteTexture(glyph: string, color: string) {
  if (typeof document === "undefined") return null;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, size, size);
  ctx.font = `bold ${size * 0.58}px "Georgia", "Times New Roman", serif`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(glyph, size / 2, size / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function Galaxy() {
  const scrollRef = useRef<number | null>(null);
  const camTargetRef = useRef(new THREE.Vector3(0, 0.8, 0.8));
  const lookTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const lookAtScratch = useMemo(() => new THREE.Vector3(), []);
  const starsRef = useRef<THREE.Points>(null);
  const nebulaRef = useRef<THREE.Points>(null);
  const stringsRef = useRef<THREE.LineSegments>(null);
  const stringPointsRef = useRef<THREE.Points>(null);

  const stars = useMemo(() => generateGalaxy(), []);
  const nebula = useMemo(() => generateNebula(), []);
  const strings = useMemo(() => generateStrings(), []);

  const starGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(stars.pos, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(stars.sz, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(stars.col, 3));
    return geo;
  }, [stars]);

  const nebulaGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(nebula.pos, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(nebula.col, 3));
    return geo;
  }, [nebula]);

  const stringsGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    // Build segment index so each consecutive point pair forms a line segment
    const indices: number[] = [];
    for (let s = 0; s < STRING_COUNT; s++) {
      for (let k = 0; k < SEGMENTS; k++) {
        const base = s * (SEGMENTS + 1) + k;
        indices.push(base, base + 1);
      }
    }
    geo.setIndex(indices);
    geo.setAttribute("position", new THREE.BufferAttribute(strings.pos.slice(), 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(strings.col, 3));
    return geo;
  }, [strings]);

  const stringPointsGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(strings.pos.slice(), 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(strings.col, 3));
    return geo;
  }, [strings]);

  const starMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: /* glsl */ `
          attribute float aSize;
          attribute vec3 aColor;
          uniform float uTime;
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            vColor = aColor;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            float depth = max(-mvPosition.z, 0.5);
            gl_PointSize = aSize * (260.0 / depth);
            vAlpha = smoothstep(0.0, 1.0, 1.0 - (depth / 90.0));
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            float r = length(gl_PointCoord.xy - vec2(0.5));
            if (r > 0.5) discard;
            float alpha = exp(-r * 13.0);
            if (alpha < 0.04) discard;
            gl_FragColor = vec4(vColor, alpha * vAlpha * 0.9);
          }
        `,
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const nebulaMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.12,
        vertexColors: true,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    []
  );

  const stringMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const stringPointsMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.28,
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    []
  );

  // Store mutable base for strings
  const baseStringsRef = useRef<Float32Array>(strings.pos.slice());
  const phasesRef = useRef<Float32Array>(strings.phases.slice());
  const notesRef = useRef<THREE.Group>(null);

  const noteGroup = useMemo(() => {
    const group = new THREE.Group();
    const glyphs = ["♪", "♫", "♩", "♬", "𝄞"];
    const colors = ["#67e8f9", "#a5b4fc", "#7dd3fc", "#f0abfc", "#fde68a"];
    for (let i = 0; i < 12; i++) {
      const tex = makeNoteTexture(glyphs[i % glyphs.length], colors[i % colors.length]);
      if (!tex) continue;
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(mat);
      const radius = 1.6 + (i % 6) * 0.6;
      const angle = (i / 26) * Math.PI * 2;
      sprite.position.set(Math.cos(angle) * radius, i * 0.35 - 3.5, Math.sin(angle) * radius);
      sprite.scale.set(0.13, 0.13, 1);
      mat.opacity = 0.24;
      group.add(sprite);
    }
    return group;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    const maxScroll =
      typeof window !== "undefined"
        ? Math.max(document.documentElement.scrollHeight - window.innerHeight, window.innerHeight * 2)
        : 1;
    const scrollNorm = Math.min(scrollY / maxScroll, 1);
    const musicFactor = scrollNorm > 0.3 && scrollNorm < 0.75
      ? Math.max(0, 1 - Math.abs(scrollNorm - 0.52) * 3.4)
      : 0;

    const prevScroll = scrollRef.current;
    scrollRef.current = scrollY;
    const scrollDelta = prevScroll === null ? 0 : scrollY - prevScroll;
    const scrollVelocity = Math.min(Math.abs(scrollDelta) / 24, 1);

    if (starsRef.current) {
      starsRef.current.rotation.y += delta * (0.035 + scrollVelocity * 0.09);
    }
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y += delta * (0.018 + scrollVelocity * 0.045);
    }
    if (stringsRef.current) {
      stringsRef.current.rotation.y += delta * (0.012 + scrollVelocity * 0.03);
      const posAttr = stringsRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const base = baseStringsRef.current;
      const phases = phasesRef.current;

      // Music burst in the mid-journey: strings resonate and visibly play

      for (let s = 0; s < STRING_COUNT; s++) {
        const phase = phases[s];
        for (let k = 0; k <= SEGMENTS; k++) {
          const tMode = k / SEGMENTS;
          const idx = (s * (SEGMENTS + 1) + k) * 3;
          const baseX = base[idx];
          const baseY = base[idx + 1];
          const baseZ = base[idx + 2];

          const vibAmp = (0.45 + 0.15 * Math.sin(phase * 1.7)) * (1 + musicFactor * 4);
          const mode = 2.0 + Math.floor((s % 5) * 1);
          const wave =
            Math.sin(mode * Math.PI * tMode + t * (1.2 + (s % 4) * 0.35) * (1 + musicFactor) + phase) *
            vibAmp *
            Math.sin(Math.PI * tMode);

          // Apply vibration along a perpendicular direction approximated by small offsets
          arr[idx] = baseX + wave * 0.35;
          arr[idx + 1] = baseY + wave;
          arr[idx + 2] = baseZ + wave * 0.22;
        }
      }
      posAttr.needsUpdate = true;
      const stringPointsMaterial = stringPointsRef.current?.material as THREE.PointsMaterial | undefined;
      if (stringPointsMaterial) {
        stringPointsMaterial.size = 0.22 + musicFactor * 0.28;
        stringPointsMaterial.opacity = 0.85 + musicFactor * 0.15;
        stringPointsMaterial.needsUpdate = true;
      }
      if (stringPointsRef.current) {
        const ptAttr = stringPointsRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
        const ptArr = ptAttr.array as Float32Array;
        ptArr.set(arr);
        ptAttr.needsUpdate = true;
      }
    }

    if (notesRef.current) {
      notesRef.current.children.forEach((child, i) => {
        const sprite = child as THREE.Sprite;
        const angle = (i / 12) * Math.PI * 2 + t * 0.22 + scrollNorm * Math.PI * 0.8;
        const radius = 2.2 + (i % 4) * 0.7;
        sprite.position.x = Math.cos(angle) * radius;
        sprite.position.z = Math.sin(angle) * radius;
        sprite.position.y = (i % 8) * 0.5 - 2.8 + Math.sin(t * 0.6 + i) * 0.4 + musicFactor * 0.5;
        sprite.material.opacity = 0.16 + 0.12 * Math.sin(t * 0.8 + i) + musicFactor * 0.12;
        const scale = 0.12 + 0.04 * Math.sin(t * 0.7 + i * 0.5) + musicFactor * 0.08;
        sprite.scale.set(scale, scale, 1);
      });
      notesRef.current.rotation.y += delta * (0.08 + scrollVelocity * 0.12);
    }

    // Travel straight down the central axis of the string tower
    const orbitX = Math.sin(t * 0.12) * 0.35;
    const orbitY = 9 - scrollNorm * 12 + Math.sin(t * 0.09) * 0.2;
    const orbitZ = 0.5 + Math.cos(t * 0.1) * 0.25;

    const lookX = orbitX * 0.05;
    const lookY = orbitY - 2.6;
    const lookZ = 0;

    // Smooth targets to avoid scroll jitter/glitches
    camTargetRef.current.set(orbitX, orbitY, orbitZ);
    lookTargetRef.current.set(lookX, lookY, lookZ);

    state.camera.position.lerp(camTargetRef.current, 0.045);
    lookAtScratch.copy(lookTargetRef.current);
    state.camera.lookAt(lookAtScratch);
    state.camera.rotation.z = THREE.MathUtils.lerp(
      state.camera.rotation.z,
      Math.sin(t * 0.06) * 0.06 + scrollNorm * 0.35,
      0.1
    );
  });

  return (
    <>
      <points ref={starsRef} geometry={starGeo} material={starMat} />
      <points ref={nebulaRef} geometry={nebulaGeo} material={nebulaMat} />
      <lineSegments ref={stringsRef} geometry={stringsGeo} material={stringMat} />
      <points ref={stringPointsRef} geometry={stringPointsGeo} material={stringPointsMat} />
      <primitive object={noteGroup} ref={notesRef} />

    </>
  );
}

export default function CosmicStringsBackdrop() {
  useEffect(() => {
    return () => {};
  }, []);

  return (
    <div aria-hidden className="fixed inset-0 -z-10" style={{ background: "#02020a" }}>
      <Canvas
        camera={{ position: [0, 9, 0.8], fov: 78, near: 0.5, far: 120 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance", stencil: false }}
        dpr={[1, 2]}
        style={{ width: "100vw", height: "100vh" }}
      >
        <color attach="background" args={["#02020a"]} />
        <fog attach="fog" args={["#02020a", 30, 120]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={1.4} color="#00d8f6" distance={30} />
        <Galaxy />
      </Canvas>
    </div>
  );
}
