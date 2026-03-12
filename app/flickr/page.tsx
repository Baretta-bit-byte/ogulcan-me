import React from 'react';

export default function FlickrPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 font-sans">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">Photography</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">Moments captured in time.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
        <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm">
          Photo 1
        </div>
        <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm">
          Photo 2
        </div>
        <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm">
          Photo 3
        </div>
      </div>
    </div>
  );
}
