"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before the reveal begins. */
  delay?: number;
  /** Vertical travel in pixels. */
  y?: number;
  /** Keep the element in its final state after it has appeared. */
  once?: boolean;
}

/**
 * A quiet, slow entrance. Luxury reads as restraint: nothing bounces,
 * nothing springs — it simply arrives.
 *
 * `data-mf-reveal` is paired with a reduced-motion guard in globals.css so a
 * visitor who has asked for less motion never sees a hidden block, even if the
 * animation never runs.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
  once = true,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      data-mf-reveal
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once, margin: "-70px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
