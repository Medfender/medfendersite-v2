"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import Reveal from "@/components/luxury/Reveal";
import { academyPlans } from "@/data/academyData";
import { isCheckoutLive } from "@/lib/checkout";
import { useAcademyAccess } from "@/context/AcademyAccessContext";

export default function AcademyMembership() {
  const { subscribed, activate, deactivate } = useAcademyAccess();

  return (
    <section
      id="membership"
      className="surface-ink relative overflow-hidden border-y border-cream/12 bg-ink-deep py-20 md:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 80% 0%, rgba(223,161,74,0.14) 0%, transparent 62%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1560px] px-5 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-6 flex items-center gap-4">
              <span className="font-mono text-[10px] tracking-[0.18em] text-brass">
                03
              </span>
              <span className="eyebrow-on-ink">Membership</span>
              <span aria-hidden className="h-px w-20 bg-cream/20" />
            </div>
            <h2 className="display-lg text-cream text-balance">
              One library.
              <br />
              <em className="italic text-brass">Three billing periods.</em>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-cream/60">
            Same content across all plans — every course, every video, every tab,
            backing track and play-along. Cancel anytime.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {academyPlans.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.08}>
              <article
                className={[
                  "relative flex h-full flex-col gap-7 border p-7 transition-colors",
                  plan.recommended
                    ? "border-brass bg-brass/[0.07]"
                    : "border-cream/15 bg-cream/[0.02] hover:border-cream/30",
                ].join(" ")}
              >
                {plan.recommended ? (
                  <span className="absolute -top-3 left-7 bg-brass px-3 py-1 font-mono text-[8px] uppercase tracking-[0.28em] text-ink">
                    Recommended
                  </span>
                ) : null}

                <div>
                  <p className="font-mono text-[8.5px] uppercase tracking-[0.28em] text-cream/55">
                    {plan.name}
                  </p>
                  <p className="mt-3 font-display text-6xl leading-none text-cream">
                    €{plan.price}
                  </p>
                  <p className="mt-3 font-mono text-[8.5px] uppercase tracking-[0.24em] text-cream/65">
                    {plan.billing}
                  </p>
                  {plan.savings ? (
                    <p className="mt-2 font-mono text-[8.5px] uppercase tracking-[0.24em] text-brass">
                      {plan.savings}
                    </p>
                  ) : null}
                </div>

                <ul className="flex flex-col gap-3 border-t border-cream/12 pt-6 text-sm text-cream/65">
                  {[
                    "All courses & masterclasses",
                    "HD streaming, no downloads",
                    "Tabs, sheet music & backing tracks",
                    "New releases included",
                    "Cancel anytime",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {isCheckoutLive(plan.checkoutUrl) ? (
                  <a
                    href={plan.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`lemonsqueezy-button mt-auto inline-flex w-full items-center justify-center gap-2 px-5 py-3.5 font-mono text-[9px] uppercase tracking-[0.26em] transition-colors ${
                      plan.recommended
                        ? "btn-brass"
                        : "border border-cream/25 text-cream hover:border-brass hover:text-brass"
                    }`}
                  >
                    Become a member
                    <span aria-hidden>→</span>
                  </a>
                ) : (
                  <div className="mt-auto">
                    <Link
                      href="/contact#booking"
                      className={`inline-flex w-full items-center justify-center gap-2 px-5 py-3.5 font-mono text-[9px] uppercase tracking-[0.26em] transition-colors ${
                        plan.recommended
                          ? "btn-brass"
                          : "border border-cream/25 text-cream hover:border-brass hover:text-brass"
                      }`}
                    >
                      Join by message
                      <span aria-hidden>→</span>
                    </Link>
                    <p className="mt-2.5 font-mono text-[8px] uppercase leading-relaxed tracking-[0.2em] text-cream/60">
                      Card checkout is being activated.
                    </p>
                  </div>
                )}
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-5 border-t border-cream/12 pt-6 md:flex-row md:items-center">
          <p className="font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.24em] text-cream/55">
            Already a member?{" "}
            <span className="text-cream/70">
              {subscribed ? "Your membership is active." : "Activate your access."}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {!subscribed ? (
              <button
                type="button"
                onClick={activate}
                className="border border-cream/20 px-4 py-2.5 font-mono text-[8.5px] uppercase tracking-[0.24em] text-cream transition-colors hover:border-brass hover:text-brass"
              >
                I already have a membership
              </button>
            ) : (
              <button
                type="button"
                onClick={deactivate}
                className="border border-cream/20 px-4 py-2.5 font-mono text-[8.5px] uppercase tracking-[0.24em] text-cream/60 transition-colors hover:border-brass/50"
              >
                Sign out (demo)
              </button>
            )}
            <Link
              href="/contact"
              className="border border-cream/20 px-4 py-2.5 font-mono text-[8.5px] uppercase tracking-[0.24em] text-cream/60 transition-colors hover:border-brass/50 hover:text-cream"
            >
              Questions? Contact
            </Link>
          </div>
        </div>

        <p className="mt-6 max-w-xl text-[11px] leading-relaxed text-cream/60">
          Videos stream only inside your browser session. Downloading, saving
          and screen-capture of academy content is restricted for all members.
        </p>
      </div>
    </section>
  );
}
