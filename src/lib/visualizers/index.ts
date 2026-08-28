/**
 * Modular visualizer renderers — each mode lives in its own file.
 * Re-exported from here so `visualizerRenderers.ts` and other imports stay stable.
 */

export type { VisualizerMode, ColorTheme, ThemeConfig } from './types';
export { THEMES, CEILING } from './types';
export { DB_GRID, DB_ZERO_VAL, drawDbGrid } from './grids';
export { FREQ_GRID, drawFreqGrid } from './grids';
export { drawBars, type BarDrawOptions } from './bars';
export { drawWaveform } from './oscillo';
export { drawCurve } from './curve';
export { drawTimeline } from './timeline';
export type { RenderFn } from './loop';
export { createRenderLoop } from './loop';
