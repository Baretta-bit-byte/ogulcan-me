"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, Lightbulb } from "lucide-react";
import { useRouter } from "next/navigation";
import { graphNodes } from "@/lib/graphData";

interface SearchEntry {
  type: "post" | "til";
  slug: string;
  title: string;
  description: string;
  content: string;
  url: string;
}

function getSnippet(content: string, query: string, radius = 60): string {
  const lower = content.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return content.slice(0, 120) + "...";
  const start = Math.max(0, idx - radius);
  const end = Math.min(content.length, idx + query.length + radius);
  let snippet = "";
  if (start > 0) snippet += "...";
  snippet += content.slice(start, end);
  if (end < content.length) snippet += "...";
  return snippet;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchIndex, setSearchIndex] = useState<SearchEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load search index on first open
  const indexLoaded = useRef(false);
  useEffect(() => {
    if (isOpen && !indexLoaded.current) {
      indexLoaded.current = true;
      fetch("/search-index.json")
        .then((r) => r.json())
        .then((data) => setSearchIndex(data))
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Page results (graph nodes)
  const pageResults = useMemo(() => {
    if (!search) return graphNodes.filter((n) => n.id !== "home");
    return graphNodes.filter(
      (n) =>
        n.label.toLowerCase().includes(search.toLowerCase()) ||
        (n.description && n.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search]);

  // Content results (posts + TIL full-text)
  const contentResults = useMemo(() => {
    if (search.length < 2) return [];
    const q = search.toLowerCase();
    return searchIndex
      .filter(
        (entry) =>
          entry.title.toLowerCase().includes(q) ||
          entry.description.toLowerCase().includes(q) ||
          entry.content.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [search, searchIndex]);

  const allResults = useMemo(() => {
    const pages = pageResults.map((n) => ({
      id: `page-${n.id}`,
      label: n.label,
      description: n.description ?? "",
      url: n.url || `/${n.id}`,
      type: n.type,
      kind: "page" as const,
    }));
    const content = contentResults.map((e) => ({
      id: `content-${e.type}-${e.slug}`,
      label: e.title,
      description: getSnippet(e.content, search),
      url: e.url,
      type: e.type,
      kind: "content" as const,
    }));
    return [...pages, ...content];
  }, [pageResults, contentResults, search]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const navigate = useCallback(
    (url: string) => {
      router.push(url);
      setIsOpen(false);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && allResults[selectedIndex]) {
      e.preventDefault();
      navigate(allResults[selectedIndex].url);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const badgeColorMap: Record<string, string> = {
    tech: "text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-400/10",
    math: "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-400/10",
    personal: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10",
    root: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-400/10",
  };

  const hasPages = pageResults.length > 0;
  const hasContent = contentResults.length > 0;
  let runningIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-slate-900/20 dark:bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <Search className="w-5 h-5 text-slate-400 mr-3" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search pages and content... (Ctrl+K)"
                className="flex-1 bg-transparent text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-lg font-sans"
              />
              <kbd className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded text-xs font-mono">
                esc
              </kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {allResults.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No results found for &ldquo;{search}&rdquo;
                </div>
              ) : (
                <>
                  {/* Pages section */}
                  {hasPages && search && (
                    <div className="px-3 pt-2 pb-1 text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest">
                      Pages
                    </div>
                  )}
                  {pageResults.map((node) => {
                    runningIndex++;
                    const idx = runningIndex;
                    return (
                      <div
                        key={node.id}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => navigate(node.url || `/${node.id}`)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                          idx === selectedIndex
                            ? "bg-slate-100 dark:bg-slate-800"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 dark:text-slate-200">
                              {node.label}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                                badgeColorMap[node.type] || badgeColorMap.root
                              }`}
                            >
                              {node.type}
                            </span>
                          </div>
                          {node.description && (
                            <div className="text-sm text-slate-500 mt-1 truncate">
                              {node.description}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Content section */}
                  {hasContent && (
                    <>
                      <div className="px-3 pt-3 pb-1 text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest">
                        Content
                      </div>
                      {contentResults.map((entry) => {
                        runningIndex++;
                        const idx = runningIndex;
                        const Icon = entry.type === "post" ? FileText : Lightbulb;
                        return (
                          <div
                            key={`${entry.type}-${entry.slug}`}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            onClick={() => navigate(entry.url)}
                            className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                              idx === selectedIndex
                                ? "bg-slate-100 dark:bg-slate-800"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            }`}
                          >
                            <Icon
                              size={14}
                              className="mt-1 shrink-0 text-slate-400"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-slate-900 dark:text-slate-200 text-sm">
                                  {entry.title}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-400/10">
                                  {entry.type}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                {getSnippet(entry.content, search)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
