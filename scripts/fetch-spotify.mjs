/**
 * Build-time Spotify data fetcher
 * Runs via `npm run prebuild` before `next build`.
 *
 * Required env vars (set as GitHub Actions secrets):
 *   SPOTIFY_CLIENT_ID
 *   SPOTIFY_CLIENT_SECRET
 *   SPOTIFY_REFRESH_TOKEN   ← one-time setup, see README
 *
 * Output: public/spotify-data.json
 */

import { writeFileSync, mkdirSync } from "fs";

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;

const EMPTY = { profile: null, tracks: [], fetched_at: null };

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
  console.warn("⚠  Spotify env vars missing — writing empty fallback data.");
  mkdirSync("public", { recursive: true });
  writeFileSync("public/spotify-data.json", JSON.stringify(EMPTY, null, 2));
  process.exit(0);
}

// ── 1. Exchange refresh token for access token ────────────────────────────────
const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${Buffer.from(
      `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
    ).toString("base64")}`,
  },
  body: new URLSearchParams({
    grant_type:    "refresh_token",
    refresh_token: SPOTIFY_REFRESH_TOKEN,
  }),
});

if (!tokenRes.ok) {
  console.error("✖  Spotify token exchange failed:", await tokenRes.text());
  writeFileSync("public/spotify-data.json", JSON.stringify(EMPTY, null, 2));
  process.exit(0);
}

const { access_token } = await tokenRes.json();
const auth = { Authorization: `Bearer ${access_token}` };

// ── 2. Fetch in parallel: user profile, playlists count, top tracks ───────────
const [meRes, playlistsRes, tracksRes] = await Promise.all([
  fetch("https://api.spotify.com/v1/me",                                         { headers: auth }),
  fetch("https://api.spotify.com/v1/me/playlists?limit=1",                       { headers: auth }),
  fetch("https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=12", { headers: auth }),
]);

const me        = await meRes.json();
const playlists = await playlistsRes.json();
const topTracks = await tracksRes.json();

// ── 3. Shape the data ─────────────────────────────────────────────────────────
const profile = {
  name:      me.display_name ?? "Ogulcan",
  followers: me.followers?.total ?? 0,
  playlists: playlists.total ?? 0,
};

const tracks = (topTracks.items ?? []).map((t) => ({
  id:          t.id,
  name:        t.name,
  artists:     t.artists.map((a) => a.name),
  album:       t.album.name,
  // prefer 300px image (index 1), fallback to largest
  image:       t.album.images[1]?.url ?? t.album.images[0]?.url ?? null,
  url:         t.external_urls.spotify,
  preview_url: t.preview_url ?? null,
  duration_ms: t.duration_ms,
}));

// ── 4. Write output ───────────────────────────────────────────────────────────
const output = { profile, tracks, fetched_at: new Date().toISOString() };
mkdirSync("public", { recursive: true });
writeFileSync("public/spotify-data.json", JSON.stringify(output, null, 2));

console.log(`✓  Spotify: ${tracks.length} top tracks, ${profile.playlists} playlists`);
