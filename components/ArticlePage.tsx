"use client";

import { useEffect, ReactNode } from "react";
import Link from "next/link";
import { CornerDownRight } from "lucide-react";
import Breadcrumb, { Crumb } from "./Breadcrumb";
import { useRightPanel, TocItem } from "@/lib/rightPanelContext";
import { graphNodes, graphLinks, Maturity } from "@/lib/graphData";

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

const BacklinksSection = ({ nodeId }: { nodeId?: string }) => {
  if (!nodeId) return null;

  const backlinks = graphLinks
    .filter(link => link.target === nodeId)
    .map(link => graphNodes.find(n => n.id === link.source))
    .filter(Boolean) as typeof graphNodes;

  if (backlinks.length === 0) return null;

  const borderMap: Record<string, string> = {
    tech: "hover:border-sky-400/40",
    math: "hover:border-violet-400/40",
    personal: "hover:border-emerald-400/40",
    root: "hover:border-slate-400/40",
  };
  const accentMap: Record<string, string> = {
    tech: "bg-sky-400/50 group-hover:bg-sky-400",
    math: "bg-violet-400/50 group-hover:bg-violet-400",
    personal: "bg-emerald-400/50 group-hover:bg-emerald-400",
    root: "bg-slate-400/50 group-hover:bg-slate-400",
  };

  return (
    <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2 font-sans">
        <CornerDownRight className="w-5 h-5 text-slate-400" />
        Connected Thoughts
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {backlinks.map(node => (
          <Link key={node.id} href={node.url || (node.type === "root" ? "/" : `/${node.type}/${node.id}`)}>
            <div className={`group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/50 cursor-pointer transition-all ${borderMap[node.type] || borderMap.root}`}>
              <div className={`absolute inset-y-0 left-0 w-0.5 transition-all ${accentMap[node.type] || accentMap.root}`} />
              <h4 className="font-medium text-slate-900 dark:text-slate-200 transition-colors mb-1 font-sans">{node.label}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{node.description}</p>
            </div>
          </Link>
        ))}
      </div>
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

  useEffect(() => {
    setTocItems(tocItems);
    return () => setTocItems([]);
  }, [setTocItems, tocItems]);

  const currentNode = nodeId ? graphNodes.find(n => n.id === nodeId) : undefined;

  return (
    <article className="space-y-6">
      {crumbs && <Breadcrumb crumbs={crumbs} />}

      <header className="space-y-3">
        <MaturityBadge maturity={currentNode?.maturity} />

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

      <BacklinksSection nodeId={nodeId} />
    </article>
  );
}
