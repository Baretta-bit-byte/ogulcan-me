"use client";

import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { graphNodes, graphLinks, GraphNode } from "@/lib/graphData";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

// Degree map — computed once from the full graph
const degreeMap = new Map<string, number>();
graphLinks.forEach((l) => {
  degreeMap.set(l.source, (degreeMap.get(l.source) ?? 0) + 1);
  degreeMap.set(l.target, (degreeMap.get(l.target) ?? 0) + 1);
});

const NODE_COLORS: Record<string, string> = {
  root:     "#e2e8f0",
  tech:     "#38bdf8",
  math:     "#a78bfa",
  personal: "#94a3b8",
};

// Small node radii — degree adds subtle size difference
function nodeRadius(id: string, isActive: boolean): number {
  const deg = degreeMap.get(id) ?? 1;
  if (isActive) return 4 + deg * 0.5;   // active: 4.5–6.5px
  return 2.5 + deg * 0.4;               // inactive: 2.9–4.5px
}

function getLocalGraph(pathname: string) {
  const current = graphNodes.find(
    (n) => n.url === pathname || (pathname === "/" && n.id === "home")
  );
  if (!current) {
    return {
      nodes: graphNodes.map((n) => ({ ...n })),
      links: graphLinks.map((l) => ({ ...l })),
      currentId: null,
    };
  }

  const neighborIds = new Set<string>([current.id]);
  graphLinks.forEach((l) => {
    if (l.source === current.id) neighborIds.add(l.target);
    if (l.target === current.id) neighborIds.add(l.source);
  });

  return {
    nodes: graphNodes.filter((n) => neighborIds.has(n.id)).map((n) => ({ ...n })),
    links: graphLinks
      .filter((l) => neighborIds.has(l.source) && neighborIds.has(l.target))
      .map((l) => ({ ...l })),
    currentId: current.id,
  };
}

export default function GraphNav() {
  const router   = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDims({ width: Math.floor(width), height: Math.floor(height) });
    });
    ro.observe(el);
    setDims({ width: Math.floor(el.clientWidth), height: Math.floor(el.clientHeight) });
    return () => ro.disconnect();
  }, []);

  const isDark      = theme !== "light";
  const labelColor  = isDark ? "#64748b" : "#94a3b8";
  const activeLabel = isDark ? "#cbd5e1" : "#1e293b";
  const linkStroke  = isDark ? "#1e293b" : "#e2e8f0";

  const graphData = useMemo(() => getLocalGraph(pathname), [pathname]);

  const paintNode = useCallback(
    (
      node: GraphNode & { x?: number; y?: number },
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      const isActive = node.id === graphData.currentId;
      const r        = nodeRadius(node.id, isActive);
      const color    = NODE_COLORS[node.type] ?? "#94a3b8";
      const x        = node.x ?? 0;
      const y        = node.y ?? 0;

      // Subtle glow ring for active only
      if (isActive) {
        ctx.beginPath();
        ctx.arc(x, y, r + 3, 0, 2 * Math.PI);
        ctx.fillStyle = color + "25";
        ctx.fill();
      }

      // Node dot
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = isActive ? color : color + "88";
      ctx.fill();

      // Label
      const fontSize = Math.max(8, (isActive ? 11 : 9) / globalScale);
      ctx.font       = `${isActive ? 500 : 400} ${fontSize}px Inter, sans-serif`;
      ctx.fillStyle  = isActive ? activeLabel : labelColor;
      ctx.textAlign  = "center";
      ctx.fillText(node.label, x, y + r + fontSize + 1.5);
    },
    [graphData.currentId, labelColor, activeLabel]
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => { if (node.url) router.push(node.url); },
    [router]
  );

  return (
    <div ref={containerRef} className="h-full w-full">
      {dims.width > 0 && dims.height > 0 && (
        <ForceGraph2D
          key={pathname}
          graphData={graphData as never}
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
          cooldownTicks={60}
          d3AlphaDecay={0.06}
          d3VelocityDecay={0.5}
        />
      )}
    </div>
  );
}
