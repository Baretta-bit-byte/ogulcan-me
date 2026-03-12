/**
 * Build-time Discogs vinyl collection fetcher
 * Runs via prebuild before `next build`.
 *
 * Required env vars (set as GitHub Actions secrets):
 *   DISCOGS_USERNAME     — your Discogs username
 *   DISCOGS_USER_TOKEN   — Personal Access Token from discogs.com/settings/developers
 *
 * If env vars are missing, the existing public/vinyl-data.json is kept as-is.
 * Output: public/vinyl-data.json
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";

const { DISCOGS_USERNAME, DISCOGS_USER_TOKEN } = process.env;

if (!DISCOGS_USERNAME || !DISCOGS_USER_TOKEN) {
  console.warn("⚠  Discogs env vars missing — keeping existing vinyl-data.json.");
  process.exit(0);
}

const HEADERS = {
  "User-Agent":    "OgulcanPortfolio/1.0 +https://ogulcantokmak.me",
  "Authorization": `Discogs token=${DISCOGS_USER_TOKEN}`,
};

// Fetch first 50 releases sorted by date added
const url = `https://api.discogs.com/users/${DISCOGS_USERNAME}/collection/folders/0/releases?per_page=50&sort=added&sort_order=desc`;

const res = await fetch(url, { headers: HEADERS });

if (!res.ok) {
  console.error("✖  Discogs API error:", res.status, await res.text());
  process.exit(0);
}

const data = await res.json();

const records = (data.releases ?? []).map((r) => {
  const info = r.basic_information;
  return {
    id:     r.id,
    title:  info.title,
    artist: info.artists?.[0]?.name?.replace(/\s*\(\d+\)$/, "") ?? "Unknown",
    year:   info.year,
    genre:  info.genres?.[0] ?? info.styles?.[0] ?? null,
    image:  info.cover_image ?? info.thumb ?? null,
    url:    `https://www.discogs.com/release/${r.id}`,
  };
});

mkdirSync("public", { recursive: true });
writeFileSync(
  "public/vinyl-data.json",
  JSON.stringify({ records }, null, 2)
);

console.log(`✓  Discogs: wrote ${records.length} vinyl records`);
