import React from 'react';

export default function SteamPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 font-sans">
      <h1 className="text-4xl font-bold text-emerald-500 mb-4">Steam Activity</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">Recent gaming activity and statistics.</p>
      <div className="p-6 border border-emerald-500/20 rounded-xl bg-emerald-500/5 text-center">
        <h3 className="text-lg font-medium text-emerald-600 dark:text-emerald-400">Steam Web API Integration</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Awaiting public profile token setup.</p>
      </div>
    </div>
  );
}
