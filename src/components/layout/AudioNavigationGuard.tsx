"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAudio } from "@/context/AudioContext";

export default function AudioNavigationGuard() {
  const pathname = usePathname();
  const { transportState, stopPlayback } = useAudio();

  useEffect(() => {
    if (transportState === "playing" && pathname !== "/audio") {
      stopPlayback();
    }
  }, [pathname, transportState, stopPlayback]);

  return null;
}
