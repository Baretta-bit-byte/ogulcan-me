"use client";

import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { graphNodes, graphLinks, GraphNode } from "@/lib/graphData";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

// φ — golden ratio for harmonious, overlap-free node spacing
const PHI = 1.618;

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

function nodeRadius(id: string, isActive: boolean): number {
  const deg = degreeMap.get(id) ?? 1;
  if (isActive) return Math.min(4 + deg * 0.5, 8);
  return Math.min(2.5 + deg * 0.4, 6);
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
  const router      = useRouter();
  const pathname    = usePathname();
  const { theme }   = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef        = useRef<any>(null);
  const [dims, setDims]         = useState({ width: 0, height: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
  const labelColor  = isDark ? "#94a3b8" : "#334155";  // slate-400 / slate-700
  const activeLabel = isDark ? "#e2e8f0" : "#0f172a";
  const hoverLabel  = isDark ? "#cbd5e1" : "#1e293b";
  const linkStroke  = isDark ? "#1e293b" : "#94a3b8";

  const graphData = useMemo(() => getLocalGraph(pathname), [pathname]);

  // Configure d3 forces — golden-ratio collision prevents node overlap
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    import("d3-force-3d").then((d3: any) => {
      // Collision: label-aware — prevents text overlap
      fg.d3Force(
        "collision",
        d3
          .forceCollide()
          .radius((node: GraphNode) => {
            const r = nodeRadius(node.id, node.id === graphData.currentId);
            const labelHalf = node.label.length * 2.8;
            return Math.max((r + 10) * PHI, labelHalf + r);
          })
          .strength(0.85)
          .iterations(3)
      );
      // Charge: push nodes apart
      const charge = fg.d3Force("charge");
      if (charge) charge.strength(-100);
      // Link distance: golden-ratio scaled
      const link = fg.d3Force("link");
      if (link) link.distance(35 * PHI);
      fg.d3ReheatSimulation();
    });
  }, [graphData.currentId]);

  const paintNode = useCallback(
    (
      node: GraphNode & { x?: number; y?: number },
      ctx: CanvasRenderingContext2D,
      globalScale: number
    ) => {
      const isActive  = node.id === graphData.currentId;
      const isHovered = node.id === hoveredId;
      const r         = nodeRadius(node.id, isActive);
      const baseColor = NODE_COLORS[node.type] ?? "#94a3b8";
      const color     = !isDark && node.type === "root" ? "#64748b" : baseColor;
      const x         = node.x ?? 0;
      const y         = node.y ?? 0;

      // Glow ring for active or hovered
      if (isActive || isHovered) {
        ctx.beginPath();
        ctx.arc(x, y, r + 3, 0, 2 * Math.PI);
        ctx.fillStyle = color + (isActive ? "25" : "18");
        ctx.fill();
      }

      // Node dot
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = isActive ? color : isHovered ? color + "cc" : color + "88";
      ctx.fill();

      // Label
      const fontSize = Math.max(8, (isActive ? 11 : 9) / globalScale);
      ctx.font       = `${isActive ? "500" : "400"} ${fontSize}px Inter, sans-serif`;
      ctx.fillStyle  = isActive ? activeLabel : isHovered ? hoverLabel : labelColor;
      ctx.textAlign  = "center";
      ctx.fillText(node.label, x, y + r + fontSize + 1.5);
    },
    [graphData.currentId, hoveredId, isDark, labelColor, activeLabel, hoverLabel]
  );

  // Larger invisible hit area so clicks register easily
  const paintPointerArea = useCallback(
    (
      node: GraphNode & { x?: number; y?: number },
      color: string,
      ctx: CanvasRenderingContext2D
    ) => {
      const r = nodeRadius(node.id, node.id === graphData.currentId) + 10;
      ctx.beginPath();
      ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    },
    [graphData.currentId]
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => { if (node.url) router.push(node.url); },
    [router]
  );

  const handleNodeHover = useCallback(
    (node: GraphNode | null) => { setHoveredId(node?.id ?? null); },
    []
  );

  // After the simulation cools, fit all visible nodes into the panel
  const handleEngineStop = useCallback(() => {
    fgRef.current?.zoomToFit(300, 20);
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ cursor: hoveredId ? "pointer" : "default" }}
    >
      {dims.width > 0 && dims.height > 0 && (
        <ForceGraph2D
          ref={fgRef}
          key={pathname}
          graphData={graphData as never}
          width={dims.width}
          height={dims.height}
          backgroundColor="transparent"
          linkColor={() => linkStroke}
          linkWidth={1}
          linkDirectionalParticles={1}
          linkDirectionalParticleSpeed={0.003}
          linkDirectionalParticleWidth={1.2}
          linkDirectionalParticleColor={() =>
            isDark ? "rgba(56,189,248,0.4)" : "rgba(71,85,105,0.3)"
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
          cooldownTicks={100}
          d3AlphaDecay={0.04}
          d3VelocityDecay={0.4}
          onEngineStop={handleEngineStop}
        />
      )}
    </div>
  );
}
