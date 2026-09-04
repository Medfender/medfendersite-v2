'use client';


import { useAudio } from '@/context/AudioContext';
import AudioCanvas from './AudioCanvas';

/**
 * AudioCanvasWrapper — thin client component that calls useAudio() directly.
 * Lives inside AudioProvider so it can access getFrequencyBands().
 * Renders the R3F particle canvas site-wide.
 */
export default function AudioCanvasWrapper() {
  const { getFrequencyBands } = useAudio();
  return <AudioCanvas getFrequencyBands={getFrequencyBands} />;
}
