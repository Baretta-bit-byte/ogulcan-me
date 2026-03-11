"use client";

import { useEffect, ReactNode } from "react";
import Breadcrumb, { Crumb } from "./Breadcrumb";
import { useRightPanel, TocItem } from "@/lib/rightPanelContext";

interface Tag {
  label: string;
  variant?: "tech" | "math" | "default";
}

interface ArticlePageProps {
  crumbs: Crumb[];
  title: string;
  date?: string;
  readTime?: string;
  tags?: Tag[];
  children: ReactNode;
  tocItems?: TocItem[];
}

const tagStyles: Record<string, string> = {
  tech: "bg-sky-400/10 text-sky-400 border-sky-400/30",
  math: "bg-violet-400/10 text-violet-400 border-violet-400/30",
  default: "bg-slate-400/10 text-slate-400 border-slate-400/30",
};

export default function ArticlePage({
  crumbs,
  title,
  date,
  readTime,
  tags = [],
  children,
  tocItems = [],
}: ArticlePageProps) {
  const { setTocItems } = useRightPanel();

  useEffect(() => {
    setTocItems(tocItems);
    return () => setTocItems([]);
  }, [setTocItems, tocItems]);

  return (
    <article className="space-y-6">
      <Breadcrumb crumbs={crumbs} />

      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h1>

        {(date || readTime) && (
          <p className="font-mono text-sm text-slate-400">
            {date}
            {date && readTime && "  ·  "}
            {readTime}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag.label}
                className={`rounded-md border px-2.5 py-0.5 font-mono text-xs ${
                  tagStyles[tag.variant ?? "default"]
                }`}
              >
                #{tag.label}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-7 prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-a:no-underline prose-code:font-mono prose-code:text-sky-400 dark:prose-code:text-sky-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm">
        {children}
      </div>
    </article>
  );
}
