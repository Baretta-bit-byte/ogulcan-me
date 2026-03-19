"use client";

import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import { graphNodes, graphLinks, GraphNode } from "@/lib/graphData";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

// φ — golden ratio for harmonious, overlap-free node spacing
const PHI = 1.618;

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

// Ring identification — Home's direct neighbors form Ring 1
const homeDirectIds = new Set<string>();
graphLinks.forEach((l) => {
  if (l.source === "home") homeDirectIds.add(l.target);
  if (l.target === "home") homeDirectIds.add(l.source);
});
const R1 = 140;       // Ring 1 radius
const R2 = R1 * PHI;  // Ring 2 radius (golden ratio)

function nodeRadius(id: string, isActive: boolean): number {
  const deg = degreeMap.get(id) ?? 1;
  if (isActive) return Math.min(5 + deg * 0.5, 9);
  return Math.min(3 + deg * 0.4, 7);
}

// Build radial ring layout — fresh copies each call
function computeRadialLayout() {
  // Sort Ring 1 by type → color-banded sectors
  const typeOrder: Record<string, number> = { tech: 0, math: 1, personal: 2, root: 3 };
  const ring1 = graphNodes
    .filter((n) => homeDirectIds.has(n.id))
    .sort((a, b) => (typeOrder[a.type] ?? 3) - (typeOrder[b.type] ?? 3));
  const ring2 = graphNodes.filter(
    (n) => n.id !== "home" && !homeDirectIds.has(n.id)
  );

  // Ring 1 angular positions
  const ring1Angles = new Map<string, number>();
  ring1.forEach((n, i) => {
    ring1Angles.set(n.id, (2 * Math.PI * i) / ring1.length - Math.PI / 2);
  });

  // Ring 2: find parent in Ring 1, position near parent's angle
  function findParent(id: string): string | null {
    for (const l of graphLinks) {
      const other = l.source === id ? l.target : l.target === id ? l.source : null;
      if (other && homeDirectIds.has(other)) return other;
    }
    return null;
  }

  const parentGroups = new Map<string, string[]>();
  ring2.forEach((n) => {
    const p = findParent(n.id);
    if (p) {
      if (!parentGroups.has(p)) parentGroups.set(p, []);
      parentGroups.get(p)!.push(n.id);
    }
  });

  const nodes = graphNodes.map((n) => {
    const copy = { ...n } as GraphNode & { x?: number; y?: number };
    if (n.id === "home") {
      copy.x = 0;
      copy.y = 0;
    } else if (homeDirectIds.has(n.id)) {
      const angle = ring1Angles.get(n.id) ?? 0;
      copy.x = R1 * Math.cos(angle);
      copy.y = R1 * Math.sin(angle);
    } else {
      const parent = findParent(n.id);
      if (parent) {
        const parentAngle = ring1Angles.get(parent) ?? 0;
        const siblings = parentGroups.get(parent) ?? [n.id];
        const idx = siblings.indexOf(n.id);
        const spread = 0.3;
        const offset = (idx - (siblings.length - 1) / 2) * spread;
        const angle = parentAngle + offset;
        copy.x = R2 * Math.cos(angle);
        copy.y = R2 * Math.sin(angle);
      }
    }
    return copy;
  });

  return { nodes, links: graphLinks.map((l) => ({ ...l })) };
}

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

  // Fresh ring layout on each modal open
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const radialGraphData = useMemo(() => computeRadialLayout(), [open]);

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

  // Configure d3 forces — radial ring layout
  useEffect(() => {
    if (!open) return;
    const fg = fgRef.current;
    if (!fg) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import("d3-force-3d").then((d3: any) => {
      // Label-aware collision
      fg.d3Force(
        "collision",
        d3
          .forceCollide()
          .radius((node: GraphNode) => {
            const r = nodeRadius(node.id, node.id === currentId);
            const labelHalf = node.label.length * 3.2;
            return Math.max((r + 14) * PHI, labelHalf + r);
          })
          .strength(0.9)
          .iterations(4)
      );
      // Mild charge — don't fight ring structure
      const charge = fg.d3Force("charge");
      if (charge) charge.strength(-60);
      // Ring-aware link distances
      const link = fg.d3Force("link");
      if (link) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        link.distance((l: any) => {
          const s = typeof l.source === "string" ? l.source : l.source.id;
          const t = typeof l.target === "string" ? l.target : l.target.id;
          // Home ↔ Ring1: match ring radius
          if (s === "home" || t === "home") return R1;
          const sR1 = homeDirectIds.has(s);
          const tR1 = homeDirectIds.has(t);
          // Ring1 ↔ Ring2: match inter-ring gap
          if ((sR1 && !tR1) || (!sR1 && tR1)) return R2 - R1;
          // Cross-links within same ring
          return R1 * 0.7;
        });
      }
      fg.d3ReheatSimulation();
    });
  }, [currentId, open]);

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
  const labelColor  = isDark ? "#94a3b8" : "#334155";  // slate-400 / slate-700
  const activeLabel = isDark ? "#e2e8f0" : "#0f172a";
  const hoverLabel  = isDark ? "#cbd5e1" : "#1e293b";  // brighter hover contrast
  const linkStroke  = isDark ? "#1e293b" : "#94a3b8";

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
      const baseColor  = NODE_COLORS[node.type] ?? "#94a3b8";
      const color      = !isDark && node.type === "root" ? "#64748b" : baseColor;
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
    [currentId, hoveredId, searchMatch, search, isDark, labelColor, activeLabel, hoverLabel]
  );

  const paintPointerArea = useCallback(
    (
      node: GraphNode & { x?: number; y?: number },
      color: string,
      ctx: CanvasRenderingContext2D
    ) => {
      const r = nodeRadius(node.id, node.id === currentId) + 12;
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
    fgRef.current?.zoomToFit(400, 60);
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
            className="relative mx-8 my-8 w-full max-w-5xl rounded-xl border border-slate-200/50 bg-white/60 backdrop-blur-xl overflow-hidden dark:border-slate-700/50 dark:bg-slate-900/70"
            style={{ height: "80vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/50 px-5 py-3 gap-4 dark:border-slate-700/50">
              <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200 shrink-0">
                Graph View — Full Map
              </span>
              <div className="flex items-center flex-1 max-w-xs bg-slate-100/80 rounded-lg px-3 py-1.5 border border-slate-200/60 focus-within:border-slate-400 dark:bg-slate-800/80 dark:border-slate-700/50 dark:focus-within:border-slate-600">
                <Search size={13} className="text-slate-400 dark:text-slate-500 shrink-0 mr-2" />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search nodes..."
                  className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-mono"
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
                className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors shrink-0"
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
                  graphData={radialGraphData as never}
                  width={dims.width}
                  height={dims.height}
                  backgroundColor="transparent"
                  linkColor={() => linkStroke}
                  linkWidth={1}
                  linkDirectionalParticles={2}
                  linkDirectionalParticleSpeed={0.004}
                  linkDirectionalParticleWidth={1.5}
                  linkDirectionalParticleColor={() =>
                    isDark ? "rgba(56,189,248,0.5)" : "rgba(71,85,105,0.35)"
                  }
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
                  cooldownTicks={200}
                  d3AlphaDecay={0.015}
                  d3VelocityDecay={0.25}
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
