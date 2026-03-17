import { compileMDX } from "next-mdx-remote/rsc";
import { getAllTils, getTil } from "@/lib/til";
import Backlinks from "@/components/Backlinks";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

async function TilEntry({ slug }: { slug: string }) {
  const til = getTil(slug);
  if (!til) return null;

  const { content } = await compileMDX({
    source: til.content,
    options: { parseFrontmatter: false },
  });

  return (
    <div className="relative pl-6 pb-10 border-l border-slate-200 dark:border-slate-800 last:pb-0">
      {/* Timeline dot */}
      <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-sky-400 border-2 border-slate-50 dark:border-slate-900" />

      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs text-slate-400">{formatDate(til.date)}</span>
          {til.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {til.title}
        </h3>

        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:text-sky-400 prose-a:no-underline hover:prose-a:underline prose-code:font-mono prose-code:text-xs prose-code:bg-slate-100 prose-code:dark:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-100 prose-pre:dark:bg-slate-800 prose-pre:border prose-pre:border-slate-200 prose-pre:dark:border-slate-700">
          {content}
        </div>
      </div>
    </div>
  );
}

export default async function TilPage() {
  const tils = getAllTils();

  return (
    <article className="space-y-12">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Today I Learned
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Short, practical notes on things I pick up while building. A micro-garden of raw discoveries.
        </p>
        <p className="font-mono text-xs text-slate-400">
          {tils.length} {tils.length === 1 ? "entry" : "entries"}
        </p>
      </section>

      {tils.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center">
          <p className="font-mono text-sm text-slate-400">No TIL entries yet.</p>
        </div>
      ) : (
        <section>
          {tils.map((til) => (
            <TilEntry key={til.slug} slug={til.slug} />
          ))}
        </section>
      )}

      <Backlinks nodeId="til" />
    </article>
  );
}
