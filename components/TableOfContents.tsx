"use client";

import { TocItem } from "@/lib/rightPanelContext";

export default function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;

  const handleClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">
      <p className="font-mono text-xs text-slate-400 mb-3">Table of Contents</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 12}px` }}>
            <button
              onClick={() => handleClick(item.id)}
              className="text-left text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors leading-snug"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
