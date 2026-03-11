"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { graphNodes, graphLinks, GraphNode } from "@/lib/graphData";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

const NODE_COLORS: Record<string, string> = {
  root:     "#e2e8f0",
  tech:     "#38bdf8",
  math:     "#a78bfa",
  personal: "#94a3b8",
};

const degreeMap = new Map<string, number>();
graphLinks.forEach((l) => {
  degreeMap.set(l.source, (degreeMap.get(l.source) ?? 0) + 1);
  degreeMap.set(l.target, (degreeMap.get(l.target) ?? 0) + 1);
});

const fullGraphData = {
  nodes: graphNodes.map((n) => ({ ...n })),
  links: graphLinks.map((l) => ({ ...l })),
};

interface GraphModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GraphModal({ open, onClose }: GraphModalProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !open) return;
    const measure = () =>
      setDims({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const isDark = theme !== "light";
  const labelColor = isDark ? "#64748b" : "#94a3b8";
  const linkStroke = isDark ? "#1e293b" : "#e2e8f0";

  const paintNode = useCallback(
    (
      node: GraphNode & { x?: number; y?: number },
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      const deg   = degreeMap.get(node.id) ?? 1;
      const r     = 2.5 + deg * 0.8;
      const color = NODE_COLORS[node.type] ?? "#94a3b8";
      const x     = node.x ?? 0;
      const y     = node.y ?? 0;

      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = color + "cc";
      ctx.fill();

      // Label only when zoomed in enough
      if (globalScale > 1.2) {
        const fontSize = 10 / globalScale;
        ctx.font      = `${fontSize}px Inter, sans-serif`;
        ctx.fillStyle = labelColor;
        ctx.textAlign = "center";
        ctx.fillText(node.label, x, y + r + fontSize + 1);
      }
    },
    [labelColor]
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (node.url) { router.push(node.url); onClose(); }
    },
    [router, onClose]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative mx-8 my-8 w-full max-w-5xl rounded-xl border border-slate-700 bg-slate-900/95 overflow-hidden"
            style={{ height: "80vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
              <span className="font-mono text-sm font-semibold text-slate-200">
                Graph View — Full Map
              </span>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Canvas */}
            <div ref={containerRef} className="h-[calc(100%-44px)] w-full">
              {dims.width > 0 && dims.height > 0 && (
                <ForceGraph2D
                  graphData={fullGraphData as never}
                  width={dims.width}
                  height={dims.height}
                  backgroundColor="transparent"
                  linkColor={() => linkStroke}
                  linkWidth={1}
                  nodeCanvasObject={paintNode as never}
                  nodeCanvasObjectMode={() => "replace"}
                  onNodeClick={handleNodeClick as never}
                  nodeLabel={(node) =>
                    (node as GraphNode).description ?? (node as GraphNode).label
                  }
                  enableNodeDrag
                  enableZoomInteraction
                  cooldownTicks={120}
                  d3AlphaDecay={0.02}
                  d3VelocityDecay={0.3}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
