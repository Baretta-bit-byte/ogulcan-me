import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { graphNodes, graphLinks } from "@/lib/graphData";

export interface Crumb {
  label: string;
  href?: string;
  /** graphData node id — when set, shows maturity badge + connection count */
  nodeId?: string;
}

const maturityIcon: Record<string, string> = {
  seedling: "🌱",
  sapling: "🪴",
  evergreen: "🌳",
};

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  // Connection count for the *last* crumb (current page)
  const lastCrumb = crumbs[crumbs.length - 1];
  const node = lastCrumb?.nodeId
    ? graphNodes.find((n) => n.id === lastCrumb.nodeId)
    : undefined;
  const connectionCount = lastCrumb?.nodeId
    ? graphLinks.filter(
        (l) => l.source === lastCrumb.nodeId || l.target === lastCrumb.nodeId
      ).length
    : 0;

  return (
    <nav className="flex items-center gap-1 text-sm text-slate-400 mb-8">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={13} className="text-slate-600" />}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="hover:text-slate-200 transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-slate-300">{crumb.label}</span>
          )}
        </span>
      ))}

      {/* Graph info for current page */}
      {node && (
        <span className="ml-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
          {node.maturity && (
            <span title={node.maturity}>{maturityIcon[node.maturity]}</span>
          )}
          {connectionCount > 0 && (
            <span className="font-mono tabular-nums" title={`${connectionCount} graph connections`}>
              {connectionCount}↔
            </span>
          )}
        </span>
      )}
    </nav>
  );
}
