"use client";

import * as HoverCard from "@radix-ui/react-hover-card";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useState } from "react";

type TooltipVariant = "tech" | "math" | "default";

interface HoverTooltipProps {
  children: ReactNode;
  content: ReactNode;
  variant?: TooltipVariant;
}

const accentColor: Record<TooltipVariant, string> = {
  tech: "border-sky-400",
  math: "border-violet-400",
  default: "border-slate-600",
};

const dotColor: Record<TooltipVariant, string> = {
  tech: "bg-sky-400",
  math: "bg-violet-400",
  default: "bg-slate-400",
};

export default function HoverTooltip({
  children,
  content,
  variant = "default",
}: HoverTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <HoverCard.Root
      openDelay={120}
      closeDelay={80}
      onOpenChange={setOpen}
    >
      <HoverCard.Trigger asChild>
        <span
          className={`cursor-pointer underline decoration-dotted underline-offset-4 ${
            variant === "tech"
              ? "text-sky-500 dark:text-sky-400 decoration-sky-400/50"
              : variant === "math"
              ? "text-violet-500 dark:text-violet-400 decoration-violet-400/50"
              : "text-slate-600 dark:text-slate-200 decoration-slate-400 dark:decoration-slate-500"
          }`}
        >
          {children}
        </span>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content sideOffset={8} align="start" asChild>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={`z-50 max-w-xs rounded-lg border bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm px-4 py-3 shadow-xl ${accentColor[variant]}`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotColor[variant]}`}
                  />
                  <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {content}
                  </div>
                </div>
                <HoverCard.Arrow className="fill-white dark:fill-slate-800" />
              </motion.div>
            )}
          </AnimatePresence>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
