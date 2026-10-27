import type { Metadata } from "next";
import DocumentHeader from "@/components/luxury/DocumentHeader";
import LegalArticle, { type LegalSection } from "@/components/legal/LegalArticle";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Medfender collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

const sections: LegalSection[] = [
  {
    title: "Information We Collect",
    body: (
      <>
        <p>
          When you make a purchase or create an account, we collect your name,
          email address, billing address, and payment information. This data is
          processed securely through our payment provider, Lemon Squeezy, and is
          never stored on our servers in plain text.
        </p>
        <p>
          When you subscribe to our newsletter, we collect your email address.
          You can unsubscribe at any time by clicking the link in any marketing
          email.
        </p>
      </>
    ),
  },
  {
    title: "How We Use Your Data",
    body: (
      <>
        <p>
          We use your information to process orders, deliver digital products,
          send transaction confirmations, and — only with your consent — send
          product announcements and newsletter updates.
        </p>
        <p>
          We do not sell, rent, or share your personal data with third parties
          for their marketing purposes.
        </p>
      </>
    ),
  },
  {
    title: "Cookies",
    body: (
      <p>
        Our site uses essential cookies for cart functionality and session
        management. Analytics cookies are used anonymously to understand how
        visitors navigate the site — no personal data is associated with them.
      </p>
    ),
  },
  {
    title: "Third-Party Services",
    body: (
      <p>
        Payments are processed by <strong>Lemon Squeezy</strong>. Audio previews
        may be streamed via trusted CDN providers. Newsletter delivery is
        handled by a GDPR-compliant email service.
      </p>
    ),
  },
  {
    title: "Your Rights",
    body: (
      <p>
        Under applicable data protection law, you have the right to access,
        correct, or delete your personal data. To exercise any of these rights,
        contact us at{" "}
        <a href="mailto:contact@medfender.com">contact@medfender.com</a>.
      </p>
    ),
  },
  {
    title: "Data Retention",
    body: (
      <p>
        Order and account data is retained for a minimum of 5 years to comply
        with financial record-keeping obligations. Newsletter subscriptions are
        retained until you unsubscribe.
      </p>
    ),
  },
  {
    title: "Contact",
    body: (
      <p>
        For any privacy-related questions or to request data deletion, reach us
        at <a href="mailto:contact@medfender.com">contact@medfender.com</a>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main className="flex flex-col">
      <DocumentHeader
        index="10"
        eyebrow="Legal · Privacy"
        title={
          <>
            Privacy,
            <br />
            <em className="text-sand-gradient">kept in confidence.</em>
          </>
        }
        intro="What we collect when you buy a tone pack or join the mailing list, where it goes, and how to have it removed."
        note="Last updated · September 2026"
      />
      <LegalArticle
        sections={sections}
        colophon="Medfender · Privacy Policy · September 2026 revision. This document is reviewed annually."
        related={[
          { label: "Terms of service", href: "/terms" },
          { label: "Setup guide", href: "/support/setup-guide" },
          { label: "Contact", href: "/contact" },
        ]}
      />
    </main>
  );
}
