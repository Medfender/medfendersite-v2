"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAudio } from "@/context/AudioContext";

export default function AudioNavigationGuard() {
  // Navigation guard disabled — router pushes must NOT be triggered
  // by audio playback state changes. Page navigation is handled via
  // standard <Link> tags only; audio control updates only local React
  // context state (playTrack / stopPlayback must never call router.push).
  return null;
}
