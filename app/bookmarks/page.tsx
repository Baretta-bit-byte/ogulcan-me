import { ExternalLink, Youtube, Puzzle, Code2, Flame } from "lucide-react";
import Backlinks from "@/components/Backlinks";

interface Bookmark {
  title: string;
  url: string;
  description: string;
}

interface PuzzleItem {
  title: string;
  url: string;
  emoji: string;
  color: string;
  bg: string;
  border: string;
  tagline: string;
}

const channels: Bookmark[] = [
  {
    title: "3Blue1Brown",
    url: "https://www.youtube.com/@3blue1brown",
    description: "Visual, intuition-first explanations of math.",
  },
  {
    title: "Fireship",
    url: "https://www.youtube.com/@Fireship",
    description: "Fast-paced dev news and 100-second explainers.",
  },
  {
    title: "Computerphile",
    url: "https://www.youtube.com/@Computerphile",
    description: "University researchers on CS concepts.",
  },
  {
    title: "The Coding Train",
    url: "https://www.youtube.com/@TheCodingTrain",
    description: "Creative coding and generative art.",
  },
  {
    title: "Theo",
    url: "https://www.youtube.com/@t3dotgg",
    description: "Web dev opinions and Next.js ecosystem.",
  },
];

const dailyPuzzles: PuzzleItem[] = [
  {
    title: "Queens",
    url: "https://www.linkedin.com/games/queens/",
    emoji: "👑",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    tagline: "Place queens without conflict",
  },
  {
    title: "Tango",
    url: "https://www.linkedin.com/games/tango/",
    emoji: "💃",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    tagline: "Match pairs by constraint",
  },
  {
    title: "Zip",
    url: "https://www.linkedin.com/games/zip/",
    emoji: "⚡",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    tagline: "Fill the grid, no gaps",
  },
  {
    title: "Mini Sudoku",
    url: "https://sudoku.com",
    emoji: "🔢",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    tagline: "Classic logic in compact form",
  },
  {
    title: "Chess.com",
    url: "https://www.chess.com/daily-chess-puzzle",
    emoji: "♟️",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    tagline: "Daily tactical puzzle",
  },
];

const codingPlatforms: PuzzleItem[] = [
  {
    title: "LeetCode",
    url: "https://leetcode.com",
    emoji: "🧩",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    tagline: "Algorithms & data structures",
  },
  {
    title: "HackerRank",
    url: "https://www.hackerrank.com",
    emoji: "💻",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    tagline: "Coding challenges & certifications",
  },
];

export default function BookmarksPage() {
  return (
    <div className="max-w-2xl mx-auto pb-24 font-sans">
      {/* Header */}
      <section className="mt-6 mb-10 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          /bookmarks
        </h1>
        <p className="font-mono text-sm text-slate-400">
          Channels I watch, puzzles I solve, things I keep coming back to.
        </p>
      </section>

      {/* Daily Puzzles — badge grid */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Puzzle size={14} className="text-violet-400" />
          <h2 className="text-sm font-mono font-semibold text-slate-400 uppercase tracking-widest">
            Daily Puzzles
          </h2>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono text-emerald-500">
            <Flame size={10} /> every day
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {dailyPuzzles.map((p) => (
            <a
              key={p.title}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative overflow-hidden rounded-xl border ${p.border} ${p.bg} p-4 transition-all hover:shadow-md hover:scale-[1.02]`}
            >
              <div className={`absolute inset-y-0 left-0 w-1 ${p.color.replace("text-", "bg-")}`} />
              <div className="text-xl mb-2">{p.emoji}</div>
              <p className={`font-mono text-sm font-bold ${p.color}`}>{p.title}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                {p.tagline}
              </p>
              <ExternalLink
                size={10}
                className="absolute top-3 right-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </a>
          ))}
        </div>
      </section>

      {/* Coding Platforms — badge row */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Code2 size={14} className="text-sky-400" />
          <h2 className="text-sm font-mono font-semibold text-slate-400 uppercase tracking-widest">
            Coding Platforms
          </h2>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-mono text-sky-500">
            <Flame size={10} /> daily practice
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {codingPlatforms.map((p) => (
            <a
              key={p.title}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative overflow-hidden rounded-xl border ${p.border} ${p.bg} p-5 transition-all hover:shadow-md hover:scale-[1.02]`}
            >
              <div className={`absolute inset-y-0 left-0 w-1 ${p.color.replace("text-", "bg-")}`} />
              <div className="text-2xl mb-2">{p.emoji}</div>
              <p className={`font-mono text-sm font-bold ${p.color}`}>{p.title}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                {p.tagline}
              </p>
              <ExternalLink
                size={10}
                className="absolute top-3 right-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </a>
          ))}
        </div>
      </section>

      {/* YouTube Channels */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Youtube size={14} className="text-red-400" />
          <h2 className="text-sm font-mono font-semibold text-slate-400 uppercase tracking-widest">
            YouTube Channels
          </h2>
        </div>
        <div className="space-y-2">
          {channels.map((b) => (
            <a
              key={b.title}
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-5 py-3 transition-all hover:border-red-400/40"
            >
              <div className="absolute inset-y-0 left-0 w-0.5 bg-red-400/30 group-hover:bg-red-400 transition-colors" />
              <div className="min-w-0 flex-1">
                <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-red-400 transition-colors">
                  {b.title}
                </span>
                <span className="ml-2 text-xs text-slate-400">{b.description}</span>
              </div>
              <ExternalLink size={11} className="text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </section>

      <Backlinks nodeId="bookmarks" />
    </div>
  );
}
