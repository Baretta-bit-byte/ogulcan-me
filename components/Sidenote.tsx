"use client";

import { useState, ReactNode } from "react";
import { MessageSquare } from "lucide-react";

interface SidenoteProps {
  children: ReactNode;
  note: ReactNode;
}

/**
 * Tufte-style marginal note.
 * Desktop: renders the note in the right margin via absolute positioning.
 * Mobile: renders as an inline expandable toggle.
 */
export default function Sidenote({ children, note }: SidenoteProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative">
      {children}
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="xl:hidden inline-flex items-center justify-center w-4 h-4 rounded-full bg-violet-400/20 text-violet-400 text-[9px] font-bold ml-0.5 align-super hover:bg-violet-400/30 transition-colors"
        aria-label="Toggle note"
      >
        <MessageSquare size={8} />
      </button>
      {/* Mobile inline note */}
      {open && (
        <span className="xl:hidden block mt-2 mb-2 pl-3 border-l-2 border-violet-400/30 text-sm text-slate-500 dark:text-slate-400 italic leading-relaxed">
          {note}
        </span>
      )}
      {/* Desktop marginal note */}
      <span className="hidden xl:block absolute left-[calc(100%+2rem)] top-0 w-48 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed italic">
        {note}
      </span>
    </span>
  );
}
