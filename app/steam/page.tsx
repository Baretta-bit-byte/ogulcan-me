"use client";

import { useEffect, useState } from "react";
import { Gamepad2, ExternalLink, Clock, Library } from "lucide-react";
import Backlinks from "@/components/Backlinks";

const DATA_URL =
  "https://raw.githubusercontent.com/Baretta-bit-byte/ogulcan-me/main/public/steam-data.json";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SteamPlayer {
  steamid: string;
  personaname: string;
  avatarfull: string;
  profileurl: string;
  personastate: number;
  gameid: string | null;
  gameextrainfo: string | null;
}

interface SteamGame {
  appid: number;
  name: string;
  playtime_2weeks: number;
  playtime_forever: number;
  img_icon_url: string;
  header_image: string;
}

interface SteamData {
  player: SteamPlayer | null;
  recentGames: SteamGame[];
  totalGames: number;
  totalPlaytime: number;
  fetched_at: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const ms = Date.parse(dateStr);
  if (isNaN(ms)) return "";
  const diff = Date.now() - ms;
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function fmtHours(minutes: number): string {
  const h = Math.round(minutes / 60);
  if (h < 1) return `${minutes}m`;
  return `${h.toLocaleString()}h`;
}

const PERSONA_STATE: Record<number, { label: string; color: string }> = {
  0: { label: "Offline",  color: "text-slate-400" },
  1: { label: "Online",   color: "text-blue-400"  },
  2: { label: "Busy",     color: "text-red-400"   },
  3: { label: "Away",     color: "text-amber-400" },
  4: { label: "Snooze",   color: "text-slate-400" },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-slate-100 dark:bg-slate-800 ${className ?? ""}`} />
  );
}

// ─── Game Card ────────────────────────────────────────────────────────────────

function GameCard({ game, maxMinutes }: { game: SteamGame; maxMinutes: number }) {
  const [imgFailed, setImgFailed] = useState(false);
  const recentPct = maxMinutes > 0 ? Math.round((game.playtime_2weeks / maxMinutes) * 100) : 0;
  const storeUrl = `https://store.steampowered.com/app/${game.appid}`;

  return (
    <a
      href={storeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-blue-400/40 dark:border-slate-800 dark:bg-slate-900/50 block"
    >
      {/* Left accent bar */}
      <div className="absolute inset-y-0 left-0 w-0.5 rounded-l-xl bg-blue-400/40 transition-all group-hover:bg-blue-400" />

      {/* Header image */}
      {!imgFailed ? (
        <img
          src={game.header_image}
          alt={game.name}
          className="w-full object-cover transition-opacity"
          style={{ aspectRatio: "460/215" }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div
          className="w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400"
          style={{ aspectRatio: "460/215" }}
        >
          <Gamepad2 size={28} strokeWidth={1.2} />
        </div>
      )}

      {/* Info */}
      <div className="p-3 pl-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-400 transition-colors leading-tight line-clamp-1">
            {game.name}
          </p>
          <ExternalLink
            size={11}
            className="mt-0.5 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-blue-400 transition-colors"
          />
        </div>

        {/* Playtime stats */}
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Clock size={9} />
            <span className="font-semibold text-blue-400">
              {fmtHours(game.playtime_2weeks)}
            </span>
            {" "}last 2 weeks
          </span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span>{fmtHours(game.playtime_forever)} total</span>
        </div>

        {/* Recent playtime bar */}
        {game.playtime_2weeks > 0 && (
          <div className="h-0.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-400 transition-all duration-500"
              style={{ width: `${recentPct}%` }}
            />
          </div>
        )}
      </div>
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SteamPage() {
  const [data,    setData]    = useState<SteamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    fetch(DATA_URL, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load Steam data (${r.status})`);
        return r.json() as Promise<SteamData>;
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const { player, recentGames, totalGames, totalPlaytime, fetched_at } = data ?? {
    player: null, recentGames: [], totalGames: 0, totalPlaytime: 0, fetched_at: null,
  };

  const state = PERSONA_STATE[player?.personastate ?? 0] ?? PERSONA_STATE[0];
  const maxMinutes = Math.max(...recentGames.map((g) => g.playtime_2weeks), 1);

  return (
    <article className="space-y-10">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gamepad2 size={22} strokeWidth={1.6} className="text-slate-700 dark:text-slate-300" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Gaming
            </h1>
          </div>

          {player && (
            <a
              href={player.profileurl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono text-xs text-slate-400 transition-colors hover:text-blue-400"
            >
              Steam Profile <ExternalLink size={11} />
            </a>
          )}
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

      {/* ── Player Card ──────────────────────────────────────────────────── */}
      <section>
        {loading ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : player ? (
          <a
            href={player.profileurl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-400/30 dark:border-slate-800 dark:bg-slate-900/50"
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={player.avatarfull}
                alt={player.personaname}
                className="h-16 w-16 rounded-xl object-cover"
              />
              {/* Online indicator */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${
                  player.personastate === 1 ? "bg-blue-400" : "bg-slate-400"
                }`}
              />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-400 transition-colors">
                  {player.personaname}
                </p>
                <span className={`text-xs font-mono ${state.color}`}>
                  {player.gameextrainfo ? `Playing ${player.gameextrainfo}` : state.label}
                </span>
              </div>

              <div className="mt-1 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Library size={11} />
                  {totalGames.toLocaleString()} games owned
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {fmtHours(totalPlaytime)} total
                </span>
              </div>
            </div>

            <ExternalLink size={13} className="shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-blue-400 transition-colors" />
          </a>
        ) : (
          !loading && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center">
              <p className="text-sm text-slate-400">
                {error ? "Could not load player data." : "No player data available."}
              </p>
              {!error && (
                <p className="mt-1 font-mono text-xs text-slate-300 dark:text-slate-600">
                  Set STEAM_API_KEY + STEAM_ID to enable.
                </p>
              )}
            </div>
          )
        )}
      </section>

      {/* ── Recently Played ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300">
          Recently Played
          <span className="ml-2 font-mono text-xs font-normal text-slate-400">last 2 weeks</span>
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : recentGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentGames.map((game) => (
              <GameCard key={game.appid} game={game} maxMinutes={maxMinutes} />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
              <Gamepad2 size={32} strokeWidth={1.2} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-sm text-slate-400">No games played in the last 2 weeks.</p>
            </div>
          )
        )}
      </section>

      <Backlinks nodeId="steam" />

    </article>
  );
}
