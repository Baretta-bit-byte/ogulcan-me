import { getAllPosts } from "@/lib/posts";
import { getAllTils } from "@/lib/til";
import { graphNodes, graphLinks } from "@/lib/graphData";
import Backlinks from "@/components/Backlinks";
import { BarChart2, FileText, Lightbulb, Network, Link2, ExternalLink } from "lucide-react";

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
