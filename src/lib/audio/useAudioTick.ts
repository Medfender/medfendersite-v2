"use client";

import { useEffect, useRef, useCallback } from "react";
import { audioTickController, TickFrame } from "./AudioTickController";

export function useAudioTick(onTick: (frame: TickFrame) => void) {
  const cbRef = useRef(onTick);
  cbRef.current = onTick;

  useEffect(() => {
    const wrapper = (frame: TickFrame) => cbRef.current(frame);
    audioTickController.on(wrapper);

    // Start loop on first subscriber; idle-check later
    audioTickController.start();

    return () => {
      audioTickController.off(wrapper);
      setTimeout(() => audioTickController.checkIdle(), 0);
    };
  }, []);
}
