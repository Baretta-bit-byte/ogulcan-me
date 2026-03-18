"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Music, BookOpen, GitBranch, Star, ExternalLink, Clock } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpotifyTrack {
  name: string;
  artists: string[];
  image: string | null;
  url: string;
}

interface Book {
  isbn: string;
  title: string;
  author: string;
  finished?: string;
  rating: number;
  pages: number;
  status?: "reading" | "finished";
  progress?: number;
}

interface Repo {
  name: string;
  description: string | null;
  html_url: string;
  pushed_at: string;
  language: string | null;
  stargazers_count: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-100 dark:bg-slate-800 ${className ?? ""}`} />;
}

// ─── Spotify Widget ───────────────────────────────────────────────────────────

function SpotifyWidget() {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/Baretta-bit-byte/ogulcan-me/main/public/spotify-data.json")
      .then((r) => r.json())
      .then((d) => { setTracks((d.tracks ?? []).slice(0, 3)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/50 hover:border-emerald-400/40 transition-all">
      <div className="absolute inset-y-0 left-0 w-0.5 bg-emerald-400/50 group-hover:bg-emerald-400 transition-all" />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
          <Music className="w-4 h-4 text-emerald-400" /> Currently Listening
        </h3>
        <Link href="/spotify" className="font-mono text-[10px] text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1">
          all tracks <ExternalLink size={9} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : tracks.length > 0 ? (
        <div className="space-y-3">
          {tracks.map((track, i) => (
            <a
              key={i}
              href={track.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group/track"
            >
              {track.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={track.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover/track:text-emerald-400 transition-colors">
                  {track.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{track.artists.join(", ")}</p>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <p className="font-mono text-xs text-slate-400">No data available.</p>
      )}
    </div>
  );
}

// ─── Books Widget ─────────────────────────────────────────────────────────────

function BooksWidget() {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/books-data.json")
      .then((r) => r.json())
      .then((books: Book[]) => {
        // Prefer currently reading, fallback to most recently finished
        const reading = books.find((b) => b.status === "reading");
        if (reading) {
          setBook(reading);
        } else {
          const sorted = [...books].sort((a, b) => ((a.finished ?? "") < (b.finished ?? "") ? 1 : -1));
          setBook(sorted[0] ?? null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const coverUrl = book ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg` : null;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/50 hover:border-amber-400/40 transition-all">
      <div className="absolute inset-y-0 left-0 w-0.5 bg-amber-400/50 group-hover:bg-amber-400 transition-all" />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" /> {book?.status === "reading" ? "Currently Reading" : "Recently Read"}
        </h3>
        <Link href="/books" className="font-mono text-[10px] text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1">
          all books <ExternalLink size={9} />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-16 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
            <Skeleton className="h-2.5 w-1/4" />
          </div>
        </div>
      ) : book ? (
        <div className="flex items-start gap-4">
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="w-12 h-auto rounded-lg shadow-sm shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
              {book.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{book.author.split(",")[0]}</p>
            {book.status === "reading" && book.progress != null ? (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${book.progress}%` }} />
                </div>
                <span className="font-mono text-[10px] text-emerald-500 tabular-nums">{book.progress}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className={i < book.rating ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-700"}
                    />
                  ))}
                </div>
                <span className="font-mono text-[10px] text-slate-400">{book.pages}p</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="font-mono text-xs text-slate-400">No data available.</p>
      )}
    </div>
  );
}

// ─── GitHub Widget ────────────────────────────────────────────────────────────

const langColors: Record<string, string> = {
  TypeScript: "bg-sky-400",
  JavaScript: "bg-amber-400",
  Python: "bg-emerald-400",
  C: "bg-slate-400",
  "C++": "bg-pink-400",
  Java: "bg-orange-400",
  Go: "bg-cyan-400",
  Rust: "bg-red-400",
};

function GitHubWidget() {
  const [repo, setRepo] = useState<Repo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/github-data.json")
      .then((r) => r.json())
      .then((d) => {
        const repos: Repo[] = d.repos ?? [];
        const sorted = [...repos].sort((a, b) => (a.pushed_at < b.pushed_at ? 1 : -1));
        setRepo(sorted[0] ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/50 hover:border-sky-400/40 transition-all">
      <div className="absolute inset-y-0 left-0 w-0.5 bg-sky-400/50 group-hover:bg-sky-400 transition-all" />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-sky-400" /> Recently Active
        </h3>
        <Link href="/github" className="font-mono text-[10px] text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1">
          all repos <ExternalLink size={9} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-2.5 w-1/3" />
        </div>
      ) : repo ? (
        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="block group/repo">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover/repo:text-sky-400 transition-colors font-mono">
            {repo.name}
          </p>
          {repo.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{repo.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            {repo.language && (
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <span className={`inline-block w-2 h-2 rounded-full ${langColors[repo.language] ?? "bg-slate-400"}`} />
                {repo.language}
              </span>
            )}
            {repo.stargazers_count > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <Star size={9} /> {repo.stargazers_count}
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <Clock size={9} /> {timeAgo(repo.pushed_at)}
            </span>
          </div>
        </a>
      ) : (
        <p className="font-mono text-xs text-slate-400">No data available.</p>
      )}
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function NowWidgets() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <SpotifyWidget />
      <BooksWidget />
      <GitHubWidget />
    </div>
  );
}
