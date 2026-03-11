"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FolderGit2,
  Calculator,
  Users,
} from "lucide-react";
import Header from "./Header";
import ThemeToggle from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/projects", label: "Projects", icon: FolderGit2 },
  { href: "/math", label: "Mathematics", icon: Calculator },
  { href: "/community", label: "Community", icon: Users },
];

export default function LeftSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      {/* Signature */}
      <div className="px-4 pt-6 pb-2">
        <Header />
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-0.5 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800/60 dark:hover:text-slate-300"
              }`}
            >
              <Icon size={15} strokeWidth={1.6} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer: theme toggle + name */}
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">
        <span className="font-mono text-xs text-slate-400">ogulcan.me</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
