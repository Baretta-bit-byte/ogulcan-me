import React from 'react';
import ArticlePage from '@/components/ArticlePage';
import NowWidgets from '@/components/NowWidgets';
import { MapPin, Briefcase, BookOpen, Send } from 'lucide-react';

export default function Now() {
  return (
    <ArticlePage nodeId="now" title="What I'm doing now">
      {/* Narrative intro */}
      <div className="mb-10 space-y-4">
        <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
          I&apos;m a computer science student based in <strong className="text-slate-900 dark:text-white">Manisa, Türkiye</strong>,
          currently in my third year. Most of my days are split between coursework in algorithms and
          systems architecture, and building tools I actually want to use.
        </p>
        <p className="text-slate-600 dark:text-slate-300 leading-7">
          Right now I&apos;m focused on growing this digital garden into a living portfolio —
          every page here is a node in an interconnected knowledge graph, not a static bullet point on a resume.
          I&apos;m also deepening my understanding of distributed systems and formal methods in mathematics.
        </p>
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-400/30 bg-amber-400/5">
          <Send className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-600 dark:text-amber-300">
            <strong>Actively seeking</strong> a Summer 2026 Software Engineering Internship.
            If you&apos;re hiring, I&apos;d love to chat — <a href="mailto:ogulcan@ogulcantokmak.me" className="underline underline-offset-2 hover:text-amber-500 transition-colors">reach out</a>.
          </p>
        </div>
      </div>

      <div className="space-y-6 not-prose">
        <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/50 hover:border-sky-400/40 transition-all">
          <div className="absolute inset-y-0 left-0 w-0.5 bg-sky-400/50 group-hover:bg-sky-400 transition-all" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-400" /> Current Location
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Based in <strong className="text-slate-900 dark:text-white">Manisa, Türkiye</strong>. Open to remote or on-site Summer 2026 internships.
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/50 hover:border-emerald-400/40 transition-all">
          <div className="absolute inset-y-0 left-0 w-0.5 bg-emerald-400/50 group-hover:bg-emerald-400 transition-all" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" /> Primary Focus
          </h2>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li>• Building this <strong className="text-slate-900 dark:text-white">digital garden</strong> — an interconnected knowledge graph with 47+ nodes, live API integrations, and a full MDX blog pipeline.</li>
            <li>• Deepening understanding of <strong className="text-slate-900 dark:text-white">distributed systems</strong>, CRDT-based sync, and event-sourced architectures.</li>
            <li>• Writing Python tooling for <strong className="text-slate-900 dark:text-white">cryptographic document verification</strong> (SecureExam-Generator).</li>
          </ul>
        </div>

        <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/50 hover:border-violet-400/40 transition-all">
          <div className="absolute inset-y-0 left-0 w-0.5 bg-violet-400/50 group-hover:bg-violet-400 transition-all" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-400" /> Exploring
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-3">
            Translating formal proofs from Ali Nesin Mathematics Village into practical intuitions.
            Currently interested in the intersection of game theory and mechanism design.
          </p>
          <div className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-violet-500 dark:text-violet-400">~/math/game-theory</span>
          </div>
        </div>
      </div>

      {/* Live data widgets */}
      <div className="not-prose mt-10">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-200 mb-4">
          Live from my feeds
        </h2>
        <NowWidgets />
      </div>
    </ArticlePage>
  );
}
