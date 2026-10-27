"use client";

import React, { useState } from "react";
import { site } from "@/lib/site";

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", inquiryType: "General", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ ok: true, msg: "Message sent. We'll be in touch within 48 hours." });
        setForm({ name: "", email: "", inquiryType: "General", subject: "", message: "" });
      } else {
        setStatus({ ok: false, msg: data.error || "Something went wrong. Please try again." });
      }
    } catch {
      setStatus({ ok: false, msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = "field";
  const labelClass =
    "mb-2 block font-mono text-[8.5px] uppercase tracking-[0.28em] text-ink/60";

  return (
    <section
      id="booking"
      className="surface-paper bg-paper py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-[1560px] px-5 md:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ── The form, set as a letter ───────────────────────────── */}
          <div className="lg:col-span-7">
            <div className="mb-8 flex items-center gap-4">
              <span className="font-mono text-[10px] tracking-[0.18em] text-rust">
                01
              </span>
              <span className="eyebrow">Enquiries</span>
              <span aria-hidden className="h-px flex-1 bg-[var(--rule)]" />
            </div>

            <h2 className="display-lg text-ink text-balance">
              Tell us
              <br />
              <em className="italic text-rust">the room.</em>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink/65 md:text-base">
              From an intimate trio to a full stage of fifteen — send the venue,
              the date and the kind of night. We reply within 48 hours with
              availability and a full technical rider.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Name</span>
                  <input
                    required
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className={labelClass}>Email</span>
                  <input
                    required
                    type="email"
                    placeholder="you@studio.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={fieldClass}
                  />
                </label>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Inquiry type</span>
                  <select
                    value={form.inquiryType}
                    onChange={(e) => setForm({ ...form, inquiryType: e.target.value })}
                    className={fieldClass}
                  >
                    <option>General</option>
                    <option>Booking</option>
                    <option>Presets</option>
                    <option>Tone Matching</option>
                    <option>Custom Capture</option>
                  </select>
                </label>

                <label className="block">
                  <span className={labelClass}>Subject</span>
                  <input
                    type="text"
                    placeholder="Wedding · June 14"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className={fieldClass}
                  />
                </label>
              </div>

              <label className="block">
                <span className={labelClass}>Message</span>
                <textarea
                  required
                  rows={6}
                  placeholder="Venue, date, format, audience, technical constraints…"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={`${fieldClass} min-h-[150px] resize-y`}
                />
              </label>

              {status && (
                <div
                  className={`border px-4 py-3 text-sm ${
                    status.ok
                      ? "border-[#4a5c48]/40 bg-[#e7ead9] text-[#3b4a37]"
                      : "border-rust/35 bg-rust/[0.08] text-rust-deep"
                  }`}
                  role="status"
                >
                  {status.msg}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-6 border-t border-[var(--rule)] pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-ink w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {loading ? "Sending…" : "Send inquiry"}
                  <span aria-hidden>→</span>
                </button>
                <p className="font-mono text-[8.5px] uppercase tracking-[0.24em] text-ink/60">
                  Reply within 48 hours
                </p>
              </div>
            </form>
          </div>

          {/* ── The colophon ────────────────────────────────────────── */}
          <aside className="lg:col-span-5 lg:pl-10">
            <div className="lg:sticky lg:top-28">
              <div className="flex items-center gap-4 border-t border-[var(--rule)] pt-5">
                <span className="font-mono text-[8.5px] uppercase tracking-[0.26em] text-ink/60">
                  Direct
                </span>
              </div>

              <a
                href={`mailto:${site.email}`}
                className="mt-5 block font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-tight text-ink transition-colors hover:text-rust"
              >
                {site.email}
              </a>

              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/60">
                For urgent bookings, custom tone captures or press enquiries,
                write directly. Replies within 48 hours, Marrakech time.
              </p>

              <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-[var(--rule)] pt-6">
                {[
                  { k: "Based", v: "Marrakech, Morocco" },
                  { k: "Territory", v: "Morocco & abroad" },
                  { k: "Roster", v: "Trio → 15 players" },
                  { k: "Sets", v: "DJ available on request" },
                ].map((item) => (
                  <div key={item.k}>
                    <dt className="font-mono text-[8px] uppercase tracking-[0.26em] text-ink/60">
                      {item.k}
                    </dt>
                    <dd className="mt-1.5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-ink/75">
                      {item.v}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-10 border-t border-[var(--rule)] pt-6">
                <p className="font-mono text-[8.5px] uppercase tracking-[0.28em] text-ink/60">
                  Follow
                </p>
                <div className="mt-4 flex flex-col">
                  {site.socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between border-b border-[var(--rule-soft)] py-3 text-sm text-ink/70 transition-colors hover:text-rust"
                    >
                      <span>{social.label}</span>
                      <span
                        aria-hidden
                        className="text-ink/30 transition-all group-hover:translate-x-0.5 group-hover:text-rust"
                      >
                        ↗
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              <p className="mt-8 font-mono text-[8px] uppercase leading-relaxed tracking-[0.24em] text-ink/70">
                Occasions — private dinners · hotel residencies · weddings ·
                brand evenings · festivals
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
