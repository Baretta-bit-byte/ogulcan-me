"use client";

import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useRef, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
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

function nodeRadius(id: string, isActive: boolean): number {
  const deg = degreeMap.get(id) ?? 1;
  if (isActive) return 5 + deg * 0.6;
  return 3 + deg * 0.5;
}

const fullGraphData = {
  nodes: graphNodes.map((n) => ({ ...n })),
  links: graphLinks.map((l) => ({ ...l })),
};

function pathnameToId(pathname: string): string | null {
  const match = graphNodes.find(
    (n) => n.url === pathname || (pathname === "/" && n.id === "home")
  );
  return match?.id ?? null;
}

interface GraphModalProps {
  open: boolean;
  onClose: () => void;
}

export default function GraphModal({ open, onClose }: GraphModalProps) {
  const router    = useRouter();
  const pathname  = usePathname();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef        = useRef<any>(null);
  const [dims, setDims]           = useState({ width: 0, height: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Find matching node for search
  const searchMatch = search
    ? graphNodes.find((n) =>
        n.label.toLowerCase().includes(search.toLowerCase()) ||
        (n.description && n.description.toLowerCase().includes(search.toLowerCase()))
      )
    : null;

  // Center camera on search match
  useEffect(() => {
    if (!searchMatch || !fgRef.current) return;
    try {
      const node = fgRef.current.graphData().nodes.find(
        (n: GraphNode & { x?: number; y?: number }) => n.id === searchMatch.id
      );
      if (node?.x != null && node?.y != null) {
        fgRef.current.centerAt(node.x, node.y, 600);
        fgRef.current.zoom(3, 600);
      }
    } catch {
      // graph not ready yet — ignore
    }
  }, [searchMatch]);

  const currentId = pathnameToId(pathname);

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

  const isDark      = theme !== "light";
  const labelColor  = isDark ? "#475569" : "#94a3b8";
  const activeLabel = isDark ? "#e2e8f0" : "#0f172a";
  const hoverLabel  = isDark ? "#94a3b8" : "#475569";
  const linkStroke  = isDark ? "#1e293b" : "#e2e8f0";

  const paintNode = useCallback(
    (
      node: GraphNode & { x?: number; y?: number },
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      const isActive   = node.id === currentId;
      const isHovered  = node.id === hoveredId;
      const isSearched = node.id === searchMatch?.id;
      const r          = nodeRadius(node.id, isActive || isSearched);
      const color      = NODE_COLORS[node.type] ?? "#94a3b8";
      const x          = node.x ?? 0;
      const y          = node.y ?? 0;
      const dimmed     = search && !isSearched && !isActive;

      // Glow ring
      if (isActive || isHovered || isSearched) {
        ctx.beginPath();
        ctx.arc(x, y, r + 4, 0, 2 * Math.PI);
        ctx.fillStyle = isSearched ? "#fbbf24" + "40" : color + (isActive ? "30" : "18");
        ctx.fill();
      }

      // Node dot
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = dimmed
        ? color + "22"
        : isSearched
          ? "#fbbf24"
          : isActive ? color : isHovered ? color + "dd" : color + "88";
      ctx.fill();

      // Labels — always visible
      const fontSize = Math.max(9, ((isActive || isSearched) ? 12 : 10) / globalScale);
      ctx.font       = `${(isActive || isSearched) ? "600" : "400"} ${fontSize}px Inter, sans-serif`;
      ctx.fillStyle  = dimmed
        ? labelColor + "44"
        : isSearched
          ? "#fbbf24"
          : isActive ? activeLabel : isHovered ? hoverLabel : labelColor;
      ctx.textAlign  = "center";
      ctx.fillText(node.label, x, y + r + fontSize + 2);
    },
    [currentId, hoveredId, searchMatch, search, labelColor, activeLabel, hoverLabel]
  );

  const paintPointerArea = useCallback(
    (
      node: GraphNode & { x?: number; y?: number },
      color: string,
      ctx: CanvasRenderingContext2D
    ) => {
      const r = nodeRadius(node.id, node.id === currentId) + 8;
      ctx.beginPath();
      ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    },
    [currentId]
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (node.url) { router.push(node.url); onClose(); }
    },
    [router, onClose]
  );

  const handleNodeHover = useCallback(
    (node: GraphNode | null) => { setHoveredId(node?.id ?? null); },
    []
  );

  const handleEngineStop = useCallback(() => {
    fgRef.current?.zoomToFit(400, 40);
  }, []);

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
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3 gap-4">
              <span className="font-mono text-sm font-semibold text-slate-200 shrink-0">
                Graph View — Full Map
              </span>
              <div className="flex items-center flex-1 max-w-xs bg-slate-800/80 rounded-lg px-3 py-1.5 border border-slate-700/50 focus-within:border-slate-600">
                <Search size={13} className="text-slate-500 shrink-0 mr-2" />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search nodes..."
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none font-mono"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="ml-1 text-slate-500 hover:text-slate-300"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-5 flex items-center gap-4 z-10">
              {(["tech", "math", "personal", "root"] as const).map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: NODE_COLORS[t] }}
                  />
                  <span className="font-mono text-[10px] text-slate-500 capitalize">{t}</span>
                </span>
              ))}
            </div>

            {/* Canvas */}
            <div
              ref={containerRef}
              className="h-[calc(100%-44px)] w-full"
              style={{ cursor: hoveredId ? "pointer" : "default" }}
            >
              {dims.width > 0 && dims.height > 0 && (
                <ForceGraph2D
                  ref={fgRef}
                  graphData={fullGraphData as never}
                  width={dims.width}
                  height={dims.height}
                  backgroundColor="transparent"
                  linkColor={() => linkStroke}
                  linkWidth={1}
                  nodeCanvasObject={paintNode as never}
                  nodeCanvasObjectMode={() => "replace"}
                  nodePointerAreaPaint={paintPointerArea as never}
                  onNodeClick={handleNodeClick as never}
                  onNodeHover={handleNodeHover as never}
                  nodeLabel={(node) =>
                    (node as GraphNode).description ?? (node as GraphNode).label
                  }
                  enableNodeDrag
                  enableZoomInteraction
                  cooldownTicks={120}
                  d3AlphaDecay={0.02}
                  d3VelocityDecay={0.3}
                  onEngineStop={handleEngineStop}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
