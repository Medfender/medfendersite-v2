"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Reveal from "@/components/luxury/Reveal";
import AcademyVideoPlayer from "@/components/academy/AcademyVideoPlayer";
import { useAcademyAccess } from "@/context/AcademyAccessContext";
import {
  buildLessons,
  type AcademyCourse,
  type AcademyLesson,
} from "@/data/academyData";
import { Lock, PlayCircle, FileText, Music2, BookOpen } from "lucide-react";

export default function AcademyCourseClient({ course }: { course: AcademyCourse }) {
  const { subscribed } = useAcademyAccess();
  const router = useRouter();
  const lessons = useMemo(() => buildLessons(course), [course]);
  const [activeId, setActiveId] = useState<string>(lessons[0]?.id ?? "");
  const active = lessons.find((l) => l.id === activeId) ?? lessons[0];

  const isLocked = (lesson: AcademyLesson) =>
    !lesson.freePreview && !subscribed;

  const materials = [
    course.hasTabs && { icon: FileText, label: "Tabs" },
    course.hasSheetMusic && { icon: BookOpen, label: "Sheet music" },
    course.hasBackingTracks && { icon: Music2, label: "Backing tracks" },
  ].filter(Boolean) as { icon: typeof FileText; label: string }[];

  return (
    <section className="surface-paper w-full">
      <div className="mx-auto w-full max-w-[1560px] px-5 py-14 md:px-8 md:py-20">
        {/* Course header */}
        <div className="grid grid-cols-1 gap-6 border-b border-[var(--rule)] pb-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <div className="flex items-center gap-4">
              <span className="folio">02</span>
              <span className="eyebrow">Course · {course.category}</span>
              <span aria-hidden className="h-px w-12 bg-[var(--rule)]" />
            </div>
            <h2 className="display-md mt-5 text-ink">
              The lessons,
              <br />
              <em className="accent-italic">in order.</em>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/60">
              Work down the index — each video builds on the one before it. Your
              place is kept while you stay on this page.
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 md:col-span-4">
            <div>
              <dt className="font-mono text-[8.5px] uppercase tracking-[0.3em] text-sand-deep">
                Lessons
              </dt>
              <dd className="mt-1.5 font-display text-2xl leading-none text-ink">
                {String(lessons.length).padStart(2, "0")}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[8.5px] uppercase tracking-[0.3em] text-sand-deep">
                Access
              </dt>
              <dd className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/80">
                {subscribed ? "Unlocked" : "Preview only"}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[8.5px] uppercase tracking-[0.3em] text-sand-deep">
                Instructor
              </dt>
              <dd className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/80">
                {course.instructor}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[8.5px] uppercase tracking-[0.3em] text-sand-deep">
                Level
              </dt>
              <dd className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/80">
                {course.level}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1.65fr_1fr] lg:gap-16">
          {/* Player + notes */}
          <div className="flex flex-col gap-8">
            <div className="plate">
              <AcademyVideoPlayer
                title={active?.title ?? course.title}
                src={active?.src}
                freePreview={active?.freePreview ?? false}
                subscribed={subscribed}
                onUnlock={() => router.push("/academy#membership")}
              />
            </div>

            <div>
              <div className="flex items-baseline gap-4">
                <span className="folio">
                  {String(
                    Math.max(
                      1,
                      lessons.findIndex((l) => l.id === active?.id) + 1,
                    ),
                  ).padStart(2, "0")}
                </span>
                <span className="font-mono text-[8.5px] uppercase tracking-[0.3em] text-sand-deep">
                  Now playing
                </span>
                <span aria-hidden className="h-px flex-1 bg-[var(--rule)]" />
                <span className="font-mono text-[8.5px] uppercase tracking-[0.26em] text-ink/50">
                  {active?.duration ?? "—"}
                </span>
              </div>
              <h3 className="display-sm mt-4 text-ink">
                {active?.title ?? course.title}
              </h3>
              <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.26em] text-rust">
                {isLocked(active as AcademyLesson)
                  ? "Members only"
                  : active?.freePreview
                    ? "Free preview"
                    : "Unlocked"}
              </p>
            </div>

            {materials.length ? (
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[var(--rule)] pt-6">
                {materials.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.24em] text-ink/60"
                  >
                    <Icon className="h-3.5 w-3.5 text-rust" strokeWidth={1.5} />
                    {label}
                  </span>
                ))}
                {isLocked(active as AcademyLesson) ? (
                  <span className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.24em] text-rust">
                    <Lock className="h-3.5 w-3.5" strokeWidth={1.5} /> Subscription
                    required
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Lesson index */}
          <aside className="border border-[var(--rule)] bg-[rgba(255,253,246,0.35)] lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-baseline justify-between border-b border-[var(--rule)] px-5 py-4">
              <div>
                <p className="eyebrow">The index</p>
                <p className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.26em] text-sand-deep">
                  {lessons.length} videos ·{" "}
                  {subscribed ? "Unlocked" : "Preview only"}
                </p>
              </div>
              <span className="font-display text-2xl leading-none text-rust">
                {String(lessons.length).padStart(2, "0")}
              </span>
            </div>

            <ul className="max-h-[560px] overflow-y-auto">
              {lessons.map((lesson, i) => {
                const locked = isLocked(lesson);
                const isActive = lesson.id === activeId;
                return (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(lesson.id)}
                      className={[
                        "flex w-full items-center gap-4 border-b border-[var(--rule-soft)] px-5 py-3.5 text-left transition-colors last:border-b-0",
                        isActive
                          ? "bg-[rgba(223,161,74,0.14)]"
                          : "hover:bg-[rgba(255,253,246,0.6)]",
                      ].join(" ")}
                    >
                      <span
                        className={`font-mono text-[9px] tracking-[0.18em] ${
                          isActive ? "text-rust" : "text-sand-deep"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`flex-1 text-sm leading-snug ${
                          isActive ? "text-ink" : "text-ink/70"
                        }`}
                      >
                        {lesson.title}
                      </span>
                      <span className="hidden font-mono text-[8.5px] uppercase tracking-[0.2em] text-sand-deep sm:inline">
                        {lesson.duration}
                      </span>
                      {locked ? (
                        <Lock className="h-3.5 w-3.5 text-rust" strokeWidth={1.5} />
                      ) : (
                        <PlayCircle
                          className={`h-3.5 w-3.5 ${
                            isActive ? "text-ink" : "text-ink/35"
                          }`}
                          strokeWidth={1.5}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {!subscribed ? (
              <div className="border-t border-[var(--rule)] p-5">
                <p className="text-xs leading-relaxed text-ink/60">
                  Only the first video is free. Subscribe to unlock every lesson,
                  tab, sheet and backing track.
                </p>
                <Link
                  href="/academy#membership"
                  className="btn btn-solid mt-4 w-full"
                >
                  Unlock all lessons
                  <span aria-hidden>→</span>
                </Link>
              </div>
            ) : null}
          </aside>
        </div>

        <div className="mt-16 border-t border-[var(--rule)] pt-6">
          <Reveal>
            <Link href="/academy" className="link-rule">
              <span aria-hidden>←</span>
              Back to the academy
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
