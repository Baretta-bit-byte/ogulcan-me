"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FolderGit2,
  Calculator,
  Users,
  Github,
  Music2,
  BookOpen,
  Disc3,
} from "lucide-react";
import Header from "./Header";
import ThemeToggle from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "/",          label: "Home",        icon: Home       },
  { href: "/projects",  label: "Projects",    icon: FolderGit2 },
  { href: "/math",      label: "Mathematics", icon: Calculator },
  { href: "/community", label: "Community",   icon: Users      },
];

const SOON_ITEMS = [
  { label: "GitHub",  icon: Github   },
  { label: "Spotify", icon: Music2   },
  { label: "Books",   icon: BookOpen },
  { label: "Vinyl",   icon: Disc3    },
];

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  // match /projects, /projects/, /projects/anything
  return (
    pathname === href ||
    pathname === `${href}/` ||
    pathname.startsWith(`${href}/`)
  );
}

export default function LeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col bg-slate-50 dark:bg-slate-900">

      {/* Signature */}
      <div className="px-5 pt-6 pb-3">
        <Header />
      </div>

      {/* Floating pill nav — grows to fill remaining height */}
      <nav className="mx-3 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/60 dark:bg-slate-800/70">
        <div className="p-2">

          {/* Live routes */}
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                  active
                    ? "text-slate-900 dark:text-slate-100"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {/* Sliding active background */}
                <AnimatePresence>
                  {active && (
                    <motion.div
                      layoutId="nav-active-bg"
                      className="absolute inset-0 rounded-xl bg-slate-100 dark:bg-slate-700/60"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                </AnimatePresence>

                {/* Content sits above the bg */}
                <span className="relative flex items-center gap-2">
                  {/* Animated bullet */}
                  <motion.span
                    animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400"
                  />
                  <Icon
                    size={14}
                    strokeWidth={active ? 2 : 1.6}
                    className="shrink-0"
                  />
                  <span className={active ? "font-medium" : ""}>{label}</span>
                </span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="mx-1 my-2 border-t border-slate-100 dark:border-slate-700/50" />

          {/* Coming-soon routes */}
          {SOON_ITEMS.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm select-none"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" />
              <Icon
                size={14}
                strokeWidth={1.4}
                className="shrink-0 text-slate-300 dark:text-slate-600"
              />
              <span className="text-slate-300 dark:text-slate-600">{label}</span>
              <span className="ml-auto font-mono text-[9px] tracking-widest text-slate-300 dark:text-slate-600">
                soon
              </span>
            </div>
          ))}

        </div>
      </nav>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-5 py-3">
        <Link
          href="/"
          className="font-mono text-xs text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
        >
          ogulcan.me
        </Link>
        <ThemeToggle />
      </div>

    </aside>
  );
}
