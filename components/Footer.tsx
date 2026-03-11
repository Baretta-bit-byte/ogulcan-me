"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

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

export default function Footer() {
  const pathname = usePathname();
  const parentPath = getParentPath(pathname);
  const parentLabel = getParentLabel(pathname);

  const scrollToTop = () => {
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 pt-8 pb-10">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-3">
          {/* Terminal-style cd .. navigation */}
          {parentPath && (
            <Link
              href={parentPath}
              className="group flex items-center gap-1.5 font-mono text-sm text-slate-400 transition-colors hover:text-slate-200 dark:hover:text-slate-200"
            >
              <span className="text-slate-600 dark:text-slate-600 group-hover:text-sky-400 transition-colors">
                &gt;
              </span>
              <span>
                cd{" "}
                <span className="text-slate-500 dark:text-slate-400 group-hover:text-slate-200 transition-colors">
                  ../{parentLabel}
                </span>
              </span>
            </Link>
          )}

          {/* Copyright */}
          <p className="font-mono text-xs text-slate-500 dark:text-slate-600">
            MIT 2026-PRESENT &copy;{" "}
            <a
              href="https://github.com/Baretta-bit-byte"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              Ogulcan
            </a>
            {" · "}
            <a
              href="https://github.com/Baretta-bit-byte/ogulcan-me"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              source
            </a>
          </p>
        </div>

        {/* Scroll to top */}
        <button
          onClick={scrollToTop}
          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Scroll to top"
        >
          <ArrowUp size={15} />
        </button>
      </div>
    </footer>
  );
}
