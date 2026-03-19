import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeReadyGate from "@/components/ThemeReadyGate";
import LeftSidebar from "@/components/LeftSidebar";
import MobileNav from "@/components/MobileNav";
import RightPanel from "@/components/RightPanel";
import { RightPanelProvider } from "@/lib/rightPanelContext";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/CommandPalette";
import ReadingProgress from "@/components/ReadingProgress";
import AmbientBackground from "@/components/AmbientBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ogulcan — Digital Garden",
  description:
    "Personal digital garden and portfolio of Ogulcan — software, mathematics, and ideas.",
  openGraph: {
    title: "Ogulcan — Digital Garden",
    description: "Personal digital garden and portfolio of Ogulcan — software, mathematics, and ideas.",
    url: "https://ogulcantokmak.me",
    siteName: "ogulcantokmak.me",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Ogulcan — Digital Garden",
    description: "Personal digital garden and portfolio of Ogulcan — software, mathematics, and ideas.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Blocking inline script — runs synchronously before first paint.
          Reads localStorage and applies the 'dark' class immediately,
          so the browser paints in the correct theme from frame 1.
          Defaults to dark if no preference is stored.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t?t==='dark':true)}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-[#0B1120] text-slate-900 dark:text-slate-200">
        {/* Enables color transitions only after first paint */}
        <ThemeReadyGate />

        <ThemeProvider>
          <RightPanelProvider>
            <AmbientBackground />
            <ReadingProgress />
            <CommandPalette />
            {/* Mobile: fixed top bar + drawer */}
            <MobileNav />

            <div className="relative z-10 flex h-screen overflow-hidden">
              {/* Left: desktop sidebar (hidden on mobile) */}
              <LeftSidebar />

              {/* Center: scrollable main content */}
              <main className="flex-1 overflow-y-auto px-4 pt-16 pb-8 sm:px-6 lg:px-10 lg:py-12 xl:px-16">
                <div className="mx-auto max-w-2xl">
                  {children}
                  <Footer />
                </div>
              </main>

              {/* Right: graph + TOC (hidden below xl) */}
              <RightPanel />
            </div>
          </RightPanelProvider>
        </ThemeProvider>
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="b6ab814a-45bc-4384-9a01-5590713b049f"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
