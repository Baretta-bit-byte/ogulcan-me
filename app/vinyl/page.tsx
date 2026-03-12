"use client";

import { useEffect, useState, useId } from "react";
import { motion } from "framer-motion";
import { Disc3, ExternalLink } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VinylRecord {
  id:     number;
  title:  string;
  artist: string;
  year:   number;
  genre:  string | null;
  image:  string | null;
  url:    string;
}

interface VinylData {
  records: VinylRecord[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Deterministic color from string — for label when no cover art */
function labelHue(seed: string): number {
  let h = 0;
  for (const c of seed) h = ((h * 31) + c.charCodeAt(0)) & 0xfffff;
  return h % 360;
}

/** Repeat "ARTIST • YEAR" enough times to fill a full ring */
function ringText(artist: string, year: number): string {
  const segment = `${artist.toUpperCase()}  •  ${year}  •  `;
  return segment.repeat(4);
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-full bg-slate-100 dark:bg-slate-800 ${className ?? ""}`} />
  );
}

// ─── Vinyl record component ───────────────────────────────────────────────────

function VinylDisc({ record }: { record: VinylRecord }) {
  const [spinning, setSpinning] = useState(false);
  const [imgErr,   setImgErr]   = useState(false);
  const uid = useId().replace(/:/g, "");

  const hue      = labelHue(record.artist + record.title);
  const labelBg  = `hsl(${hue}, 45%, 28%)`;
  const labelRim = `hsl(${hue}, 45%, 38%)`;

  return (
    <a
      href={record.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block"
      onMouseEnter={() => setSpinning(true)}
      onMouseLeave={() => setSpinning(false)}
      aria-label={`${record.artist} — ${record.title}`}
    >
      <motion.div
        className="relative aspect-square w-full"
        animate={{ rotate: spinning ? 360 : 0 }}
        transition={
          spinning
            ? { duration: 3, ease: "linear", repeat: Infinity }
            : { duration: 0.6, ease: "easeOut" }
        }
      >
        {/* ── Vinyl disc body ────────────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-full shadow-xl"
          style={{
            background: `
              repeating-radial-gradient(
                circle at 50% 50%,
                #0d0d0d  0px,  #0d0d0d  1px,
                #1e1e1e  1px,  #1e1e1e  2px,
                #111     2px,  #111     3px,
                #181818  3px,  #181818  4px
              )
            `,
          }}
        />

        {/* ── Arc text: ARTIST • YEAR around the outer rim ───────────── */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <defs>
            {/* Circle path just inside the outer edge */}
            <path
              id={`ring-${uid}`}
              d="M 100,100 m -84,0 a 84,84 0 1,1 168,0 a 84,84 0 1,1 -168,0"
            />
          </defs>
          <text
            fontSize="7"
            letterSpacing="1.5"
            fontFamily="monospace"
            fill={spinning ? `hsl(${hue}, 60%, 65%)` : "#444"}
            style={{ transition: "fill 0.4s" }}
          >
            <textPath href={`#ring-${uid}`} startOffset="0%">
              {ringText(record.artist, record.year)}
            </textPath>
          </text>
        </svg>

        {/* ── Center label ────────────────────────────────────────────── */}
        <div
          className="absolute inset-[22%] rounded-full overflow-hidden shadow-inner"
          style={{
            background: labelBg,
            boxShadow:  `inset 0 0 0 3px ${labelRim}`,
          }}
        >
          {record.image && !imgErr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={record.image}
              alt={record.title}
              className="h-full w-full rounded-full object-cover"
              onError={() => setImgErr(true)}
            />
          ) : (
            /* Initials fallback label */
            <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 px-2 text-center">
              <span
                className="font-mono text-[10px] font-bold leading-tight text-white/80"
                style={{ fontSize: "clamp(6px, 1.8cqi, 11px)" }}
              >
                {record.artist
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 3)
                  .toUpperCase()}
              </span>
              <span
                className="font-mono text-white/40"
                style={{ fontSize: "clamp(5px, 1.4cqi, 9px)" }}
              >
                {record.year}
              </span>
            </div>
          )}
        </div>

        {/* ── Spindle hole ───────────────────────────────────────────── */}
        <div className="absolute inset-[47%] rounded-full bg-black shadow-inner" />

      </motion.div>

      {/* ── Info below the disc (appears on hover) ──────────────────── */}
      <div className="mt-3 space-y-0.5 text-center">
        <p className="truncate text-xs font-semibold text-slate-700 transition-colors group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-slate-100">
          {record.title}
        </p>
        <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">
          {record.artist}
        </p>
        {record.genre && (
          <span className="inline-block rounded-md border border-slate-200 px-1.5 py-0.5 font-mono text-[9px] text-slate-400 dark:border-slate-700 dark:text-slate-600">
            {record.genre}
          </span>
        )}
      </div>

      {/* ── External link badge ─────────────────────────────────────── */}
      <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
          <ExternalLink size={9} className="text-white" />
        </div>
      </div>
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VinylPage() {
  const [data,    setData]    = useState<VinylData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/vinyl-data.json")
      .then((r) => r.json())
      .then((d: VinylData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const records = data?.records ?? [];

  return (
    <article className="space-y-12">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Disc3
              size={22}
              strokeWidth={1.6}
              className="text-slate-700 dark:text-slate-300"
            />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Vinyl
            </h1>
          </div>
          <a
            href="https://www.discogs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-xs text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
          >
            Discogs <ExternalLink size={11} />
          </a>
        </div>
        <p className="font-mono text-sm text-slate-400">
          My owned vinyl records. Hover to spin.
        </p>
      </section>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <section>
        {loading ? (
          <div className="grid grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full" />
                <div className="space-y-1.5 px-2">
                  <div className="mx-auto h-3 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="mx-auto h-2.5 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : records.length > 0 ? (
          <div className="grid grid-cols-4 gap-6">
            {records.map((record) => (
              <VinylDisc key={record.id} record={record} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center dark:border-slate-800">
            <p className="font-mono text-sm text-slate-400">
              No records yet — edit <code>public/vinyl-data.json</code> or set up Discogs secrets.
            </p>
          </div>
        )}
      </section>

      {/* ── Footer note ──────────────────────────────────────────────────── */}
      {!loading && records.length > 0 && (
        <p className="font-mono text-[10px] text-slate-300 dark:text-slate-700">
          Hover a record to spin · click to view on Discogs
        </p>
      )}

    </article>
  );
}
