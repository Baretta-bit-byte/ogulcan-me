"use client";

import { useEffect, useState, useRef } from "react";
import { ExternalLink, Users, ListMusic, Play, Pause, Clock } from "lucide-react";
import Backlinks from "@/components/Backlinks";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpotifyTrack {
  id:          string;
  name:        string;
  artists:     string[];
  album:       string;
  image:       string | null;
  url:         string;
  preview_url: string | null;
  duration_ms: number;
}

interface SpotifyProfile {
  name:      string;
  followers: number;
  playlists: number;
}

interface SpotifyData {
  profile:    SpotifyProfile | null;
  tracks:     SpotifyTrack[];
  fetched_at: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDuration(ms: number): string {
  const s   = Math.floor(ms / 1000);
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1)  return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30)  return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-slate-100 dark:bg-slate-800 ${className ?? ""}`} />
  );
}

// ─── Track card ───────────────────────────────────────────────────────────────

function TrackCard({ track, rank }: { track: SpotifyTrack; rank: number }) {
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const togglePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!track.preview_url) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(track.preview_url);
      audioRef.current.volume = 0.5;
      audioRef.current.onended = () => setPlaying(false);
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => setPlaying(false));
      setPlaying(true);
    }
  };

  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-emerald-400/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Rank badge */}
      <span className="absolute left-2 top-2 z-10 rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[10px] text-white backdrop-blur-sm">
        #{rank}
      </span>

      {/* Album art */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {track.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.image}
            alt={track.album}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ListMusic size={32} className="text-slate-300 dark:text-slate-600" />
          </div>
        )}

        {/* Hover overlay */}
        {hovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            {track.preview_url && (
              <button
                onClick={togglePreview}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-black shadow-lg transition-transform hover:scale-110 active:scale-95"
                aria-label={playing ? "Pause preview" : "Play preview"}
              >
                {playing ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" />}
              </button>
            )}
          </div>
        )}

        {/* Playing indicator */}
        {playing && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-emerald-400 px-2 py-0.5">
            <span className="font-mono text-[9px] font-bold text-black">PLAYING</span>
          </div>
        )}
      </div>

      {/* Track info */}
      <div className="space-y-0.5 p-3">
        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-500 transition-colors">
          {track.name}
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {track.artists.join(", ")}
        </p>
        <div className="flex items-center gap-1 pt-0.5">
          <Clock size={9} className="text-slate-300 dark:text-slate-600" />
          <span className="font-mono text-[10px] text-slate-300 dark:text-slate-600">
            {fmtDuration(track.duration_ms)}
          </span>
          <ExternalLink
            size={9}
            className="ml-auto text-slate-300 dark:text-slate-600 group-hover:text-emerald-400 transition-colors"
          />
        </div>
      </div>
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SpotifyPage() {
  const [data,    setData]    = useState<SpotifyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch directly from GitHub raw — always the latest committed version,
    // updated every 30 min by the spotify.yml workflow (no redeploy needed).
    fetch("https://raw.githubusercontent.com/Baretta-bit-byte/ogulcan-me/main/public/spotify-data.json")
      .then((r) => r.json())
      .then((d: SpotifyData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const profile = data?.profile ?? null;
  const tracks  = data?.tracks  ?? [];

  return (
    <article className="space-y-12">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Spotify logo SVG */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="#1DB954"
              aria-hidden="true"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Spotify
            </h1>
          </div>
          <a
            href="https://open.spotify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-xs text-slate-400 transition-colors hover:text-emerald-400"
          >
            Browse Playlists <ExternalLink size={11} />
          </a>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6">
          {loading ? (
            <>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
            </>
          ) : profile ? (
            <>
              <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <Users size={13} strokeWidth={1.6} />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {profile.followers.toLocaleString()}
                </span>{" "}
                followers
              </span>
              <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <ListMusic size={13} strokeWidth={1.6} />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {profile.playlists}
                </span>{" "}
                playlists
              </span>
            </>
          ) : (
            <p className="font-mono text-xs text-slate-400">
              Connect Spotify in GitHub Actions secrets to see live data.
            </p>
          )}
        </div>
      </section>

      {/* ── Top Tracks ───────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300">
            My {tracks.length > 0 ? tracks.length : "12"} most-played tracks
          </h2>
          <span className="font-mono text-xs text-slate-400">last 4 weeks</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : tracks.length > 0 ? (
          <div className="grid grid-cols-4 gap-3">
            {tracks.map((track, i) => (
              <TrackCard key={track.id} track={track} rank={i + 1} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
            <p className="font-mono text-sm text-slate-400">
              No data yet — set up Spotify secrets in GitHub Actions to populate this.
            </p>
            <p className="mt-2 font-mono text-xs text-slate-300 dark:text-slate-600">
              See <code>scripts/fetch-spotify.mjs</code> for setup instructions.
            </p>
          </div>
        )}

        {data?.fetched_at && (
          <p className="text-right font-mono text-[10px] text-slate-300 dark:text-slate-700">
            updated {timeAgo(data.fetched_at)}
          </p>
        )}
      </section>

      <Backlinks nodeId="spotify" />

    </article>
  );
}
