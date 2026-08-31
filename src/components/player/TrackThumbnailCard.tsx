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

      {/* ─── Artwork Card Holder — Guitar Stompbox Layout — Portal to body ── */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence mode="wait">
          {isPreviewOpen && resolvedSrc && (
            <motion.div
              key="preview-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-sm"
              onClick={() => setIsPreviewOpen(false)}
            >
              {/* Pedal Chassis — stops propagation so clicking card doesn't close */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-xl bg-zinc-900 rounded-lg shadow-[0_30px_60px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.1)] border-2 border-zinc-950 flex flex-col"
              >
                {/* Hardware screws — four corners, recessed hex/Phillips heads */}
                <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-zinc-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border border-zinc-900" />
                <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-zinc-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border border-zinc-900" />
                <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-zinc-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border border-zinc-900" />
                <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-zinc-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border border-zinc-900" />

                {/* Top half: Screen / Bezel */}
                <div className="px-8 pt-10 pb-6">
                  <div className="relative w-full aspect-square bg-black p-2 rounded-md shadow-[inset_0_10px_25px_rgba(0,0,0,1)] border-b border-r border-zinc-700/30 overflow-hidden">
                    {/* Subtle inner reflection */}
                    <div className="absolute inset-0 rounded-md bg-gradient-to-b from-white/5 via-transparent to-black/60 pointer-events-none" />
                    <img
                      src={resolvedSrc}
                      alt={`Preview of ${trackName}`}
                      className="relative w-full h-full object-cover rounded-sm"
                    />
                  </div>
                </div>

                {/* Bottom half: Footswitch & Controls — true stompbox layout */}
                <div className="flex flex-col items-center justify-center pb-10 space-y-3">
                  {/* Glowing red LED jewel */}
                  <div className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_15px_#ef4444] ring-2 ring-zinc-800" />

                  {/* Silkscreen label */}
                  <span className="text-zinc-500 font-mono text-[10px] tracking-widest uppercase font-bold select-none">
                    Bypass / Close
                  </span>

                  {/* 3PDT Footswitch — mounting nut wrapper with centered plunger */}
                  <div className="p-1 rounded-full bg-zinc-800 shadow-inner border border-zinc-950 flex items-center justify-center">
                    {/* Mechanical plunger */}
                    <button
                      onClick={() => setIsPreviewOpen(false)}
                      aria-label="Close preview"
                      className="w-12 h-12 rounded-full bg-gradient-to-b from-zinc-300 to-zinc-500 border-[2px] border-zinc-400 shadow-[0_5px_10px_rgba(0,0,0,0.6),inset_0_2px_3px_rgba(255,255,255,0.8)] active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)] transition-all cursor-pointer"
                    />
                  </div>

                  {/* Track label silkscreen */}
                  <div className="text-center select-none pt-2">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Featured Track</h3>
                    <p className="text-[10px] text-zinc-600 font-mono mt-0.5">Stereo Output · 24-Bit / 96kHz</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        ,
        document.body
      )}
    </div>
  );
}
