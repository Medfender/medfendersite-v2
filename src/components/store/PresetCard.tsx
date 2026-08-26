"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { PackData, ToneItem } from "@/data/storeData";
import { useAudio } from "@/context/AudioContext";

export const previewController = {
  listeners: new Set<(id: string | null, playing: boolean) => void>(),
  activeId: null as string | null,
  notify(id: string | null, playing: boolean) {
    this.activeId = playing ? id : null;
    this.listeners.forEach((fn) => fn(id, playing));
  },
};

export default function PresetCard({ preset }: { preset: PackData }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl hover:border-cyan-500/50 transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-cyan-500/10 text-cyan-400 rounded-md mb-2">
            {preset.badge}
          </span>
          <h3 className="text-xl font-bold text-white">{preset.title}</h3>
        </div>
      </div>
      <p className="text-slate-400 text-sm mb-6">{preset.description}</p>

      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Included Tones</h4>
        {preset.tones.map((tone) => (
          <ToneRow key={tone.id} tone={tone} />
        ))}
      </div>
    </div>
  );
}

function ToneRow({ tone }: { tone: ToneItem }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { registerAudioElement, stopTrack, activeTrack, isPlaying, connectAudioElement, setVisualizerActive, setCardVolume, pauseAllOtherMedia, getActiveFrequencyData, setActiveAudioElement } = useAudio();
  const [playing, setPlaying] = useState(false);
  const [localVol, setLocalVol] = useState(0.85);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    const cleanup = registerAudioElement(audioRef.current);
    return () => {
      if (cleanup) cleanup();
    };
  }, [registerAudioElement]);

  useEffect(() => {
    if (playing && audioRef.current) {
      if (isPlaying || activeTrack) {
        stopTrack();
      }
    }
  }, [playing, isPlaying, activeTrack, stopTrack]);

  useEffect(() => {
    const handler = (id: string | null, isPlayingInstance: boolean) => {
      if (id !== null && id !== tone.id && isPlayingInstance) {
        if (playing) {
          setPlaying(false);
          setVisualizerActive(false);
          if (audioRef.current) {
            try {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            } catch (e) {}
            playPromiseRef.current = null;
          }
        }
      }
    };
    previewController.listeners.add(handler);
    return () => { previewController.listeners.delete(handler); };
  }, [playing, tone.id, setVisualizerActive]);

  // Reset when native audio events fire (external stop / featured player start)
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPause = () => setPlaying(false);
    const onEnded = () => { setPlaying(false); setVisualizerActive(false); };
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    return () => { el.removeEventListener("pause", onPause); el.removeEventListener("ended", onEnded); };
  }, [setVisualizerActive]);

  const toggle = useCallback(async () => {
    if (!audioRef.current) return;
    if (playing) {
      try {
        const p = audioRef.current.pause();
        // Ensure any pending play promise is caught before pausing completes silently
        if (playPromiseRef.current) {
          try {
            await playPromiseRef.current;
          } catch (e: any) {
            if (e.name !== "AbortError") {
              console.error("Pending play interrupted:", e);
            }
          }
          playPromiseRef.current = null;
        }
      } catch (e) {}
      audioRef.current.currentTime = 0;
      setPlaying(false);
      setVisualizerActive(false);
      previewController.notify(tone.id, false);
    } else {
      // Pause all other media before starting playback (global coordination)
      pauseAllOtherMedia(audioRef.current);

      previewController.notify(tone.id, true);
      if (isPlaying || activeTrack) {
        stopTrack();
      }
      // Keep element volume fixed at 1.0; attenuation via GainNode only
      if (audioRef.current) audioRef.current.volume = 1.0;
      audioRef.current.currentTime = 0;

      try {
        if (audioRef.current) {
          playPromiseRef.current = audioRef.current.play();
          if (playPromiseRef.current !== undefined) {
            await playPromiseRef.current;
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Playback error:", err);
        }
      } finally {
        playPromiseRef.current = null;
      }

      const AudioCtxClass =
        (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass && audioRef.current) {
        try {
          const ctx = new AudioCtxClass();
          if (ctx.state === "suspended") await ctx.resume();
          connectAudioElement(audioRef.current);
        } catch (e) {
          console.warn("Visualizer init skipped:", e);
        }
      }

      setPlaying(true);
      setVisualizerActive(true);
      if (audioRef.current) {
        audioRef.current.volume = 1.0;
        connectAudioElement(audioRef.current);
        setCardVolume(audioRef.current, localVol);
        if (setActiveAudioElement) setActiveAudioElement(audioRef.current);
      }
    }
  }, [playing, localVol, tone.id, isPlaying, activeTrack, stopTrack, connectAudioElement, connectAudioElement, setVisualizerActive, pauseAllOtherMedia]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 1.0;
      setCardVolume(audioRef.current, localVol);
    }
  }, [localVol, setCardVolume]);

  const handleVolChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setLocalVol(v);
    if (audioRef.current) {
      setCardVolume(audioRef.current, v);
    }
  }, [setCardVolume]);

  return (
    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
      <audio ref={audioRef} src={tone.audioUrl} preload="metadata" crossOrigin="anonymous" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="w-10 h-10 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center hover:bg-cyan-400 transition shadow-[0_0_12px_rgba(0,216,246,0.3)] shrink-0"
            aria-label={playing ? "STOP" : "PLAY"}
          >
            <span className="text-base leading-none select-none" aria-hidden="true">
              {playing ? "■" : "▶"}
            </span>
          </button>
          <div>
            <div className="text-sm font-medium text-white">{tone.name}</div>
            <div className="text-xs text-slate-400">{tone.gearTag}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold">VOL</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={localVol}
            onChange={handleVolChange}
            className="w-16 accent-cyan-400 cursor-pointer"
            aria-label={`Volume for ${tone.name}`}
          />
        </div>
      </div>
    </div>
  );
}
