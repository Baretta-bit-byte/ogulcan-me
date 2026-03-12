"use client";

import * as HoverCard from "@radix-ui/react-hover-card";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useState } from "react";

type TooltipVariant = "tech" | "math" | "default";

interface HoverTooltipProps {
  children: ReactNode;
  content: ReactNode;
  label?: string;
  variant?: TooltipVariant;
}

const accentBorder: Record<TooltipVariant, string> = {
  tech:    "border-sky-400/50",
  math:    "border-violet-400/50",
  default: "border-slate-500/50",
};

const accentBar: Record<TooltipVariant, string> = {
  tech:    "bg-sky-400",
  math:    "bg-violet-400",
  default: "bg-slate-400",
};

const dotColor: Record<TooltipVariant, string> = {
  tech:    "bg-sky-400",
  math:    "bg-violet-400",
  default: "bg-slate-400",
};

const labelColor: Record<TooltipVariant, string> = {
  tech:    "text-sky-500 dark:text-sky-400",
  math:    "text-violet-500 dark:text-violet-400",
  default: "text-slate-700 dark:text-slate-200",
};

const triggerClass: Record<TooltipVariant, string> = {
  tech:    "text-sky-500 dark:text-sky-400 decoration-sky-400/50",
  math:    "text-violet-500 dark:text-violet-400 decoration-violet-400/50",
  default: "text-slate-600 dark:text-slate-200 decoration-slate-400 dark:decoration-slate-500",
};

export default function HoverTooltip({
  children,
  content,
  label,
  variant = "default",
}: HoverTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <HoverCard.Root open={open} onOpenChange={setOpen} openDelay={120} closeDelay={80}>
      <HoverCard.Trigger asChild>
        <span
          className={`cursor-help underline decoration-dotted underline-offset-4 ${triggerClass[variant]}`}
        >
          {children}
        </span>
      </HoverCard.Trigger>

      <AnimatePresence>
        {open && (
          <HoverCard.Portal forceMount>
            <HoverCard.Content forceMount sideOffset={8} align="start" asChild>
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={`z-50 w-72 rounded-lg border bg-white/97 dark:bg-slate-800/97 backdrop-blur-sm shadow-xl overflow-hidden ${accentBorder[variant]}`}
              >
                {/* Thin accent top bar */}
                <div className={`h-0.5 w-full ${accentBar[variant]}`} />

                <div className="px-4 py-3 space-y-2">
                  {label && (
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor[variant]}`} />
                      <span className={`font-mono text-xs font-semibold ${labelColor[variant]}`}>
                        {label}
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {content}
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
