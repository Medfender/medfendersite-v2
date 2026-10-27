"use client";

import React, { useEffect, useRef, useState } from "react";
import { Lock, Play, ShieldAlert } from "lucide-react";

interface AcademyVideoPlayerProps {
  src?: string;
  title: string;
  poster?: string;
  /** Whether this lesson is freely playable without a subscription. */
  freePreview?: boolean;
  /** Whether the viewer currently has an active subscription. */
  subscribed: boolean;
  /** Called when the viewer asks to unlock (opens subscription flow). */
  onUnlock?: () => void;
  className?: string;
}

/**
 * A video surface that NEVER exposes a download affordance:
 *  - native controls with `controlsList="nodownload noremoteplayback"`
 *  - picture-in-picture disabled
 *  - context menu disabled
 *  - source is only attached when the lesson is actually playable
 */
export default function AcademyVideoPlayer({
  src,
  title,
  poster,
  freePreview = false,
  subscribed,
  onUnlock,
  className = "",
}: AcademyVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const playable = Boolean(src) && (freePreview || subscribed);

  // Never leave a playable src in the DOM for locked lessons.
  const resolvedSrc = playable ? src : undefined;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  // Pause + strip source whenever access is revoked.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!playable) {
      try {
        video.pause();
      } catch {
        /* ignore */
      }
      video.removeAttribute("src");
      video.load();
    }
  }, [playable]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden border border-[var(--hairline-soft)] bg-ink ${className}`}
      onContextMenu={handleContextMenu}
    >
      {playable ? (
        <>
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={resolvedSrc}
            poster={poster}
            controls
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            playsInline
            preload="metadata"
            title={title}
            onContextMenu={handleContextMenu}
            onKeyDown={(e) => {
              // Block the "save video" / download shortcuts where supported.
              if (e.ctrlKey || e.metaKey) {
                const key = e.key.toLowerCase();
                if (key === "s" || key === "o" || key === "u") e.preventDefault();
              }
            }}
          />
          {!playing ? (
            <button
              type="button"
              aria-label={`Play ${title}`}
              onClick={() => videoRef.current?.play()}
              className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-ink/85 via-ink/25 to-transparent focus:outline-none"
            >
              <span className="flex h-16 w-16 items-center justify-center bg-brass text-ink transition-transform duration-300 hover:scale-110">
                <Play className="ml-1 h-7 w-7" fill="currentColor" strokeWidth={0} />
              </span>
            </button>
          ) : null}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-ink-deep via-ink to-ink-deep text-center px-6">
          {freePreview ? (
            <ShieldAlert className="h-10 w-10 text-brass-light" />
          ) : (
            <Lock className="h-10 w-10 text-brass-light" />
          )}
          <h3 className="font-display text-2xl text-cream">
            {freePreview ? "Sign in to watch" : "Members only"}
          </h3>
          <p className="max-w-md text-sm text-sand">
            {freePreview
              ? "This preview becomes playable once you create your free account."
              : "This lesson is unlocked for active members. Subscribe to access all courses, tabs, sheet music and backing tracks."}
          </p>
          <button
            type="button"
            onClick={onUnlock}
            className="mt-2 border border-brass bg-brass/10 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-brass-light hover:bg-brass hover:text-ink"
          >
            Unlock all lessons
          </button>
          <span className="font-mono text-[8.5px] uppercase tracking-[0.3em] text-sand-deep">
            Downloading is disabled on all academy videos
          </span>
        </div>
      )}
    </div>
  );
}
