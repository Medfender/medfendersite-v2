"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { parseBlob } from "music-metadata-browser";
import { Play, Pause, Trash2, Music } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { saveTrack, loadTracks, removeTrack as deletePersistedTrack, clearAllTracks } from "@/lib/audio/LocalTrackStore";

export interface LocalTrack {
  id: string;
  file: File;
  objectUrl: string;
  name: string;
  artist?: string;
  audioUrl: string;
  thumbnail?: string | null;
  embeddedArtworkUrl?: string | null;
  selectedCoverUrl?: string | null;
}

const MAX_LOCAL = 10;
const FALLBACK_COVER = "/images/Thumbnails/TONEX.jpg";

function parseFilenameArtistTitle(filename: string): { artist?: string; title?: string } {
  const base = filename.replace(/\.[^.]+$/, "");
  const patterns = [
    { regex: /^(.*?)\s+-\s+(.*)$/, split: true },
    { regex: /^(.*?)\s+–\s+(.*)$/, split: true },
    { regex: /^(.*?)\s+—\s+(.*)$/, split: true },
  ];
  for (const p of patterns) {
    const m = base.match(p.regex);
    if (m && m[1] && m[2]) {
      const a = m[1].trim();
      const t = m[2].trim();
      if (a.length > 0 && t.length > 0) return { artist: a, title: t };
    }
  }
  return { artist: undefined, title: base };
}

function revokeUrl(url: string) {
  try { URL.revokeObjectURL(url); } catch {}
}

function Thumbnail({ src, size = 36, accent = "cyan" }: { src: string | null; size?: number; accent?: "cyan" | "amber" }) {
  const [err, setErr] = useState(false);
  const ring = accent === "amber" ? "border-amber-500/40 shadow-[0_0_6px_rgba(245,158,11,0.3)]" : "border-brass/30 shadow-[0_0_6px_rgba(223,161,74,0.25)]";
  return (
    <div className={`relative shrink-0 rounded-sm overflow-hidden border ${ring} bg-[#0e0e12]`} style={{ width: size, height: size }} aria-hidden>
      {src && !err ? <img src={src} alt="" className="w-full h-full object-cover" onError={() => setErr(true)} /> : <div className="w-full h-full flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-neutral-700" /></div>}
    </div>
  );
}

export default function LocalTrackPanel() {
  const { activeTrack, playTrack, isPlaying, currentTime, duration, seek } = useAudio();
  const [localTracks, setLocalTracks] = useState<LocalTrack[]>([]);
  const [countMsg, setCountMsg] = useState(`0 / ${MAX_LOCAL} local tracks`);
  const [lookingUpId, setLookingUpId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const persisted = await loadTracks();
      const restored: LocalTrack[] = [];
      for (const pt of persisted) {
        const objectUrl = URL.createObjectURL(pt.file);
        restored.push({
          id: pt.id,
          file: pt.file,
          objectUrl,
          name: pt.name || pt.file.name.replace(/\.[^.]+$/, ""),
          artist: pt.artist,
          audioUrl: objectUrl,
          embeddedArtworkUrl: pt.embeddedArtworkUrl || null,
          selectedCoverUrl: pt.thumbnailUrl || null,
          thumbnail: pt.embeddedArtworkUrl || pt.thumbnailUrl || null,
        });
      }
      setLocalTracks(restored);
    })();
  }, []);

  const resolveArtwork = (track: LocalTrack): string | null => {
    if (track.selectedCoverUrl) return track.selectedCoverUrl;
    if (track.embeddedArtworkUrl) return track.embeddedArtworkUrl;
    return null;
  };

  const clearLocal = useCallback(() => {
    setLocalTracks((prev) => { prev.forEach((t) => revokeUrl(t.objectUrl)); return []; });
    (async () => { await clearAllTracks(); })();
  }, []);

  useEffect(() => { setCountMsg(`${localTracks.length} / ${MAX_LOCAL} local tracks`); }, [localTracks.length]);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const toAdd = Array.from(files).slice(0, Math.max(0, MAX_LOCAL - localTracks.length));
    for (const file of toAdd) {
      const url = URL.createObjectURL(file);
      const nameFromFile = file.name.replace(/\.[^.]+$/, "");
      const parsedName = parseFilenameArtistTitle(file.name);
      const embeddedArtworkUrl: string | null = await extractEmbeddedArt(file);
      const track: LocalTrack = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        objectUrl: url,
        name: parsedName.title || nameFromFile,
        artist: parsedName.artist || undefined,
        audioUrl: url,
        embeddedArtworkUrl,
        selectedCoverUrl: null,
        thumbnail: embeddedArtworkUrl || null,
      };
      await saveTrack({ id: track.id, file: track.file, name: track.name, artist: track.artist, thumbnailUrl: track.selectedCoverUrl, embeddedArtworkUrl: track.embeddedArtworkUrl, duration: undefined, importedAt: Date.now() });
      setLocalTracks((prev) => [...prev, track]);
    }
    if (inputRef.current) inputRef.current.value = "";
  }, [localTracks.length]);

  async function extractEmbeddedArt(file: File): Promise<string | null> {
    try {
      const metadata = await parseBlob(file);
      if (metadata.common && metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        if (picture.data && picture.format) {
          const uint8 = new Uint8Array(picture.data);
          const blob = new Blob([uint8], { type: `image/${picture.format}` });
          return await new Promise<string>((res) => { const reader = new FileReader(); reader.onload = () => res(reader.result as string); reader.readAsDataURL(blob); });
        }
      }
    } catch {}
    return null;
  }

  const removeTrack = useCallback((id: string) => {
    setLocalTracks((prev) => {
      const removed = prev.find((t) => t.id === id);
      if (removed) { revokeUrl(removed.objectUrl); if (removed.embeddedArtworkUrl && removed.embeddedArtworkUrl.startsWith("blob:")) try { URL.revokeObjectURL(removed.embeddedArtworkUrl); } catch {} }
      return prev.filter((t) => t.id !== id);
    });
    (async () => { await deletePersistedTrack(id); })();
  }, []);

  const handleFindCover = useCallback(async (id: string) => {
    setLookingUpId(id);
    try {
      const track = localTracks.find((t) => t.id === id);
      if (!track) return;
      const metaName = track.name || "";
      const metaArtist = track.artist || "";
      const qBase = metaName || metaArtist ? `${metaArtist} ${metaName}`.trim() : (parseFilenameArtistTitle(track.file.name).artist ? `${parseFilenameArtistTitle(track.file.name).artist} ${parseFilenameArtistTitle(track.file.name).title}` : track.file.name);
      if (!qBase) return;
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(qBase)}&entity=song&limit=3`);
      if (!res.ok) return;
      const data = await res.json();
      const match = data.results?.[0];
      if (match && match.artworkUrl) {
        const artworkUrl = match.artworkUrl.replace(/100x100$/, "600x600");
        setLocalTracks((prev) => prev.map((t) => t.id !== id ? t : { ...t, selectedCoverUrl: artworkUrl, thumbnail: artworkUrl }));
        const existing = await loadTracks();
        const pt = existing.find((e) => e.id === id);
        if (pt) await saveTrack({ ...pt, thumbnailUrl: artworkUrl, embeddedArtworkUrl: pt.embeddedArtworkUrl || null });
      }
    } catch {}
    finally { setLookingUpId(null); }
  }, [localTracks]);

  const handleRemoveCover = useCallback(async (id: string) => {
    setLocalTracks((prev) => prev.map((t) => t.id !== id ? t : { ...t, selectedCoverUrl: null, thumbnail: t.embeddedArtworkUrl || null }));
    const existing = await loadTracks();
    const pt = existing.find((e) => e.id === id);
    if (pt) await saveTrack({ ...pt, thumbnailUrl: null, embeddedArtworkUrl: pt.embeddedArtworkUrl || null });
  }, []);

  const displayCover = (track: LocalTrack): string => resolveArtwork(track) || FALLBACK_COVER;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex items-center gap-4">
        <span className="fret-index" data-inlay="true">
          07
        </span>
        <span className="eyebrow-on-ink">Local library</span>
        <span aria-hidden className="h-px flex-1 bg-[var(--rule-ink)]" />
        <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-cream/60">
          {countMsg}
        </span>
      </div>

      <div className="mt-8 flex flex-col gap-8 border-b border-[var(--rule-ink)] pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="display-md max-w-xl text-balance text-cream">
            Your own <em className="italic text-brass">recording,</em> on the same deck.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/55">
            Load an MP3, WAV or FLAC from this device. Files stay in the browser —
            nothing is uploaded. Only an optional cover-art lookup sends the
            track title and artist text out.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="btn btn-ghost cursor-pointer">
            <Music size={13} aria-hidden />
            Import audio
            <input
              type="file"
              accept="audio/*"
              multiple
              ref={inputRef}
              onChange={handleImport}
              className="sr-only"
            />
          </label>
          {localTracks.length > 0 && (
            <button
              onClick={clearLocal}
              className="font-mono text-[9px] uppercase tracking-[0.2em] text-cream/55 underline decoration-cream/20 underline-offset-4 transition-colors hover:text-[var(--color-brass-light)]"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        {localTracks.map((track, idx) => {
          const isActive = (activeTrack as any)?.id === track.id;
          const coverSrc = displayCover(track);
          return (
            <div
              key={track.id}
              onClick={() => playTrack({ id: track.id, name: track.name, gearTag: track.artist || "Local", audioUrl: track.audioUrl, thumbnail: resolveArtwork(track) || FALLBACK_COVER } as any)}
              className={`w-full flex flex-col border-b border-[var(--rule-ink)] py-3 transition-colors hover:bg-cream/[0.02] cursor-pointer group ${isActive ? "bg-cream/[0.02]" : ""}`}
            >
              <div className="flex items-center justify-between w-full px-1">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-[10px] text-cream/55 font-mono w-7 shrink-0 tabular-nums">{String(idx + 1).padStart(2, "0")}</span>
                  <Thumbnail src={coverSrc} size={36} accent={isActive ? "cyan" : "amber"} />
                  <div className="min-w-0 flex-1">
                    <h4 className={`text-sm truncate ${isActive ? "text-brass-light" : "text-cream/90"}`}>
                      {track.name || "Untitled"}
                    </h4>
                    <p className="text-[10px] text-cream/55 truncate font-mono uppercase tracking-[0.14em]">{track.artist || "Local"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <button onClick={(e) => { e.stopPropagation(); removeTrack(track.id); }} className="text-cream/55 hover:text-[var(--color-brass-light)] transition" aria-label="Remove track"><Trash2 size={12} /></button>
                  <button
                    aria-label={isActive && isPlaying ? "Pause" : "Play"}
                    onClick={(e) => { e.stopPropagation(); playTrack({ id: track.id, name: track.name, gearTag: track.artist || "Local", audioUrl: track.audioUrl, thumbnail: resolveArtwork(track) || FALLBACK_COVER } as any); }}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                      isActive
                        ? "border-brass/60 text-cream bg-brass/10"
                        : "border-cream/20 text-cream/60 opacity-0 group-hover:opacity-100 hover:border-brass/50 hover:text-cream bg-transparent"
                    }`}
                  >
                    {isActive && isPlaying ? <Pause size={12} strokeWidth={1.5} /> : <Play size={12} strokeWidth={1.5} className="ml-0.5" />}
                  </button>
                  <span className="text-[10px] text-cream/60 font-mono w-10 text-right tabular-nums">{(track as any).duration || "0:00"}</span>
                </div>
              </div>

              {isActive && (
                <div
                  className="w-full h-6 relative flex items-center justify-between gap-[1px] mt-3 mb-1 px-2 cursor-pointer group"
                  onClick={(e) => {
                    if (!seek) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    seek(percent);
                  }}
                >
                  <div className="w-full h-full relative flex items-center justify-between gap-[1px]">
                    {Array.from({ length: 150 }).map((_, i) => {
                      const barPct = (i / 149) * 100;
                      const played = barPct <= progressPercent;
                      return (
                        <div
                          key={i}
                          className={`w-[1px] rounded-none transition-colors duration-75 ${played ? "bg-brass/80" : "bg-cream/10"}`}
                          style={{ height: `${Math.max(30, 15 + (i % 3) * 20)}%` }}
                        />
                      );
                    })}
                  </div>
                  <div
                    className="absolute top-0 bottom-0 w-[1px] bg-brass-light z-10 pointer-events-none"
                    style={{ left: `${Math.min(100, Math.max(0, progressPercent))}%`, boxShadow: "0 0 3px rgba(240,197,121,0.6)" }}
                  />
                </div>
              )}
            </div>
          );
        })}
        {localTracks.length === 0 && (
          <div className="grid grid-cols-1 gap-6 py-12 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-display text-2xl leading-tight text-cream/80">
                Nothing loaded yet.
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-cream/55">
                Import up to ten tracks to audition them through the master
                turntable, the queue and the meters above.
              </p>
            </div>
            <p className="font-mono text-[8px] uppercase leading-relaxed tracking-[0.22em] text-cream/55">
              Format — MP3 · WAV · FLAC
              <br />
              Storage — this browser only
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
