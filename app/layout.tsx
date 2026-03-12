import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import ThemeReadyGate from "@/components/ThemeReadyGate";
import LeftSidebar from "@/components/LeftSidebar";
import RightPanel from "@/components/RightPanel";
import { RightPanelProvider } from "@/lib/rightPanelContext";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/CommandPalette";

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
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-200">
        {/* Enables color transitions only after first paint */}
        <ThemeReadyGate />

        <ThemeProvider>
          <RightPanelProvider>
            <CommandPalette />
            <div className="flex h-screen overflow-hidden">
              {/* Left: sidebar */}
              <LeftSidebar />

              {/* Center: scrollable main content */}
              <main className="flex-1 overflow-y-auto px-10 py-12 lg:px-16">
                <div className="mx-auto max-w-2xl">
                  {children}
                  <Footer />
                </div>
              </main>

              {/* Right: graph + TOC */}
              <RightPanel />
            </div>
          </RightPanelProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
