/**
 * Legacy entry — re-exports from the modular visualizers package.
 *
 * All drawing logic now lives in `src/lib/visualizers/`:
 *   - bars.ts        (drawBars)
 *   - curve.ts       (drawCurve)
 *   - oscillo.ts     (drawWaveform)
 *   - timeline.ts    (drawTimeline — preserved for future activation)
 *   - grids.ts       (drawDbGrid, drawFreqGrid)
 *   - types.ts       (ColorTheme, VisualizerMode, ThemeConfig, THEMES)
 *   - loop.ts        (createRenderLoop)
 *
 * This file is kept for backward compatibility with imports that still
 * resolve to `@/lib/visualizer/useAudioVisualizer`.
 */

export {
  THEMES,
  CEILING,
  DB_GRID,
  DB_ZERO_VAL,
  FREQ_GRID,
  drawDbGrid,
  drawFreqGrid,
  drawBars,
  drawWaveform,
  drawCurve,
  drawTimeline,
  createRenderLoop,
} from '../visualizers';

export type {
  VisualizerMode,
  ColorTheme,
  ThemeConfig,
  BarDrawOptions,
  RenderFn,
} from '../visualizers';
