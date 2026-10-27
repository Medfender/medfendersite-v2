"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * The cover photograph.
 *
 * It drifts against the page at a fraction of scroll speed, so the room
 * behind the type feels deeper than the page rather than pasted onto it.
 * With reduced motion the photograph is simply still.
 */
export default function HeroPlate({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yRaw = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const scaleRaw = useTransform(scrollYProgress, [0, 1], [1.03, 1.09]);
  const y = useSpring(yRaw, { stiffness: 90, damping: 28, mass: 0.6 });
  const scale = useSpring(scaleRaw, { stiffness: 90, damping: 28, mass: 0.6 });

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={reduceMotion ? undefined : { y, scale }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="grade-print object-cover"
          style={{ objectPosition: "center 42%" }}
        />
      </motion.div>
    </div>
  );
}
