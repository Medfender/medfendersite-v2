import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Medfender",
  description: "Terms and conditions governing the use of Medfender's digital products and services.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Top gradient */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00d8f6]/30 to-transparent" />

      <div className="max-w-3xl mx-auto px-6 py-24 space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <p className="text-[0.6rem] font-black uppercase tracking-[0.35em] text-[#E5A93C]">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">
            Terms of Service
          </h1>
          <p className="text-sm text-zinc-500">Last updated: September 2026</p>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-zinc-900" />

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-zinc-400">
          <section className="space-y-3">
            <h2 className="text-base font-black uppercase tracking-widest text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, or purchasing from Medfender, you agree to be bound by these Terms of Service. If you do not agree, you must not use this site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black uppercase tracking-widest text-white">2. Digital Products & Licensing</h2>
            <p>
              All Medfender products — including TONEX captures, HX Stomp presets, impulse responses, and session stems — are licensed to you for personal and commercial use on equipment you own or operate.
            </p>
            <p>
              You may not redistribute, resell, sublicense, or repackage the original files in any form, whether modified or unmodified. Sharing purchased content publicly (forums, torrent sites, cloud drives) constitutes copyright infringement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black uppercase tracking-widest text-white">3. Refund Policy</h2>
            <p>
              Due to the digital nature of our products, all sales are final once a download has begun. If a file is corrupt or defective, contact us within 14 days of purchase for a replacement or full refund. Disputes filed directly with your payment provider before contacting us may delay resolution.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black uppercase tracking-widest text-white">4. Equipment & Compatibility</h2>
            <p>
              Presets are built for the devices advertised on each product page (e.g. Line 6 HX Stomp, IK Multimedia TONEX). Medfender is not responsible for issues arising from using presets on unsupported hardware or outdated firmware.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black uppercase tracking-widest text-white">5. Account Responsibility</h2>
            <p>
              You are responsible for keeping your account credentials secure. Medfender is not liable for unauthorized access resulting from compromised passwords. Notify us immediately at{" "}
              <a href="mailto:contact@medfender.com" className="text-[#00d8f6] hover:underline">
                contact@medfender.com
              </a>{" "}
              if you suspect unauthorized activity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black uppercase tracking-widest text-white">6. Intellectual Property</h2>
            <p>
              All content on this site — including the Medfender name, logo, audio recordings, preset designs, written copy, and graphics — is the property of Medfender and protected by international copyright law. No reproduction is permitted without explicit written permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black uppercase tracking-widest text-white">7. Limitation of Liability</h2>
            <p>
              Medfender products are provided "as is" without warranty of any kind. Medfender is not liable for any direct, indirect, or consequential damages arising from the use or inability to use the products.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black uppercase tracking-widest text-white">8. Changes to Terms</h2>
            <p>
              We reserve the right to update these terms at any time. Material changes will be communicated via email to active subscribers. Continued use of the site after changes constitutes acceptance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black uppercase tracking-widest text-white">9. Governing Law</h2>
            <p>
              These terms are governed by the laws of the jurisdiction in which Medfender operates. Any disputes will be resolved in that jurisdiction's courts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black uppercase tracking-widest text-white">10. Contact</h2>
            <p>
              For any questions about these terms, reach us at{" "}
              <a href="mailto:contact@medfender.com" className="text-[#00d8f6] hover:underline">
                contact@medfender.com
              </a>
              .
            </p>
          </section>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-wrap items-center gap-6 text-[0.6rem] font-bold tracking-widest text-zinc-600 uppercase">
          <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy</Link>
          <Link href="/support/setup-guide" className="hover:text-zinc-400 transition-colors">Setup Guide</Link>
          <Link href="/" className="hover:text-zinc-400 transition-colors">Home</Link>
        </div>
      </div>
    </main>
  );
}
