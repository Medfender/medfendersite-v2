"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Disc3 } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

interface Props {
  showTitle?: boolean;
}

// Try common image extensions in order
const EXTS = [".jpg", ".jpeg", ".png", ".webp"];

function sanitizeName(name: string): string {
  return (name || "").trim().replace(/\s+/g, " ").replace(/[&]/g, "&");
}

export default function TrackThumbnailCard({ showTitle = false }: Props) {
  const { activeTrack } = useAudio();
  const rawName = (activeTrack as any)?.name || (activeTrack as any)?.title || "";
  const trackName = sanitizeName(rawName);

  const [extIndex, setExtIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);

  // Keep refs in sync with state so onError never reads a stale closure
  const extIndexRef = useRef(extIndex);
  const trackNameRef = useRef(trackName);
  const resolvedSrcRef = useRef<string | null>(null);

  useEffect(() => {
    extIndexRef.current = extIndex;
  }, [extIndex]);
  useEffect(() => {
    resolvedSrcRef.current = resolvedSrc;
  }, [resolvedSrc]);
  useEffect(() => {
    trackNameRef.current = trackName;
  }, [trackName]);

  // Reset on track change — fires synchronously after DOM update
  useEffect(() => {
    setExtIndex(0);
    setFailed(false);
    const clean = sanitizeName(rawName);
    const path = `/images/Thumbnails/${clean}.jpg`;
    setResolvedSrc(path);
    resolvedSrcRef.current = path;
    console.log("[TrackThumbnail] Attempting image path:", path, "| trackName:", clean);
  }, [rawName]);

  const onError = () => {
    const current = resolvedSrcRef.current;
    const idx = extIndexRef.current;
    console.log("[TrackThumbnail] onError — current src:", current, "| extIndex:", idx);
    const nextIdx = idx + 1;
    if (nextIdx < EXTS.length) {
      const clean = trackNameRef.current;
      const nextSrc = `/images/Thumbnails/${clean}${EXTS[nextIdx]}`;
      console.log("[TrackThumbnail] Trying next extension:", nextSrc);
      setExtIndex(nextIdx);
      setResolvedSrc(nextSrc);
    } else {
      console.log("[TrackThumbnail] All extensions exhausted — showing fallback");
      setFailed(true);
    }
  };

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
                  "radial-gradient(circle at 30% 30%, #1a1a1a 0%, #0a0a0a 70%), repeating-conic-gradient(#111 0% 25%, #1a1a1a 0% 50%) 0 0 / 8px 8px",
              }}
            >
              <Disc3 size={28} className="text-amber-500/60" strokeWidth={1.2} />
            </motion.div>
          ) : (
            <motion.img
              key={resolvedSrc ? `img-${resolvedSrc}` : `img-init-${trackName}`}
              src={resolvedSrc || undefined}
              alt={trackName}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover"
              onError={onError}
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
    </div>
  );
}
