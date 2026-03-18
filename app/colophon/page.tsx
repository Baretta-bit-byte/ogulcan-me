import ArticlePage from "@/components/ArticlePage";
import LinkedTerm from "@/components/LinkedTerm";

const decisions = [
  {
    title: "Next.js 16 + Static Export",
    why: "React is my primary professional competency — using it for my personal site is a direct portfolio signal. Static export means zero server cost, zero cold starts, and a site that survives even if I stop paying for infrastructure.",
    tradeoff: "No server-side features (API routes, ISR, middleware). Every dynamic data source needs a creative workaround — build-time scripts or client-side fetches.",
  },
  {
    title: "GitHub Pages over Vercel",
    why: "Free, no vendor lock-in, and the deploy pipeline is a simple GitHub Actions workflow I fully control. The site is pure static HTML/CSS/JS — it doesn't need edge functions or serverless infrastructure.",
    tradeoff: "No preview deployments per PR, no built-in analytics, no automatic cache invalidation.",
  },
  {
    title: "Tailwind CSS v4",
    why: "Utility-first CSS eliminates the naming problem and keeps styles co-located with markup. v4's CSS-native configuration removes the need for a JS config file entirely.",
    tradeoff: "Long class strings in JSX. Mitigated by extracting repeated patterns into components rather than @apply directives.",
  },
  {
    title: "Framer Motion v12",
    why: "The animation API maps directly to React's mental model — animate on mount, exit on unmount, layout animations via layoutId. The page transition system uses template.tsx + motion.div for fade-in on navigation.",
    tradeoff: "Bundle size (~30KB gzipped). Acceptable for a portfolio site where polish is the point.",
  },
  {
    title: "react-force-graph-2d",
    why: "Canvas-based graph rendering handles the knowledge graph's 26+ nodes smoothly. The library supports custom node painting, which lets me color-code by type and scale by connection count.",
    tradeoff: "Requires ssr: false dynamic import (Canvas doesn't exist during SSR). The graph is client-rendered, not part of the static HTML.",
  },
  {
    title: "Cron-based Data Pipelines",
    why: "Spotify, Flickr, and Steam data require API keys or OAuth. Instead of a server, GitHub Actions crons run fetch scripts every 30min–6h and commit JSON files to the repo. The site reads from raw.githubusercontent.com — no redeploy needed.",
    tradeoff: "Data staleness up to the cron interval. Git history accumulates data commits. Both are acceptable trade-offs.",
  },
  {
    title: "MDX over plain Markdown",
    why: "MDX lets me embed React components inside blog posts — interactive code blocks, LinkedTerm hover cards, custom callouts. This is essential for a site that treats content as an interconnected graph, not isolated pages.",
    tradeoff: "Slightly more complex build pipeline (next-mdx-remote + gray-matter). Worth it for the authoring flexibility.",
  },
  {
    title: "View Transitions API for Theme Toggle",
    why: "The circular reveal effect when switching dark/light mode is pure CSS — no JavaScript animation library needed. It creates a memorable micro-interaction that visitors notice and remember.",
    tradeoff: "Not supported in all browsers (Firefox partial). Falls back gracefully to an instant theme switch.",
  },
];

export default function ColophonPage() {
  return (
    <ArticlePage
      nodeId="colophon"
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Colophon" },
      ]}
      title="Colophon"
      tags={[
        { label: "architecture", variant: "tech" },
        { label: "meta", variant: "tech" },
      ]}
      tocItems={[
        { id: "why-this-page", label: "Why This Page Exists", level: 2 },
        { id: "decisions", label: "Architectural Decisions", level: 2 },
        { id: "stack", label: "Full Stack", level: 2 },
      ]}
    >
      <h2 id="why-this-page">Why This Page Exists</h2>
      <p>
        Most portfolios show <em>what</em> was built. This page explains{" "}
        <em>why</em> each technical decision was made — and what was traded away.
        Every choice here is a deliberate constraint, not a default.
      </p>
      <p>
        This site is a{" "}
        <LinkedTerm
          href="/posts/why-i-built-this-garden"
          variant="tech"
          title="Why I Built This Garden"
          content="On personal websites, digital gardens, and the technical architecture behind a living portfolio."
        >
          digital garden
        </LinkedTerm>
        {" "}— an interconnected knowledge graph, not a static portfolio. The
        architecture reflects that philosophy: everything is linked, everything
        grows, and every page knows what references it.
      </p>

      <h2 id="decisions">Architectural Decisions</h2>
      {decisions.map((d, i) => (
        <div
          key={i}
          className="mb-6 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono">
              {d.title}
            </h3>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div>
              <span className="text-[10px] font-mono font-semibold text-emerald-500 uppercase tracking-wider">
                Why
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                {d.why}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-mono font-semibold text-amber-500 uppercase tracking-wider">
                Trade-off
              </span>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                {d.tradeoff}
              </p>
            </div>
          </div>
        </div>
      ))}

      <h2 id="stack">Full Stack</h2>
      <p>
        The complete technology surface documented in one place — see{" "}
        <LinkedTerm
          href="/uses"
          nodeId="uses"
          variant="tech"
        >
          /uses
        </LinkedTerm>
        {" "}for the development environment.
      </p>
      <div className="grid grid-cols-2 gap-3 not-prose">
        {[
          { label: "Framework", value: "Next.js 16 (App Router)" },
          { label: "Styling", value: "Tailwind CSS v4" },
          { label: "Animation", value: "Framer Motion v12" },
          { label: "Graph", value: "react-force-graph-2d" },
          { label: "Content", value: "MDX + gray-matter" },
          { label: "Tooltips", value: "Radix UI Hover Card" },
          { label: "Icons", value: "Lucide React" },
          { label: "Hosting", value: "GitHub Pages" },
          { label: "Analytics", value: "Umami Cloud" },
          { label: "CI/CD", value: "GitHub Actions" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2"
          >
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              {item.label}
            </p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </ArticlePage>
  );
}
