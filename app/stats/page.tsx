import { getAllPosts } from "@/lib/posts";
import { getAllTils } from "@/lib/til";
import { graphNodes, graphLinks } from "@/lib/graphData";
import Backlinks from "@/components/Backlinks";
import { BarChart2, FileText, Lightbulb, Network, Link2, ExternalLink, CalendarDays } from "lucide-react";

// Set your Umami public share URL after enabling it in:
// Umami Dashboard → Website Settings → Share
const UMAMI_SHARE_URL = "https://cloud.umami.is/share/K1d4IcPrFgtnZG82";

export default function StatsPage() {
  const posts = getAllPosts();
  const tils  = getAllTils();

  const metrics = [
    {
      label: "Graph Nodes",
      value: graphNodes.length,
      icon: Network,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
      accent: "bg-sky-500",
    },
    {
      label: "Graph Links",
      value: graphLinks.length,
      icon: Link2,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      accent: "bg-violet-500",
    },
    {
      label: "Blog Posts",
      value: posts.length,
      icon: FileText,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      accent: "bg-emerald-500",
    },
    {
      label: "TIL Entries",
      value: tils.length,
      icon: Lightbulb,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      accent: "bg-amber-500",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-24 font-sans">
      {/* Header */}
      <section className="mt-6 mb-10 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-sky-500" />
          /stats
        </h1>
        <p className="font-mono text-sm text-slate-400">
          Site metrics and analytics — updated live.
        </p>
      </section>

      {/* Metric cards */}
      <section className="mb-12">
        <h2 className="text-sm font-mono font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Site at a Glance
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map(({ label, value, icon: Icon, color, bg, border, accent }) => (
            <div
              key={label}
              className={`relative overflow-hidden rounded-xl border ${border} ${bg} p-5`}
            >
              <div className={`absolute inset-y-0 left-0 w-1 ${accent}`} />
              <Icon className={`w-4 h-4 ${color} mb-3`} />
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Page breakdown */}
      <section className="mb-12">
        <h2 className="text-sm font-mono font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Content Breakdown
        </h2>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {[
            { label: "Tech nodes", value: graphNodes.filter(n => n.type === "tech").length },
            { label: "Math nodes", value: graphNodes.filter(n => n.type === "math").length },
            { label: "Personal nodes", value: graphNodes.filter(n => n.type === "personal").length },
            { label: "Evergreen notes 🌳", value: graphNodes.filter(n => n.maturity === "evergreen").length },
            { label: "Sapling notes 🪴", value: graphNodes.filter(n => n.maturity === "sapling").length },
            { label: "Seedling notes 🌱", value: graphNodes.filter(n => n.maturity === "seedling").length },
          ].map(({ label, value }, i, arr) => (
            <div
              key={label}
              className={`flex items-center justify-between px-5 py-3 text-sm ${
                i !== arr.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""
              }`}
            >
              <span className="text-slate-600 dark:text-slate-400 font-mono">{label}</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Graph Topology */}
      <section className="mb-12">
        <h2 className="text-sm font-mono font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Graph Topology
        </h2>
        {(() => {
          // Compute connection counts per node
          const connectionCount: Record<string, number> = {};
          for (const node of graphNodes) connectionCount[node.id] = 0;
          for (const link of graphLinks) {
            connectionCount[link.source] = (connectionCount[link.source] || 0) + 1;
            connectionCount[link.target] = (connectionCount[link.target] || 0) + 1;
          }

          const avgConnections = (graphLinks.length * 2 / graphNodes.length).toFixed(1);
          const density = ((graphLinks.length * 2) / (graphNodes.length * (graphNodes.length - 1)) * 100).toFixed(1);

          const mostConnected = graphNodes
            .map(n => ({ ...n, count: connectionCount[n.id] || 0 }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

          const orphans = graphNodes.filter(n => (connectionCount[n.id] || 0) <= 1 && n.id !== "home");

          return (
            <>
              {/* Topology stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <p className="text-2xl font-bold text-sky-500 tabular-nums">{avgConnections}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">Avg. connections / node</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <p className="text-2xl font-bold text-violet-500 tabular-nums">{density}%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">Graph density</p>
                </div>
              </div>

              {/* Most connected nodes */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <p className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">Most Connected</p>
                </div>
                {mostConnected.map(({ id, label, count }, i, arr) => (
                  <div
                    key={id}
                    className={`flex items-center justify-between px-5 py-3 text-sm ${
                      i !== arr.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""
                    }`}
                  >
                    <span className="text-slate-600 dark:text-slate-400 font-mono">{label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-sky-400"
                          style={{ width: `${Math.min(100, (count / (mostConnected[0]?.count || 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Orphan detection */}
              {orphans.length > 0 && (
                <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-5">
                  <p className="text-xs font-mono font-semibold text-amber-500 uppercase tracking-wider mb-3">
                    Needs more connections ({orphans.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {orphans.map(n => (
                      <span key={n.id} className="rounded-md border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 font-mono text-[11px] text-amber-600 dark:text-amber-400">
                        {n.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </section>

      {/* Content Activity Heatmap */}
      <section className="mb-12">
        <h2 className="text-sm font-mono font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <CalendarDays className="w-4 h-4" /> Garden Activity
        </h2>
        {(() => {
          // Collect all dates: lastTended from nodes, post dates, TIL dates
          const dateCounts: Record<string, number> = {};
          for (const n of graphNodes) {
            if (n.lastTended) dateCounts[n.lastTended] = (dateCounts[n.lastTended] || 0) + 1;
          }
          for (const p of posts) {
            if (p.date) {
              const d = p.date.slice(0, 10);
              dateCounts[d] = (dateCounts[d] || 0) + 1;
            }
          }
          for (const t of tils) {
            if (t.date) {
              const d = t.date.slice(0, 10);
              dateCounts[d] = (dateCounts[d] || 0) + 1;
            }
          }

          // Generate last 12 weeks of dates
          const today = new Date();
          const weeks: string[][] = [];
          for (let w = 11; w >= 0; w--) {
            const week: string[] = [];
            for (let d = 0; d < 7; d++) {
              const date = new Date(today);
              date.setDate(date.getDate() - (w * 7 + (6 - d)));
              week.push(date.toISOString().slice(0, 10));
            }
            weeks.push(week);
          }

          const maxCount = Math.max(1, ...Object.values(dateCounts));

          function cellColor(count: number): string {
            if (count === 0) return "bg-slate-100 dark:bg-slate-800";
            const ratio = count / maxCount;
            if (ratio < 0.33) return "bg-emerald-200 dark:bg-emerald-900";
            if (ratio < 0.66) return "bg-emerald-400 dark:bg-emerald-700";
            return "bg-emerald-500 dark:bg-emerald-500";
          }

          const totalActivity = Object.values(dateCounts).reduce((s, c) => s + c, 0);
          const activeDays = Object.keys(dateCounts).length;

          return (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl font-bold text-emerald-500 tabular-nums">{totalActivity}</span>
                <span className="text-xs text-slate-500 font-mono">contributions across {activeDays} days</span>
              </div>
              <div className="flex gap-1">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-1">
                    {week.map((date) => (
                      <div
                        key={date}
                        className={`w-3 h-3 rounded-sm ${cellColor(dateCounts[date] || 0)}`}
                        title={`${date}: ${dateCounts[date] || 0} updates`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="text-[10px] text-slate-400 font-mono">Less</span>
                <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
                <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
                <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
                <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="text-[10px] text-slate-400 font-mono">More</span>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Umami analytics embed */}
      <section className="mb-12">
        <h2 className="text-sm font-mono font-semibold text-slate-400 uppercase tracking-widest mb-4">
          Analytics
        </h2>
        {UMAMI_SHARE_URL ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <iframe
              src={UMAMI_SHARE_URL}
              className="w-full"
              style={{ height: "600px", border: "none" }}
              title="Umami Analytics"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tracking is active via Umami. To embed the public dashboard here:
            </p>
            <ol className="text-sm text-slate-500 dark:text-slate-400 space-y-1 list-decimal list-inside font-mono">
              <li>Go to Umami → Website Settings → Share</li>
              <li>Enable &quot;Share URL&quot;</li>
              <li>Copy the link and set <code className="text-sky-400">UMAMI_SHARE_URL</code> in <code className="text-sky-400">app/stats/page.tsx</code></li>
            </ol>
            <a
              href="https://cloud.umami.is"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-sky-500 hover:text-sky-400 transition-colors font-mono"
            >
              Open Umami Dashboard <ExternalLink size={12} />
            </a>
          </div>
        )}
      </section>

      <Backlinks nodeId="stats" />
    </div>
  );
}
