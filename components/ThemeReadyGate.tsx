"use client";

import { useEffect } from "react";

/**
 * Adds .theme-ready to <html> after first paint.
 * This enables color transitions ONLY after hydration,
 * so the initial dark-mode application never causes a flash.
 */
export default function ThemeReadyGate() {
  useEffect(() => {
    // requestAnimationFrame ensures we're past the first paint
    const raf = requestAnimationFrame(() => {
      document.documentElement.classList.add("theme-ready");
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
