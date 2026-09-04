---
name: audio-canvas-particle-morph
description: R3F scroll-driven GPU particle morphing background with custom GLSL
metadata:
  type: project
  status: approved
---

# Audio Canvas — Scroll-Driven Particle Morph System

## Classification
Architectural — new R3F shader subsystems integrated behind existing audio page UI.

## Approved Approaches (user green-lit)
- Install `@react-three/fiber`, `@react-three/drei`, `three`
- Layered background (low z-index, pointer-events pass-through, window-level mouse tracking)
- Single Draw Call (`THREE.Points`, no JS per-frame position updates)

## Deliverables (approved scope)
1. `src/components/audio/AudioCanvas.tsx` — R3F Canvas setup, scroll + mouse tracking
2. `src/components/audio/MorphParticles.tsx` — BufferGeometry, ShaderMaterial, audio uniform injection
3. `src/shaders/morphParticles.vert` — vertex morph + mouse repulsion
4. `src/shaders/morphParticles.frag` — metallic grain + fake lighting
5. `AudioContext` extension (`getFrequencyBands`) — pipe analyser data into uniforms

## Design Lock (verified in chat, no deviation)
| Element | Lock |
|---|---|
| Shape A (0–0.33) | Waveform grid (20×20×8, sine Y) |
| Shape B (0.33–0.66) | Vinyl record (polar, concentric rings) |
| Shape C (0.66–1.0) | Nebula sphere (randomized spherical) |
| Mouse tracking | `window` `mousemove` event → `uMouse` uniform |
| Scroll | `window.scrollY` → `uScroll` uniform (not `drei/ScrollControls`) |
| Audio uniforms | `uAudioHigh`, `uAudioMid`, `uAudioLow` (float) |
| Particle count | ~15,000 points (single draw call) |
| Visual style | Dark `#0b0f19`, cyan `#00d8f6`, warm gold `#f5c842`, metallic grain |

## Implementation Path (after spec approval — this doc)
1. Write shader files (GLSL)
2. Write `MorphParticles.tsx` + `AudioCanvas.tsx`
3. Extend `AudioContext`
4. Install R3F packages (`pnpm add three @react-three/fiber @react-three/drei`)
5. Build check (`npm run build`) + screenshot QA (`node screenshot.mjs` on localhost)

## Notes
- DSL: `useFrame` ONLY for uniform updates (audio + scroll refs + mouse), never for `geometry.attributes.position.needsUpdate`.
- No `drei/ScrollControls` — native scroll mapping avoids drei scroll dependency.
