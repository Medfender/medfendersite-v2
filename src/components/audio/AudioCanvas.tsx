'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

// SSR guard: R3F requires a browser environment.
// Dynamic import with ssr: false prevents hydration crashes.
const AudioCanvasDynamic = dynamic(
  () => import('./AudioCanvasImpl'),
  {
    ssr: false,
    loading: () => null,
  }
) as ComponentType<{ getFrequencyBands: () => { high: number; mid: number; low: number } }>;

export default AudioCanvasDynamic;
