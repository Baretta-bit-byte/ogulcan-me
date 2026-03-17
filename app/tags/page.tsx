import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { getAllTils } from "@/lib/til";

function buildTagCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  for (const til of getAllTils()) {
    for (const tag of til.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return counts;
}

export default function TagsPage() {
  const tagCounts = buildTagCounts();
  const sorted = [...tagCounts.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <article className="space-y-12">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Tags</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          All tags across posts and TIL entries.
        </p>
        <p className="font-mono text-xs text-slate-400">{sorted.length} tags</p>
      </section>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center">
          <p className="font-mono text-sm text-slate-400">No tags yet.</p>
        </div>
      ) : (
        <section className="flex flex-wrap gap-3">
          {sorted.map(([tag, count]) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="group flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-4 py-1.5 transition-all hover:border-sky-400/50"
            >
              <span className="font-mono text-sm text-slate-700 dark:text-slate-300 group-hover:text-sky-400 transition-colors">
                #{tag}
              </span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 group-hover:bg-sky-400/10 group-hover:text-sky-400 transition-colors">
                {count}
              </span>
            </Link>
          ))}
        </section>
      )}
    </article>
  );
}
