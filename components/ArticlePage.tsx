"use client";

import { useEffect, ReactNode } from "react";
import Breadcrumb, { Crumb } from "./Breadcrumb";
import Backlinks from "./Backlinks";
import { useRightPanel, TocItem } from "@/lib/rightPanelContext";
import { graphNodes, Maturity } from "@/lib/graphData";

function tendedAgo(isoDate?: string): string | null {
  if (!isoDate) return null;
  const ms = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

interface Tag {
  label: string;
  variant?: "tech" | "math" | "default";
}

interface ArticlePageProps {
  crumbs?: Crumb[];
  title: string;
  date?: string;
  readTime?: string;
  tags?: Tag[];
  children: ReactNode;
  tocItems?: TocItem[];
  nodeId?: string;
}

const tagStyles: Record<string, string> = {
  tech: "bg-sky-400/10 text-sky-400 border-sky-400/30",
  math: "bg-violet-400/10 text-violet-400 border-violet-400/30",
  default: "bg-slate-400/10 text-slate-400 border-slate-400/30",
};

const MaturityBadge = ({ maturity }: { maturity?: Maturity }) => {
  if (!maturity) return null;
  const config = {
    seedling: { icon: "🌱", label: "Seedling", color: "text-amber-500 dark:text-amber-400 border-amber-500/30 bg-amber-500/10" },
    sapling:  { icon: "🪴", label: "Sapling",  color: "text-emerald-500 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
    evergreen:{ icon: "🌳", label: "Evergreen",color: "text-sky-500 dark:text-sky-400 border-sky-500/30 bg-sky-500/10" },
  };
  const { icon, label, color } = config[maturity];
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${color} mb-6`}>
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-bold uppercase tracking-wider font-sans">{label}</span>
    </div>
  );
};

export default function ArticlePage({
  crumbs,
  title,
  date,
  readTime,
  tags = [],
  children,
  tocItems = [],
  nodeId,
}: ArticlePageProps) {
  const { setTocItems } = useRightPanel();

  // tocItems dizisini bir metne (string'e) çeviriyoruz.
  // Metinler (string) JavaScript'te referansla değil, doğrudan değerle karşılaştırılır!
  const tocItemsString = JSON.stringify(tocItems);

  useEffect(() => {
    // String'e çevirdiğimiz veriyi tekrar diziye çevirip Context'e yolluyoruz
    setTocItems(JSON.parse(tocItemsString));
    
    return () => setTocItems([]);
  }, [setTocItems, tocItemsString]); // <-- DİKKAT: Artık tocItems'ı değil, tocItemsString'i dinliyoruz!

  const currentNode = nodeId ? graphNodes.find(n => n.id === nodeId) : undefined;

  return (
    <article className="space-y-6">
      {crumbs && <Breadcrumb crumbs={crumbs} />}

      <header className="space-y-3">
        <MaturityBadge maturity={currentNode?.maturity} />

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h1>

        {(date || readTime || currentNode?.lastTended) && (
          <p className="font-mono text-sm text-slate-400">
            {date}
            {date && readTime && "  ·  "}
            {readTime}
            {currentNode?.lastTended && (
              <>
                {(date || readTime) && "  ·  "}
                <span className="inline-flex items-center gap-1" title={`Last tended: ${currentNode.lastTended}`}>
                  <span className="text-emerald-500">⟳</span> tended {tendedAgo(currentNode.lastTended)}
                </span>
              </>
            )}
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

      {nodeId && <Backlinks nodeId={nodeId} />}
    </article>
  );
}
