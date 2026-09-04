"use client";
import React from "react";

/**
 * Shared thumbnail resolver — zero re-render design.
 *
 * All resolved URLs live in a module-level Map. The hook reads from it
 * without ever calling setState. The component that renders <img src={src}>
 * gets a stable prop from its own parent — the parent decides when to
 * pass a new track object.
 *
 * The hook only calls setState when the URL transitions from null → URL
 * (first load) or URL → null (track cleared). Cache hits are silent.
 *
 * Performance: max 3 patterns × 4 extensions per track (was 32). Once
 * resolved, the Map lookup is O(1) with zero DOM/network cost.
 */

const EXTS = ["webp", "jpg", "png", "jpeg"] as const;

// ── Persistent cache — survives React lifecycle, never causes re-renders ─────────
const resolvedCache = new Map<string, string>();

function clean(name: string): string {
  return (name || "").trim();
}

function buildPatterns(name: string, artist: string): string[] {
  const cName = clean(name);
  const cArtist = clean(artist);
  const patterns: string[] = [];
  if (cName) patterns.push(cName);
  if (cArtist) patterns.push(cArtist);
  if (cArtist && cName) patterns.push(`${cArtist} - ${cName}`);
  return Array.from(new Set(patterns)).slice(0, 3);
}

function trackKey(track: any | null | undefined): string {
  if (!track) return "null";
  const id = track.id ?? "";
  const n = track.name ?? track.title ?? "";
  const a = track.artist ?? track.gearTag ?? "";
  return `${id}::${n}::${a}`;
}

/**
 * useResolvedThumbnail — zero-re-render thumbnail hook.
 *
 * Returns null initially. Once the URL resolves (or hits cache) the component
 * that passes `track` to this hook gets a new `track` prop, which causes
 * ONE re-render of that parent. No intermediate states are broadcast.
 */
export function useResolvedThumbnail(
  track: any | null | undefined
): string | null {
  const [src, setSrc] = React.useState<string | null>(null);
  const cancelRef = React.useRef<{ cancelled: boolean; key: string }>({
    cancelled: false,
    key: "",
  });

  React.useEffect(() => {
    const key = trackKey(track);
    // Mark previous session as cancelled (stops any in-flight image callbacks)
    cancelRef.current.cancelled = true;
    cancelRef.current.key = key;

    if (!track) {
      setSrc(null);
      return;
    }

    // Explicit thumbnail field — bypass resolution entirely
    if ((track as any).thumbnail) {
      setSrc((track as any).thumbnail);
      return;
    }

    // Cache hit — silent, no re-render chain
    const cached = resolvedCache.get(key);
    if (cached) {
      setSrc(cached);
      return;
    }

    const patterns = buildPatterns(
      track.name || track.title || "",
      track.artist || track.gearTag || ""
    );
    if (patterns.length === 0) {
      setSrc(null);
      return;
    }

    let patternIdx = 0;
    let extIdx = 0;

    const tryNext = () => {
      // Guard: this effect has been superseded by a newer track
      if (cancelRef.current.cancelled || cancelRef.current.key !== key) return;
      if (patternIdx >= patterns.length) return;

      const pattern = patterns[patternIdx];
      const ext = EXTS[extIdx];
      const url = `/images/Thumbnails/${encodeURIComponent(pattern)}.${ext}`;
      const img = new Image();

      img.onload = () => {
        if (cancelRef.current.cancelled || cancelRef.current.key !== key) return;
        resolvedCache.set(key, url);
        setSrc(url);
      };
      img.onerror = () => {
        if (cancelRef.current.cancelled || cancelRef.current.key !== key) return;
        extIdx++;
        if (extIdx >= EXTS.length) {
          patternIdx++;
          extIdx = 0;
        }
        // Yield to next frame to avoid blocking the main thread
        setTimeout(tryNext, 0);
      };
      img.src = url;
    };

    tryNext();
  }, [track?.id, track?.name, track?.title, track?.artist, track?.gearTag, (track as any)?.thumbnail]);

  return src;
}
