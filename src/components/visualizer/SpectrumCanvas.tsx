'use client';

import React, { useEffect, useRef } from 'react';
import { AudioPhysicsEngine } from '@/lib/visualizer/AudioPhysicsEngine';
import { ColorTheme, renderStudioVisualizer, VisualizerMode } from '@/lib/visualizer/visualizerRenderers';

interface SpectrumCanvasProps {
  /** Shared AnalyserNode from the single pipeline — no createMediaElementSource here. */
  analyserNode?: AnalyserNode | null;
  isPlaying?: boolean;
  mode?: VisualizerMode;
  theme?: ColorTheme;
  className?: string;
}

export const SpectrumCanvas: React.FC<SpectrumCanvasProps> = ({
  analyserNode,
  isPlaying = false,
  mode = 'curve',
  theme = 'cyan',
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const physicsEngineRef = useRef<AudioPhysicsEngine>(new AudioPhysicsEngine(128));

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    const physics = physicsEngineRef.current;

    const freqBuf = new Uint8Array(analyserNode ? analyserNode.frequencyBinCount : 512);
    const timeBuf = new Uint8Array(analyserNode ? analyserNode.fftSize : 512);

    const renderLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (analyserNode && isPlaying) {
        analyserNode.getByteFrequencyData(freqBuf);
        analyserNode.getByteTimeDomainData(timeBuf);
        // FFT signal verification log — confirm data is flowing, not zeroed
        if (Math.random() < 0.005) {
          const maxVal = Math.max(...Array.from(freqBuf));
          console.log('Live Audio Signal Peak:', maxVal);
        }
      } else if (analyserNode && !isPlaying) {
        // When paused, physics engine handles idle sine; just zero the buffers
        // so the engine's idle path activates cleanly
        freqBuf.fill(0);
        timeBuf.fill(128);
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(dpr, dpr);
          const frameData = physics.process(freqBuf, timeBuf, dt, isPlaying);
          renderStudioVisualizer(ctx, frameData, rect.width, rect.height, mode, theme);
          ctx.restore();
        }
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [analyserNode, isPlaying, mode, theme]);

  return (
    <canvas
      ref={canvasRef}
      className={className || 'w-full h-full block'}
    />
  );
};

export default SpectrumCanvas;
