# Audio Canvas — Scroll-Driven Particle Morph Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GPU-driven scroll-morphing particle background (waveform → vinyl → nebula) with audio-reactive uniforms, mouse repulsion physics, and window-level mouse tracking — layered behind the existing audio page UI.

**Architecture:** Single-draw-call `THREE.Points` with three `BufferAttribute`s (one per morph shape) interpolated in GLSL vertex shader. All position updates happen on the GPU via uniforms (`uScroll`, `uMouse`, `uAudio*`). `useFrame` only updates uniforms — never writes back to geometry. Scroll and mouse use `window` event listeners (not `drei/ScrollControls` or DOM event handlers on the canvas).

**Tech Stack:** Next.js 16 (App Router), React Three Fiber 8, @react-three/drei 9, Three.js 0.170, custom GLSL via `ShaderMaterial`.

**Spec:** `docs/superpowers/specs/2026-09-04-audio-canvas-particle-design.md`

---

## Global Constraints

- R3F: `@react-three/fiber@^8`, `@react-three/drei@^9`, `three@^0.170`
- Particle count: ~15,000 points (single draw call, no per-frame `geometry.attributes.position.needsUpdate`)
- Visual palette: `#0b0f19` dark base, `#00d8f6` cyan accent, `#f5c842` warm gold
- Mouse: `window.addEventListener('mousemove')` — never `pointer-events:none` or canvas DOM events
- Audio: `useFrame` reads `analyserNode.getByteFrequencyData()`, pipes to `uAudioHigh`, `uAudioMid`, `uAudioLow`
- Scroll: `window.scrollY` → `uScroll` (0.0–1.0), passive listener, ref-based (no re-renders)

---

## File Structure

```
src/
  components/audio/
    AudioCanvas.tsx       ← NEW — R3F Canvas + window mouse/scroll refs
    MorphParticles.tsx   ← NEW — BufferGeometry + ShaderMaterial + useFrame
  shaders/
    morphParticles.vert  ← NEW — vertex shader (morph + mouse repulsion + audio displacement)
    morphParticles.frag  ← NEW — fragment shader (metallic grain + fake lighting)
  context/
    AudioContext.tsx      ← MODIFY — add getFrequencyBands() method
```

---

## Task 1: Install R3F Packages

**Files:**
- Modify: `package.json` (add dependencies)
- Modify: `pnpm-lock.yaml` (generated)

- [ ] **Step 1: Add R3F packages**

Run:
```bash
cd /home/medfender/projects/medfendersite-v2
pnpm add three @react-three/fiber @react-three/drei
pnpm add -D @types/three
```

- [ ] **Step 2: Verify install**

Run: `pnpm list three @react-three/fiber @react-three/drei`
Expected: all three listed with versions

---

## Task 2: Write GLSL Vertex Shader

**Files:**
- Create: `src/shaders/morphParticles.vert`
- Create: `src/shaders/morphParticles.frag`

**Interfaces:**
- Consumes: `uScroll`, `uMouse`, `uTime`, `uAudioHigh`, `uAudioMid`, `uAudioLow` uniforms
- Produces: `gl_Position`, `vColor`, `vAlpha` varyings

**Notes for agent:**
- Three BufferAttributes named exactly `positionA`, `positionB`, `positionC`
- Scroll ranges: A = 0.0–0.33, B = 0.33–0.66, C = 0.66–1.0
- Mouse NDC: `uMouse` is [0,1] normalized — convert to [-1,1] in shader
- Audio displacement is multiplicative on the morphed position
- All math stays in vertex shader — no JS position updates

- [ ] **Step 1: Write vertex shader**

Create `src/shaders/morphParticles.vert`:

```glsl
precision highp float;

uniform float uTime;
uniform float uScroll;
uniform vec2 uMouse;
uniform float uAudioLow;
uniform float uAudioMid;
uniform float uAudioHigh;

attribute vec3 positionA;
attribute vec3 positionB;
attribute vec3 positionC;

varying vec3 vColor;
varying float vAlpha;

void main() {
  // --- Morph interpolation (smoothstep easing) ---
  float t = clamp(uScroll, 0.0, 1.0);

  // Waveform → Vinyl (0.0 → 0.33)
  float blendAB = smoothstep(0.15, 0.42, t);
  // Vinyl → Nebula (0.33 → 0.66)
  float blendBC = smoothstep(0.58, 0.85, t);

  vec3 pos = mix(positionA, positionB, blendAB);
  pos = mix(pos, positionC, blendBC);

  // --- Audio-reactive displacement ---
  float bassPump  = 1.0 + uAudioLow  * 0.45 * sin(pos.y * 7.0 + uTime * 2.1);
  float midPulse  = 1.0 + uAudioMid  * 0.25 * sin(pos.x * 11.0 + uTime * 3.3);
  float highSpark = 1.0 + uAudioHigh * 0.12 * sin(pos.z * 15.0 + uTime * 4.7);
  pos *= bassPump * midPulse * highSpark;

  // --- Mouse repulsion ---
  // uMouse is [0,1] — convert to [-1,1] NDC
  vec2 mouseNDC = uMouse * 2.0 - 1.0;
  // Project pos.xy into same normalized space as mouse
  vec2 particleScreen = pos.xy * 0.6; // scale down to NDC-ish
  vec2 toMouse = particleScreen - mouseNDC;
  float dist = length(toMouse);
  float repulsion = smoothstep(0.45, 0.0, dist);
  vec2 repulseDir = normalize(toMouse + vec2(0.0001));
  pos.xy += repulseDir * repulsion * 0.35;

  // --- Color gradient based on position + audio energy ---
  float energy = (uAudioLow + uAudioMid + uAudioHigh) * 0.33;
  vec3 darkBase   = vec3(0.043, 0.059, 0.098);   // #0b0f19
  vec3 cyanAccent = vec3(0.0,   0.847, 0.965);   // #00d8f6
  vec3 goldAccent = vec3(0.961, 0.784, 0.259);   // #f5c842

  float radial = length(pos) * 0.08;
  vec3 col = mix(darkBase, cyanAccent, radial);
  col = mix(col, goldAccent, clamp(energy * 1.8 + pos.z * 0.15, 0.0, 0.6));
  vColor = col;

  // --- Alpha: fade particles at edges ---
  vAlpha = clamp(1.0 - dist * 1.4, 0.0, 1.0) * 0.92;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

- [ ] **Step 2: Write fragment shader**

Create `src/shaders/morphParticles.frag`:

```glsl
precision highp float;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);

  // Soft circular disc with sharp core
  float disc = smoothstep(0.5, 0.28, dist);
  if (disc < 0.01) discard;

  // Fake 3D normal from point coord
  float z = sqrt(max(0.0, 1.0 - dot(uv * 2.0, uv * 2.0)));
  vec3 normal = normalize(vec3(uv * 2.0, z));

  // Key light (top-right-front)
  vec3 lightDir = normalize(vec3(0.6, 0.8, 1.0));
  float diffuse = max(dot(normal, lightDir), 0.0);

  // Rim / fresnel glow
  float rim = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 2.5);

  // Specular highlight
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 halfVec = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfVec), 0.0), 48.0);

  // Compose
  vec3 col = vColor * (0.35 + diffuse * 0.55);
  col += vec3(0.0, 0.847, 0.965) * rim * 0.55;      // cyan rim
  col += vec3(1.0) * spec * 0.7;                       // white spec

  gl_FragColor = vec4(col, disc * vAlpha);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/shaders/morphParticles.vert src/shaders/morphParticles.frag
git commit -m "feat: add GLSL shaders for morph particle system

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 3: Write MorphParticles Component

**Files:**
- Create: `src/components/audio/MorphParticles.tsx`

**Interfaces:**
- Consumes: `getFrequencyBands()` from AudioContext (via prop or context)
- Produces: Renders `<points>` inside R3F Canvas; receives `scrollRef` and `mouseRef` as props
- Props:
  ```tsx
  scrollRef: React.RefObject<number>
  mouseRef: React.RefObject<{ x: number; y: number }>
  getFrequencyBands: () => { high: number; mid: number; low: number }
  ```

**Notes for agent:**
- Geometry: single `BufferGeometry` with THREE.Points — no InstancedMesh
- Three `BufferAttribute`s: `positionA`, `positionB`, `positionC` (each Float32Array, 3 components per vertex)
- `ShaderMaterial` with `vertexShader`/`fragmentShader` as raw GLSL strings (imported as `?raw`)
- `useFrame` only updates uniform values — never touches geometry
- Audio uniform: read via `getFrequencyBands()` each frame
- Scroll + mouse: read from refs (no state, no re-renders)
- Particle count: 15,000

- [ ] **Step 1: Write MorphParticles component**

Create `src/components/audio/MorphParticles.tsx`:

```tsx
'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from '@/shaders/morphParticles.vert?raw';
import fragmentShader from '@/shaders/morphParticles.frag?raw';

const PARTICLE_COUNT = 15000;

interface MorphParticlesProps {
  scrollRef: React.RefObject<number>;
  mouseRef: React.RefObject<{ x: number; y: number }>;
  getFrequencyBands: () => { high: number; mid: number; low: number };
}

export default function MorphParticles({
  scrollRef,
  mouseRef,
  getFrequencyBands,
}: MorphParticlesProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // --- Shape A: Audio waveform grid (20×20×8) ---
  const positionA = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    const cols = 20, rows = 20, depth = 8;
    const spacing = 0.09;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols) % rows;
      const dep = Math.floor(i / (cols * rows)) % depth;
      const x = (col - cols / 2 + 0.5) * spacing;
      const y = (row - rows / 2 + 0.5) * spacing;
      const z = (dep - depth / 2 + 0.5) * spacing;
      // Undulate Y with sine wave
      const wave = Math.sin(col * 0.6) * 0.18 + Math.cos(row * 0.8) * 0.12;
      arr[i * 3]     = x;
      arr[i * 3 + 1] = y + wave;
      arr[i * 3 + 2] = z;
    }
    return arr;
  }, []);

  // --- Shape B: Vinyl record (concentric rings) ---
  const positionB = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    const radiusMax = 2.8;
    const rings = 40;
    const grooveDetail = 12; // particles per ring
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ring = i % rings;
      const seg  = Math.floor(i / rings) % grooveDetail;
      const jitter = ((i / rings / grooveDetail) % 1) * 0.3 - 0.15; // subtle offset
      const r = (ring / rings) * radiusMax + jitter * 0.05;
      const theta = (seg / grooveDetail) * Math.PI * 2 + (ring % 2) * 0.04; // groove helix
      const grooveAmp = ring % 3 === 0 ? 0.06 : 0.02; // every 3rd ring is a groove ridge
      arr[i * 3]     = Math.cos(theta) * r;
      arr[i * 3 + 1] = Math.sin(theta) * r;
      arr[i * 3 + 2] = Math.sin(ring * 0.9 + seg * 0.3) * grooveAmp;
    }
    return arr;
  }, []);

  // --- Shape C: Nebula sphere (randomized spherical) ---
  const positionC = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi   = Math.acos(2 * v - 1);
      const r     = 2.2 + (Math.random() - 0.5) * 0.8;
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('positionA', new THREE.BufferAttribute(positionA, 3));
    geo.setAttribute('positionB', new THREE.BufferAttribute(positionB, 3));
    geo.setAttribute('positionC', new THREE.BufferAttribute(positionC, 3));
    return geo;
  }, [positionA, positionB, positionC]);

  const uniforms = useMemo(
    () => ({
      uTime:      { value: 0 },
      uScroll:    { value: 0 },
      uMouse:     { value: new THREE.Vector2(0.5, 0.5) },
      uAudioLow:  { value: 0 },
      uAudioMid:  { value: 0 },
      uAudioHigh: { value: 0 },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;

    u.uTime.value  = clock.getElapsedTime();
    u.uScroll.value = scrollRef.current ?? 0;

    if (mouseRef.current) {
      u.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
    }

    const { high, mid, low } = getFrequencyBands();
    u.uAudioLow.value  = low;
    u.uAudioMid.value  = mid;
    u.uAudioHigh.value = high;
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/audio/MorphParticles.tsx
git commit -m "feat: add MorphParticles R3F component with 3-shape GPU morphing

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 4: Write AudioCanvas Component

**Files:**
- Create: `src/components/audio/AudioCanvas.tsx`

**Interfaces:**
- Consumes: `getFrequencyBands` prop (passed from parent, sourced from AudioContext)
- Produces: Renders R3F Canvas as fixed-position background; calls `onReady(getFrequencyBands)` when mounted

**Notes for agent:**
- `'use client'` — R3F is client-only
- Use `next/dynamic` with `ssr: false` to avoid SSR issues
- `position: fixed; inset: 0; z-index: 0` — no `pointer-events: none`
- `window.addEventListener('mousemove', ...)` in `useEffect` — passes normalized [0,1] coords to `mouseRef`
- `window.addEventListener('scroll', ...)` in `useEffect` — maps `scrollY / (scrollHeight - innerHeight)` to [0,1]
- Camera: `PerspectiveCamera` with `fov={60}`, positioned at `[0, 0, 5]`, looking at origin
- Pass `getFrequencyBands` down to `MorphParticles` via prop

- [ ] **Step 1: Write AudioCanvas component**

Create `src/components/audio/AudioCanvas.tsx`:

```tsx
'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import MorphParticles from './MorphParticles';

interface AudioCanvasProps {
  getFrequencyBands: () => { high: number; mid: number; low: number };
}

export default function AudioCanvas({ getFrequencyBands }: AudioCanvasProps) {
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const scrollRef = useRef(0);

  // Window-level mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: 1.0 - e.clientY / window.innerHeight, // flip Y to match GL coords
      };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Window-level scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initialize on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'auto', // intentionally not pointer-events:none
      }}
    >
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={60} />
        <MorphParticles
          scrollRef={scrollRef}
          mouseRef={mouseRef}
          getFrequencyBands={getFrequencyBands}
        />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 2: Wrap with dynamic import (SSR guard)**

In `src/components/audio/AudioCanvas.tsx`, replace the default export with a dynamic import wrapper. Create a file `src/components/audio/AudioCanvasDynamic.tsx`:

```tsx
'use client';

import dynamic from 'next/dynamic';

const AudioCanvas = dynamic(() => import('./AudioCanvasImpl'), {
  ssr: false,
  loading: () => null,
});

export default AudioCanvas;
```

Rename the original `AudioCanvas.tsx` content to `AudioCanvasImpl.tsx` and export `AudioCanvasImpl`. The dynamic wrapper is the new `AudioCanvas.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/audio/AudioCanvas.tsx src/components/audio/AudioCanvasImpl.tsx
git commit -m "feat: add AudioCanvas R3F wrapper with window-level mouse/scroll tracking

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 5: Extend AudioContext with getFrequencyBands

**Files:**
- Modify: `src/context/AudioContext.tsx` (add `getFrequencyBands` method)
- Modify: `src/context/AudioContext.tsx` (export type `FrequencyBands` if not exists)

**Notes for agent:**
- `analyserNode` is already exposed on the AudioContext
- Add a `getFrequencyBands()` method that:
  1. Creates a `Uint8Array(frequencyBinCount)`
  2. Calls `analyserNode.getByteFrequencyData(data)`
  3. Averages bins into three bands: low (0–10%), mid (10–50%), high (50–100%)
  4. Returns `{ low: float, mid: float, high: float }` — all normalized 0.0–1.0
- The method should handle `analyserNode === null` gracefully (return zeros)
- Read the file fully before editing to avoid overwriting existing code

- [ ] **Step 1: Read AudioContext**

Run: `cat src/context/AudioContext.tsx` (full file)

- [ ] **Step 2: Add getFrequencyBands method**

Add inside the context value object (after `analyserNode`):
```tsx
getFrequencyBands: (): FrequencyBands => {
  if (!analyserNode) return { low: 0, mid: 0, high: 0 };
  const bins = new Uint8Array(analyserNode.frequencyBinCount);
  analyserNode.getByteFrequencyData(bins);
  const len = bins.length;
  const lowEnd  = Math.floor(len * 0.10);
  const midEnd  = Math.floor(len * 0.50);

  let low = 0, mid = 0, high = 0;
  for (let i = 0;       i < lowEnd;  i++) low  += bins[i];
  for (let i = lowEnd;  i < midEnd;  i++) mid  += bins[i];
  for (let i = midEnd;  i < len;     i++) high += bins[i];

  return {
    low:  low  / (lowEnd  * 255),
    mid:  mid  / ((midEnd - lowEnd) * 255),
    high: high / ((len - midEnd) * 255),
  };
},
```

Also add the type export:
```tsx
export interface FrequencyBands { low: number; mid: number; high: number }
```

- [ ] **Step 3: Commit**

```bash
git add src/context/AudioContext.tsx
git commit -m "feat: add getFrequencyBands() to AudioContext for particle shader uniforms

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 6: Wire AudioCanvas into the Audio Page

**Files:**
- Modify: `src/app/audio/page.tsx` (import and render AudioCanvas)

**Notes for agent:**
- Import `AudioCanvas` and `useAudio` from context
- Render `<AudioCanvas getFrequencyBands={getFrequencyBands} />` near the top of the page JSX
- Ensure `getFrequencyBands` is called from the AudioContext value
- The canvas is `position: fixed` with `z-index: 0`, so it renders behind all other content
- Check the current page.tsx structure first — don't break existing layout

- [ ] **Step 1: Read audio page**

Run: `cat src/app/audio/page.tsx`

- [ ] **Step 2: Add AudioCanvas import and render**

Add at top of file:
```tsx
import AudioCanvas from '@/components/audio/AudioCanvas';
```

Inside the component JSX (before the first child div):
```tsx
<AudioCanvas getFrequencyBands={getFrequencyBands} />
```

- [ ] **Step 3: Commit**

```bash
git add src/app/audio/page.tsx
git commit -m "feat: integrate AudioCanvas as fixed particle background on /audio page

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 7: TypeScript & Build Check

**Files:**
- Modify: `tsconfig.json` (add `?raw` module declaration if missing)
- Modify: any type stubs needed

**Notes for agent:**
- The `?raw` import (Vite/Next.js) for GLSL files needs a type declaration. Add to `src/types/glsl.d.ts`:
```typescript
declare module '*.vert?raw' { const value: string; export default value; }
declare module '*.frag?raw' { const value: string; export default value; }
```
- Run `pnpm build` — fix any TypeScript or build errors
- Do NOT push to GitHub — follow local-first protocol

- [ ] **Step 1: Create GLSL type declaration**

Create `src/types/glsl.d.ts`:
```typescript
declare module '*.vert?raw' {
  const value: string;
  export default value;
}
declare module '*.frag?raw' {
  const value: string;
  export default value;
}
```

- [ ] **Step 2: Run build**

Run: `pnpm build`
Expected: build succeeds with no errors

- [ ] **Step 3: Commit**

```bash
git add src/types/glsl.d.ts
git commit -m "chore: add GLSL ?raw module declarations for TypeScript

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

## Task 8: Visual QA — Screenshot Verification

**Files:**
- Verify: `src/components/audio/AudioCanvas.tsx`
- Verify: `src/components/audio/MorphParticles.tsx`
- Verify: `src/shaders/morphParticles.vert`
- Verify: `src/shaders/morphParticles.frag`

**Notes for agent:**
- Start the dev server: `pnpm dev` (background)
- Wait for it to be ready (check localhost:3000)
- Take screenshots at:
  - `http://localhost:3000/audio` (page load, scroll=0)
  - Scroll to mid-page (scroll ~0.5, should show vinyl shape)
  - Scroll to bottom (scroll ~1.0, should show nebula shape)
- Use `node screenshot.mjs http://localhost:3000/audio` or Playwright MCP
- Check console for WebGL errors
- Save screenshots to `temp_screenshots/`
- If particle rendering is broken: check geometry attributes are named `positionA/B/C` exactly matching shader `attribute` declarations

- [ ] **Step 1: Start dev server**

Run in background: `cd /home/medfender/projects/medfendersite-v2 && pnpm dev`

- [ ] **Step 2: Take screenshots and verify**

Take at least 3 screenshots (scroll=0, scroll=0.5, scroll=1.0). Verify:
1. Particles visible and not just a blank canvas
2. Shapes morphing between scroll positions (if detectable visually)
3. No console errors

- [ ] **Step 3: Stop dev server**

Run: `pkill -f "next dev" || true`

---

## Self-Review Checklist

- [ ] All 3 BufferAttributes named `positionA`, `positionB`, `positionC` match shader attribute declarations
- [ ] Mouse tracking uses `window.addEventListener` (not canvas DOM events)
- [ ] `useFrame` only updates uniforms — no `geometry.attributes.position.needsUpdate`
- [ ] `AudioContext.getFrequencyBands()` handles `analyserNode === null`
- [ ] `AudioCanvas` uses `dynamic(() => ..., { ssr: false })` to avoid SSR crash
- [ ] GLSL `?raw` imports have TypeScript declarations in `src/types/glsl.d.ts`
- [ ] Build passes with no errors
- [ ] Visual QA screenshots taken and reviewed
- [ ] All commits are atomic (one logical change per commit)
