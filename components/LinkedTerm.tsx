"use client";

import * as HoverCard from "@radix-ui/react-hover-card";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Variant = "tech" | "math" | "default";

interface LinkedTermProps {
  href: string;
  children: ReactNode;
  content: ReactNode;
  title?: string;
  variant?: Variant;
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
}: LinkedTermProps) {
  const [open, setOpen] = useState(false);

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
                    {content}
                  </p>

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
