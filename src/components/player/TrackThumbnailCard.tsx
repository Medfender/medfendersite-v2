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
  return Array.from(new Set(patterns));
}

export default function TrackThumbnailCard({ showTitle = false }: Props) {
  const { activeTrack } = useAudio();
  const rawName =
    (activeTrack as any)?.name ||
    (activeTrack as any)?.title ||
    "";
  const rawArtist =
    (activeTrack as any)?.artist ||
    (activeTrack as any)?.author ||
    "";
  const trackName = clean(rawName);
  // Prefer explicit thumbnail URL (from track data) over pattern guessing
  const explicitThumb = (activeTrack as any)?.thumbnail || (activeTrack as any)?.coverUrl || null;

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

  // Close on Escape key when modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPreviewOpen) {
        setIsPreviewOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewOpen]);

  // Multi-pattern preloader (only when no explicit thumbnail given)
  useEffect(() => {
    // If there's an explicit thumbnail URL, use it directly
    if (explicitThumb) {
      setFailed(false);
      setResolvedSrc(explicitThumb);
      return;
    }

    if (!rawName && !rawArtist) return;

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
        setTimeout(tryNext, 0);
      };
      img.src = url;
    };

    tryNext();

    return () => {
      session.cancelled = true;
    };
  }, [rawName, rawArtist, explicitThumb]);

  return (
    <div className="relative flex items-center gap-2">
      {/* ─── Animated Card with Pulse Ring ─── */}
      <motion.div
        animate={{
          y: [0, -2, 0],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-md overflow-visible shadow-[0_0_10px_rgba(217,119,6,0.4)] z-20"
      >
        {/* Outer pulse ring — ambient glow when track is active */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.15, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-[-4px] rounded-md bg-amber-500/20 blur-[6px] pointer-events-none"
        />

        {/* Card image container */}
        <div className="relative w-full h-full rounded-md overflow-hidden border border-amber-600/40 bg-stone-900">
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
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsPreviewOpen(true);
                }}
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
        </div>
      </motion.div>

      {showTitle && (
        <div className="flex flex-col min-w-0">
          <h2 className="text-sm font-bold text-white truncate leading-tight">
            {trackName}
          </h2>
          <p className="text-[9px] text-amber-300/70 font-mono tracking-widest">
            NOW PLAYING
          </p>
        </div>
      )}

      {/* ─── Tube-Amp Artwork Preview Modal ─── */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence mode="wait">
            {isPreviewOpen && resolvedSrc && (
              <motion.div
                key="preview-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-sm"
                onClick={() => setIsPreviewOpen(false)}
              >
                {/* ── Tube Amp Chassis ── */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.88, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 12 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-md"
                >
                  {/* Chassis outer shell */}
                  <div
                    className="relative rounded-xl overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(160deg, #2a2a2a 0%, #1c1c1c 40%, #141414 100%)",
                      boxShadow:
                        "0 40px 80px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.6)",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    {/* Corner screws */}
                    <div className="absolute top-4 left-4 w-3.5 h-3.5 rounded-full bg-zinc-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] border border-zinc-900 z-10" />
                    <div className="absolute top-4 right-4 w-3.5 h-3.5 rounded-full bg-zinc-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] border border-zinc-900 z-10" />
                    <div className="absolute bottom-4 left-4 w-3.5 h-3.5 rounded-full bg-zinc-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] border border-zinc-900 z-10" />
                    <div className="absolute bottom-4 right-4 w-3.5 h-3.5 rounded-full bg-zinc-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] border border-zinc-900 z-10" />

                    {/* ── Top panel: silkscreen header + fake VU meters ── */}
                    <div
                      className="px-8 pt-10 pb-6 border-b border-black/40"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
                      }}
                    >
                      {/* VU meter + title row */}
                      <div className="flex items-center justify-between mb-4">
                        {/* Left VU meter */}
                        <div className="flex items-center gap-1">
                          {["bg-amber-500", "bg-amber-400", "bg-zinc-600", "bg-zinc-700", "bg-zinc-800"].map(
                            (color, i) => (
                              <motion.div
                                key={i}
                                animate={{
                                  opacity: [0.3, 1, 0.3],
                                }}
                                transition={{
                                  duration: 0.8 + i * 0.2,
                                  repeat: Infinity,
                                  delay: i * 0.15,
                                }}
                                className={`w-1 h-3 rounded-full ${color} shadow-[0_0_4px_${color.includes("amber") ? "#f59e0b" : "transparent"}]`}
                              />
                            )
                          )}
                        </div>

                        {/* Silkscreen title */}
                        <div className="text-center select-none">
                          <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-amber-500/80">
                            ♪ Featured Track ♪
                          </p>
                        </div>

                        {/* Right VU meter */}
                        <div className="flex items-center gap-1">
                          {["bg-amber-500", "bg-zinc-800", "bg-zinc-700", "bg-amber-400", "bg-zinc-600"].map(
                            (color, i) => (
                              <motion.div
                                key={i}
                                animate={{
                                  opacity: [0.3, 1, 0.3],
                                }}
                                transition={{
                                  duration: 0.8 + i * 0.2,
                                  repeat: Infinity,
                                  delay: i * 0.15 + 0.3,
                                }}
                                className={`w-1 h-3 rounded-full ${color}`}
                              />
                            )
                          )}
                        </div>
                      </div>

                      {/* ── Speaker-grille frame around image ── */}
                      <div className="relative p-2 rounded-lg overflow-hidden"
                        style={{
                          background: "repeating-linear-gradient(90deg, #111 0px, #111 3px, transparent 3px, transparent 7px), repeating-linear-gradient(0deg, #111 0px, #111 3px, transparent 3px, transparent 7px)",
                          boxShadow: "inset 0 0 20px rgba(0,0,0,0.8), inset 0 0 4px rgba(0,0,0,0.6)",
                        }}
                      >
                        {/* Inner bezel */}
                        <div className="relative w-full aspect-square bg-black rounded-md overflow-hidden"
                          style={{
                            boxShadow: "inset 0 4px 16px rgba(0,0,0,0.9), inset 0 0 2px rgba(0,0,0,0.5)",
                          }}
                        >
                          {/* Subtle inner reflection */}
                          <div className="absolute inset-0 rounded-md bg-gradient-to-b from-white/[0.03] via-transparent to-black/60 pointer-events-none z-10" />
                          <img
                            src={resolvedSrc}
                            alt={`Preview of ${trackName}`}
                            className="relative w-full h-full object-cover rounded-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ── Bottom panel: tubes + close switch ── */}
                    <div
                      className="flex flex-col items-center justify-center px-8 py-6 space-y-5"
                      style={{
                        background:
                          "linear-gradient(0deg, rgba(0,0,0,0.2) 0%, transparent 60%)",
                      }}
                    >
                      {/* Glowing tubes row */}
                      <div className="flex items-center justify-center gap-6">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="flex flex-col items-center gap-1.5">
                            {/* Tube glass */}
                            <div
                              className="relative w-7 h-10 rounded-t-[14px] rounded-b-sm overflow-hidden"
                              style={{
                                background: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
                                boxShadow: `0 0 ${12 + i * 4}px rgba(255, 140, 0, 0.35), 0 0 ${6 + i * 2}px rgba(255, 80, 0, 0.2), inset 0 0 8px rgba(255, 100, 0, 0.1)`,
                              }}
                            >
                              {/* Tube plate (internal grid) */}
                              <div
                                className="absolute inset-2 top-1 rounded-sm opacity-20"
                                style={{
                                  background:
                                    "repeating-linear-gradient(0deg, #888 0px, #888 1px, transparent 1px, transparent 3px), repeating-linear-gradient(90deg, #888 0px, #888 1px, transparent 1px, transparent 3px)",
                                }}
                              />
                              {/* Heater glow */}
                              <motion.div
                                animate={{ opacity: [0.6, 0.9, 0.6] }}
                                transition={{
                                  duration: 1.5 + i * 0.3,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                                className="absolute bottom-0 inset-x-1 h-2 rounded-b-sm"
                                style={{
                                  background:
                                    "radial-gradient(ellipse at center bottom, rgba(255,120,0,0.8) 0%, rgba(255,60,0,0.4) 50%, transparent 100%)",
                                }}
                              />
                            </div>
                            {/* Tube base pins */}
                            <div className="w-6 h-1.5 rounded-sm bg-zinc-800 border border-zinc-900" />
                          </div>
                        ))}
                      </div>

                      {/* Power switch row */}
                      <div className="flex items-center gap-4 w-full max-w-xs">
                        {/* STANDBY label */}
                        <div className="flex-1 text-right">
                          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-500 select-none">
                            Standby
                          </span>
                        </div>

                        {/* Illuminated toggle power switch */}
                        <div
                          className="relative p-1 rounded-full cursor-pointer group"
                          style={{
                            background: "linear-gradient(180deg, #111 0%, #1a1a1a 100%)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.04)",
                          }}
                          onClick={() => setIsPreviewOpen(false)}
                          role="button"
                          tabIndex={0}
                          aria-label="Close preview"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setIsPreviewOpen(false);
                            }
                          }}
                        >
                          {/* Switch housing */}
                          <div
                            className="relative w-14 h-7 rounded-full overflow-hidden"
                            style={{
                              background: "linear-gradient(180deg, #0a0a0a 0%, #141414 100%)",
                              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8)",
                            }}
                          >
                            {/* ON indicator glow */}
                            <motion.div
                              animate={{ opacity: [0.7, 1, 0.7] }}
                              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                              className="absolute inset-0 rounded-full"
                              style={{
                                background:
                                  "radial-gradient(ellipse at 50% 50%, rgba(0,216,246,0.25) 0%, transparent 70%)",
                                boxShadow: "0 0 12px rgba(0,216,246,0.3)",
                              }}
                            />

                            {/* Power symbol */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="drop-shadow-[0_0_4px_rgba(0,216,246,0.8)]"
                              >
                                <motion.path
                                  d="M12 3v9"
                                  stroke="#00d8f6"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  animate={{ opacity: [0.8, 1, 0.8] }}
                                  transition={{ duration: 1.8, repeat: Infinity }}
                                />
                                <motion.path
                                  d="M18.36 6.64A9 9 0 1 1 5.64 6.64"
                                  stroke="#00d8f6"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  fill="none"
                                  animate={{ opacity: [0.8, 1, 0.8] }}
                                  transition={{ duration: 1.8, repeat: Infinity }}
                                />
                              </svg>
                            </div>

                            {/* Cyan indicator LED */}
                            <motion.div
                              animate={{ opacity: [0.8, 1, 0.8] }}
                              transition={{ duration: 1.8, repeat: Infinity }}
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                              style={{
                                background: "#00d8f6",
                                boxShadow: "0 0 8px #00d8f6, 0 0 16px rgba(0,216,246,0.4)",
                              }}
                            />
                          </div>
                        </div>

                        {/* POWER label */}
                        <div className="flex-1">
                          <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-500 select-none">
                            Power
                          </span>
                        </div>
                      </div>

                      {/* ── Jack labels ── */}
                      <div className="flex items-center justify-between w-full max-w-xs pt-2 border-t border-zinc-800/50">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[8px] font-bold tracking-[0.15em] uppercase text-zinc-600">Input</span>
                          <div className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
                            <div className="w-1.5 h-1.5 mx-auto mt-1 rounded-full bg-zinc-600" />
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[8px] font-bold tracking-[0.15em] uppercase text-zinc-600">Stereo</span>
                          <div className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
                            <div className="w-1.5 h-1.5 mx-auto mt-1 rounded-full bg-zinc-600" />
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[8px] font-bold tracking-[0.15em] uppercase text-zinc-600">Output</span>
                          <div className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]">
                            <div className="w-1.5 h-1.5 mx-auto mt-1 rounded-full bg-zinc-600" />
                          </div>
                        </div>
                      </div>

                      {/* Track name silkscreen */}
                      <div className="text-center select-none pb-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                          {trackName || "No Track Selected"}
                        </p>
                        <p className="text-[9px] text-zinc-600 font-mono mt-0.5">
                          24-Bit / 96kHz · Stereo
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
