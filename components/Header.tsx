"use client";

import { motion, type Easing } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// ─── SVG path data ────────────────────────────────────────────────────────────
//
// PATH_MAIN traces one continuous pen stroke:
//   entry at upper-left of O
//   → sweep counter-clockwise around the O oval
//   → close near the entry, creating the characteristic cursive crossing
//   → exit stroke through the O heading right
//   → gentle connector to T
//   → T upstroke (curves up)
//   → T downstroke (straight down)
//
// viewBox: 0 0 140 70
//
const PATH_MAIN =
  "M 18,24 " +
  "C 12,32 14,46 26,52 " +    // lower-left arc of O
  "C 38,58 54,52 56,40 " +    // lower-right arc of O
  "C 58,28 52,14 40,12 " +    // upper-right arc of O
  "C 28,10 14,16 16,28 " +    // close upper-left (crossing back over entry)
  "C 18,34 30,32 56,34 " +    // exit through the O, going right
  "C 65,34 72,30 72,20 " +    // connector + T upstroke (curves up)
  "L 72,56";                  // T downstroke

// PATH_CROSS: the T crossbar — a gentle arc, drawn after the T body
const PATH_CROSS =
  "M 58,27 C 63,23 80,23 90,27";

// ─── Cycle timing ─────────────────────────────────────────────────────────────
// Both paths share CYCLE duration so they loop in sync forever.
//
//  Main path timeline  (5 s total):
//    0.00 → 0.28   draw  (0 → 1)    easeOut — pen flows naturally
//    0.28 → 0.40   hold  (at 1)
//    0.40 → 0.64   erase (1 → 0)    easeIn  — pen lifts and retreats
//    0.64 → 1.00   pause (at 0)     — rest before next cycle
//
//  Crossbar timeline (same 5 s, delay baked in):
//    0.00 → 0.22   wait  (at 0)
//    0.22 → 0.30   draw  (0 → 1)    easeOut
//    0.30 → 0.42   hold  (at 1)
//    0.42 → 0.52   erase (1 → 0)    easeIn
//    0.52 → 1.00   pause (at 0)
//
const CYCLE = 5;

const MAIN_KF    = [0, 1, 1, 0, 0];
const MAIN_TIMES = [0, 0.28, 0.40, 0.64, 1];
const MAIN_EASE: Easing[]  = ["easeOut", "linear", "easeIn", "linear"];

const CROSS_KF    = [0, 0, 1, 1, 0, 0];
const CROSS_TIMES = [0, 0.22, 0.30, 0.42, 0.52, 1];
const CROSS_EASE: Easing[]  = ["linear", "easeOut", "linear", "easeIn", "linear"];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Header() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Avoid flash: before mount, render invisible paths (same DOM structure)
  const stroke = mounted
    ? theme === "light"
      ? "#334155"   // slate-700 — slightly softer than pure black
      : "#cbd5e1"   // slate-300 — warm against dark background
    : "transparent";

  const sharedPathProps = {
    fill: "none" as const,
    stroke,
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      width="128"
      height="64"
      viewBox="0 0 140 70"
      aria-label="Ogulcan Tokmak signature"
      className="overflow-visible select-none"
    >
      {/* O loop + connector + T body */}
      <motion.path
        d={PATH_MAIN}
        {...sharedPathProps}
        animate={{ pathLength: MAIN_KF }}
        transition={{
          pathLength: {
            duration: CYCLE,
            times: MAIN_TIMES,
            ease: MAIN_EASE,
            repeat: Infinity,
          },
        }}
      />

      {/* T crossbar — drawn after T body exists */}
      <motion.path
        d={PATH_CROSS}
        {...sharedPathProps}
        animate={{ pathLength: CROSS_KF }}
        transition={{
          pathLength: {
            duration: CYCLE,
            times: CROSS_TIMES,
            ease: CROSS_EASE,
            repeat: Infinity,
          },
        }}
      />
    </svg>
  );
}
