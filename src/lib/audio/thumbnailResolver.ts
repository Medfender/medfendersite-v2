"use client";
import React from "react";

/**
 * Shared thumbnail resolver.
 * Given a track's name + artist/gear tag, sequentially tries every
 * `<pattern>.<ext>` combination against `/public/images/Thumbnails/`
 * and returns the first URL that loads. Returns null if nothing matches.
 *
 * Used by StickyTransport, PlaylistPanel, VinylShowcase, PatchBrowser
 * so all four cards stay synchronized with the active track.
 */

const EXTS = ["webp", "WEBP", "jpg", "JPG", "jpeg", "JPEG", "png", "PNG"] as const;

function clean(name: string): string {
  return (name || "").trim();
}

function buildPatterns(name: string, artist: string): string[] {
  const cleanName = clean(name);
  const cleanArtist = clean(artist);
  const patterns: string[] = [];
  if (cleanName) patterns.push(cleanName);
  if (cleanArtist) patterns.push(cleanArtist);
  if (cleanArtist && cleanName) {
    patterns.push(`${cleanArtist} - ${cleanName}`);
    patterns.push(`${cleanArtist} feat ${cleanName}`);
    // Exact filename match for featured artist files with long compound titles
    if (cleanArtist && cleanName) {
      patterns.push(`${cleanArtist} - ${cleanName}`); // already done above
    }
  }
  return Array.from(new Set(patterns));
}

export function thumbnailPatterns(track: any | null | undefined): string[] {
  if (!track) return [];
  const name = track.name || track.title || "";
  const artist = track.artist || track.gearTag || "";
  return buildPatterns(name, artist);
}

/**
 * React-friendly hook that resolves a thumbnail URL for the given track.
 * Cancels any in-flight resolution on cleanup or track change.
 */
export function useResolvedThumbnail(track: any | null | undefined): string | null {
  const [src, setSrc] = React.useState<string | null>(null);
  const cancelRef = React.useRef<{ cancelled: boolean }>({ cancelled: false });

  React.useEffect(() => {
    cancelRef.current.cancelled = true;
    const session = { cancelled: false };
    cancelRef.current = session;
    setSrc(null);

    // Explicit thumbnail field on the track (highest priority — exact match)
    if (track && (track as any).thumbnail) {
      setSrc((track as any).thumbnail);
      return;
    }

    const patterns = thumbnailPatterns(track);
    if (patterns.length === 0) return;

    let patternIdx = 0;
    let extIdx = 0;

    const tryNext = () => {
      if (session.cancelled) return;
      if (patternIdx >= patterns.length) return;
      const pattern = patterns[patternIdx];
      const ext = EXTS[extIdx];
      const url = `/images/Thumbnails/${encodeURIComponent(pattern)}.${ext}`;
      const img = new Image();
      img.onload = () => {
        if (session.cancelled) return;
        setSrc(url);
      };
      img.onerror = () => {
        if (session.cancelled) return;
        extIdx++;
        if (extIdx >= EXTS.length) {
          patternIdx++;
          extIdx = 0;
        }
        setTimeout(tryNext, 0);
      };
      img.src = url;
    };

    tryNext();
  }, [track?.id, track?.name, track?.title, track?.artist, track?.gearTag]);

  return src;
}
