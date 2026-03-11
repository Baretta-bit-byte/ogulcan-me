"use client";

import { motion, type Variants } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const SIGNATURE_PATHS = [
  // O
  "M 20 30 C 20 18, 36 18, 36 30 C 36 42, 20 42, 20 30",
  // g
  "M 42 26 C 42 20, 54 20, 54 26 L 54 42 C 54 48, 42 48, 42 44",
  // u
  "M 60 20 L 60 34 C 60 40, 72 40, 72 34 L 72 20",
  // l
  "M 78 14 L 78 40",
  // c
  "M 92 22 C 84 22, 82 28, 82 32 C 82 36, 84 40, 92 40",
  // a
  "M 104 40 C 104 22, 96 22, 96 32 C 96 40, 104 40, 104 40 L 104 32",
  // n
  "M 110 26 L 110 40 M 110 30 C 114 22, 126 22, 126 30 L 126 40",
];

const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        delay: i * 0.12,
        type: "spring" as const,
        duration: 0.8,
        bounce: 0,
      },
      opacity: { delay: i * 0.12, duration: 0.01 },
    },
  }),
};

export default function Header() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stroke = mounted && theme === "light" ? "#1e293b" : "#e2e8f0";

  return (
    <motion.svg
      width="136"
      height="56"
      viewBox="0 0 150 60"
      initial="hidden"
      animate="visible"
      aria-label="Ogulcan signature"
      className="overflow-visible"
    >
      {SIGNATURE_PATHS.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          custom={i}
          variants={draw}
        />
      ))}
    </motion.svg>
  );
}
