'use client';

import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import MorphParticles, { type FrequencyBands } from './MorphParticles';

interface AudioCanvasProps {
  getFrequencyBands: () => FrequencyBands;
}

/**
 * AudioCanvas — the fixed background R3F layer for the /audio page.
 *
 * Key design decisions (locked in spec):
 * - Layered background (`z-index: 0`, fixed, `pointer-events: auto` so the
 *   mouse event listener on `window` still works; we do NOT set the canvas
 *   to pointer-events: none, because we rely on window-level mouse tracking,
 *   not canvas DOM events).
 * - Window-level mouse tracking: the mouse data comes from a `window`
 *   `mousemove` listener that writes into `mouseRef.current`. This ensures
 *   the repulsion physics work even when the user is hovering over the
 *   foreground turntable UI.
 * - Window-level scroll tracking: `scrollRef.current` holds the normalized
 *   scroll progress (0.0 to 1.0) computed from `window.scrollY`.
 */
export default function AudioCanvasImpl({ getFrequencyBands }: AudioCanvasProps) {
  // Mouse tracking — normalized [0,1] screen coordinates.
  // We flip Y here (`1.0 - y`) so that the shader's NDC conversion is intuitive.
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  // Scroll tracking — normalized [0,1] scroll progress.
  const scrollRef = useRef(0);

  // Window-level mouse tracking (no pointer-events: none needed on canvas).
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: Math.max(0, Math.min(1, e.clientX / window.innerWidth)),
        y: 1.0 - Math.max(0, Math.min(1, e.clientY / window.innerHeight)),
      };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    // Initialize mouse position so we don't start with (0, 0)
    handleMouseMove({
      clientX: window.innerWidth / 2,
      clientY: window.innerHeight / 2,
    } as MouseEvent);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Window-level scroll tracking.
  useEffect(() => {
    const handleScroll = () => {
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initialize immediately on mount
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'auto',
        // Prevent canvas from blocking mouse events (we rely on window listener)
        // The forward UI elements will overlay above this with higher z-index.
      }}
      aria-hidden="true"
    >
      <Canvas
        style={{ position: 'absolute', inset: 0 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={60} near={0.1} far={100} />
        <MorphParticles
          scrollRef={scrollRef}
          mouseRef={mouseRef}
          getFrequencyBands={getFrequencyBands}
        />
      </Canvas>
    </div>
  );
}
