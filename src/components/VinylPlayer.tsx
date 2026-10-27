"use client";

import React from "react";
import Turntable from "@/components/turntable/Turntable";

/**
 * VinylPlayer now delegates its deck rendering to the canonical Turntable
 * implementation. Keeping a single component prevents the two players from
 * drifting, ensures the updated gimbal, counterweight, hardware controls, and
 * tonearm details stay synchronized, and removes the legacy flat SVG copy.
 */
export function VinylPlayer(props: React.ComponentProps<typeof Turntable>) {
  return <Turntable {...props} />;
}
