import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import Link from "next/link";
import { getAllPosts, getPost, type Maturity } from "@/lib/posts";

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

const maturityLabel: Record<Maturity, { icon: string; label: string; color: string }> = {
  seedling:  { icon: "🌱", label: "Seedling",  color: "text-emerald-500" },
  sapling:   { icon: "🪴", label: "Sapling",   color: "text-violet-400"  },
  evergreen: { icon: "🌳", label: "Evergreen", color: "text-sky-400"     },
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { content } = await compileMDX({
    source: post.content,
    options: { parseFrontmatter: false },
  });

  const m = maturityLabel[post.maturity];

  return (
    <article className="space-y-10">
      {/* Back link */}
      <Link
        href="/posts"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-400 hover:text-violet-400 transition-colors"
      >
        ← Writing
      </Link>

      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 font-mono text-xs ${m.color}`}>
            {m.icon} {m.label}
          </span>
          {post.date && (
            <>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="font-mono text-xs text-slate-400">{formatDate(post.date)}</span>
            </>
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-snug">
          {post.title}
        </h1>

        {post.description && (
          <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            {post.description}
          </p>
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="border-b border-slate-200 dark:border-slate-800 pt-2" />
      </header>

      {/* MDX content */}
      <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-violet-500 prose-a:no-underline hover:prose-a:underline prose-code:font-mono prose-code:text-sm prose-code:bg-slate-100 prose-code:dark:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
        {content}
      </div>
    </article>
  );
}
