"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { parseBlob } from "music-metadata-browser";
import { Play, Pause, Trash2, Music, ImagePlus } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { saveTrack, loadTracks, removeTrack as deletePersistedTrack, clearAllTracks } from "@/lib/audio/LocalTrackStore";

export interface LocalTrack {
  id: string;
  file: File;
  objectUrl: string;
  name: string;
  artist?: string;
  audioUrl: string;
  thumbnail?: string | null;         // resolved display image
  embeddedArtworkUrl?: string | null; // data URL from embedded art
  selectedCoverUrl?: string | null;   // Apple/user selected cover URL
}

const MAX_LOCAL = 10;
const FALLBACK_COVER = "/images/Thumbnails/TONEX.jpg";

function normalizeForApple(name?: string, artist?: string) {
  const cleanName = (name || "").trim().replace(/\.mp3|\.flac|\.wav|\.m4a|\.aac$/i, "");
  const cleanArtist = (artist || "").trim();
  return (cleanName || cleanArtist || "").trim();
}

function parseFilenameArtistTitle(filename: string): { artist?: string; title?: string } {
  const base = filename.replace(/\.[^.]+$/, "");
  // Common patterns: "Artist - Title", "Artist – Title", "Artist — Title"
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
  // If no split found and no embedded metadata, return empty — don't invent bad metadata
  return { artist: undefined, title: base };
}

function revokeUrl(url: string) {
  try { URL.revokeObjectURL(url); } catch {}
}

export default function LocalTrackPanel() {
  const { playlist, loadPlaylist, activeTrack, playTrack, isPlaying } = useAudio();
  const [localTracks, setLocalTracks] = useState<LocalTrack[]>([]);
  const [countMsg, setCountMsg] = useState(`0 / ${MAX_LOCAL} local tracks`);
  const [lookingUpId, setLookingUpId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load persisted tracks on mount; restore object URLs
  useEffect(() => {
    (async () => {
      const persisted = await loadTracks();
      const restored: LocalTrack[] = [];
      for (const pt of persisted) {
        // Recreate object URL from stored File/Blob
        const objectUrl = URL.createObjectURL(pt.file);
        const nameFromFile = pt.name || pt.file.name.replace(/\.[^.]+$/, "");
        restored.push({
          id: pt.id,
          file: pt.file,
          objectUrl,
          name: pt.name || nameFromFile,
          artist: pt.artist,
          audioUrl: objectUrl,
          embeddedArtworkUrl: pt.embeddedArtworkUrl || null,
          selectedCoverUrl: pt.thumbnailUrl || null,
          thumbnail: resolveArtwork({
            selectedCoverUrl: pt.thumbnailUrl || null,
            embeddedArtworkUrl: pt.embeddedArtworkUrl || null,
          } as LocalTrack),
        });
      }
      setLocalTracks(restored);
    })();
  }, []);

  const resolveArtwork = (track: LocalTrack): string | null => {
    // Explicit precedence: selected Apple/user cover > embedded art > fallback
    if (track.selectedCoverUrl) return track.selectedCoverUrl;
    if (track.embeddedArtworkUrl) return track.embeddedArtworkUrl;
    return null; // fallback handled at render time
  };

  const clearLocal = useCallback(() => {
    setLocalTracks((prev) => {
      prev.forEach((t) => revokeUrl(t.objectUrl));
      return [];
    });
    (async () => { await clearAllTracks(); })();
  }, []);

  useEffect(() => {
    setCountMsg(`${localTracks.length} / ${MAX_LOCAL} local tracks`);
  }, [localTracks.length]);

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
        artist: parsedName.artist || (parsedName.artist ? parsedName.artist : undefined),
        audioUrl: url,
        embeddedArtworkUrl,
        selectedCoverUrl: null,
        thumbnail: embeddedArtworkUrl || null,
      };

      // Persist to IndexedDB (file, meta, embedded art URL)
      await saveTrack({
        id: track.id,
        file: track.file,
        name: track.name,
        artist: track.artist,
        thumbnailUrl: track.selectedCoverUrl,
        embeddedArtworkUrl: track.embeddedArtworkUrl,
        duration: undefined,
        importedAt: Date.now(),
      });

      setLocalTracks((prev) => [...prev, track]);
    }
    if (inputRef.current) inputRef.current.value = "";
  }, [localTracks.length]);

  // Helper: extract embedded artwork using music-metadata-browser (local only)
  // Returns a data URL (persistable) rather than a temporary blob URL.
  async function extractEmbeddedArt(file: File): Promise<string | null> {
    try {
      const metadata = await parseBlob(file);
      if (metadata.common && metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        if (picture.data && picture.format) {
          const uint8 = new Uint8Array(picture.data);
          const blob = new Blob([uint8], { type: `image/${picture.format}` });
          return await new Promise<string>((res) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }
      }
    } catch {
      // Graceful: no embedded art or parser unsupported
    }
    return null;
  }

  const removeTrack = useCallback((id: string) => {
    setLocalTracks((prev) => {
      const removed = prev.find((t) => t.id === id);
      if (removed) {
        revokeUrl(removed.objectUrl);
        if (removed.embeddedArtworkUrl && removed.embeddedArtworkUrl.startsWith("blob:")) {
          try { URL.revokeObjectURL(removed.embeddedArtworkUrl); } catch {}
        }
      }
      return prev.filter((t) => t.id !== id);
    });
    // Delete from IndexedDB after state update
    (async () => {
      await deletePersistedTrack(id);
    })();
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
        setLocalTracks((prev) => prev.map((t) => {
          if (t.id !== id) return t;
          return {
            ...t,
            selectedCoverUrl: artworkUrl,
            thumbnail: artworkUrl,
          };
        }));
        // Persist Apple cover selection
        const existing = await loadTracks();
        const pt = existing.find((e) => e.id === id);
        if (pt) {
          await saveTrack({ ...pt, thumbnailUrl: artworkUrl, embeddedArtworkUrl: pt.embeddedArtworkUrl || null });
        }
      }
    } catch {
      // graceful: keep existing artwork
    } finally {
      setLookingUpId(null);
    }
  }, [localTracks]);

  // Remove Apple/user cover; embedded artwork should become visible again
  const handleRemoveCover = useCallback(async (id: string) => {
    setLocalTracks((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const embedded = t.embeddedArtworkUrl || null;
      return {
        ...t,
        selectedCoverUrl: null,
        thumbnail: embedded || null,
      };
    }));
    const existing = await loadTracks();
    const pt = existing.find((e) => e.id === id);
    if (pt) {
      await saveTrack({ ...pt, thumbnailUrl: null, embeddedArtworkUrl: pt.embeddedArtworkUrl || null });
    }
  }, []);

  // Sync to main playlist when local tracks change
  useEffect(() => {
    const existing = playlist || [];
    const localOnly = localTracks.map((t) => ({
      id: t.id,
      name: t.name,
      gearTag: t.artist || "Local",
      audioUrl: t.audioUrl,
      thumbnail: resolveArtwork(t) || FALLBACK_COVER,
    }));
    if (localOnly.length > 0) {
      const merged = [...existing.filter((e: any) => !e.id?.startsWith("local-")), ...localOnly];
      loadPlaylist(merged as any);
    }
  }, [localTracks]);

  const displayCover = (track: LocalTrack): string => {
    return resolveArtwork(track) || FALLBACK_COVER;
  };

  return (
    <div className="w-full px-2 pt-3 pb-1">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">Local Library</h3>
        <span className="text-[10px] font-mono text-zinc-600">{countMsg}</span>
      </div>
      <div className="flex gap-2 mb-2">
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-300 cursor-pointer hover:bg-cyan-500/20 transition">
          <Music size={10} /> Import
          <input type="file" accept="audio/*" multiple ref={inputRef} onChange={handleImport} className="hidden" />
        </label>
        {localTracks.length > 0 && (
          <button onClick={clearLocal} className="px-2 py-1.5 rounded-md bg-red-500/10 border border-red-500/20 text-[10px] font-mono text-red-300 hover:bg-red-500/20 transition">Clear</button>
        )}
      </div>
      <p className="text-[9px] text-zinc-600 leading-tight mb-2">Local files never leave your device. Only an optional cover-art search sends track title/artist text to Apple.</p>
      <div className="flex flex-col gap-2">
        {localTracks.map((track) => {
          const isActive = (activeTrack as any)?.id === track.id;
          const coverSrc = displayCover(track);
          return (
            <div key={track.id} className={`flex items-center gap-3 px-2 py-2 rounded-lg border border-zinc-900/60 transition-colors ${isActive ? "bg-cyan-500/10" : "bg-[#0e121c]/60"}`}>
              <img src={coverSrc} alt="" className="w-9 h-9 rounded object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <div className={`text-xs font-semibold truncate ${isActive ? "text-cyan-200" : "text-neutral-200"}`}>{track.name}</div>
                <div className="text-[10px] text-zinc-500 truncate">{track.artist || "Local"}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleFindCover(track.id)} disabled={!!lookingUpId} className="text-[9px] px-1.5 py-0.5 rounded border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 transition" title="Find cover art">Art</button>
                {track.selectedCoverUrl && (
                  <button onClick={() => handleRemoveCover(track.id)} className="text-[9px] px-1.5 py-0.5 rounded border border-neutral-700 text-zinc-400 hover:text-white transition" title="Remove cover">Remove</button>
                )}
                <button onClick={() => removeTrack(track.id)} className="text-zinc-500 hover:text-red-400 transition" aria-label="Remove track"><Trash2 size={12} /></button>
              </div>
            </div>
          );
        })}
        {localTracks.length === 0 && (
          <div className="text-zinc-600 text-xs py-4 text-center">No local tracks loaded.</div>
        )}
      </div>
    </div>
  );
}
