/**
 * Cloudinary photo fetcher — runs via `npm run prebuild` and the `flickr.yml` cron.
 *
 * Required env vars:
 *   CLOUDINARY_CLOUD_NAME  ← Your cloud name (shown on Cloudinary dashboard)
 *   CLOUDINARY_API_KEY     ← Settings → Access Keys
 *   CLOUDINARY_API_SECRET  ← Settings → Access Keys
 *
 * Setup:
 *   1. Create a free Cloudinary account at https://cloudinary.com
 *   2. Upload your photos into a folder named "photography" (Media Library → New Folder)
 *   3. Add the env vars above as GitHub Secrets
 *
 * Output: public/flickr-data.json
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

const FOLDER = "photography"; // Cloudinary folder name
const MAX    = 24;

const EMPTY = { user: null, photos: [], fetched_at: null };

function preserve(reason) {
  console.warn(`⚠  ${reason}`);
  if (existsSync("public/flickr-data.json")) {
    console.warn("⚠  Keeping existing flickr-data.json.");
  } else {
    console.warn("⚠  Writing empty fallback data.");
    mkdirSync("public", { recursive: true });
    writeFileSync("public/flickr-data.json", JSON.stringify(EMPTY, null, 2));
  }
  process.exit(0);
}

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  preserve("CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET not set — skipping.");
}

// Basic auth header
const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString("base64");

// ── Fetch resource list ───────────────────────────────────────────────────────

const params = new URLSearchParams({
  max_results: String(MAX),
  prefix:      `${FOLDER}/`,
  type:        "upload",
  context:     "true",  // include custom metadata (caption / alt)
  tags:        "true",
});

let res;
try {
  res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image?${params}`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
} catch (e) {
  preserve(`Network error: ${e.message}`);
}

if (!res.ok) {
  preserve(`Cloudinary API error: ${res.status} ${await res.text()}`);
}

let data;
try {
  data = await res.json();
} catch (e) {
  preserve(`JSON parse error: ${e.message}`);
}

// ── Shape ─────────────────────────────────────────────────────────────────────

// Cloudinary CDN URL helper — applies image transformations
function cdnUrl(publicId, transform) {
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transform}/${publicId}`;
}

const photos = (data.resources ?? []).map((r) => {
  const caption = r.context?.custom?.caption ?? r.context?.custom?.alt ?? "";
  // Derive a human-readable title from the public_id filename (strip folder prefix)
  const filename = r.public_id.replace(`${FOLDER}/`, "").replace(/[-_]/g, " ");
  const title    = caption || filename || "Untitled";

  return {
    id:        r.public_id,
    title,
    taken:     r.created_at ?? null,
    tags:      r.tags ?? [],
    width:     r.width,
    height:    r.height,
    // Three sizes via Cloudinary URL transforms — no extra API calls
    url_thumb: cdnUrl(r.public_id, "w_150,h_150,c_fill,q_auto,f_auto"),
    url_med:   cdnUrl(r.public_id, "w_640,c_limit,q_auto,f_auto"),
    url_large: cdnUrl(r.public_id, "w_1200,c_limit,q_auto,f_auto"),
    page_url:  r.secure_url, // opens full-res in new tab
  };
});

// Sort newest first (Cloudinary returns upload order by default)
photos.sort((a, b) => (b.taken ?? "").localeCompare(a.taken ?? ""));

const output = {
  user: { cloud_name: CLOUDINARY_CLOUD_NAME, photos_count: photos.length },
  photos,
  fetched_at: new Date().toISOString(),
};

mkdirSync("public", { recursive: true });
writeFileSync("public/flickr-data.json", JSON.stringify(output, null, 2));

console.log(`✓  Cloudinary: ${photos.length} photos from folder "${FOLDER}"`);
