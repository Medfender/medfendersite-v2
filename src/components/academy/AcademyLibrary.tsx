"use client";

import { useMemo, useState } from "react";
import AcademyCourseCard from "./AcademyCourseCard";
import {
  academyCategories,
  academyCourses,
  academyDifficulties,
  type AcademyDifficulty,
} from "@/data/academyData";
import type { AcademyCourse } from "@/data/academyData";

const DIFFICULTY_LABEL: Record<AcademyDifficulty, string> = {
  All: "All levels",
  Basic: "Beginner",
  Intermediate: "Intermediate",
  Advanced: "Advanced",
  Extras: "Masterclass / Extras",
};

export default function AcademyLibrary() {
  const [difficulty, setDifficulty] = useState<AcademyDifficulty>("All");
  const [category, setCategory] = useState<(typeof academyCategories)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo<AcademyCourse[]>(() => {
    const q = query.trim().toLowerCase();
    return academyCourses.filter((course) => {
      if (difficulty !== "All" && course.difficulty !== difficulty) return false;
      if (category !== "All" && course.category !== category) return false;
      if (!q) return true;
      return (
        course.title.toLowerCase().includes(q) ||
        course.subtitle.toLowerCase().includes(q) ||
        course.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [difficulty, category, query]);

  const counts = useMemo(() => {
    const out: Record<AcademyDifficulty, number> = {
      All: academyCourses.length,
      Basic: 0,
      Intermediate: 0,
      Advanced: 0,
      Extras: 0,
    };
    for (const c of academyCourses) out[c.difficulty] += 1;
    return out;
  }, []);

  return (
    <section className="surface-paper bg-paper py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1560px] px-5 md:px-8">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] tracking-[0.18em] text-rust">
            02
          </span>
          <span className="eyebrow">Lesson library</span>
          <span aria-hidden className="h-px flex-1 bg-[var(--rule)]" />
        </div>

        <div className="mt-7 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <h2 className="display-lg max-w-2xl text-ink text-balance">
            Choose exactly what
            <br />
            <em className="italic text-rust">you want to learn.</em>
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-ink/60">
            Every course ships tabs, sheet music, backing tracks and play-alongs.
            Filter by level or category — the first video in every course is
            free to watch.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-12 flex flex-col gap-6 border-y border-[var(--rule)] py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {academyDifficulties.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                aria-pressed={difficulty === d}
                className={[
                  "font-mono text-[9px] uppercase tracking-[0.22em] transition-colors",
                  difficulty === d
                    ? "text-rust underline decoration-rust/40 underline-offset-[6px]"
                    : "text-ink/60 hover:text-ink",
                ].join(" ")}
              >
                {DIFFICULTY_LABEL[d]}
                <span className="ml-1.5 text-ink/30">{counts[d] ?? 0}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as (typeof academyCategories)[number])
              }
              className="border border-[var(--rule)] bg-transparent px-3 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-ink focus:border-ink focus:outline-none"
              aria-label="Filter by category"
            >
              {academyCategories.map((c) => (
                <option key={c} value={c} className="bg-paper">
                  {c === "All" ? "All categories" : c}
                </option>
              ))}
            </select>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search lessons…"
              className="w-48 border border-[var(--rule)] bg-transparent px-3 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none"
              aria-label="Search lessons"
            />
          </div>
        </div>

        <p className="mt-6 font-mono text-[8.5px] uppercase tracking-[0.26em] text-ink/60">
          Showing {filtered.length} of {academyCourses.length} courses
        </p>

        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course, i) => (
            <AcademyCourseCard key={course.id} course={course} delay={(i % 3) * 0.04} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-12 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-ink/60">
            No courses match your filters.
          </p>
        ) : null}
      </div>
    </section>
  );
}
