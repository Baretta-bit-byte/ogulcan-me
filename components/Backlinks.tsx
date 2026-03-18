"use client";

import Link from "next/link";
import { CornerDownRight, ArrowUpRight } from "lucide-react";
import { graphNodes, graphLinks, type GraphNode } from "@/lib/graphData";

function tendedAgo(isoDate?: string): string | null {
  if (!isoDate) return null;
  const ms = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1mo ago" : `${months}mo ago`;
}

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

function nodeUrl(node: GraphNode): string {
  return node.url || `/${node.id}`;
}

function NodeCard({ node }: { node: GraphNode }) {
  return (
    <Link href={nodeUrl(node)}>
      <div
        className={`group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/50 cursor-pointer transition-all ${borderMap[node.type] || borderMap.root}`}
      >
        <div
          className={`absolute inset-y-0 left-0 w-0.5 transition-all ${accentMap[node.type] || accentMap.root}`}
        />
        <h4 className="font-medium text-slate-900 dark:text-slate-200 transition-colors mb-1 font-sans">
          {node.label}
        </h4>
        {node.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
            {node.description}
          </p>
        )}
        {node.lastTended && (
          <p className="mt-1.5 text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <span className="text-emerald-500">⟳</span> tended {tendedAgo(node.lastTended)}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function Backlinks({ nodeId }: { nodeId: string }) {
  // Incoming: nodes that link TO this page
  const incoming = graphLinks
    .filter((link) => link.target === nodeId && link.source !== "home")
    .map((link) => graphNodes.find((n) => n.id === link.source))
    .filter(Boolean) as GraphNode[];

  // Outgoing: nodes this page links TO
  const outgoing = graphLinks
    .filter((link) => link.source === nodeId)
    .map((link) => graphNodes.find((n) => n.id === link.target))
    .filter(Boolean) as GraphNode[];

  if (incoming.length === 0 && outgoing.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-8">
      {incoming.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2 font-sans">
            <CornerDownRight className="w-4 h-4 text-slate-400" />
            Mentioned by
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {incoming.map((node) => (
              <NodeCard key={node.id} node={node} />
            ))}
          </div>
        </div>
      )}

      {outgoing.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2 font-sans">
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
            Links to
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {outgoing.map((node) => (
              <NodeCard key={node.id} node={node} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
