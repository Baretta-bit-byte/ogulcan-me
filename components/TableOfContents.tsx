"use client";

import { useEffect, useRef, useState } from "react";
import { TocItem } from "@/lib/rightPanelContext";

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    // Disconnect any previous observer
    observerRef.current?.disconnect();

    const headingElements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    // Track which headings are currently intersecting
    const visibleHeadings = new Set<string>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            visibleHeadings.add(id);
          } else {
            visibleHeadings.delete(id);
          }
        });

        // Pick the first (topmost in DOM order) visible heading
        const firstVisible = items.find((item) => visibleHeadings.has(item.id));
        if (firstVisible) {
          setActiveId(firstVisible.id);
        }
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 }
    );

    headingElements.forEach((el) => observerRef.current!.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [items]);

  if (items.length === 0) return null;

  const handleClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">
      <p className="font-mono text-xs text-slate-400 mb-3">Table of Contents</p>
      <ul className="space-y-1.5">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li
              key={item.id}
              style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
              className={`border-l-2 transition-colors ${
                isActive
                  ? "border-sky-400"
                  : "border-transparent"
              }`}
            >
              <button
                onClick={() => handleClick(item.id)}
                className={`text-left text-sm pl-2 transition-colors leading-snug ${
                  isActive
                    ? "text-sky-400 font-medium"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
