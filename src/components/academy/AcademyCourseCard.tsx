"use client";

import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/luxury/Reveal";
import { ArrowUpRight, BookOpen, Music2, FileText } from "lucide-react";
import type { AcademyCourse } from "@/data/academyData";

export default function AcademyCourseCard({
  course,
  delay = 0,
}: {
  course: AcademyCourse;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <Link href={`/academy/${course.slug}`} className="group flex h-full flex-col">
        <div className="relative aspect-[4/3] w-full overflow-hidden border border-[var(--rule)] bg-paper-dim">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="grade-print object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-80" />

          {course.badge ? (
            <span className="absolute left-3 top-3 bg-paper/95 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.26em] text-ink">
              {course.badge}
            </span>
          ) : null}
          <span className="absolute right-3 top-3 border border-cream/30 bg-ink-deep/70 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.24em] text-cream/85 backdrop-blur-sm">
            {course.difficulty}
          </span>
          <p className="absolute bottom-3 left-3 right-3 font-mono text-[8.5px] uppercase tracking-[0.22em] text-cream/85">
            {course.lessons} videos · {course.instructor}
          </p>
        </div>

        <div className="flex flex-1 flex-col pt-4">
          <h3 className="font-display text-2xl leading-tight text-ink transition-colors group-hover:text-rust">
            {course.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/60">
            {course.subtitle}
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-[var(--rule)] pt-3.5 font-mono text-[8px] uppercase tracking-[0.22em] text-ink/60">
            {course.hasTabs ? (
              <span className="inline-flex items-center gap-1.5">
                <FileText className="h-3 w-3" /> Tabs
              </span>
            ) : null}
            {course.hasSheetMusic ? (
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-3 w-3" /> Sheet
              </span>
            ) : null}
            {course.hasBackingTracks ? (
              <span className="inline-flex items-center gap-1.5">
                <Music2 className="h-3 w-3" /> Backing
              </span>
            ) : null}
            <ArrowUpRight className="ml-auto h-4 w-4 text-rust opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
