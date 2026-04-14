"use client";

import React from "react";
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
  Clock,
  Map,
  Wrench,
  PenLine,
  Camera,
  Gamepad2,
  Lightbulb,
  BarChart2,
  UserRound,
  Tag,
  Bookmark,
  ScrollText,
  Crown,
} from "lucide-react";
import Header from "./Header";
import ThemeToggle from "./ThemeToggle";

// ─── Grouped navigation ──────────────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Me",
    items: [
      { href: "/",      label: "Home",   icon: Home      },
      { href: "/about", label: "/about", icon: UserRound },
      { href: "/now",   label: "/now",   icon: Clock     },
    ],
  },
  {
    title: "Build",
    items: [
      { href: "/projects", label: "Projects", icon: FolderGit2 },
      { href: "/github",   label: "GitHub",   icon: Github     },
      { href: "/uses",     label: "/uses",    icon: Wrench     },
    ],
  },
  {
    title: "Learn",
    items: [
      { href: "/math",  label: "Mathematics", icon: Calculator },
      { href: "/posts", label: "Writing",     icon: PenLine    },
      { href: "/til",   label: "TIL",         icon: Lightbulb  },
      { href: "/tags",  label: "Tags",        icon: Tag        },
    ],
  },
  {
    title: "Connect",
    items: [
      { href: "/community", label: "Community", icon: Users    },
      { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
    ],
  },
  {
    title: "Media",
    items: [
      { href: "/spotify", label: "Spotify",     icon: Music2   },
      { href: "/books",   label: "Books",       icon: BookOpen },
      { href: "/vinyl",   label: "Vinyl",       icon: Disc3    },
      { href: "/flickr",  label: "Photography", icon: Camera   },
      { href: "/steam",   label: "Gaming",      icon: Gamepad2 },
    ],
  },
  {
    title: "Game",
    items: [
      { href: "/knights-tour", label: "Knight's Tour", icon: Crown },
    ],
  },
  {
    title: "Meta",
    items: [
      { href: "/topics",   label: "Topics",    icon: Map        },
      { href: "/stats",    label: "/stats",    icon: BarChart2  },
      { href: "/colophon", label: "/colophon", icon: ScrollText },
    ],
  },
];

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return (
    pathname === href ||
    pathname === `${href}/` ||
    pathname.startsWith(`${href}/`)
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex h-screen w-56 shrink-0 flex-col bg-transparent">

      {/* Signature */}
      <div className="px-5 pt-6 pb-3">
        <Header />
      </div>

      {/* Floating pill nav */}
      <nav className="mx-3 flex-1 overflow-hidden rounded-2xl border border-slate-200/50 bg-white/60 shadow-sm backdrop-blur-md dark:border-slate-700/30 dark:bg-slate-800/40">
        <div className="h-full overflow-y-auto p-2">

          {NAV_GROUPS.map((group, gi) => (
            <div key={group.title}>
              {/* Group label */}
              <div className={`px-3 pb-0.5 ${gi === 0 ? "pt-1" : "pt-2.5"}`}>
                <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-slate-300 dark:text-slate-600">
                  {group.title}
                </span>
              </div>

              {/* Group items */}
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href, pathname);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm transition-colors ${
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
