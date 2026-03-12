import React from 'react';
import Link from 'next/link';
import { graphNodes } from '@/lib/graphData';
import { FolderGit2, Sigma, User } from 'lucide-react';

export default function TopicsPage() {
  const techNodes = graphNodes.filter(n => n.type === 'tech');
  const mathNodes = graphNodes.filter(n => n.type === 'math');
  const personalNodes = graphNodes.filter(n => n.type === 'personal');

  const Section = ({ title, icon: Icon, nodes, colorClass, borderClass, hoverClass }: {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    nodes: typeof graphNodes;
    colorClass: string;
    borderClass: string;
    hoverClass: string;
  }) => (
    <div className="mb-12">
      <h2 className={`text-2xl font-bold flex items-center gap-2 mb-6 ${colorClass}`}>
        <Icon className="w-6 h-6" /> {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nodes.map((node) => (
          <Link key={node.id} href={node.url || `/${node.type}/${node.id}`}>
            <div className={`group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900/50 cursor-pointer transition-all ${hoverClass}`}>
              <div className={`absolute inset-y-0 left-0 w-1 opacity-50 transition-all ${borderClass} group-hover:opacity-100`} />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{node.label}</h3>
              {node.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{node.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-24 font-sans">
      <div className="mt-6 mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
          Maps of Content
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          A structured directory of the digital garden, bypassing the graph view.
        </p>
      </div>
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
    </div>
  );
}
