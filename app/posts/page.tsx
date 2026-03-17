import Link from "next/link";
import { getAllPosts, type Maturity } from "@/lib/posts";

const maturityLabel: Record<Maturity, string> = {
  seedling: "🌱",
  sapling:  "🪴",
  evergreen: "🌳",
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function PostsPage() {
  const posts = getAllPosts();

  return (
    <article className="space-y-12">
      {/* Header */}
      <section className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Writing
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Long-form essays on software, mathematics, and ideas. Organized by maturity —
          from raw seedlings to evergreen arguments.
        </p>
        <div className="flex items-center gap-4 font-mono text-xs text-slate-400">
          <span>🌱 seedling</span>
          <span>🪴 sapling</span>
          <span>🌳 evergreen</span>
        </div>
      </section>

      {/* Post list */}
      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center">
          <p className="font-mono text-sm text-slate-400">No posts yet.</p>
        </div>
      ) : (
        <section className="space-y-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className="group flex items-start justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-5 py-4 transition-all hover:border-violet-400/40 hover:shadow-sm"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base" aria-label={post.maturity}>
                    {maturityLabel[post.maturity]}
                  </span>
                  <span className="truncate font-semibold text-slate-800 dark:text-slate-100 group-hover:text-violet-400 transition-colors">
                    {post.title}
                  </span>
                </div>
                {post.description && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                    {post.description}
                  </p>
                )}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="shrink-0 font-mono text-xs text-slate-400 pt-1">
                {formatDate(post.date)}
              </span>
            </Link>
          ))}
        </section>
      )}
    </article>
  );
}
