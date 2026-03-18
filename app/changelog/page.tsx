import { History, Sprout } from "lucide-react";
import Backlinks from "@/components/Backlinks";
import { graphNodes } from "@/lib/graphData";

function tendedAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1w ago" : `${weeks}w ago`;
}

const recentlyTended = graphNodes
  .filter((n) => n.lastTended && n.id !== "home")
  .sort((a, b) => new Date(b.lastTended!).getTime() - new Date(a.lastTended!).getTime())
  .slice(0, 8);

const entries = [
  {
    version: "3.3",
    date: "2026-03-18",
    items: [
      "KaTeX math rendering in blog posts and TIL entries",
      "Enhanced /now with narrative intro and internship availability CTA",
      "\"All content is human-authored\" trust badge in footer",
      "Search result highlighting with amber keyword matches",
      "Deep cross-linking: project pages reference garden notes and concepts",
      "Richer hover previews with \"click to explore\" hint",
      "Enriched graph node labels and descriptions for better hover previews",
      "Timeline badges on /about (BSc, Certificate, Member, etc.)",
      "Changelog now shows recently tended garden nodes",
      "3 new TIL entries + 1 new blog post with LaTeX notation",
      "Graph descriptions enriched for better hover preview content",
      "5 new cross-links in knowledge graph (104 total)",
    ],
  },
  {
    version: "3.2",
    date: "2026-03-17",
    items: [
      "2.5D animated SVG signature — 3 depth layers + Framer Motion mouse parallax",
      "Flickr API integration — masonry photo grid, hover overlay with title + views",
      "Steam Web API — player card, recently played games, playtime progress bars",
      "Freshness indicators — lastTended field on all graph nodes",
      "Reading progress bar — sky-400 bar tracking main scroll position",
      "Page transitions — Framer Motion fade+slide keyed by pathname",
      "Currently reading — /books + /now BooksWidget shows in-progress books",
      "/colophon — Architectural Decision Records (8 ADR cards)",
      "Content activity heatmap on /stats",
      "Tufte-style sidenotes (desktop margin, mobile inline toggle)",
      "Breadcrumb graph info — maturity badge + connection count",
      "RelatedContent — tag-based recommendations on blog detail pages",
      "Clickable tag links on blog post pages",
      "Table of Contents on blog post detail pages",
      "3 new TIL entries: CRDT Lamport clock, SHA-256 shuffle, event sourcing replay",
      "Spring 2026 retrospective blog post",
      "Next.js 16.1.7 security update (5 Dependabot alerts resolved)",
    ],
  },
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

      {/* Recently Tended */}
      <section className="mt-14 mb-12">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
          <Sprout className="w-5 h-5 text-emerald-400" />
          Recently Tended
        </h2>
        <p className="text-xs font-mono text-slate-400 mb-5">
          Garden nodes most recently updated
        </p>
        <div className="grid grid-cols-2 gap-2">
          {recentlyTended.map((node) => (
            <a
              key={node.id}
              href={node.url || `/${node.id}`}
              className="group flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 hover:border-sky-400/40 transition-colors bg-white dark:bg-slate-900/50"
            >
              <div className="min-w-0 flex items-center gap-2">
                <span className="text-xs">
                  {node.maturity === "seedling" ? "🌱" : node.maturity === "sapling" ? "🪴" : "🌳"}
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-300 truncate group-hover:text-sky-400 transition-colors">
                  {node.label}
                </span>
              </div>
              <span className="shrink-0 text-[10px] font-mono text-slate-400">
                {node.lastTended ? tendedAgo(node.lastTended) : ""}
              </span>
            </a>
          ))}
        </div>
      </section>

      <div className="mt-12">
        <Backlinks nodeId="changelog" />
      </div>
    </div>
  );
}
