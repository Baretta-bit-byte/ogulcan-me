import React from 'react';

export default function PostsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 font-sans">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">Writing & Essays</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Long-form, polished thoughts on software engineering and design.
      </p>
      <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-center">
        <span className="text-2xl mb-4 block">🚧</span>
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-200">MDX Pipeline Under Construction</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Migrating articles to next-mdx-remote soon.</p>
      </div>
    </div>
  );
}
