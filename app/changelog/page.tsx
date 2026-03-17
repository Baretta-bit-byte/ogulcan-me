import { History } from "lucide-react";
import Backlinks from "@/components/Backlinks";

const entries = [
  {
    version: "3.1",
    date: "2026-03-17",
    items: [
      "Added /about narrative biography with CV download",
      "Added /stats analytics dashboard with Umami embed",
      "Added /bookmarks — YouTube channels + daily puzzles",
      "Added /tags — browse all content by tag",
      "Added /changelog — you are here",
      "RSS feed at /feed.xml",
      "Open Graph meta tags for all blog posts",
      "Reading time estimates on posts",
      "Draft support via frontmatter",
      "Full-text search in command palette",
    ],
  },
  {
    version: "3.0",
    date: "2026-03-16",
    items: [
      "MDX blog pipeline — /posts with maturity badges",
      "Today I Learned — /til timeline micro-notes",
      "Bi-directional backlinks on every page",
      "Graph search with amber highlight + camera focus",
      "TOC active section highlighting",
      "/now live widget cluster (Spotify, Books, GitHub)",
      "Command palette (Ctrl+K) site-wide search",
      "Maps of Content (/topics) with parent/leaf distinction",
    ],
  },
  {
    version: "2.0",
    date: "2026-03-10",
    items: [
      "Interactive knowledge graph (react-force-graph-2d)",
      "Hover tooltip system (LinkedTerm + HoverTooltip)",
      "Animated SVG signature (Header.tsx)",
      "Organic theme toggle (View Transitions API circular reveal)",
      "/github — GitHub REST API dashboard",
      "/spotify — live data via cron + click-to-play previews",
      "/books — manual JSON + Open Library covers",
      "/vinyl — CSS groove records, Discogs fetch",
      "/uses — living dev environment doc",
    ],
  },
  {
    version: "1.0",
    date: "2026-02-28",
    items: [
      "Initial 3-column layout (LeftSidebar, main, RightPanel)",
      "Floating pill nav with Framer Motion layoutId",
      "Dark/light mode with next-themes",
      "Static export to GitHub Pages",
      "Core pages: projects, math, community",
    ],
  },
];

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ChangelogPage() {
  return (
    <div className="max-w-2xl mx-auto pb-24 font-sans">
      <section className="mt-6 mb-10 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <History className="w-6 h-6 text-sky-500" />
          /changelog
        </h1>
        <p className="font-mono text-sm text-slate-400">
          How this garden grew over time.
        </p>
      </section>

      <div className="relative">
        <div className="absolute left-[7px] top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-800" />

        <div className="space-y-10">
          {entries.map((entry) => (
            <div key={entry.version} className="flex gap-5">
              <div className="relative mt-2 shrink-0">
                <div className="h-3.5 w-3.5 rounded-full bg-sky-400 ring-2 ring-white dark:ring-slate-900" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                    v{entry.version}
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    {formatDate(entry.date)}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {entry.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <Backlinks nodeId="changelog" />
      </div>
    </div>
  );
}
