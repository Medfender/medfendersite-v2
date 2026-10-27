import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/luxury/Reveal";
import SectionHeading from "@/components/luxury/SectionHeading";

interface Service {
  number: string;
  title: string;
  body: string;
  images: { src: string; alt: string; width: number; height: number }[];
  slug: string;
}

const services: Service[] = [
  {
    number: "01",
    title: "Private dinners",
    body: "Low light, long courses, a violin that stays out of the conversation until it doesn't.",
    slug: "private-dinners",
    images: [
      { src: "/images/site/services/private-dinners/01-violinist-intimate.jpg", alt: "Violinist performing in intimate candlelit dining room", width: 3000, height: 2000 },
      { src: "/images/site/services/private-dinners/02-violinist-shadow-dim.jpg", alt: "Violinist silhouette in dim atmospheric dining space", width: 3000, height: 2000 },
      { src: "/images/site/services/private-dinners/03-candlelit-dining.jpg", alt: "Elegant candlelit private dinner setting", width: 3000, height: 2000 },
    ],
  },
  {
    number: "02",
    title: "Hotel residencies",
    body: "A weekly room, a rotating repertoire, a sound that becomes part of the property.",
    slug: "hotel-residencies",
    images: [
      { src: "/images/site/services/hotel-residencies/01-grand-pianist-lounge.jpg", alt: "Grand pianist in elegant hotel lounge", width: 3000, height: 2000 },
      { src: "/images/site/services/hotel-residencies/02-cellist-elegant-setting.jpg", alt: "Cellist performing in warm elegant hotel setting", width: 3000, height: 2000 },
      { src: "/images/site/services/hotel-residencies/03-stylish-lounge-jazz.jpg", alt: "Stylish hotel lounge with jazz atmosphere", width: 3000, height: 2000 },
    ],
  },
  {
    number: "03",
    title: "Weddings",
    body: "Ceremony, cocktails and first dance — arranged around the couple, not a playlist.",
    slug: "weddings",
    images: [
      { src: "/images/site/services/weddings/01-wedding-harpist.jpg", alt: "Concert harpist at romantic wedding ceremony", width: 3000, height: 2000 },
      { src: "/images/site/services/weddings/02-bride-listening-song.jpg", alt: "Bride listening to live strings during ceremony", width: 3000, height: 2000 },
      { src: "/images/site/services/weddings/03-bride-emotion-ceremony.jpg", alt: "Bride emotional during wedding ceremony with live strings", width: 3000, height: 2000 },
    ],
  },
  {
    number: "04",
    title: "Brand & corporate",
    body: "Launch nights and seated dinners with a live score instead of a speaker.",
    slug: "corporate",
    images: [
      { src: "/images/site/services/corporate/01-string-quartet-gala.jpg", alt: "String quartet performing at corporate gala", width: 3000, height: 2000 },
      { src: "/images/site/services/corporate/02-chamber-orchestra-stage.jpg", alt: "Chamber orchestra on stage at launch event", width: 3000, height: 2000 },
      { src: "/images/site/services/corporate/03-cellists-dark-stage.jpg", alt: "Cellists in dramatic stage lighting at gala", width: 3000, height: 2000 },
    ],
  },
  {
    number: "05",
    title: "Festivals & clubs",
    body: "Full stage volume, Gnaoua and brass, and a set built to close the night rather than fill it.",
    slug: "festivals",
    images: [
      { src: "/images/site/services/festivals/01-brass-section-horns.jpg", alt: "Brass section with horns and trumpets at festival", width: 3000, height: 2000 },
      { src: "/images/site/services/festivals/02-trumpet-soloist-stage.jpg", alt: "Trumpet soloist center stage at festival", width: 3000, height: 2000 },
      { src: "/images/site/services/festivals/03-festival-crowd-stage.jpg", alt: "Festival crowd and full stage band", width: 3000, height: 2000 },
    ],
  },
];

const BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q==";

const spans = [
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-4",
];

const aspects = [
  "aspect-[16/10]",
  "aspect-[16/10] lg:aspect-[4/5]",
  "aspect-[4/3]",
  "aspect-[4/3]",
  "aspect-[4/3]",
];

export default function ServicesShowcase() {
  return (
    <section
      id="occasions"
      className="surface-paper relative overflow-hidden border-y border-[var(--rule)] bg-paper-deep/70 py-20 md:py-28"
    >
      <div className="mx-auto w-full max-w-[1560px] px-5 md:px-8">
        <SectionHeading
          index="9"
          inlay
          eyebrow="Occasions"
          title={
            <>
              Nights that ask
              <br />
              for <em className="italic text-rust">a musician.</em>
            </>
          }
          intro="An international roster of musicians — violinists, pianists, harpists, cellists, brass and percussion — curated for private dinners, hotel residencies, weddings, corporate launches and festivals worldwide."
          action={
            <Link href="/live" className="link-rule">
              All occasions
              <span aria-hidden>→</span>
            </Link>
          }
        />

        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-12">
          {services.map((service, i) => (
            <Reveal
              key={service.slug}
              delay={(i % 3) * 0.06}
              className={`md:col-span-1 ${spans[i]}`}
            >
              <Link href={`/live#${service.slug}`} className="group block">
                <div className={`plate ${aspects[i]} w-full`}>
                  <Image
                    src={service.images[0].src}
                    alt={service.images[0].alt}
                    width={service.images[0].width}
                    height={service.images[0].height}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent opacity-70"
                  />
                  <span className="absolute left-4 top-4 font-mono text-[9px] uppercase tracking-[0.26em] text-cream/85">
                    {service.number} / 05
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-[var(--rule)] pt-3">
                  <h3 className="display-sm text-ink transition-colors duration-300 group-hover:text-rust">
                    {service.title}
                  </h3>
                  <span
                    aria-hidden
                    className="font-mono text-[10px] text-ink/60 transition-all duration-300 group-hover:translate-x-1 group-hover:text-rust"
                  >
                    ↗
                  </span>
                </div>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/60">
                  {service.body}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
