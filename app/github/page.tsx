"use client";

import { useEffect, useState } from "react";
import {
  Github,
  ExternalLink,
  GitPullRequest,
  Users,
  Star,
  GitFork,
  GitCommit,
} from "lucide-react";
import Backlinks from "@/components/Backlinks";

const USERNAME = "Baretta-bit-byte";
const DATA_URL =
  "https://raw.githubusercontent.com/Baretta-bit-byte/ogulcan-me/main/public/github-data.json";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GithubUser {
  followers: number;
  following: number;
  public_repos: number;
  html_url: string;
}

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  pushed_at: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
}

interface PREvent {
  title: string;
  html_url: string;
  merged_at: string | null;
  created_at: string | null;
  repo: string;
  state: string;
}

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ContributionData {
  contributions: ContributionDay[];
  total: Record<string, number>;
}

interface GitHubData {
  user: GithubUser | null;
  repos: Repo[];
  lastPR: PREvent | null;
  contributions: ContributionData | null;
  fetched_at: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "some time ago";
  const ms = Date.parse(dateStr);
  if (isNaN(ms)) return "some time ago";
  const diff = Date.now() - ms;
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

const LEVEL_COLORS = [
  "bg-slate-100 dark:bg-slate-800",      // 0 — empty
  "bg-emerald-200 dark:bg-emerald-900",  // 1 — low
  "bg-emerald-300 dark:bg-emerald-700",  // 2 — med
  "bg-emerald-500 dark:bg-emerald-500",  // 3 — high
  "bg-emerald-600 dark:bg-emerald-400",  // 4 — max
];

const LANG_COLORS: Record<string, string> = {
  Python:     "bg-blue-400",
  "C++":      "bg-pink-400",
  TypeScript: "bg-sky-400",
  JavaScript: "bg-yellow-400",
  C:          "bg-slate-400",
  Rust:       "bg-orange-400",
  Go:         "bg-cyan-400",
};

// ─── Contribution heatmap ─────────────────────────────────────────────────────

function ContributionGraph({ data }: { data: ContributionData }) {
  const days = data.contributions;
  const total = data.total["lastYear"] ?? Object.values(data.total).reduce((a, b) => a + b, 0);

  // Group into weeks (columns), each week = 7 days (Sun→Sat)
  const weeks: ContributionDay[][] = [];
  let week: ContributionDay[] = [];

  // Pad start so first day lands on correct weekday
  const firstDay = new Date(days[0].date).getDay(); // 0=Sun
  for (let i = 0; i < firstDay; i++) {
    week.push({ date: "", count: 0, level: 0 });
  }

  for (const day of days) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push({ date: "", count: 0, level: 0 });
    weeks.push(week);
  }

  // Month labels: find first week where month changes
  const monthLabels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((w, i) => {
    const firstFilled = w.find((d) => d.date);
    if (!firstFilled) return;
    const m = new Date(firstFilled.date).getMonth();
    if (m !== lastMonth) {
      monthLabels.push({
        col: i,
        label: new Date(firstFilled.date).toLocaleString("default", { month: "short" }),
      });
      lastMonth = m;
    }
  });

  const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

  return (
    <div className="space-y-2">
      <p className="font-mono text-xs text-slate-400">
        {total.toLocaleString()} contributions in the last year
      </p>
      <div className="overflow-x-auto">
        <div className="flex gap-1 pb-1">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-[3px] pr-1 pt-5">
            {DAY_LABELS.map((d, i) => (
              <span key={i} className="h-[10px] text-[9px] leading-[10px] text-slate-400">
                {d}
              </span>
            ))}
          </div>

          {/* Weeks grid */}
          <div className="flex flex-col">
            {/* Month row */}
            <div className="relative mb-1 h-4">
              {monthLabels.map(({ col, label }) => (
                <span
                  key={col}
                  className="absolute text-[9px] text-slate-400"
                  style={{ left: col * 13 }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-[3px]">
              {weeks.map((w, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {w.map((d, di) => (
                    <div
                      key={di}
                      title={d.date ? `${d.date}: ${d.count} contributions` : ""}
                      className={`h-[10px] w-[10px] rounded-sm ${LEVEL_COLORS[d.level]}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-400">Less</span>
        {LEVEL_COLORS.map((cls, i) => (
          <div key={i} className={`h-[10px] w-[10px] rounded-sm ${cls}`} />
        ))}
        <span className="text-[10px] text-slate-400">More</span>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-slate-100 dark:bg-slate-800 ${className ?? ""}`} />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GitHubPage() {
  const [data,    setData]    = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    fetch(DATA_URL, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load GitHub data (${r.status})`);
        return r.json() as Promise<GitHubData>;
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const { user, repos, lastPR, contributions, fetched_at } = data ?? {
    user: null, repos: [], lastPR: null, contributions: null, fetched_at: null,
  };

  return (
    <article className="space-y-12">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Github size={22} strokeWidth={1.6} className="text-slate-700 dark:text-slate-300" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              GitHub
            </h1>
          </div>
          <a
            href={`https://github.com/${USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-xs text-slate-400 transition-colors hover:text-sky-400"
          >
            Visit Profile <ExternalLink size={11} />
          </a>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6">
          {loading ? (
            <>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </>
          ) : user ? (
            <>
              <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <Users size={13} strokeWidth={1.6} />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user.followers}</span>
                {" "}followers
              </span>
              <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{user.following}</span>
                {" "}following
              </span>
            </>
          ) : null}
        </div>

        {fetched_at && (
          <p className="font-mono text-[10px] text-slate-400">
            updated {timeAgo(fetched_at)}
          </p>
        )}

        {error && (
          <p className="font-mono text-xs text-red-400">{error}</p>
        )}
      </section>

      {/* ── Pinned / Recent Repos ────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300">
          Recent Repositories
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {repos.map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-violet-400/40 dark:border-slate-800 dark:bg-slate-900/50"
              >
                {/* Left accent bar */}
                <div className="absolute inset-y-0 left-0 w-0.5 rounded-l-xl bg-violet-400/50 transition-all group-hover:bg-violet-400" />

                <div className="space-y-2 pl-3">
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-violet-400 transition-colors leading-tight">
                      {repo.name}
                    </span>
                    <ExternalLink
                      size={11}
                      className="mt-0.5 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-violet-400 transition-colors"
                    />
                  </div>

                  {repo.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {repo.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3">
                    {repo.language && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <span className={`h-2 w-2 rounded-full ${LANG_COLORS[repo.language] ?? "bg-slate-400"}`} />
                        {repo.language}
                      </span>
                    )}
                    {repo.stargazers_count > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                        <Star size={9} /> {repo.stargazers_count}
                      </span>
                    )}
                    {repo.forks_count > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                        <GitFork size={9} /> {repo.forks_count}
                      </span>
                    )}
                    <span className="ml-auto text-[10px] text-slate-300 dark:text-slate-600">
                      {timeAgo(repo.pushed_at)}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* ── Last Pull Request ────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300">
          Last Pull Request
        </h2>

        {loading ? (
          <Skeleton className="h-20 rounded-xl" />
        ) : lastPR ? (
          <a
            href={lastPR.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-sky-400/40 dark:border-slate-800 dark:bg-slate-900/50 block"
          >
            <div className="absolute inset-y-0 left-0 w-0.5 rounded-l-xl bg-sky-400/50 transition-all group-hover:bg-sky-400" />
            <div className="space-y-2 pl-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <GitPullRequest size={13} className="shrink-0 text-sky-400 mt-0.5" />
                  <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-sky-400 transition-colors">
                    {lastPR.title}
                  </span>
                </div>
                <ExternalLink size={11} className="shrink-0 text-slate-300 dark:text-slate-600 mt-0.5" />
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                <span className="font-mono">{lastPR.repo.split("/")[1]}</span>
                <span>·</span>
                <GitCommit size={9} />
                <span>
                  {lastPR.merged_at
                    ? `merged ${timeAgo(lastPR.merged_at)}`
                    : `opened ${timeAgo(lastPR.created_at)}`}
                </span>
              </div>
            </div>
          </a>
        ) : (
          !loading && (
            <p className="font-mono text-xs text-slate-400">No recent public pull requests found.</p>
          )
        )}
      </section>

      {/* ── Contribution Graph ───────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300">
          Contribution Graph
        </h2>

        {loading ? (
          <Skeleton className="h-28 w-full rounded-xl" />
        ) : contributions ? (
          <ContributionGraph data={contributions} />
        ) : (
          <p className="font-mono text-xs text-slate-400">Contribution data unavailable.</p>
        )}
      </section>

      <Backlinks nodeId="github" />

    </article>
  );
}
