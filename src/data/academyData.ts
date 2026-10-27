export type AcademyDifficulty = "Basic" | "Intermediate" | "Advanced" | "Extras" | "All";

export type AcademyLevel = "Beginner" | "Intermediate" | "Advanced" | "Masterclass";

export interface AcademyLesson {
  id: string;
  title: string;
  duration: string;
  freePreview: boolean;
  src: string;
}

export interface AcademyCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  instructor: string;
  difficulty: Exclude<AcademyDifficulty, "All">;
  level: AcademyLevel;
  category: string;
  lessons: number;
  videoSrc: string;
  thumbnail: string;
  tags: string[];
  badge?: "NEW" | "UPDATE";
  hasTabs: boolean;
  hasBackingTracks: boolean;
  hasSheetMusic: boolean;
}

export const ACADEMY_INSTRUCTOR = "Medfender";

export const ACADEMY_VIDEO_SRC =
  "/Videos/Background%20videos/studio-seamless-loop.mp4";

export const academyCourses: AcademyCourse[] = [
  {
    id: "gypsy-basics",
    slug: "gypsy-basics",
    title: "Gypsy Guitar Basics",
    subtitle: "Your first steps into gypsy jazz",
    description:
      "Foundations of the gypsy-jazz vocabulary: picking, rest strokes, basic arpeggios and the essential chord shapes. Short, focused lessons you can repeat at your own pace.",
    instructor: ACADEMY_INSTRUCTOR,
    difficulty: "Basic",
    level: "Beginner",
    category: "Technique",
    lessons: 7,
    videoSrc: ACADEMY_VIDEO_SRC,
    thumbnail: "/images/site/thumb/Me-Guitar-3.webp",
    tags: ["picking", "arpeggios", "chords"],
    badge: "NEW",
    hasTabs: true,
    hasBackingTracks: true,
    hasSheetMusic: true,
  },
  {
    id: "douce-ambiance",
    slug: "douce-ambiance",
    title: "Douce Ambiance",
    subtitle: "A Django classic, step by step",
    description:
      "Learn one of the most loved standards note by note. Each phrase is broken down slowly before the full-speed play-through.",
    instructor: ACADEMY_INSTRUCTOR,
    difficulty: "Basic",
    level: "Beginner",
    category: "Django Tributes",
    lessons: 11,
    videoSrc: ACADEMY_VIDEO_SRC,
    thumbnail: "/images/site/thumb/IMG_7741.webp",
    tags: ["standard", "rhythm", "lead"],
    hasTabs: true,
    hasBackingTracks: true,
    hasSheetMusic: true,
  },
  {
    id: "sweet-chorus",
    slug: "sweet-chorus",
    title: "Sweet Chorus",
    subtitle: "Intermediate vocabulary & phrasing",
    description:
      "Deepen your vocabulary with chord substitutions, passing diminished lines and melodic phrasing over a swing progression.",
    instructor: ACADEMY_INSTRUCTOR,
    difficulty: "Intermediate",
    level: "Intermediate",
    category: "Joscho Originals",
    lessons: 13,
    videoSrc: ACADEMY_VIDEO_SRC,
    thumbnail: "/images/site/thumb/IMG_7742.webp",
    tags: ["substitutions", "phrasing", "swing"],
    badge: "UPDATE",
    hasTabs: true,
    hasBackingTracks: true,
    hasSheetMusic: true,
  },
  {
    id: "tears",
    slug: "tears",
    title: "Tears",
    subtitle: "Emotional lead playing",
    description:
      "A lyrical approach to gypsy-jazz lead work: vibrato, dynamics and melodic contour over a slow ballad.",
    instructor: ACADEMY_INSTRUCTOR,
    difficulty: "Intermediate",
    level: "Intermediate",
    category: "Django Tributes",
    lessons: 11,
    videoSrc: ACADEMY_VIDEO_SRC,
    thumbnail: "/images/site/thumb/IMG_7746.webp",
    tags: ["lead", "ballad", "vibrato"],
    hasTabs: true,
    hasBackingTracks: true,
    hasSheetMusic: true,
  },
  {
    id: "song-for-ramona",
    slug: "song-for-ramona",
    title: "Song For Ramona",
    subtitle: "Advanced single-note lines",
    description:
      "Advanced single-note vocabulary: long flowing lines, chromatic approach notes and rhythmic displacement.",
    instructor: ACADEMY_INSTRUCTOR,
    difficulty: "Advanced",
    level: "Advanced",
    category: "Joscho Originals",
    lessons: 11,
    videoSrc: ACADEMY_VIDEO_SRC,
    thumbnail: "/images/site/thumb/IMG_7747.webp",
    tags: ["advanced", "chromatic", "rhythm"],
    hasTabs: true,
    hasBackingTracks: true,
    hasSheetMusic: true,
  },
  {
    id: "belleville",
    slug: "belleville",
    title: "Belleville",
    subtitle: "High-speed gypsy jazz",
    description:
      "Tackle one of the fastest standards in the repertoire. Technique, economy of motion and controlled tension at tempo.",
    instructor: ACADEMY_INSTRUCTOR,
    difficulty: "Advanced",
    level: "Advanced",
    category: "Django Tributes",
    lessons: 11,
    videoSrc: ACADEMY_VIDEO_SRC,
    thumbnail: "/images/site/thumb/IMG_7748.webp",
    tags: ["speed", "technique", "standard"],
    hasTabs: true,
    hasBackingTracks: true,
    hasSheetMusic: true,
  },
  {
    id: "arpeggio-improvisation",
    slug: "arpeggio-improvisation",
    title: "Arpeggio-Based Improvisation",
    subtitle: "15-step masterclass",
    description:
      "A structured 15-step method for building improvisations entirely from arpeggios. Melodic, harmonic and rhythmic layers.",
    instructor: ACADEMY_INSTRUCTOR,
    difficulty: "Extras",
    level: "Masterclass",
    category: "Theory",
    lessons: 17,
    videoSrc: ACADEMY_VIDEO_SRC,
    thumbnail: "/images/site/thumb/IMG_7780.webp",
    tags: ["improvisation", "arpeggios", "method"],
    hasTabs: true,
    hasBackingTracks: true,
    hasSheetMusic: true,
  },
  {
    id: "matteo-mancuso",
    slug: "matteo-mancuso",
    title: "Matteo Mancuso — Guest Masterclass",
    subtitle: "Modern fusion vocabulary",
    description:
      "Guest-artist style masterclass exploring modern fusion phrasing, hybrid picking and advanced timing.",
    instructor: ACADEMY_INSTRUCTOR,
    difficulty: "Extras",
    level: "Masterclass",
    category: "Guest Artists",
    lessons: 10,
    videoSrc: ACADEMY_VIDEO_SRC,
    thumbnail: "/images/site/thumb/So-Lounge.webp",
    tags: ["fusion", "hybrid picking", "guest"],
    hasTabs: true,
    hasBackingTracks: true,
    hasSheetMusic: true,
  },
  {
    id: "rhythm-guitar",
    slug: "rhythm-guitar",
    title: "Theory Class — Rhythm Guitar",
    subtitle: "Comp like a pro",
    description:
      "The art of gypsy-jazz rhythm guitar: la pompe, voicings, voice-leading and dynamics in a comping role.",
    instructor: ACADEMY_INSTRUCTOR,
    difficulty: "Extras",
    level: "Masterclass",
    category: "Theory",
    lessons: 6,
    videoSrc: ACADEMY_VIDEO_SRC,
    thumbnail: "/images/site/thumb/Me-Guitar-3.webp",
    tags: ["rhythm", "comping", "voicings"],
    hasTabs: true,
    hasBackingTracks: true,
    hasSheetMusic: true,
  },
];

export const academyDifficulties: Exclude<AcademyDifficulty, "All">[] = [
  "Basic",
  "Intermediate",
  "Advanced",
  "Extras",
];

export const academyCategories = [
  "All",
  "Technique",
  "Django Tributes",
  "Joscho Originals",
  "Theory",
  "Guest Artists",
] as const;

export function buildLessons(course: AcademyCourse): AcademyLesson[] {
  const out: AcademyLesson[] = [];
  for (let i = 1; i <= course.lessons; i++) {
    out.push({
      id: `${course.id}-lesson-${i}`,
      title: `Lesson ${i}${i === 1 ? " — Preview" : ""}`,
      duration: `${3 + (i % 7)}:${String((i * 13) % 60).padStart(2, "0")}`,
      freePreview: i === 1,
      src: course.videoSrc,
    });
  }
  return out;
}

export const academyPlans = [
  {
    id: "monthly",
    name: "Monthly",
    price: 29,
    period: "month",
    billing: "Billed every month",
    savings: "",
    checkoutUrl:
      "https://medfender.lemonsqueezy.com/checkout/buy/academy-monthly?embed=1",
    recommended: false,
  },
  {
    id: "quarterly",
    name: "Quarterly",
    price: 79,
    period: "3 months",
    billing: "Billed every 3 months",
    savings: "Save 9%",
    checkoutUrl:
      "https://medfender.lemonsqueezy.com/checkout/buy/academy-quarterly?embed=1",
    recommended: true,
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 249,
    period: "year",
    billing: "Billed once a year",
    savings: "Save 28%",
    checkoutUrl:
      "https://medfender.lemonsqueezy.com/checkout/buy/academy-yearly?embed=1",
    recommended: false,
  },
] as const;
