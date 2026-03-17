import React from 'react';
import Link from 'next/link';
import { graphNodes, graphLinks } from '@/lib/graphData';
import type { Maturity } from '@/lib/graphData';
import { FolderGit2, Sigma, User } from 'lucide-react';
import Backlinks from "@/components/Backlinks";

const maturityEmoji: Record<Maturity, string> = {
  seedling: "\u{1F331}",
  sapling: "\u{1FAB4}",
  evergreen: "\u{1F333}",
};

export default function TopicsPage() {
  const techNodes = graphNodes.filter(n => n.type === 'tech');
  const mathNodes = graphNodes.filter(n => n.type === 'math');
  const personalNodes = graphNodes.filter(n => n.type === 'personal');

  /* Parent nodes: those that are sources linking to other non-home nodes */
  const parentIds = new Set(
    graphLinks
      .filter(l => l.source !== 'home')
      .map(l => l.source)
  );

  const Section = ({ title, icon: Icon, nodes, colorClass, borderClass, hoverClass }: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    nodes: typeof graphNodes;
    colorClass: string;
    borderClass: string;
    hoverClass: string;
  }) => {
    /* Separate parent (hub) nodes from leaf nodes */
    const hubs = nodes.filter(n => parentIds.has(n.id));
    const leaves = nodes.filter(n => !parentIds.has(n.id));

    return (
      <div className="mb-12">
        <h2 className={`text-2xl font-bold flex items-center gap-2 mb-6 ${colorClass}`}>
          <Icon className="w-6 h-6" /> {title}
        </h2>

        {/* Hub / parent cards — full-width */}
        {hubs.map((node) => (
          <Link key={node.id} href={node.url || `/${node.type}/${node.id}`}>
            <div className={`group relative overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 p-5 mb-4 bg-white dark:bg-slate-900/50 cursor-pointer transition-all ${hoverClass}`}>
              <div className={`absolute inset-y-0 left-0 w-1.5 opacity-70 transition-all ${borderClass} group-hover:opacity-100`} />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
                {node.maturity && <span title={node.maturity}>{maturityEmoji[node.maturity]}</span>}
                {node.label}
              </h3>
              {node.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{node.description}</p>
              )}
            </div>
          </Link>
        ))}

        {/* Leaf cards — 2-col grid, last card spans full width when odd */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leaves.map((node, i) => (
            <Link
              key={node.id}
              href={node.url || `/${node.type}/${node.id}`}
              className={leaves.length % 2 === 1 && i === leaves.length - 1 ? 'md:col-span-2' : ''}
            >
              <div className={`group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/50 cursor-pointer transition-all ${hoverClass}`}>
                <div className={`absolute inset-y-0 left-0 w-1 opacity-50 transition-all ${borderClass} group-hover:opacity-100`} />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  {node.maturity && <span title={node.maturity}>{maturityEmoji[node.maturity]}</span>}
                  {node.label}
                </h3>
                {node.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{node.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 font-sans">
      <section className="mt-6 mb-10 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Maps of Content
        </h1>
        <p className="font-mono text-sm text-slate-400">
          A structured directory of the digital garden, bypassing the graph view.
        </p>
      </section>
      <Section
        title="Technology & Engineering"
        icon={FolderGit2}
        nodes={techNodes}
        colorClass="text-sky-500"
        borderClass="bg-sky-500"
        hoverClass="hover:border-sky-500/40"
      />
      <Section
        title="Mathematics"
        icon={Sigma}
        nodes={mathNodes}
        colorClass="text-violet-500"
        borderClass="bg-violet-500"
        hoverClass="hover:border-violet-500/40"
      />
      <Section
        title="Personal & Community"
        icon={User}
        nodes={personalNodes}
        colorClass="text-emerald-500"
        borderClass="bg-emerald-500"
        hoverClass="hover:border-emerald-500/40"
      />

      <Backlinks nodeId="topics" />
    </div>
  );
}
