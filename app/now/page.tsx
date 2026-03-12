import React from 'react';
import ArticlePage from '@/components/ArticlePage';
import { MapPin, Briefcase, BookOpen } from 'lucide-react';

export default function Now() {
  return (
    <ArticlePage nodeId="now" title="What I'm doing now">
      <p className="text-slate-600 dark:text-slate-400 mb-10 text-lg leading-relaxed">
        A real-time snapshot of my professional focus, geographic location, and active explorations.
        This page acts as a living alternative to a static CV.
      </p>

      <div className="space-y-6 not-prose">
        <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/50 hover:border-sky-400/40 transition-all">
          <div className="absolute inset-y-0 left-0 w-0.5 bg-sky-400/50 group-hover:bg-sky-400 transition-all" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-400" /> Current Location
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Based in <strong className="text-slate-900 dark:text-white">Manisa, Türkiye</strong>. Open to Summer 2026 Software Engineering Internships.
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/50 hover:border-emerald-400/40 transition-all">
          <div className="absolute inset-y-0 left-0 w-0.5 bg-emerald-400/50 group-hover:bg-emerald-400 transition-all" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" /> Primary Focus
          </h2>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li>• Enhancing <strong className="text-slate-900 dark:text-white">ogulcan.me</strong> with a react-force-graph-2d knowledge graph.</li>
            <li>• Deepening understanding of systems architecture and algorithmic efficiency.</li>
          </ul>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/50 hover:border-violet-400/40 transition-all">
          <div className="absolute inset-y-0 left-0 w-0.5 bg-violet-400/50 group-hover:bg-violet-400 transition-all" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-400" /> Exploring
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-3">Translating raw math concepts from Ali Nesin Mathematics Village.</p>
          <div className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-violet-500 dark:text-violet-400">~/math/game-theory</span>
          </div>
        </div>
      </div>
    </ArticlePage>
  );
}
