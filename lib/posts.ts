import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type Maturity = "seedling" | "sapling" | "evergreen";

export interface PostMeta {
  slug:        string;
  title:       string;
  description: string;
  date:        string;
  maturity:    Maturity;
  tags:        string[];
}

export interface Post extends PostMeta {
  content: string;
}

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw  = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
      const { data } = matter(raw);
      return {
        slug,
        title:       data.title       ?? slug,
        description: data.description ?? "",
        date:        data.date        ?? "",
        maturity:    (data.maturity   ?? "seedling") as Maturity,
        tags:        data.tags        ?? [],
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | null {
  const filepath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filepath)) return null;

  const raw = fs.readFileSync(filepath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title:       data.title       ?? slug,
    description: data.description ?? "",
    date:        data.date        ?? "",
    maturity:    (data.maturity   ?? "seedling") as Maturity,
    tags:        data.tags        ?? [],
    content,
  };
}
