import type { Metadata } from "next";
import Link from "next/link";
import DocumentHeader from "@/components/luxury/DocumentHeader";

export const metadata: Metadata = {
  title: "Installation & Setup Guides",
  description:
    "Everything you need to load your Medfender tones into your DSP ecosystem.",
  alternates: { canonical: "/support/setup-guide" },
};

interface Guide {
  index: string;
  platform: string;
  title: string;
  intro: string;
  steps: { title: string; body: string }[];
}

const guides: Guide[] = [
  {
    index: "01",
    platform: "ToneX",
    title: "Load presets into ToneX",
    intro:
      "These captures are fully compatible with the IK Multimedia ToneX ecosystem. Follow the steps below to import your new boutique tones.",
    steps: [
      {
        title: "Extract the downloaded ZIP file",
        body: "Locate the .zip archive included with your purchase email. Extract it to a folder on your desktop so the .tonex preset files are visible.",
      },
      {
        title: "Open ToneX Librarian",
        body: "Launch the ToneX Librarian application on your computer. Ensure your hardware pedal is connected via USB for a direct sync path.",
      },
      {
        title: "Drag and drop into your library",
        body: "Select all .tonex files from the extracted folder and drag them directly into the ToneX Librarian library window. Confirm the import completes successfully.",
      },
      {
        title: "Sync to your hardware pedal",
        body: "Press the sync button inside ToneX Librarian to transfer the new presets to your physical ToneX pedal. Power-cycle the pedal after sync completes.",
      },
    ],
  },
  {
    index: "02",
    platform: "HX Stomp / Helix",
    title: "Load presets on Line 6 hardware",
    intro:
      "These .hlx files are designed for the full Line 6 DSP architecture. Follow the steps below to load them safely into an empty user preset slot.",
    steps: [
      {
        title: "Extract the downloaded ZIP file",
        body: "Unzip the archive to reveal the .hlx preset files and any included custom Impulse Response (.ir) assets.",
      },
      {
        title: "Open HX Edit and select an empty user preset slot",
        body: "Launch HX Edit, navigate to an empty user preset, and click to select it. Save your existing preset if needed before importing.",
      },
      {
        title: "Import the .hlx preset",
        body: "Click the Import button in HX Edit and navigate to the extracted .hlx file. Confirm the import and verify the preset loads without errors.",
      },
      {
        title: "Load included custom Medfender IRs if required",
        body: "If the preset uses a custom Impulse Response block, load the included .ir files into the same slot number referenced in the preset documentation.",
      },
    ],
  },
];

export default function SetupGuidePage() {
  return (
    <main className="flex flex-col">
      <DocumentHeader
        index="12"
        eyebrow="Support · Installation"
        title={
          <>
            Tone in,
            <br />
            <em className="text-sand-gradient">step by step.</em>
          </>
        }
        intro="Everything you need to load your Medfender tones into your DSP ecosystem — ToneX captures and Line 6 presets, both from a clean download."
        note="Two ecosystems · Windows & macOS"
      />

      <section className="surface-paper w-full">
        <div className="mx-auto w-full max-w-[1560px] px-5 py-16 md:px-8 md:py-24">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-16">
            {/* Contents rail */}
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-28">
                <p className="eyebrow border-b border-[var(--rule)] pb-3">
                  Platforms
                </p>
                <ol className="mt-4">
                  {guides.map((guide) => (
                    <li key={guide.platform}>
                      <a
                        href={`#g-${guide.index}`}
                        className="group flex items-baseline gap-3 border-b border-[var(--rule-soft)] py-3"
                      >
                        <span className="font-mono text-[9px] tracking-[0.18em] text-rust">
                          {guide.index}
                        </span>
                        <span className="text-xs leading-snug text-ink/60 transition-colors group-hover:text-ink">
                          {guide.platform}
                        </span>
                      </a>
                    </li>
                  ))}
                </ol>
                <p className="mt-8 max-w-[16rem] font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.26em] text-sand-deep">
                  Firmware updates can move menus. If a screen in the guide no
                  longer matches, write to us.
                </p>
              </div>
            </aside>

            {/* Guides */}
            <div className="lg:col-span-8 lg:col-start-5">
              {guides.map((guide) => (
                <article
                  key={guide.platform}
                  id={`g-${guide.index}`}
                  className="scroll-mt-28 border-t border-[var(--rule)] pt-8 [&:not(:first-child)]:mt-20"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="folio shrink-0">{guide.index}</span>
                    <span className="eyebrow">{guide.platform}</span>
                    <span aria-hidden className="h-px flex-1 bg-[var(--rule)]" />
                  </div>

                  <h2 className="display-md mt-5 text-ink">{guide.title}</h2>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/65 md:text-base">
                    {guide.intro}
                  </p>

                  <figure className="plate grade-print mt-9 aspect-[16/9]">
                    <img
                      src="/images/site/full/Me-Guitar-3.webp"
                      alt="Medfender at the amp, guitar in hand"
                      loading="lazy"
                    />
                    <figcaption className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between gap-4 bg-gradient-to-t from-ink-deep/90 to-transparent px-5 pb-4 pt-12 font-mono text-[8.5px] uppercase tracking-[0.26em] text-cream/70">
                      <span>Plate {guide.index}</span>
                      <span>{guide.platform} · signal check</span>
                    </figcaption>
                  </figure>

                  <ol className="mt-10">
                    {guide.steps.map((step, i) => (
                      <li
                        key={step.title}
                        className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-[var(--rule-soft)] py-6 sm:grid-cols-[3.5rem_1fr] sm:gap-6"
                      >
                        <span className="font-display text-2xl leading-none text-rust">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h3 className="font-display text-xl leading-tight text-ink">
                            {step.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-ink/60">
                            {step.body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <p className="mt-6 border-t border-[var(--rule)] pt-4 font-mono text-[8.5px] uppercase tracking-[0.26em] text-sand-deep">
                    Download → extract → import → verify
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Support band */}
      <section className="surface-ink w-full border-t border-[var(--rule-ink)]">
        <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-8 px-5 py-14 md:flex-row md:items-end md:justify-between md:px-8 md:py-20">
          <div className="max-w-xl">
            <p className="eyebrow-on-ink">Still stuck</p>
            <h2 className="display-md mt-4 text-cream">
              A human answers,
              <br />
              usually within a day.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-cream/60">
              Send the pack name, your device, and a screenshot of the screen
              you are on. We will walk the install with you.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/contact" className="btn btn-brass">
              Contact support
              <span aria-hidden>→</span>
            </Link>
            <Link href="/store" className="btn btn-ghost">
              Browse packs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
