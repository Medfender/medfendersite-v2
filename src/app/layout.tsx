import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AudioProvider } from "@/context/AudioContext";
import { CartProvider } from "@/lib/CartContext";
import { AcademyAccessProvider } from "@/context/AcademyAccessContext";
import Navbar from "@/components/layout/Navbar";
import SiteFooter from "@/components/layout/SiteFooter";
import AudioNavigationGuard from "@/components/layout/AudioNavigationGuard";
import PageTransition from "@/components/layout/PageTransition";
import PaperAtmosphere from "@/components/layout/PaperAtmosphere";
import { site } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://medfender.com"),
  title: {
    default: "Medfender — Live Band & Composer · Marrakech",
    template: "%s — Medfender",
  },
  description: site.description,
  keywords: [
    "Medfender",
    "Marrakech guitarist",
    "live band Marrakech",
    "Gnawa blues",
    "Moroccan guitarist",
    "wedding guitarist Morocco",
    "event musicians Marrakech",
    "TONEX captures",
    "HX Stomp presets",
  ],
  authors: [{ name: "Medfender" }],
  creator: "Medfender",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Medfender",
    images: [
      {
        url: "/images/site/hero-stage.webp",
        width: 2560,
        height: 1246,
        alt: "Medfender performing live at So Lounge, Marrakech",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/site/hero-stage.webp"],
  },
  robots: { index: true, follow: true },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: "Medfender",
  description: site.description,
  genre: ["Gnawa", "Blues", "Blues Rock", "Fusion", "Instrumental"],
  url: "https://medfender.com",
  image: "https://medfender.com/images/site/hero-stage.webp",
  areaServed: [
    { "@type": "City", name: "Marrakech" },
    { "@type": "Country", name: "Morocco" },
  ],
  sameAs: site.socials.map((s) => s.href),
  email: site.email,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="grain min-h-full bg-paper text-ink"
      >
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <CartProvider>
          <AcademyAccessProvider>
            <Navbar />
            <AudioProvider>
              <PaperAtmosphere />
              <AudioNavigationGuard />
              <div id="main" className="relative z-10">
                <PageTransition>{children}</PageTransition>
              </div>
            </AudioProvider>
          </AcademyAccessProvider>
        </CartProvider>
        <SiteFooter />
        <Script
          id="medfender-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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
