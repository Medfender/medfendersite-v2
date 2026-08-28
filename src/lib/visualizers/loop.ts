/**
 * loop.ts — thin rAF render-loop factory.
 * Used by MiniVisualizer.tsx (createRenderLoop) and can be reused by any
 * canvas component that needs a stable start/stop lifecycle.
 */

export type RenderFn = (timestamp: number) => void;

export function createRenderLoop(
  fn: RenderFn,
): { start: () => number; stop: () => void } {
  let animId = 0;
  const loop = (ts: number) => {
    fn(ts);
    animId = requestAnimationFrame(loop);
  };
  return {
    start: () => { animId = requestAnimationFrame(loop); return animId; },
    stop: () => { cancelAnimationFrame(animId); },
  };
}
