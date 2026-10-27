import type { Metadata } from "next";
import DocumentHeader from "@/components/luxury/DocumentHeader";
import LegalArticle, { type LegalSection } from "@/components/legal/LegalArticle";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms and conditions governing the use of Medfender's digital products and services.",
  alternates: { canonical: "/terms" },
};

const sections: LegalSection[] = [
  {
    title: "Acceptance of Terms",
    body: (
      <p>
        By accessing, browsing, or purchasing from Medfender, you agree to be
        bound by these Terms of Service. If you do not agree, you must not use
        this site.
      </p>
    ),
  },
  {
    title: "Digital Products & Licensing",
    body: (
      <>
        <p>
          All Medfender products — including TONEX captures, HX Stomp presets,
          impulse responses, and session stems — are licensed to you for
          personal and commercial use on equipment you own or operate.
        </p>
        <p>
          You may not redistribute, resell, sublicense, or repackage the
          original files in any form, whether modified or unmodified. Sharing
          purchased content publicly (forums, torrent sites, cloud drives)
          constitutes copyright infringement.
        </p>
      </>
    ),
  },
  {
    title: "Refund Policy",
    body: (
      <p>
        Due to the digital nature of our products, all sales are final once a
        download has begun. If a file is corrupt or defective, contact us within
        14 days of purchase for a replacement or full refund. Disputes filed
        directly with your payment provider before contacting us may delay
        resolution.
      </p>
    ),
  },
  {
    title: "Equipment & Compatibility",
    body: (
      <p>
        Presets are built for the devices advertised on each product page (e.g.
        Line 6 HX Stomp, IK Multimedia TONEX). Medfender is not responsible for
        issues arising from using presets on unsupported hardware or outdated
        firmware.
      </p>
    ),
  },
  {
    title: "Account Responsibility",
    body: (
      <p>
        You are responsible for keeping your account credentials secure.
        Medfender is not liable for unauthorized access resulting from
        compromised passwords. Notify us immediately at{" "}
        <a href="mailto:contact@medfender.com">contact@medfender.com</a> if you
        suspect unauthorized activity.
      </p>
    ),
  },
  {
    title: "Intellectual Property",
    body: (
      <p>
        All content on this site — including the Medfender name, logo, audio
        recordings, preset designs, written copy, and graphics — is the property
        of Medfender and protected by international copyright law. No
        reproduction is permitted without explicit written permission.
      </p>
    ),
  },
  {
    title: "Limitation of Liability",
    body: (
      <p>
        Medfender products are provided &ldquo;as is&rdquo; without warranty of
        any kind. Medfender is not liable for any direct, indirect, or
        consequential damages arising from the use or inability to use the
        products.
      </p>
    ),
  },
  {
    title: "Changes to Terms",
    body: (
      <p>
        We reserve the right to update these terms at any time. Material changes
        will be communicated via email to active subscribers. Continued use of
        the site after changes constitutes acceptance.
      </p>
    ),
  },
  {
    title: "Governing Law",
    body: (
      <p>
        These terms are governed by the laws of the jurisdiction in which
        Medfender operates. Any disputes will be resolved in that
        jurisdiction&apos;s courts.
      </p>
    ),
  },
  {
    title: "Contact",
    body: (
      <p>
        For any questions about these terms, reach us at{" "}
        <a href="mailto:contact@medfender.com">contact@medfender.com</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <main className="flex flex-col">
      <DocumentHeader
        index="11"
        eyebrow="Legal · Terms"
        title={
          <>
            Terms of
            <br />
            <em className="text-sand-gradient">service.</em>
          </>
        }
        intro="The agreement between you and Medfender: what a licence covers, how refunds work, and where the limits sit."
        note="Last updated · September 2026"
      />
      <LegalArticle
        sections={sections}
        colophon="Medfender · Terms of Service · September 2026 revision. Governs all purchases made through this site."
        related={[
          { label: "Privacy policy", href: "/privacy" },
          { label: "Setup guide", href: "/support/setup-guide" },
          { label: "Contact", href: "/contact" },
        ]}
      />
    </main>
  );
}
