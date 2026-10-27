import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/luxury/PageHero";
import AcademyCourseClient from "./AcademyCourseClient";
import { academyCourses } from "@/data/academyData";

export function generateStaticParams() {
  return academyCourses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = academyCourses.find((c) => c.slug === slug);
  if (!course) return {};
  return {
    title: `${course.title} — Academy`,
    description: course.description,
    alternates: { canonical: `/academy/${course.slug}` },
  };
}

export default async function AcademyCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = academyCourses.find((c) => c.slug === slug);
  if (!course) notFound();

  return (
    <main className="flex flex-col">
      <PageHero
        eyebrow={course.difficulty}
        title={
          <>
            {course.title}
            <br />
            <em className="text-sand-gradient">{course.subtitle}</em>
          </>
        }
        description={course.description}
        image="/images/site/live-portrait.webp"
        imageAlt={course.title}
        focus="center 30%"
        meta={[
          { label: "Lessons", value: String(course.lessons) },
          { label: "Instructor", value: course.instructor },
          { label: "Level", value: course.level },
          { label: "Format", value: "Video · Tabs · Sheet" },
        ]}
        sideLabel={`Academy · ${course.category}`}
      />
      <AcademyCourseClient course={course} />
    </main>
  );
}
