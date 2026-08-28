/**
 * Shared types and the central theme table for the modular visualizers.
 *
 * Each rendering mode lives in its own file under `./` (curve.ts, bars.ts,
 * oscillo.ts, timeline.ts). They all import the ThemeConfig and helpers
 * from this module so colors and types stay in lockstep.
 */

export type ColorTheme = 'cyan' | 'neon' | 'emerald';
export type VisualizerMode = 'curve' | 'bars' | 'waveform';

export interface ThemeConfig {
  primary: string;
  glow: string;
  peak: string;
  overflow: string;   // intense accent for >+6 dB overflow highlight
  gradTop: string;
  gradMid: string;
}

export const THEMES: Record<ColorTheme, ThemeConfig> = {
  cyan: {
    primary: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.85)',
    peak: '#f59e0b',
    overflow: '#ffffff',
    gradTop: 'rgba(56, 189, 248, 0.38)',
    gradMid: 'rgba(14, 165, 233, 0.12)',
  },
  neon: {
    primary: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.9)',
    peak: '#06b6d4',
    overflow: '#ffffff',
    gradTop: 'rgba(244, 63, 94, 0.42)',
    gradMid: 'rgba(217, 70, 239, 0.14)',
  },
  emerald: {
    primary: '#10b981',
    glow: 'rgba(16, 185, 129, 0.85)',
    peak: '#38bdf8',
    overflow: '#ffffff',
    gradTop: 'rgba(16, 185, 129, 0.40)',
    gradMid: 'rgba(6, 182, 212, 0.12)',
  },
};

/**
 * Ceiling multiplier: 1.0 means the bar/curve reaches all the way to the top
 * edge of the grid area at +6 dB. No visual compression — the highest peaks
 * sit flush against the +6 dB ceiling line with the overflow glow sitting
 * just above it.
 */
export const CEILING = 1.0;
