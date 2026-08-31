import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AudioProvider } from "@/context/AudioContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Medfender — Tactical Audio Hardware & Preset Packs",
  description: "Hand-tuned TONEX and HX Stomp preset packs, analog audio captures, and studio-grade tone profiles.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-neutral-950 text-neutral-100 min-h-screen">
        <Navbar />
        <AudioProvider>
          <PageTransition>{children}</PageTransition>
        </AudioProvider>
        <Footer />
        <Script
          src="https://assets.lemonsqueezy.com/lemon.js"
          strategy="afterInteractive"
        />
        <Script id="lemon-btn-handler" strategy="afterInteractive">
          {`
            document.addEventListener('click', function(e) {
              var btn = e.target.closest ? e.target.closest('.lemonsqueezy-button') : null;
              if (btn && typeof window.LemonSqueezy !== 'undefined') {
                e.preventDefault();
                window.LemonSqueezy.Setup({ eventName: 'Checkout', checkoutOptions: { embed: true } });
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
}
