"use client";

import { motion, useMotionValue, useSpring, useTransform, type Easing } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState, useCallback } from "react";

// ─── SVG path data ────────────────────────────────────────────────────────────
const PATH_MAIN =
  "M 18,24 " +
  "C 12,32 14,46 26,52 " +
  "C 38,58 54,52 56,40 " +
  "C 58,28 52,14 40,12 " +
  "C 28,10 14,16 16,28 " +
  "C 18,34 30,32 56,34 " +
  "C 65,34 72,30 72,20 " +
  "L 72,56";

const PATH_CROSS = "M 58,27 C 63,23 80,23 90,27";

// ─── Cycle timing ─────────────────────────────────────────────────────────────
const CYCLE = 5;

const MAIN_KF    = [0, 1, 1, 0, 0];
const MAIN_TIMES = [0, 0.28, 0.40, 0.64, 1];
const MAIN_EASE: Easing[] = ["easeOut", "linear", "easeIn", "linear"];

const CROSS_KF    = [0, 0, 1, 1, 0, 0];
const CROSS_TIMES = [0, 0.22, 0.30, 0.42, 0.52, 1];
const CROSS_EASE: Easing[] = ["linear", "easeOut", "linear", "easeIn", "linear"];

// ─── Parallax spring config ────────────────────────────────────────────────────
const SPRING = { stiffness: 100, damping: 18, mass: 0.6 };

// ─── Component ────────────────────────────────────────────────────────────────
export default function Header() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Mouse tracking — normalized to -1..1 relative to viewport
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const smoothX = useSpring(rawX, SPRING);
  const smoothY = useSpring(rawY, SPRING);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    },
    [rawX, rawY]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // ── Parallax transforms per depth layer ──────────────────────────────────
  // Shadow layers shift opposite to mouse direction (appear further back).
  // Main layer shifts in mouse direction (lifts toward the viewer).
  //
  // Base offsets place shadows below-right of the main stroke by default,
  // giving a top-left "light source" feel even without mouse movement.
  const s2X = useTransform(smoothX, (v) => 3.5 + v * -3.5); // deep shadow
  const s2Y = useTransform(smoothY, (v) => 4.5 + v * -2.0);
  const s1X = useTransform(smoothX, (v) => 1.5 + v * -1.5); // mid shadow
  const s1Y = useTransform(smoothY, (v) => 2.0 + v * -1.0);
  const mX  = useTransform(smoothX, (v) => v *  1.5);        // main — foreground
  const mY  = useTransform(smoothY, (v) => v *  0.8);

  // ── Theme-aware colours ───────────────────────────────────────────────────
  const isDark     = mounted && theme !== "light";
  const mainStroke = mounted ? (isDark ? "#e2e8f0" : "#334155") : "transparent";
  const s1Color    = mounted
    ? isDark
      ? "rgba(56,189,248,0.28)"   // sky-400 glow for dark
      : "rgba(15,23,42,0.22)"     // slate shadow for light
    : "transparent";
  const s2Color    = mounted
    ? isDark
      ? "rgba(56,189,248,0.12)"
      : "rgba(15,23,42,0.10)"
    : "transparent";

  // ── Shared path props factory ─────────────────────────────────────────────
  const base = {
    fill: "none" as const,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const mainAnim = {
    animate: { pathLength: MAIN_KF },
    transition: {
      pathLength: {
        duration: CYCLE, times: MAIN_TIMES, ease: MAIN_EASE, repeat: Infinity,
      },
    },
  };
  const crossAnim = {
    animate: { pathLength: CROSS_KF },
    transition: {
      pathLength: {
        duration: CYCLE, times: CROSS_TIMES, ease: CROSS_EASE, repeat: Infinity,
      },
    },
  };

  return (
    <svg
      width="128"
      height="64"
      viewBox="0 0 140 70"
      aria-label="Ogulcan Tokmak signature"
      className="overflow-visible select-none"
    >
      <defs>
        {/* Blur filters for shadow layers */}
        <filter id="sig-deep-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
        <filter id="sig-mid-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.9" />
        </filter>
      </defs>

      {/* ── Layer 1: deep shadow (furthest back) ─────────────────────────── */}
      <motion.g style={{ x: s2X, y: s2Y, filter: "url(#sig-deep-blur)" }}>
        <motion.path d={PATH_MAIN}  {...base} stroke={s2Color} strokeWidth={3.2} {...mainAnim}  />
        <motion.path d={PATH_CROSS} {...base} stroke={s2Color} strokeWidth={3.2} {...crossAnim} />
      </motion.g>

      {/* ── Layer 2: mid shadow ───────────────────────────────────────────── */}
      <motion.g style={{ x: s1X, y: s1Y, filter: "url(#sig-mid-blur)" }}>
        <motion.path d={PATH_MAIN}  {...base} stroke={s1Color} strokeWidth={2.4} {...mainAnim}  />
        <motion.path d={PATH_CROSS} {...base} stroke={s1Color} strokeWidth={2.4} {...crossAnim} />
      </motion.g>

      {/* ── Layer 3: main stroke (foreground) ────────────────────────────── */}
      <motion.g style={{ x: mX, y: mY }}>
        <motion.path d={PATH_MAIN}  {...base} stroke={mainStroke} strokeWidth={1.7} {...mainAnim}  />
        <motion.path d={PATH_CROSS} {...base} stroke={mainStroke} strokeWidth={1.7} {...crossAnim} />
      </motion.g>
    </svg>
  );
}
