"use client";

import React from "react";
import { useAudio } from "@/context/AudioContext";
import Turntable from "@/components/turntable/Turntable";
import PlaylistPanel from "@/components/audio/PlaylistPanel";
import StickyTransport from "@/components/audio/StickyTransport";
import SignalChain from "@/components/audio/SignalChain";
import FeaturedAudioSection from "@/components/audio/FeaturedAudioSection";
import LocalTrackPanel from "@/components/audio/LocalTrackPanel";
import SpectrumAnalyzerPanel from "@/components/audio/SpectrumAnalyzerPanel";

export default function AudioClient() {
  const {
    transportState,
    isPowered,
    isPlaying,
    activeTrack,
    currentTime,
    duration,
    currentBpm,
    playTrack,
    togglePlay,
    stop: ctxStop,
    pause,
    seek,
  } = useAudio();

  // Click-to-seek: convert a 0..1 waveform percent into an absolute time on the active track.
  const handlePlaylistSeek = (percent: number) => {
    if (duration > 0) seek(percent * duration);
  };

  const handleTogglePlay = () => togglePlay();
  const handleTurntablePlay = () => {
    if (activeTrack) playTrack(activeTrack);
  };
  const handleTurntableStop = () => ctxStop();
  const handleNeedleDrop = () => {};

  const bpm = isPowered && isPlaying ? currentBpm ?? 0 : 0;
  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <>
      <main className="surface-ink relative flex min-h-screen flex-col overflow-x-hidden bg-ink-deep text-paper">
        {/* ── Featured audio masthead ───────────────────────────────────── */}
        <FeaturedAudioSection />

        {/* ── The deck & the queue ─────────────────────────────────────── */}
        <section className="w-full border-t border-[var(--rule-ink)]">
          <div className="mx-auto w-full max-w-[1560px] px-5 py-16 md:px-8 md:py-20">
            <div className="flex flex-col gap-6 border-b border-[var(--rule-ink)] pb-8 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center gap-4">
                  <span className="fret-index" data-inlay="true">
                    03
                  </span>
                  <span className="eyebrow-on-ink">The listening room</span>
                  <span aria-hidden className="h-px w-14 bg-cream/20 md:w-24" />
                </div>
                <h2 className="display-lg mt-6 max-w-2xl text-balance text-cream">
                  The record,
                  <br />
                  <em className="italic text-brass">in motion.</em>
                </h2>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/60">
                  One master turntable drives every panel below. Drop the needle,
                  read the spectrum, then follow the queue — the state is shared,
                  never duplicated.
                </p>
              </div>

              <a href="#local-library" className="btn btn-ghost self-start md:self-auto">
                Import your music
                <span aria-hidden>↓</span>
              </a>
            </div>

            <div className="mt-12 flex w-full flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
              <div className="relative w-full flex-none lg:w-[480px] xl:w-[520px]">
                <Turntable
                  transportState={transportState}
                  progress={progress}
                  onTogglePlay={handleTogglePlay}
                  onStop={handleTurntableStop}
                  onNeedleDrop={handleNeedleDrop}
                  onPlay={handleTurntablePlay}
                  onPause={pause}
                  bpm={bpm}
                />
              </div>

              <div className="w-full flex-1 border border-[var(--rule-ink)] p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-brass" aria-hidden />
                  <p className="font-mono text-[8px] uppercase tracking-[0.24em] text-cream/55">
                    Deck notes
                  </p>
                </div>
                <p className="mt-5 font-display text-[2rem] leading-tight text-cream">
                  The deck is
                  <br />
                  <em className="italic text-brass">the master.</em>
                </p>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/60">
                  Playback, the active track, the queue and the meters all read
                  from one turntable engine. Nothing below keeps a second copy
                  of the state.
                </p>
                <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-[var(--rule-ink)] pt-5">
                  {[
                    { k: "Conversion", v: "192 kHz" },
                    { k: "Depth", v: "32-bit" },
                    { k: "Range", v: "126 dB" },
                    { k: "Round trip", v: "< 1 ms" },
                  ].map((item) => (
                    <div key={item.k}>
                      <dt className="font-mono text-[8px] uppercase tracking-[0.22em] text-cream/55">
                        {item.k}
                      </dt>
                      <dd className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-cream/85">
                        {item.v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div id="playlist-panel" data-playlist className="mt-14 border-t border-[var(--rule-ink)] pt-8">
              <PlaylistPanel onSeek={handlePlaylistSeek} />
            </div>

            <div className="mt-14 border-t border-[var(--rule-ink)] pt-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-[8px] uppercase tracking-[0.24em] text-cream/55">
                  Spectrum · live
                </p>
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-cream/55">
                  Idle until the needle drops
                </p>
              </div>
              <div className="relative mt-4 h-[240px] w-full border border-[var(--rule-ink)] md:h-[280px]">
                <SpectrumAnalyzerPanel
                  selectedBandId={null}
                  setSelectedBandId={() => {}}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Local files ──────────────────────────────────────────────── */}
        <section id="local-library" className="w-full border-t border-[var(--rule-ink)]">
          <div className="mx-auto w-full max-w-[1560px] px-5 py-16 md:px-8 md:py-20">
            <LocalTrackPanel />
          </div>
        </section>

        {/* ── Signal chain ─────────────────────────────────────────────── */}
        <section className="w-full border-t border-[var(--rule-ink)]">
          <SignalChain />
        </section>

        {/* ── Track & gear context ─────────────────────────────────────── */}
        <section className="w-full border-t border-[var(--rule-ink)]">
          <div className="mx-auto w-full max-w-[1560px] px-5 py-16 md:px-8 md:py-20">
            <div className="flex items-center gap-4">
              <span className="fret-index" data-inlay="true">
                05
              </span>
              <span className="eyebrow-on-ink">Track &amp; gear context</span>
              <span aria-hidden className="h-px flex-1 bg-[var(--rule-ink)]" />
            </div>

            <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
              <div>
                <h3 className="label-rule text-brass">Active track</h3>
                <div className="mt-6">
                  <div className="border-t border-[var(--rule-ink)] py-4">
                    <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-cream/55">
                      Title
                    </p>
                    <p className="mt-2 font-display text-2xl leading-tight text-cream">
                      {(activeTrack as any)?.name ||
                        (activeTrack as any)?.title ||
                        "—"}
                    </p>
                  </div>
                  <div className="border-t border-[var(--rule-ink)] py-4">
                    <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-cream/55">
                      Source
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-brass">
                      {(activeTrack as any)?.gearTag ||
                        (activeTrack as any)?.artist ||
                        "No track selected"}
                    </p>
                  </div>
                  <div className="flex gap-10 border-y border-[var(--rule-ink)] py-4">
                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-cream/55">
                        Total
                      </p>
                      <p className="mt-1.5 font-mono text-xs tabular-nums text-cream">
                        {Math.floor(duration / 60)}:
                        {Math.floor(duration % 60)
                          .toString()
                          .padStart(2, "0")}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-cream/55">
                        Elapsed
                      </p>
                      <p className="mt-1.5 font-mono text-xs tabular-nums text-cream">
                        {Math.floor(currentTime / 60)}:
                        {Math.floor(currentTime % 60)
                          .toString()
                          .padStart(2, "0")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="label-rule text-brass">Signal notes</h3>
                <ul className="mt-6">
                  {[
                    'Guitar → 1/4" TRS balanced direct',
                    "TONEX Black Tube: vintage tube preamp model",
                    "HX Stomp XL: stereo amp + modulation chain",
                    "Interface USB-C: 192 kHz / 32-bit record path",
                    "DAW: Cubase — stereo monitoring out",
                  ].map((note) => (
                    <li
                      key={note}
                      className="border-t border-[var(--rule-ink)] py-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-cream/60"
                    >
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Viewport dock: animated bar player ───────────────────────── */}
      <div
        id="sticky-transport-sentinel"
        style={{ height: 1, position: "absolute", bottom: 100, pointerEvents: "none" }}
        aria-hidden
      />
      <StickyTransport />
    </>
  );
}
