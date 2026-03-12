import React from 'react';
import ArticlePage from '@/components/ArticlePage';

export default function UsesPage() {
  return (
    <ArticlePage nodeId="uses" title="What I Use">
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 font-sans">
        A living document detailing my development environment, hardware, and the software I use daily to build and design.
      </p>

      <div className="space-y-8 font-sans">
        <section className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/50 hover:border-sky-400/40 transition-all">
          <div className="absolute inset-y-0 left-0 w-0.5 bg-sky-400/50 group-hover:bg-sky-400 transition-all" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Coding Environment</h2>
          <ul className="space-y-3 text-slate-600 dark:text-slate-300">
            <li><strong>Editor:</strong> VS Code with a custom minimalist configuration.</li>
            <li><strong>Theme:</strong> Tokyo Night / Custom Slate theme.</li>
            <li><strong>Font:</strong> JetBrains Mono (with ligatures enabled).</li>
            <li><strong>Terminal:</strong> Windows Terminal + WSL2 (Ubuntu) running Zsh and Oh-My-Zsh.</li>
          </ul>
        </section>

        <section className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/50 hover:border-violet-400/40 transition-all">
          <div className="absolute inset-y-0 left-0 w-0.5 bg-violet-400/50 group-hover:bg-violet-400 transition-all" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Core Stack</h2>
          <ul className="space-y-3 text-slate-600 dark:text-slate-300">
            <li><strong>Framework:</strong> Next.js (App Router) — For both static and dynamic applications.</li>
            <li><strong>Styling:</strong> Tailwind CSS v4 — The only way I write CSS anymore.</li>
            <li><strong>Language:</strong> TypeScript — Strict mode always enabled.</li>
            <li><strong>Animation:</strong> Framer Motion — For fluid, physics-based UI interactions.</li>
          </ul>
        </section>

        <section className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900/50 hover:border-emerald-400/40 transition-all">
          <div className="absolute inset-y-0 left-0 w-0.5 bg-emerald-400/50 group-hover:bg-emerald-400 transition-all" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Hardware</h2>
          <ul className="space-y-3 text-slate-600 dark:text-slate-300">
            <li><strong>Machine:</strong> Windows 11 development setup.</li>
            <li><strong>Peripherals:</strong> Mechanical keyboard, external monitor for dual-screen workflow.</li>
          </ul>
        </section>
      </div>
    </ArticlePage>
  );
}
