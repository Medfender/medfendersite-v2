"use client";

import React, { useState } from "react";

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
        setStatus({ ok: true, msg: "Message sent! We'll be in touch soon." });
        setForm({ name: "", email: "", inquiryType: "General", subject: "", message: "" });
      } else {
        setStatus({ ok: false, msg: data.error || "Something went wrong." });
      }
    } catch {
      setStatus({ ok: false, msg: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="w-full max-w-6xl mx-auto px-6 py-24">
      <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Form */}
        <div className="lg:col-span-3 bg-neutral-900/50 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-md">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">Contact & Booking</h2>
          <p className="text-neutral-400 mb-8">Send a request for bookings, tone matching, or preset inquiries.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid md:grid-cols-2 gap-5">
              <input
                required
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-neutral-950/60 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400/40 transition placeholder:text-neutral-500"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-neutral-950/60 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400/40 transition placeholder:text-neutral-500"
              />
            </div>

            <select
              value={form.inquiryType}
              onChange={(e) => setForm({ ...form, inquiryType: e.target.value })}
              className="w-full bg-neutral-950/60 border border-white/10 text-neutral-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400/40 transition cursor-pointer"
            >
              <option>General</option>
              <option>Booking</option>
              <option>Presets</option>
              <option>Tone Matching</option>
            </select>

            <input
              type="text"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full bg-neutral-950/60 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400/40 transition placeholder:text-neutral-500"
            />

            <textarea
              required
              rows={5}
              placeholder="Message..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-neutral-950/60 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-400/40 transition placeholder:text-neutral-500 resize-none"
            />

            {status && (
              <div
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                  status.ok ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/20" : "bg-rose-950/60 text-rose-300 border border-rose-500/20"
                }`}
              >
                {status.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-600 text-black font-extrabold px-6 py-3 shadow-[0_0_20px_rgba(0,216,246,0.35)] hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-neutral-950/40 border border-white/10 rounded-3xl p-8 shadow-lg backdrop-blur-md">
            <h3 className="text-xl font-extrabold text-white mb-4">Marrakech Bookings</h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-3">
              Available for solo, duo, and full trio performances at luxury venues across Marrakech and beyond.
            </p>
            <ul className="text-neutral-300 text-sm space-y-1 list-disc list-inside">
              <li>Solo acoustic sets</li>
              <li>Duo with percussion</li>
              <li>Full trio — electric + rhythm section</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-950/20 border border-cyan-500/20 rounded-3xl p-8 shadow-lg backdrop-blur-md">
            <h3 className="text-xl font-extrabold text-cyan-300 mb-3">Direct Inquiry</h3>
            <p className="text-neutral-300 text-sm mb-4">For urgent bookings or custom tone requests, reach directly via email or social links.</p>
            <a href="mailto:contact@medfender.site" className="inline-block text-cyan-300 font-bold hover:underline">contact@medfender.site</a>
          </div>
        </aside>
      </div>
    </section>
  );
}
