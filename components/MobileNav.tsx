"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
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
} from "lucide-react";
import Header from "./Header";
import ThemeToggle from "./ThemeToggle";

// ─── Grouped nav items (mirrored from LeftSidebar) ───────────────────────────

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

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Fixed top bar ──────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-slate-200/50 bg-white/50 px-4 backdrop-blur-xl dark:border-slate-700/30 dark:bg-slate-900/40 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Menu size={20} strokeWidth={1.6} />
        </button>

        {/* Signature — scaled down for mobile bar */}
        <Link href="/" aria-label="Home" className="scale-[0.65] origin-center">
          <Header />
        </Link>

        <ThemeToggle />
      </div>

      {/* ── Drawer ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.aside
              className="fixed top-0 left-0 bottom-0 z-50 flex w-64 flex-col bg-white/70 shadow-xl backdrop-blur-xl dark:bg-slate-900/70 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0.08, duration: 0.35 }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <Link href="/" onClick={() => setOpen(false)}>
                  <Header />
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Nav links — scrollable, grouped */}
              <nav className="flex-1 overflow-y-auto px-3 pb-4">
                {NAV_GROUPS.map((group, gi) => (
                  <div key={group.title}>
                    {/* Group label */}
                    <div className={`px-3 pb-1 ${gi === 0 ? "pt-1" : "pt-3"}`}>
                      <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
                        {group.title}
                      </span>
                    </div>

                    {/* Group items */}
                    <div className="space-y-0.5">
                      {group.items.map(({ href, label, icon: Icon }) => {
                        const active = isActive(href, pathname);
                        return (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                              active
                                ? "bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                            }`}
                          >
                            {active && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                            )}
                            <Icon
                              size={15}
                              strokeWidth={active ? 2 : 1.5}
                              className="shrink-0"
                            />
                            {label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Footer */}
              <div className="border-t border-slate-200/50 px-5 py-3 dark:border-slate-700/30">
                <span className="font-mono text-xs text-slate-400">ogulcan.me</span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
