"use client";

import { useEffect } from "react";
import { useRightPanel, TocItem } from "@/lib/rightPanelContext";

/**
 * Invisible client component that registers TOC items with the RightPanel context.
 * Drop it into any server-rendered page to get Table of Contents support.
 */
export default function TocRegistrar({ items }: { items: TocItem[] }) {
  const { setTocItems } = useRightPanel();
  const key = JSON.stringify(items);

  useEffect(() => {
    setTocItems(JSON.parse(key));
    return () => setTocItems([]);
  }, [setTocItems, key]);

  return null;
}
