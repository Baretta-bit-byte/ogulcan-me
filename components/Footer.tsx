"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ArrowUp, Mail, Github, Linkedin, Instagram } from "lucide-react";

// ─── cd ../ navigation helpers ───────────────────────────────────────────────
function getParentPath(pathname: string): string | null {
  if (pathname === "/") return null;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 1) return "/";
  return "/" + parts.slice(0, -1).join("/");
}

function getParentLabel(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return "~";
  return parts[parts.length - 2];
}

// ─── Social links ─────────────────────────────────────────────────────────────
// Update hrefs with your actual handles.
const SOCIAL = [
  {
    icon: Github,
    href: "https://github.com/Baretta-bit-byte",
    label: "GitHub",
  },
  {
    icon: Linkedin,
    href: "https://linkedin.com/in/ogulcantokmak",
    label: "LinkedIn",
  },
  {
    icon: Instagram,
    href: "https://instagram.com/ogulcantokmak",
    label: "Instagram",
  },
  {
    icon: Mail,
    href: "mailto:ogulcan@ogulcantokmak.me",
    label: "Email",
  },
];

// ─── Konami code easter egg ───────────────────────────────────────────────────
const KONAMI = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
  "b","a",
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Footer() {
  const pathname    = usePathname();
  const parentPath  = getParentPath(pathname);
  const parentLabel = getParentLabel(pathname);

  const [eggOpen,   setEggOpen]   = useState(false);
  const [konamiIdx, setKonamiIdx] = useState(0);
  const [konamiHit, setKonamiHit] = useState(false);

  // Konami code listener
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === KONAMI[konamiIdx]) {
        const next = konamiIdx + 1;
        if (next === KONAMI.length) {
          setKonamiHit(true);
          setKonamiIdx(0);
          setTimeout(() => setKonamiHit(false), 3500);
        } else {
          setKonamiIdx(next);
        }
      } else {
        setKonamiIdx(0);
      }
    },
    [konamiIdx]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const scrollToTop = () => {
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-20 space-y-6 border-t border-slate-200 pb-10 pt-8 dark:border-slate-800">

      {/* ── Connect with me ────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Connect with me
          </span>

          <div className="flex items-center gap-0.5">
            {SOCIAL.map(({ icon: Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                whileHover={{ scale: 1.18 }}
                whileTap={{ scale: 0.88 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <Icon size={16} strokeWidth={1.6} />
              </motion.a>
            ))}
          </div>
        </div>

        <p className="font-mono text-xs text-slate-400 dark:text-slate-600">
          Made with ♥ in İzmir ·{" "}
          <a
            href="https://github.com/Baretta-bit-byte/ogulcan-me"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-slate-600 dark:hover:text-slate-400"
          >
            view source
          </a>
        </p>
        <p className="flex items-center gap-1.5 font-mono text-[10px] text-slate-300 dark:text-slate-700 mt-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
          All content on this site is human-authored
        </p>
      </div>

      {/* ── Bottom row ─────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">

          {/* Terminal cd ../ navigation */}
          {parentPath && (
            <Link
              href={parentPath}
              className="group flex items-center gap-1.5 font-mono text-sm text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
            >
              <span className="transition-colors group-hover:text-sky-400">
                &gt;
              </span>
              <span>
                cd{" "}
                <span className="text-slate-500 transition-colors group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-200">
                  ../{parentLabel}
                </span>
              </span>
            </Link>
          )}

          {/* Copyright + easter egg trigger */}
          <p className="flex items-center gap-1.5 font-mono text-xs text-slate-500 dark:text-slate-600">
            <span>MIT 2026 &copy; Ogulcan</span>
            <span>·</span>
            <a
              href="https://github.com/Baretta-bit-byte"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-slate-400"
            >
              Baretta-bit-byte
            </a>

            {/* ── Easter egg: ~ button ───────────────────────────────── */}
            <span className="relative">
              <button
                onClick={() => setEggOpen((v) => !v)}
                onBlur={() => setEggOpen(false)}
                aria-label="Easter egg"
                className="ml-1 cursor-pointer text-slate-300 transition-colors hover:text-slate-500 dark:text-slate-700 dark:hover:text-slate-500"
              >
                ~
              </button>

              <AnimatePresence>
                {eggOpen && (
                  <motion.span
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                    className="absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] leading-relaxed text-slate-600 shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    built with curiosity,
                    <br />
                    caffeine, and Claude.
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </p>
        </div>

        {/* Scroll to top */}
        <button
          onClick={scrollToTop}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Scroll to top"
        >
          <ArrowUp size={15} />
        </button>
      </div>

      {/* ── Konami code reward ─────────────────────────────────────────── */}
      <AnimatePresence>
        {konamiHit && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-sky-400/30 bg-sky-400/5 px-4 py-3 font-mono text-xs text-sky-500 dark:text-sky-400"
          >
            ↑↑↓↓←→←→BA — nice. you found it.
            <span className="ml-2 text-slate-400">
              this easter egg has been here all along.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

    </footer>
  );
}
