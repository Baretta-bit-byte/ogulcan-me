"use client";

import { useEffect, useState } from "react";
import { ExternalLink, BookOpen, Star } from "lucide-react";
import Backlinks from "@/components/Backlinks";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Book {
  isbn:     string;
  title:    string;
  author:   string;
  finished?: string;   // ISO date string
  rating:   1 | 2 | 3 | 4 | 5;
  url?:     string;
  my_note?: string;
  status?:  "reading" | "finished";
  progress?: number; // 0-100
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function coverUrl(isbn: string, size: "S" | "M" | "L" = "M"): string {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year:  "numeric",
  });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-slate-100 dark:bg-slate-800 ${className ?? ""}`} />
  );
}

// ─── Book card ────────────────────────────────────────────────────────────────

function BookCard({ book }: { book: Book }) {
  const [imgErr, setImgErr] = useState(false);
  const [hovered, setHovered] = useState(false);

  const Wrapper = book.url ? "a" : "div";
  const linkProps = book.url
    ? { href: book.url, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper
      {...linkProps}
      className="group relative block overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-violet-400/40 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {!imgErr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl(book.isbn)}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgErr(true)}
          />
        ) : (
          /* Fallback when Open Library has no cover */
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center">
            <BookOpen size={24} className="text-slate-300 dark:text-slate-600" />
            <span className="text-[10px] leading-tight text-slate-400">{book.title}</span>
          </div>
        )}

        {/* Hover overlay — title, author, stars, date */}
        {hovered && (
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold leading-tight text-white line-clamp-2">
                {book.title}
              </p>
              <p className="text-[10px] leading-tight text-white/70 line-clamp-1">
                {book.author}
              </p>

              {/* Personal note */}
              {book.my_note && (
                <p className="text-[9px] leading-snug text-amber-200/80 italic line-clamp-2">
                  &ldquo;{book.my_note}&rdquo;
                </p>
              )}

              {/* Star rating */}
              <div className="flex items-center gap-0.5 pt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={9}
                    className={
                      i < book.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-white/30"
                    }
                  />
                ))}
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="font-mono text-[9px] text-white/50">
                  {book.finished ? fmtDate(book.finished) : ""}
                </span>
                {book.url && (
                  <ExternalLink size={9} className="text-white/50" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Wrapper>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BooksPage() {
  const [books,   setBooks]   = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/books-data.json")
      .then((r) => r.json())
      .then((data: Book[]) => {
        // Separate currently reading from finished
        const finished = data
          .filter((b) => b.status !== "reading")
          .sort((a, b) => new Date(b.finished ?? "").getTime() - new Date(a.finished ?? "").getTime());
        const reading = data.filter((b) => b.status === "reading");
        setBooks([...reading, ...finished]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentlyReading = books.filter((b) => b.status === "reading");
  const finishedBooks = books.filter((b) => b.status !== "reading");

  return (
    <article className="space-y-12">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen
              size={22}
              strokeWidth={1.6}
              className="text-slate-700 dark:text-slate-300"
            />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Reading Log
            </h1>
          </div>
        </div>
        <p className="font-mono text-sm text-slate-400">
          The last {books.length > 0 ? books.length : "12"} books I read and finished.
        </p>
      </section>

      {/* ── Currently Reading ──────────────────────────────────────────── */}
      {!loading && currentlyReading.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-mono font-semibold text-slate-400 uppercase tracking-widest">
            Currently Reading
          </h2>
          <div className="space-y-3">
            {currentlyReading.map((book) => (
              <div
                key={book.isbn}
                className="group relative overflow-hidden rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4 flex items-center gap-4"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-emerald-400" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverUrl(book.isbn)}
                  alt={book.title}
                  className="w-12 h-auto rounded-lg shadow-sm shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{book.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{book.author.split(",")[0]}</p>
                  {book.my_note && (
                    <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-1">{book.my_note}</p>
                  )}
                  {book.progress != null && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-400 transition-all"
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-emerald-500 tabular-nums">{book.progress}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <section>
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
            ))}
          </div>
        ) : finishedBooks.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {finishedBooks.map((book) => (
              <BookCard key={book.isbn} book={book} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center dark:border-slate-800">
            <p className="font-mono text-sm text-slate-400">
              No books yet — edit <code>public/books-data.json</code> to add entries.
            </p>
          </div>
        )}
      </section>

      {/* ── Footer note ──────────────────────────────────────────────────── */}
      {!loading && books.length > 0 && (
        <p className="font-mono text-[10px] text-slate-300 dark:text-slate-700">
          Covers via Open Library · hover a cover to see details
        </p>
      )}

      <Backlinks nodeId="books" />

    </article>
  );
}
