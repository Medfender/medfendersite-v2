import type { Metadata } from "next";
import ContactSection from "@/components/contact/ContactSection";

export const metadata: Metadata = {
  title: "Contact — Medfender",
  description: "Get in touch with Medfender for custom tone captures, collaborations, or studio inquiries.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      <ContactSection />
    </main>
  );
}
