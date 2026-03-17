import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const TIL_DIR = path.join(process.cwd(), "content", "til");
const OUT_FILE = path.join(process.cwd(), "public", "search-index.json");

function stripMdx(content) {
  return content
    .replace(/import\s.+from\s.+/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/[*_~]+/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readDir(dir, type) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(dir, filename), "utf8");
      const { data, content } = matter(raw);
      if (data.draft) return null;
      return {
        type,
        slug,
        title: data.title ?? slug,
        description: data.description ?? "",
        content: stripMdx(content).slice(0, 2000),
        url: type === "post" ? `/posts/${slug}` : `/til#${slug}`,
      };
    })
    .filter(Boolean);
}

const index = [...readDir(POSTS_DIR, "post"), ...readDir(TIL_DIR, "til")];
fs.writeFileSync(OUT_FILE, JSON.stringify(index));
console.log(`[search-index] ${index.length} entries written to public/search-index.json`);
