import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface TilMeta {
  slug:  string;
  title: string;
  date:  string;
  tags:  string[];
}

export interface Til extends TilMeta {
  content: string;
}

const TIL_DIR = path.join(process.cwd(), "content", "til");

export function getAllTils(): TilMeta[] {
  if (!fs.existsSync(TIL_DIR)) return [];

  return fs
    .readdirSync(TIL_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw  = fs.readFileSync(path.join(TIL_DIR, filename), "utf8");
      const { data } = matter(raw);
      return {
        slug,
        title: data.title ?? slug,
        date:  data.date  ?? "",
        tags:  data.tags  ?? [],
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getTil(slug: string): Til | null {
  const filepath = path.join(TIL_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filepath)) return null;

  const raw = fs.readFileSync(filepath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title:   data.title ?? slug,
    date:    data.date  ?? "",
    tags:    data.tags  ?? [],
    content,
  };
}
