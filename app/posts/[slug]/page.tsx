import "katex/dist/katex.min.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import Link from "next/link";
import rehypeSlug from "rehype-slug";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import Backlinks from "@/components/Backlinks";
import RelatedContent from "@/components/RelatedContent";
import TocRegistrar from "@/components/TocRegistrar";
import { TocItem } from "@/lib/rightPanelContext";
import { getAllPosts, getPost, type Maturity } from "@/lib/posts";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Ogulcan`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://ogulcantokmak.me/posts/${slug}`,
      publishedTime: post.date,
    },
  };
}

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

/** Extract headings from raw markdown for TOC */
function extractHeadings(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  const re = /^(#{1,3})\s+(.+)$/gm;
  let match;
  while ((match = re.exec(markdown)) !== null) {
    const level = match[1].length as 1 | 2 | 3;
    const label = match[2].replace(/\*\*/g, "").replace(/`/g, "").trim();
    // Match rehype-slug's id generation
    const id = label
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    items.push({ id, label, level });
  }
  return items;
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { content } = await compileMDX({
    source: post.content,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkMath],
        rehypePlugins: [rehypeSlug, rehypeKatex],
      },
    },
  });

  const tocItems = extractHeadings(post.content);
  const m = maturityLabel[post.maturity];

  return (
    <article className="space-y-10">
      <TocRegistrar items={tocItems} />
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
          <>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="font-mono text-xs text-slate-400">{post.readingTime}</span>
          </>
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
              <Link
                key={tag}
                href={`/tags/${tag}`}
                className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        <div className="border-b border-slate-200 dark:border-slate-800 pt-2" />
      </header>

      {/* MDX content */}
      <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-violet-500 prose-a:no-underline hover:prose-a:underline prose-code:font-mono prose-code:text-sm prose-code:bg-slate-100 prose-code:dark:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
        {content}
      </div>

      <RelatedContent
        currentSlug={slug}
        currentTags={post.tags}
        type="post"
      />

      <Backlinks nodeId="posts" />
    </article>
  );
}
