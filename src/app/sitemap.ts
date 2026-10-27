import type { MetadataRoute } from "next";
import { packs } from "@/data/storeData";
import { academyCourses } from "@/data/academyData";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://medfender.com";
  const staticRoutes = [
    "/",
    "/live",
    "/audio",
    "/store",
    "/academy",
    "/media",
    "/fretboard",
    "/contact",
    "/support/setup-guide",
    "/privacy",
    "/terms",
  ];

  const packRoutes = packs.map((pack) => `/store/${pack.slug}`);
  const academyRoutes = academyCourses.map((course) => `/academy/${course.slug}`);

  const all = [...staticRoutes, ...packRoutes, ...academyRoutes];

  return all.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/live" ? 0.9 : 0.7,
  }));
}