import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getAllPosts, type PostMeta } from "@/lib/posts";
import { getAllTils, type TilMeta } from "@/lib/til";

interface RelatedContentProps {
  currentSlug: string;
  currentTags: string[];
  type: "post" | "til";
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default function RelatedContent({
  currentSlug,
  currentTags,
  type,
}: RelatedContentProps) {
  const posts = getAllPosts();
  const tils = getAllTils();

  // Score items by number of shared tags
  const scored: { slug: string; title: string; date: string; href: string; kind: "post" | "til"; score: number }[] = [];

  for (const post of posts) {
    if (type === "post" && post.slug === currentSlug) continue;
    const shared = post.tags.filter((t) => currentTags.includes(t)).length;
    if (shared > 0) {
      scored.push({
        slug: post.slug,
        title: post.title,
        date: post.date,
        href: `/posts/${post.slug}`,
        kind: "post",
        score: shared,
      });
    }
  }

  for (const til of tils) {
    if (type === "til" && til.slug === currentSlug) continue;
    const shared = til.tags.filter((t) => currentTags.includes(t)).length;
    if (shared > 0) {
      scored.push({
        slug: til.slug,
        title: til.title,
        date: til.date,
        href: `/til#${til.slug}`,
        kind: "til",
        score: shared,
      });
    }
  }

  // Sort by score desc, then date desc — take top 4
  const related = scored
    .sort((a, b) => b.score - a.score || (a.date < b.date ? 1 : -1))
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2 font-sans">
        <Sparkles className="w-4 h-4 text-amber-400" />
        Related
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {related.map((item) => (
          <Link key={`${item.kind}-${item.slug}`} href={item.href}>
            <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900/50 hover:border-violet-400/40 transition-all">
              <div className="absolute inset-y-0 left-0 w-0.5 bg-violet-400/50 group-hover:bg-violet-400 transition-all" />
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase">
                  {item.kind}
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {formatDate(item.date)}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-200 group-hover:text-violet-400 transition-colors line-clamp-2">
                {item.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
