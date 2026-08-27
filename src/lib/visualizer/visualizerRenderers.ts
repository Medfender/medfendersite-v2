/**
 * renderStudioVisualizer — delegates to the shared engine in useAudioVisualizer.ts.
 * This file exists for backward-compatible named exports; all logic lives in
 * the shared engine so the mini visualizer can import the same drawing functions.
 */
export type { VisualizerMode, ColorTheme } from './useAudioVisualizer';

import {
  THEMES,
  drawDbGrid,
  drawFreqGrid,
  drawBars,
  drawWaveform,
  drawCurve,
} from './useAudioVisualizer';

export function renderStudioVisualizer(
  ctx: CanvasRenderingContext2D,
  data: {
    smoothed:    Float32Array;
    peaks:       Float32Array;
    timeDomain:  Float32Array;
  },
  width: number,
  height: number,
  mode: 'curve' | 'bars' | 'waveform' = 'curve',
  themeKey: 'cyan' | 'neon' | 'emerald' = 'cyan',
) {
  const theme = THEMES[themeKey] ?? THEMES.cyan;
  ctx.clearRect(0, 0, width, height);

  const padLeft   = 45;
  const padBottom = 24;

  // Grid layers
  drawDbGrid(ctx, width, height, padLeft, padBottom, theme);
  drawFreqGrid(ctx, width, height, padLeft, padBottom);

  if (mode === 'bars') {
    drawBars(ctx, width, height, padLeft, padBottom, theme, {
      smoothed:  data.smoothed,
      peaks:     data.peaks,
      barCount:  48,
      gap:       4,
      cornerRadius: 3,
    });
    return;
  }

  if (mode === 'waveform') {
    drawWaveform(ctx, width, height, padLeft, padBottom, data.timeDomain, theme);
    return;
  }

  drawCurve(ctx, width, height, padLeft, padBottom, theme, data.smoothed, data.peaks);
}
