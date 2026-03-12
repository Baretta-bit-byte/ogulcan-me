"use client";

import * as HoverCard from "@radix-ui/react-hover-card";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { graphNodes, Maturity } from "@/lib/graphData";

type Variant = "tech" | "math" | "default";

const maturityConfig: Record<Maturity, { icon: string; label: string; color: string }> = {
  seedling:  { icon: "🌱", label: "Seedling",  color: "text-amber-500 dark:text-amber-400 border-amber-500/30 bg-amber-500/10" },
  sapling:   { icon: "🪴", label: "Sapling",   color: "text-emerald-500 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  evergreen: { icon: "🌳", label: "Evergreen", color: "text-sky-500 dark:text-sky-400 border-sky-500/30 bg-sky-500/10" },
};

interface LinkedTermProps {
  href: string;
  children: ReactNode;
  content: ReactNode;
  title?: string;
  variant?: Variant;
  nodeId?: string;
}

const triggerClass: Record<Variant, string> = {
  tech:    "text-sky-500 dark:text-sky-400 decoration-sky-400/50",
  math:    "text-violet-500 dark:text-violet-400 decoration-violet-400/50",
  default: "text-slate-600 dark:text-slate-200 decoration-slate-400 dark:decoration-slate-500",
};

const accentBorder: Record<Variant, string> = {
  tech:    "border-sky-400/50",
  math:    "border-violet-400/50",
  default: "border-slate-500/50",
};

const accentBar: Record<Variant, string> = {
  tech:    "bg-sky-400",
  math:    "bg-violet-400",
  default: "bg-slate-400",
};

const dotClass: Record<Variant, string> = {
  tech:    "bg-sky-400",
  math:    "bg-violet-400",
  default: "bg-slate-400",
};

const titleColor: Record<Variant, string> = {
  tech:    "text-sky-500 dark:text-sky-400",
  math:    "text-violet-500 dark:text-violet-400",
  default: "text-slate-700 dark:text-slate-200",
};

export default function LinkedTerm({
  href,
  children,
  content,
  title,
  variant = "default",
  nodeId,
}: LinkedTermProps) {
  const [open, setOpen] = useState(false);
  const graphNode = nodeId ? graphNodes.find(n => n.id === nodeId) : undefined;
  const resolvedContent = content ?? (graphNode?.description ?? "");
  const maturity = graphNode?.maturity;

  return (
    <HoverCard.Root open={open} onOpenChange={setOpen} openDelay={150} closeDelay={80}>
      <HoverCard.Trigger asChild>
        <Link
          href={href}
          className={`underline decoration-dotted underline-offset-4 transition-opacity hover:opacity-80 ${triggerClass[variant]}`}
        >
          {children}
        </Link>
      </HoverCard.Trigger>

      <AnimatePresence>
        {open && (
          <HoverCard.Portal forceMount>
            <HoverCard.Content forceMount sideOffset={8} align="start" asChild>
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className={`z-50 w-72 rounded-lg border bg-white/97 dark:bg-slate-800/97 backdrop-blur-sm shadow-xl overflow-hidden ${accentBorder[variant]}`}
              >
                {/* Thin accent top bar */}
                <div className={`h-0.5 w-full ${accentBar[variant]}`} />

                <div className="px-4 py-3 space-y-2">
                  {/* Title row */}
                  {title && (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotClass[variant]}`} />
                        <span className={`font-mono text-xs font-semibold truncate ${titleColor[variant]}`}>
                          {title}
                        </span>
                      </div>
                      <ArrowUpRight size={12} className="shrink-0 text-slate-400" />
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {resolvedContent}
                  </p>

                  {/* Maturity badge */}
                  {maturity && (
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${maturityConfig[maturity].color}`}>
                      <span>{maturityConfig[maturity].icon}</span>
                      <span>{maturityConfig[maturity].label}</span>
                    </div>
                  )}

                  {/* Path hint */}
                  <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {href}
                  </p>
                </div>

                <HoverCard.Arrow className="fill-white dark:fill-slate-800" />
              </motion.div>
            </HoverCard.Content>
          </HoverCard.Portal>
        )}
      </AnimatePresence>
    </HoverCard.Root>
  );
}
