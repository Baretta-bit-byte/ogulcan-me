"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Users, ListMusic, X, Clock } from "lucide-react";
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
  genres:      string[];
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

// Genre → color pill style
function genreStyle(genre: string): string {
  const g = genre.toLowerCase();
  if (/rock|punk|metal|grunge|hard/.test(g))           return "bg-red-500/20 text-red-300 border-red-500/30";
  if (/pop|dance|disco/.test(g))                        return "bg-pink-500/20 text-pink-300 border-pink-500/30";
  if (/hip.hop|rap|trap|drill/.test(g))                 return "bg-orange-500/20 text-orange-300 border-orange-500/30";
  if (/r.b|soul|funk|gospel/.test(g))                   return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  if (/electronic|edm|techno|house|synth|ambient/.test(g)) return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
  if (/indie|alternative|lo.fi/.test(g))                return "bg-violet-500/20 text-violet-300 border-violet-500/30";
  if (/jazz|blues|swing/.test(g))                       return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
  if (/classical|orchestra|opera|baroque/.test(g))      return "bg-purple-500/20 text-purple-300 border-purple-500/30";
  if (/country|folk|bluegrass|acoustic/.test(g))        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (/latin|reggaeton|salsa|cumbia/.test(g))           return "bg-lime-500/20 text-lime-300 border-lime-500/30";
  return "bg-slate-500/20 text-slate-300 border-slate-500/30";
}

// Capitalize genre label nicely
function fmtGenre(genre: string): string {
  return genre.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ─── Dominant color hook ──────────────────────────────────────────────────────

function useDominantColor(imageUrl: string | null): string | null {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) return;
    setColor(null);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 40, 40);
        const data = ctx.getImageData(0, 0, 40, 40).data;

        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 16) {
          const pr = data[i], pg = data[i + 1], pb = data[i + 2];
          const brightness = (pr + pg + pb) / 3;
          // skip near-black and near-white pixels
          if (brightness > 25 && brightness < 230) {
            r += pr; g += pg; b += pb; count++;
          }
        }
        if (count > 0) {
          setColor(`rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`);
        }
      } catch {
        // CORS or canvas error — silently ignore
      }
    };
  }, [imageUrl]);

  return color;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-100 dark:bg-slate-800 ${className ?? ""}`} />;
}

// ─── Embedded Player Bar ──────────────────────────────────────────────────────

function EmbedPlayer({ track, onClose }: { track: SpotifyTrack; onClose: () => void }) {
  // detect theme for iframe
  const isDark = typeof window !== "undefined"
    ? document.documentElement.classList.contains("dark")
    : true;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/60 bg-white/70 px-3 pb-3 pt-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
    >
      <div className="mb-1 flex items-center justify-between px-1">
        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">now playing</span>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Close player"
        >
          <X size={13} />
        </button>
      </div>
      <iframe
        key={track.id}
        src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator${isDark ? "&theme=0" : ""}`}
        width="100%"
        height="80"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-lg"
      />
    </motion.div>
  );
}

// ─── Track card ───────────────────────────────────────────────────────────────

function TrackCard({
  track,
  rank,
  isActive,
  onSelect,
}: {
  track: SpotifyTrack;
  rank: number;
  isActive: boolean;
  onSelect: (track: SpotifyTrack) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const dominantColor = useDominantColor(track.image);

  const accentColor = dominantColor ?? "#1DB954";
  const borderStyle = isActive
    ? { borderColor: `${accentColor}60`, boxShadow: `0 4px 20px ${accentColor}20` }
    : {};

  return (
    <div
      onClick={() => onSelect(track)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={borderStyle}
      className={`group relative cursor-pointer overflow-hidden rounded-xl border bg-white transition-all duration-300 dark:bg-slate-900/50 ${
        isActive
          ? "border-transparent"
          : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
      }`}
    >
      {/* Rank badge */}
      <span className="absolute left-2 top-2 z-10 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white backdrop-blur-sm">
        #{rank}
      </span>

      {/* Album art */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {track.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.image}
            alt={track.album}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ListMusic size={32} className="text-slate-300 dark:text-slate-600" />
          </div>
        )}

        {/* Hover overlay — genre tags + Spotify icon */}
        <AnimatePresence>
          {(hovered || isActive) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3"
              style={{
                background: dominantColor
                  ? `linear-gradient(135deg, ${accentColor}cc 0%, rgba(0,0,0,0.75) 100%)`
                  : "rgba(0,0,0,0.72)",
                backdropFilter: "blur(2px)",
              }}
            >
              {/* Spotify icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1DB954] shadow-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="black" aria-hidden="true">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              </div>

              {/* Genre pills */}
              {(track.genres?.length ?? 0) > 0 && (
                <div className="flex flex-wrap justify-center gap-1">
                  {(track.genres ?? []).slice(0, 3).map((g) => (
                    <span
                      key={g}
                      className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-semibold leading-tight ${genreStyle(g)}`}
                    >
                      {fmtGenre(g)}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active / NOW PLAYING badge */}
        {isActive && (
          <div
            className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md px-2 py-0.5"
            style={{ backgroundColor: accentColor }}
          >
            <span className="font-mono text-[9px] font-bold text-black">NOW PLAYING</span>
          </div>
        )}
      </div>

      {/* Track info */}
      <div className="space-y-1 p-3">
        <p
          className="truncate text-sm font-semibold transition-colors duration-200"
          style={hovered || isActive ? { color: accentColor } : {}}
        >
          {!hovered && !isActive && (
            <span className="text-slate-800 dark:text-slate-100">{track.name}</span>
          )}
          {(hovered || isActive) && track.name}
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
            className="ml-auto text-slate-300 dark:text-slate-600 transition-colors group-hover:text-[#1DB954]"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SpotifyPage() {
  const [data,        setData]        = useState<SpotifyData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [activeTrack, setActiveTrack] = useState<SpotifyTrack | null>(null);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/Baretta-bit-byte/ogulcan-me/main/public/spotify-data.json")
      .then((r) => r.json())
      .then((d: SpotifyData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const profile = data?.profile ?? null;
  const tracks  = data?.tracks  ?? [];

  return (
    <article className={`space-y-12 ${activeTrack ? "pb-24" : ""}`}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#1DB954" aria-hidden="true">
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
            className="flex items-center gap-1.5 font-mono text-xs text-slate-400 transition-colors hover:text-[#1DB954]"
          >
            Browse Playlists <ExternalLink size={11} />
          </a>
        </div>

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : tracks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {tracks.map((track, i) => (
              <TrackCard
                key={track.id}
                track={track}
                rank={i + 1}
                isActive={activeTrack?.id === track.id}
                onSelect={setActiveTrack}
              />
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

      {/* ── Embedded Spotify Player ───────────────────────────────────────── */}
      <AnimatePresence>
        {activeTrack && (
          <EmbedPlayer
            track={activeTrack}
            onClose={() => setActiveTrack(null)}
          />
        )}
      </AnimatePresence>

    </article>
  );
}
