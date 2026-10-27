"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

type AudioContextConstructor = typeof AudioContext;

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextConstructor })
      .webkitAudioContext ??
    null
  );
}

/**
 * A small Karplus–Strong pluck.
 *
 * The string is synthesised once per note into an AudioBuffer: a short burst
 * of noise is fed through a delay line the length of the string's period, then
 * low-pass filtered and fed back into itself. That is the same idea as a
 * physical string — and it is why the high strings decay faster than the low
 * ones without any envelope being drawn.
 *
 * Sound is off by default and only starts from a deliberate tap, which keeps
 * the site silent for anyone who did not ask for it.
 */
export function usePluck() {
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const timersRef = useRef<number[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  const hasWebAudio = useSyncExternalStore(
    () => () => {},
    () => Boolean(getAudioContextConstructor()),
    () => false,
  );
  const supported = hasWebAudio && !audioFailed;

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
      void contextRef.current?.close();
      contextRef.current = null;
      masterRef.current = null;
    };
  }, []);

  const ensureContext = useCallback(async () => {
    const Constructor = getAudioContextConstructor();
    if (!Constructor) throw new Error("Web Audio is unavailable");

    if (!contextRef.current) {
      const context = new Constructor();
      const master = context.createGain();
      master.gain.value = 0.22;
      master.connect(context.destination);
      contextRef.current = context;
      masterRef.current = master;
    }

    if (contextRef.current.state === "suspended") {
      await contextRef.current.resume();
    }

    return contextRef.current;
  }, []);

  const pluck = useCallback(
    (midi: number, velocity = 0.8) => {
      const context = contextRef.current;
      const master = masterRef.current;
      if (!enabled || !context || !master) return;

      const frequency = 440 * Math.pow(2, (midi - 69) / 12);
      const sampleRate = context.sampleRate;
      const seconds = 1.9;
      const length = Math.floor(sampleRate * seconds);
      const buffer = context.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

      // Delay line = one period of the string.
      const period = Math.max(2, Math.round(sampleRate / frequency));
      const line = new Float32Array(period);
      for (let i = 0; i < period; i++) {
        line[i] = (Math.random() * 2 - 1) * 0.9;
      }

      // Pick position: a touch nearer the bridge than the middle.
      const pick = Math.max(1, Math.floor(period * 0.22));

      let index = 0;
      for (let i = 0; i < length; i++) {
        const current = line[index];
        const next = line[(index + 1) % period];
        // Averaging two adjacent samples is the low-pass loss of a real string.
        line[index] = 0.4985 * (current + next);
        // The initial pick transient, then the string takes over.
        data[i] =
          (i < period ? line[(index + pick) % period] : current) *
          velocity *
          Math.pow(0.99985, i);
        index = (index + 1) % period;
      }

      // A short fade at the tail so the buffer never clicks.
      const fade = Math.floor(sampleRate * 0.08);
      for (let i = 0; i < fade; i++) {
        data[length - 1 - i] *= i / fade;
      }

      const source = context.createBufferSource();
      source.buffer = buffer;

      const body = context.createBiquadFilter();
      body.type = "lowpass";
      body.frequency.value = Math.min(6800, frequency * 12);
      body.Q.value = 0.4;

      source.connect(body);
      body.connect(master);
      source.start();
    },
    [enabled],
  );

  const toggle = useCallback(async () => {
    if (enabled) {
      setEnabled(false);
      await contextRef.current?.suspend();
      return;
    }
    try {
      await ensureContext();
      setEnabled(true);
    } catch {
      setAudioFailed(true);
    }
  }, [enabled, ensureContext]);

  const playArpeggio = useCallback(
    (midiNotes: number[], spacing = 170) => {
      if (!enabled) return;
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = midiNotes.map((midi, index) =>
        window.setTimeout(() => pluck(midi), index * spacing),
      );
    },
    [enabled, pluck],
  );

  /**
   * A strum: low string first, with a few milliseconds of roll between
   * adjacent strings so it reads as a hand rather than a chord button.
   */
  const strum = useCallback(
    (midiNotes: number[]) => {
      if (!enabled) return;
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = midiNotes.map((midi, index) =>
        window.setTimeout(() => pluck(midi, 0.75), index * 26),
      );
    },
    [enabled, pluck],
  );

  return { enabled, supported, toggle, pluck, strum, playArpeggio };
}
