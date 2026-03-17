/**
 * Steam data fetcher — runs via `npm run prebuild` and the `steam.yml` cron.
 *
 * Required env vars:
 *   STEAM_API_KEY  ← https://steamcommunity.com/dev/apikey
 *   STEAM_ID       ← Your 64-bit Steam ID (e.g. "76561198...")
 *                    Find yours at: https://www.steamidfinder.com
 *
 * Output: public/steam-data.json
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";

const { STEAM_API_KEY, STEAM_ID } = process.env;

const EMPTY = {
  player: null,
  recentGames: [],
  totalGames: 0,
  totalPlaytime: 0,
  fetched_at: null,
};

function preserve(reason) {
  console.warn(`⚠  ${reason}`);
  if (existsSync("public/steam-data.json")) {
    console.warn("⚠  Keeping existing steam-data.json.");
  } else {
    console.warn("⚠  Writing empty fallback data.");
    mkdirSync("public", { recursive: true });
    writeFileSync("public/steam-data.json", JSON.stringify(EMPTY, null, 2));
  }
  process.exit(0);
}

if (!STEAM_API_KEY || !STEAM_ID) {
  preserve("STEAM_API_KEY or STEAM_ID not set — skipping.");
}

const STEAM = "https://api.steampowered.com";

function steamUrl(iface, method, version, extra = {}) {
  const p = new URLSearchParams({
    key: STEAM_API_KEY,
    steamid: STEAM_ID,
    format: "json",
    ...extra,
  });
  return `${STEAM}/${iface}/${method}/${version}/?${p}`;
}

// ── Fetch in parallel ─────────────────────────────────────────────────────────

let playerRes, recentRes, ownedRes;
try {
  [playerRes, recentRes, ownedRes] = await Promise.all([
    fetch(steamUrl("ISteamUser", "GetPlayerSummaries", "v2", { steamids: STEAM_ID })),
    fetch(steamUrl("IPlayerService", "GetRecentlyPlayedGames", "v1", { count: "10" })),
    fetch(steamUrl("IPlayerService", "GetOwnedGames", "v1", {
      include_appinfo: "false",
      include_played_free_games: "true",
    })),
  ]);
} catch (e) {
  preserve(`Network error: ${e.message}`);
}

// ── Parse ─────────────────────────────────────────────────────────────────────

let playerData, recentData, ownedData;
try {
  [playerData, recentData, ownedData] = await Promise.all([
    playerRes.json(),
    recentRes.json(),
    ownedRes.json(),
  ]);
} catch (e) {
  preserve(`JSON parse error: ${e.message}`);
}

// ── Shape ─────────────────────────────────────────────────────────────────────

const playerRaw = playerData.response?.players?.[0] ?? null;
const player = playerRaw
  ? {
      steamid:       playerRaw.steamid,
      personaname:   playerRaw.personaname,
      avatarfull:    playerRaw.avatarfull,
      profileurl:    playerRaw.profileurl,
      personastate:  playerRaw.personastate ?? 0, // 0=offline, 1=online, 2=busy, 3=away, 4=snooze
      gameid:        playerRaw.gameid        ?? null, // currently playing app ID
      gameextrainfo: playerRaw.gameextrainfo ?? null, // currently playing game name
    }
  : null;

const recentGames = (recentData.response?.games ?? []).map((g) => ({
  appid:            g.appid,
  name:             g.name,
  playtime_2weeks:  g.playtime_2weeks  ?? 0, // minutes
  playtime_forever: g.playtime_forever ?? 0, // minutes
  img_icon_url:     g.img_icon_url     ?? "",
  header_image:     `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
}));

const ownedGames    = ownedData.response?.games ?? [];
const totalGames    = ownedData.response?.game_count ?? ownedGames.length;
const totalPlaytime = ownedGames.reduce((sum, g) => sum + (g.playtime_forever ?? 0), 0);

// ── Write ─────────────────────────────────────────────────────────────────────

const output = { player, recentGames, totalGames, totalPlaytime, fetched_at: new Date().toISOString() };
mkdirSync("public", { recursive: true });
writeFileSync("public/steam-data.json", JSON.stringify(output, null, 2));

console.log(
  `✓  Steam: ${recentGames.length} recent games, ${totalGames} owned, player: ${player?.personaname ?? "unknown"}`
);
