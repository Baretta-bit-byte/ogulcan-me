import Link from "next/link";
import { getAllPosts, type PostMeta, type Maturity } from "@/lib/posts";
import { getAllTils, type TilMeta } from "@/lib/til";

export function generateStaticParams() {
  const tags = new Set<string>();
  for (const post of getAllPosts()) for (const tag of post.tags) tags.add(tag);
  for (const til  of getAllTils())  for (const tag of til.tags)  tags.add(tag);
  return [...tags].map((tag) => ({ tag: encodeURIComponent(tag) }));
}

const maturityLabel: Record<Maturity, string> = {
  seedling: "🌱", sapling: "🪴", evergreen: "🌳",
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const tag = decodeURIComponent(params.tag);

  const posts: PostMeta[] = getAllPosts().filter((p) => p.tags.includes(tag));
  const tils:  TilMeta[]  = getAllTils().filter((t)  => t.tags.includes(tag));
  const total = posts.length + tils.length;

  return (
    <article className="space-y-12">
      <section className="space-y-3">
        <Link href="/tags" className="font-mono text-xs text-slate-400 hover:text-sky-400 transition-colors">
          ← all tags
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          <span className="text-sky-400">#</span>{tag}
        </h1>
        <p className="font-mono text-xs text-slate-400">{total} {total === 1 ? "entry" : "entries"}</p>
      </section>

      {posts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Posts</h2>
          <div className="space-y-2">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/posts/${post.slug}`}
                className="group flex items-start justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-5 py-4 transition-all hover:border-violet-400/40"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span>{maturityLabel[post.maturity]}</span>
                    <span className="truncate font-semibold text-slate-800 dark:text-slate-100 group-hover:text-violet-400 transition-colors">
                      {post.title}
                    </span>
                  </div>
                  {post.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{post.description}</p>
                  )}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1 pt-1">
                  <span className="font-mono text-xs text-slate-400">{formatDate(post.date)}</span>
                  <span className="font-mono text-xs text-slate-400">{post.readingTime}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {tils.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Today I Learned</h2>
          <div className="space-y-2">
            {tils.map((til) => (
              <Link
                key={til.slug}
                href={`/til#${til.slug}`}
                className="group flex items-start justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-5 py-4 transition-all hover:border-sky-400/40"
              >
                <span className="truncate font-semibold text-slate-800 dark:text-slate-100 group-hover:text-sky-400 transition-colors">
                  {til.title}
                </span>
                <span className="shrink-0 font-mono text-xs text-slate-400 pt-0.5">{formatDate(til.date)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {total === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center">
          <p className="font-mono text-sm text-slate-400">No content tagged with #{tag}.</p>
        </div>
      )}
    </article>
  );
}
