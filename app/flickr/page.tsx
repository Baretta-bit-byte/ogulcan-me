"use client";

import { useEffect, useState } from "react";
import { Camera, ExternalLink } from "lucide-react";
import Backlinks from "@/components/Backlinks";

const DATA_URL =
  "https://raw.githubusercontent.com/Baretta-bit-byte/ogulcan-me/main/public/flickr-data.json";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PhotoUser {
  cloud_name: string;
  photos_count: number;
}

interface FlickrPhoto {
  id: string;
  title: string;
  taken: string | null;
  tags: string[];
  width: number;
  height: number;
  url_thumb: string;
  url_med: string;
  url_large: string;
  page_url: string;
}

interface FlickrData {
  user: PhotoUser | null;
  photos: FlickrPhoto[];
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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-slate-100 dark:bg-slate-800 ${className ?? ""}`} />
  );
}

// ─── Photo Card ───────────────────────────────────────────────────────────────

function PhotoCard({ photo }: { photo: FlickrPhoto }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <a
      href={photo.page_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-xl break-inside-avoid mb-3 bg-slate-100 dark:bg-slate-800"
    >
      {/* Loading skeleton */}
      {!loaded && !failed && (
        <div className="absolute inset-0 animate-pulse bg-slate-100 dark:bg-slate-800" />
      )}

      {/* Photo */}
      {!failed ? (
        <img
          src={photo.url_med}
          alt={photo.title}
          className={`w-full transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => { setFailed(true); setLoaded(true); }}
        />
      ) : (
        <div className="flex aspect-square items-center justify-center text-slate-400">
          <Camera size={24} strokeWidth={1.4} />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="p-3 translate-y-2 transition-transform duration-200 group-hover:translate-y-0">
          {photo.title !== "Untitled" && (
            <p className="text-sm font-medium text-white leading-tight line-clamp-2 mb-1">
              {photo.title}
            </p>
          )}
          <div className="flex items-center gap-2.5 text-white/70 text-[10px]">
            {photo.taken && (
              <span>{formatDate(photo.taken)}</span>
            )}
            {photo.tags.length > 0 && (
              <span className="line-clamp-1">{photo.tags.slice(0, 3).join(" · ")}</span>
            )}
          </div>
        </div>
      </div>

      {/* External link badge */}
      <div className="absolute right-2 top-2 rounded-full bg-black/30 p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
        <ExternalLink size={10} className="text-white" />
      </div>
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FlickrPage() {
  const [data,    setData]    = useState<FlickrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    fetch(DATA_URL, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load Flickr data (${r.status})`);
        return r.json() as Promise<FlickrData>;
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const { user, photos, fetched_at } = data ?? { user: null, photos: [], fetched_at: null };

  return (
    <article className="space-y-10">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera size={22} strokeWidth={1.6} className="text-slate-700 dark:text-slate-300" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Photography
            </h1>
          </div>

        </div>

        {/* Stats row */}
        {!loading && user && (
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Camera size={13} strokeWidth={1.6} />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {user.photos_count.toLocaleString()}
              </span>
              {" "}photos
            </span>
          </div>
        )}

        {loading && (
          <div className="flex gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        )}

        {fetched_at && (
          <p className="font-mono text-[10px] text-slate-400">
            updated {timeAgo(fetched_at)}
          </p>
        )}

        {error && (
          <p className="font-mono text-xs text-red-400">{error}</p>
        )}
      </section>

      {/* ── Photo Grid ───────────────────────────────────────────────────── */}
      <section>
        {loading ? (
          <div className="columns-2 sm:columns-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="mb-3 break-inside-avoid animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                style={{ height: `${140 + (i % 3) * 60}px` }}
              />
            ))}
          </div>
        ) : photos.length > 0 ? (
          <div className="columns-2 sm:columns-3 gap-3">
            {photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
              <Camera size={32} strokeWidth={1.2} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
              <p className="text-sm text-slate-400">
                {error ? "Could not load photos." : "No public photos found."}
              </p>
              {!error && (
                <p className="mt-1 font-mono text-xs text-slate-300 dark:text-slate-600">
                  Set FLICKR_API_KEY + FLICKR_USER_ID to enable.
                </p>
              )}
            </div>
          )
        )}
      </section>

      <Backlinks nodeId="flickr" />

    </article>
  );
}
