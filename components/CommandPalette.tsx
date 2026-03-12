"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { graphNodes } from '@/lib/graphData';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredNodes = useMemo(() => {
    if (!search) return graphNodes.filter(n => n.id !== 'home');
    return graphNodes.filter(n =>
      n.label.toLowerCase().includes(search.toLowerCase()) ||
      (n.description && n.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredNodes.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredNodes[selectedIndex]) {
      e.preventDefault();
      const targetUrl = filteredNodes[selectedIndex].url || `/${filteredNodes[selectedIndex].id}`;
      router.push(targetUrl);
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const badgeColorMap: Record<string, string> = {
    tech: 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-400/10',
    math: 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-400/10',
    personal: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10',
    root: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-400/10',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-slate-900/20 dark:bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <Search className="w-5 h-5 text-slate-400 mr-3" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Search nodes... (⌘K)"
                className="flex-1 bg-transparent text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-lg font-sans"
              />
              <kbd className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded text-xs font-mono">esc</kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredNodes.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No results found for &ldquo;{search}&rdquo;</div>
              ) : (
                filteredNodes.map((node, index) => (
                  <div
                    key={node.id}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => {
                      const targetUrl = node.url || (node.type === 'root' ? '/' : `/${node.type}/${node.id}`);
                      router.push(targetUrl);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                      index === selectedIndex ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-slate-200">{node.label}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${badgeColorMap[node.type] || badgeColorMap.root}`}>
                          {node.type}
                        </span>
                      </div>
                      {node.description && <div className="text-sm text-slate-500 mt-1">{node.description}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
