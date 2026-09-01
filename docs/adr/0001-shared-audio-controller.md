# ADR-0001: Shared Web Audio Controller — Split Transport / Tick Architecture

Status: ACCEPTED | Date: 2026-09-01 | Author: Medfender

## Context

`AudioContext` (`src/context/AudioContext.tsx`) currently mixes slow-moving transport state (`transportState`, `isPlaying`) with high-frequency data (`currentTime`, `analyserNode.getByteFrequencyData`) in a single React provider. Every `timeupdate` tick updates React state, causing all consumers (turntable, sticky transport, playlist, spectrum) to re-render at 60Hz.

Two new consumers must share a single `AnalyserNode`: (a) a 2D CSS-rotation vinly turntable (`Turntable.tsx`, `VinylShowcase.tsx`), and (b) a real-time spectrum canvas (`SpectrumAnalyzerPanel.tsx`). They must stay frame-perfectly synchronized without coupling to React re-renders.

## Decision

Split into **two layers** (incremental, A10):

### Layer 1 — React Context (slow, ~once/user-action)
Keep in `AudioProvider`: `transportState`, `isPlaying`, `volume`, `currentTrack`, `playlist`, `seek`, `play/pause/stop`. These change on user actions, not per frame — no perf cost.

### Layer 2 — Standalone Tick Controller (fast, rAF-driven, no React tree)
New singleton `src/lib/audio/AudioTickController.ts` (outside React):
- Owns `requestAnimationFrame` loop (full native, no cap — A6)
- Holds refs: `analyserRef`, `audioRef`, `transportStateRef` (mirrored from context for reads inside tick)
- Exposes pub/sub event emitter (A7): `controller.on('tick', (frame) => ...)`, `.off(...)`
- Provides `useAudioTick(callback)` hook (A7) that auto-subscribes/unsubscribes and runs callback in rAF
- Frame payload: `{ frequencyData: Uint8Array; transportState: TransportState; time: number; progress: number; isPlaying: boolean }`

### Node routing (A1, A4, shared single AnalyserNode)
- Source graph stays: `MediaElementSource → AnalyserNode (fftSize=2048, smoothing=0.15) → MasterGain → destination`
- Only **one** `AnalyserNode` exists (shared by both turntable and spectrum — A1)
- Turntable reads `transportState` from tick controller's mirrored ref (A9), not from React context, and applies `transform: rotate(...)` via CSS `ref.style.transform` (zero React renders — A5)
- Spectrum reads `getByteFrequencyData` inside the same `rAF` tick (A4) — single loop = guaranteed sync, lower overhead

### State removal (A2, A3, A5, A8)
- `currentTime` removed from context state; moved to controller's `time` ref + event payload. Components that want a progress display (`StickyTransport`, `PlaylistPanel`) subscribe via `useAudioTick` and hold **local `useState`** (A8) — only that component re-renders, siblings untouched.
- `isVisualizerActive` stays in context (control signal, changes ~once/play) but tick loop drives canvas redrawing independently.

## Consequences

Positive:
- Turntable and spectrum are frame-sync'd via one `rAF` tick (A4)
- Zero React re-renders for turntable rotation (A5); same for spectrum if its canvas uses `useRef` + direct `ctx.drawImage`
- `currentTime` removed from context reduces provider re-render count dramatically (A8)
- Incremental migration (A10): existing `AudioProvider` stays intact; new `AudioTickController` can be adopted component-by-component (turntable + spectrum first, transport UI later)

Negative / Trade-offs:
- New singleton to manage (lifecycle, cleanup on unmount of last subscriber, memory leak guard)
- `transportState` is read twice (context + controller ref mirror) — minimal cost, but must stay in sync via a setter bridge (e.g., `context.setTransportState` also writes `controller.setTransportStateRef()`)
- Direct canvas mutation avoids React for the spectrum; fine for a canvas component but requires care for SSR / hydration

## Implementation Plan (Incremental — A10)

1. **Create controller** (`src/lib/audio/AudioTickController.ts`) + `useAudioTick` hook
2. **Bridge**: connect `AudioProvider` to controller (mirror `transportState`, seed analyser ref, start/stop rAF)
3. **Migrate turntable** (`Turntable.tsx`): replace `isPlaying`/`transportState` prop consumption with `useAudioTick`; apply rotation via `ref.style.transform`
4. **Migrate spectrum** (`SpectrumAnalyzerPanel.tsx` / `SpectrumCanvas`): subscribe to tick; draw via `requestAnimationFrame` inside the tick or via its own `rAF` (if using `useAudioTick`, the callback is already in rAF — just draw)
5. **Later**: migrate `StickyTransport`, `PlaylistPanel` to local-state + `useAudioTick`

## Decisions Record (Q1–Q10)
- A1: Shared single `AnalyserNode`
- A2: Split transport (React context) / tick data (refs + event bus)
- A3: 2D CSS rotation (no 3D mesh)
- A4: Single shared `rAF` loop managed by controller
- A5: Event emitter / ref subscription (zero React renders for animation)
- A6: Full native `rAF`, no cap; controller singleton outside React tree
- A7: Both pub/sub emitter and `useAudioTick` hook
- A8: `currentTime` fully to controller; consumers use local state
- A9: `transportState` stays in context; turntable reads via tick controller
- A10: Incremental migration (controller first, component-by-component)
