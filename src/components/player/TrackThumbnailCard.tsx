"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Disc3 } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

interface Props {
  showTitle?: boolean;
}

const EXTS = ["jpg", "JPG", "jpeg", "JPEG", "png", "PNG", "webp", "WEBP"];

function clean(name: string): string {
  return (name || "").trim();
}

function buildPatterns(name: string, artist: string): string[] {
  const cleanName = clean(name);
  const cleanArtist = clean(artist);
  const patterns: string[] = [];
  if (cleanName) patterns.push(cleanName);
  if (cleanArtist && cleanName) {
    patterns.push(`${cleanArtist} - ${cleanName}`);
    patterns.push(`${cleanArtist} feat ${cleanName}`);
    patterns.push(`${cleanArtist} - ${cleanName} feat ${cleanArtist}`);
  }
  // dedupe
  return Array.from(new Set(patterns));
}

export default function TrackThumbnailCard({ showTitle = false }: Props) {
  const { activeTrack } = useAudio();
  const rawName = (activeTrack as any)?.name || (activeTrack as any)?.title || "";
  const rawArtist =
    (activeTrack as any)?.artist || (activeTrack as any)?.gearTag || (activeTrack as any)?.author || "";
  const trackName = clean(rawName);

  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const cancelRef = useRef<{ cancelled: boolean }>({ cancelled: false });
  const trackNameRef = useRef(trackName);

  useEffect(() => {
    trackNameRef.current = trackName;
  }, [trackName]);

  // Multi-pattern preloader: tests all pattern × extension combinations
  useEffect(() => {
    if (!rawName && !rawArtist) return;

    // Cancel any in-flight preloader from the previous track
    cancelRef.current.cancelled = true;
    const session = { cancelled: false };
    cancelRef.current = session;

    setFailed(false);
    setResolvedSrc(null);

    const patterns = buildPatterns(rawName, rawArtist);
    console.log("[TrackThumbnail] Trying patterns:", patterns);

    let patternIdx = 0;
    let extIdx = 0;

    const tryNext = () => {
      if (session.cancelled) return;
      if (patternIdx >= patterns.length) {
        console.log("[TrackThumbnail] All combinations exhausted — fallback");
        setFailed(true);
        setResolvedSrc(null);
        return;
      }
      const pattern = patterns[patternIdx];
      const ext = EXTS[extIdx];
      const url = `/images/Thumbnails/${encodeURIComponent(pattern)}.${ext}`;
      console.log("Attempting:", url);

      const img = new Image();
      img.onload = () => {
        if (session.cancelled) return;
        console.log("[TrackThumbnail] ✓ Found:", url);
        setResolvedSrc(url);
        setFailed(false);
      };
      img.onerror = () => {
        if (session.cancelled) return;
        extIdx++;
        if (extIdx >= EXTS.length) {
          patternIdx++;
          extIdx = 0;
        }
        // micro-defer to avoid potential stack/RAF starvation
        setTimeout(tryNext, 0);
      };
      console.log("Attempting:", url);
      img.src = url;
    };

    tryNext();

    return () => {
      session.cancelled = true;
    };
  }, [rawName, rawArtist]);

  return (
    <div className="relative flex items-center gap-2">
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-md overflow-hidden shadow-[0_0_10px_rgba(217,119,6,0.4)] border border-amber-600/40 bg-stone-900 z-20"
      >
        <AnimatePresence mode="wait">
          {failed || !resolvedSrc ? (
            <motion.div
              key="fallback"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full flex items-center justify-center"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #1a1a1a 0%, #0a0a0a 70%)",
              }}
            >
              <Disc3 size={28} className="text-amber-500/60" strokeWidth={1.2} />
            </motion.div>
          ) : (
            <motion.img
              key={resolvedSrc}
              src={resolvedSrc}
              alt={trackName}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3 }}
              role="button"
              tabIndex={0}
              aria-label={`Open preview of ${trackName}`}
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); setIsPreviewOpen(true); }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsPreviewOpen(true);
                }
              }}
              className="w-full h-full object-cover cursor-pointer transition-transform hover:scale-110"
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
      </motion.div>
      {showTitle && (
        <div className="flex flex-col min-w-0">
          <h2 className="text-sm font-bold text-white truncate leading-tight">{trackName}</h2>
          <p className="text-[9px] text-amber-300/70 font-mono tracking-widest">NOW PLAYING</p>
        </div>
      )}

      {/* ─── Artwork Card Holder (Preview Lightbox) — Portal to body ── */}
      {mounted && isPreviewOpen && resolvedSrc && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-sm"
              onClick={() => setIsPreviewOpen(false)}
            >
              {/* Card Holder — stops propagation so clicking card doesn't close */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-2xl max-h-[75vh] bg-[#111] border border-gray-800 rounded-2xl p-4 flex flex-col shadow-2xl"
              >
                {/* Close button */}
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  aria-label="Close preview"
                  className="absolute -top-3 -right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-neutral-700 transition-colors shadow-lg"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="1" y1="1" x2="13" y2="13" />
                    <line x1="13" y1="1" x2="1" y2="13" />
                  </svg>
                </button>

                {/* Image container */}
                <div className="relative flex-1 min-h-0 w-full bg-black rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src={resolvedSrc}
                    alt={`Preview of ${trackName}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
