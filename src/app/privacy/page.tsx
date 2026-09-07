import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Medfender",
  description: "How Medfender collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-500">Last updated: September 2026</p>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-zinc-900" />

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-zinc-400">
          <section className="space-y-3">
            <h2 className="text-base font-black uppercase tracking-widest text-white">Information We Collect</h2>
            <p>
              When you make a purchase or create an account, we collect your name, email address, billing address, and payment information. This data is processed securely through our payment provider, Lemon Squeezy, and is never stored on our servers in plain text.
            </p>
            <p>
              When you subscribe to our newsletter, we collect your email address. You can unsubscribe at any time by clicking the link in any marketing email.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black uppercase tracking-widest text-white">How We Use Your Data</h2>
            <p>
              We use your information to process orders, deliver digital products, send transaction confirmations, and — only with your consent — send product announcements and newsletter updates.
            </p>
            <p>
              We do not sell, rent, or share your personal data with third parties for their marketing purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black uppercase tracking-widest text-white">Cookies</h2>
            <p>
              Our site uses essential cookies for cart functionality and session management. Analytics cookies are used anonymously to understand how visitors navigate the site — no personal data is associated with them.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black uppercase tracking-widest text-white">Third-Party Services</h2>
            <p>
              Payments are processed by <strong className="text-zinc-300">Lemon Squeezy</strong>. Audio previews may be streamed via trusted CDN providers. Newsletter delivery is handled by a GDPR-compliant email service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black uppercase tracking-widest text-white">Your Rights</h2>
            <p>
              Under applicable data protection law, you have the right to access, correct, or delete your personal data. To exercise any of these rights, contact us at{" "}
              <a href="mailto:contact@medfender.com" className="text-[#00d8f6] hover:underline">
                contact@medfender.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black uppercase tracking-widest text-white">Data Retention</h2>
            <p>
              Order and account data is retained for a minimum of 5 years to comply with financial record-keeping obligations. Newsletter subscriptions are retained until you unsubscribe.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black uppercase tracking-widest text-white">Contact</h2>
            <p>
              For any privacy-related questions or to request data deletion, reach us at{" "}
              <a href="mailto:contact@medfender.com" className="text-[#00d8f6] hover:underline">
                contact@medfender.com
              </a>
              .
            </p>
          </section>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-wrap items-center gap-6 text-[0.6rem] font-bold tracking-widest text-zinc-600 uppercase">
          <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms</Link>
          <Link href="/support/setup-guide" className="hover:text-zinc-400 transition-colors">Setup Guide</Link>
          <Link href="/" className="hover:text-zinc-400 transition-colors">Home</Link>
        </div>
      </div>
    </main>
  );
}
