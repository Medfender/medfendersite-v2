"use client";

import { useState, useRef, useEffect } from "react";
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
              onClick={() => setIsPreviewOpen(true)}
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

      {/* ─── Aperçu (Preview Lightbox) ─────────────────────────────────────── */}
      <AnimatePresence>
        {isPreviewOpen && resolvedSrc && (
          <motion.div
            key="preview-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => setIsPreviewOpen(false)}
          >
            {/* Enlarged image — stop propagation so clicking the image doesn't close */}
            <motion.img
              key={resolvedSrc}
              src={resolvedSrc}
              alt={`Preview of ${trackName}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full aspect-square object-cover rounded-md border border-amber-700/50 shadow-[0_0_40px_rgba(217,119,6,0.3)]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
