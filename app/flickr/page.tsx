"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react";
import Backlinks from "@/components/Backlinks";

const DATA_URL =
  "https://raw.githubusercontent.com/Baretta-bit-byte/ogulcan-me/main/public/flickr-data.json";

// ─── Forensic fingerprint ─────────────────────────────────────────────────────
// Generates a short hash from browser characteristics.
// Shown on the lightbox overlay — if someone screenshots, the ID is visible,
// making the capture traceable back to the session/device.

function getSessionFingerprint(): string {
  if (typeof window === "undefined") return "000000";
  const raw = [
    navigator.userAgent,
    navigator.language,
    `${screen.width}x${screen.height}`,
    String(new Date().getTimezoneOffset()),
    navigator.hardwareConcurrency ?? 0,
  ].join("|");
  let h = 0x811c9dc5;
  for (let i = 0; i < raw.length; i++) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).slice(0, 6).toUpperCase();
}

function getTimestamp(): string {
  return new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC";
}

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
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-slate-100 dark:bg-slate-800 ${className ?? ""}`} />
  );
}

// ─── CanvasImage ──────────────────────────────────────────────────────────────
// Renders the lightbox image on a <canvas> instead of <img>.
// Benefits: no "Save image as" in context menu, src not exposed in DOM.

function CanvasImage({ src, alt }: { src: string; alt: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")?.drawImage(img, 0, 0);
      setLoaded(true);
    };
    img.src = src;
  }, [src]);

  return (
    <>
      {!loaded && (
        <div
          className="animate-pulse rounded-lg bg-slate-800"
          style={{ width: "min(88vw, 800px)", height: "min(82vh, 600px)" }}
        />
      )}
      <canvas
        ref={canvasRef}
        aria-label={alt}
        className={`rounded-lg shadow-2xl transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0 absolute"}`}
        style={{ maxHeight: "82vh", maxWidth: "88vw" }}
        onContextMenu={(e) => e.preventDefault()}
      />
    </>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

// ─── Forensic Overlay ────────────────────────────────────────────────────────
// Diagonal repeating watermark overlay shown inside the lightbox.
// Visible on any screenshot — ties the capture to the session fingerprint.

function ForensicOverlay() {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const fp = getSessionFingerprint();
    const ts = getTimestamp();
    setLabel(`ogulcantokmak.me · ${ts} · ID:${fp}`);
  }, []);

  if (!label) return null;

  // Render 9 copies in a 3x3 grid, rotated −25°, scaled up so rotation
  // doesn't leave gaps at the corners.
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      style={{ zIndex: 10 }}
    >
      <div
        style={{
          position: "absolute",
          inset: "-50%",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(3, 1fr)",
          transform: "rotate(-25deg)",
          opacity: 0.18,
        }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontFamily: "monospace",
              fontSize: "11px",
              whiteSpace: "nowrap",
              letterSpacing: "0.04em",
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  photos,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  photos: FlickrPhoto[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const photo = photos[index];

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowLeft")   onPrev();
      if (e.key === "ArrowRight")  onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="Close"
      >
        <X size={18} />
      </button>

      {/* Counter */}
      <div className="absolute left-4 top-4 font-mono text-xs text-white/50">
        {index + 1} / {photos.length}
      </div>

      {/* Prev */}
      {photos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-3 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          aria-label="Previous photo"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      {/* Forensic overlay — always rendered, visible on any screenshot */}
      <ForensicOverlay />

      {/* Canvas image — no right-click "Save as", src not in DOM */}
      <AnimatePresence mode="wait">
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
        >
          <CanvasImage src={photo.url_large} alt={photo.title} />
        </motion.div>
      </AnimatePresence>

      {/* Next */}
      {photos.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-3 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          aria-label="Next photo"
        >
          <ChevronRight size={22} />
        </button>
      )}

      {/* Bottom bar */}
      {(photo.title !== "Untitled" || photo.taken || photo.tags.length > 0) && (
        <div
          className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 px-5 py-4 bg-gradient-to-t from-black/70 to-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-0.5">
            {photo.title !== "Untitled" && (
              <p className="text-sm font-medium text-white">{photo.title}</p>
            )}
            {photo.taken && (
              <p className="text-xs text-white/50">{formatDate(photo.taken)}</p>
            )}
          </div>
          {photo.tags.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1.5">
              {photo.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── Photo Card ───────────────────────────────────────────────────────────────

function PhotoCard({ photo, onClick }: { photo: FlickrPhoto; onClick: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <button
      onClick={onClick}
      className="group relative block w-full overflow-hidden rounded-xl break-inside-avoid mb-3 bg-slate-100 dark:bg-slate-800 text-left cursor-zoom-in"
    >
      {/* Loading skeleton */}
      {!loaded && !failed && (
        <div className="absolute inset-0 animate-pulse bg-slate-100 dark:bg-slate-800" />
      )}

      {/* Photo — watermarked, non-draggable */}
      {!failed ? (
        <img
          src={photo.url_med}
          alt={photo.title}
          className={`w-full transition-all duration-300 group-hover:scale-[1.02] select-none ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={() => { setFailed(true); setLoaded(true); }}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
          style={{ WebkitUserDrag: "none" } as React.CSSProperties}
        />
      ) : (
        <div className="flex aspect-square items-center justify-center text-slate-400">
          <Camera size={24} strokeWidth={1.4} />
        </div>
      )}

      {/* Transparent shield — always present, blocks right-click reaching <img> */}
      <div
        className="absolute inset-0"
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none">
        <div className="p-3 translate-y-1 transition-transform duration-200 group-hover:translate-y-0">
          {photo.title !== "Untitled" && (
            <p className="text-xs font-medium text-white leading-tight line-clamp-2">
              {photo.title}
            </p>
          )}
          {photo.taken && (
            <p className="mt-0.5 text-[10px] text-white/60">{formatDate(photo.taken)}</p>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FlickrPage() {
  const [data,         setData]         = useState<FlickrData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [lightboxIdx,  setLightboxIdx]  = useState<number | null>(null);

  // Block common download shortcuts on this page
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["s", "p", "u"].includes(key)) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    fetch(DATA_URL, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load photo data (${r.status})`);
        return r.json() as Promise<FlickrData>;
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const photos = data?.photos ?? [];

  const openLightbox = useCallback((i: number) => setLightboxIdx(i), []);
  const closeLightbox = useCallback(() => setLightboxIdx(null), []);
  const prevPhoto = useCallback(() =>
    setLightboxIdx((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  );
  const nextPhoto = useCallback(() =>
    setLightboxIdx((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length]
  );

  const { user, fetched_at } = data ?? { user: null, fetched_at: null };

  return (
    <article className="space-y-10">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Camera size={22} strokeWidth={1.6} className="text-slate-700 dark:text-slate-300" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Photography
          </h1>
        </div>

        {!loading && user && (
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Camera size={13} strokeWidth={1.6} />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {user.photos_count.toLocaleString()}
            </span>
            photos
          </div>
        )}

        {loading && <Skeleton className="h-4 w-28" />}

        {fetched_at && (
          <p className="font-mono text-[10px] text-slate-400">
            updated {timeAgo(fetched_at)}
          </p>
        )}

        {error && <p className="font-mono text-xs text-red-400">{error}</p>}
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
            {photos.map((photo, i) => (
              <PhotoCard key={photo.id} photo={photo} onClick={() => openLightbox(i)} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
            <Camera size={32} strokeWidth={1.2} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
            <p className="text-sm text-slate-400">
              {error ? "Could not load photos." : "No photos found."}
            </p>
          </div>
        )}
      </section>

      <Backlinks nodeId="flickr" />

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            photos={photos}
            index={lightboxIdx}
            onClose={closeLightbox}
            onPrev={prevPhoto}
            onNext={nextPhoto}
          />
        )}
      </AnimatePresence>

    </article>
  );
}
