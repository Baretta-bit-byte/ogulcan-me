import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import LeftSidebar from "@/components/LeftSidebar";
import RightPanel from "@/components/RightPanel";
import { RightPanelProvider } from "@/lib/rightPanelContext";

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
      <body className="bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-900 dark:text-slate-200">
        <ThemeProvider>
          <RightPanelProvider>
            <div className="flex h-screen overflow-hidden">
              {/* Left: sticky sidebar */}
              <LeftSidebar />

              {/* Center: scrollable main content */}
              <main className="flex-1 overflow-y-auto px-10 py-12 lg:px-16">
                <div className="mx-auto max-w-2xl">{children}</div>
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
