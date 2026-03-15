/**
 * One-time helper to get a fresh Spotify refresh token.
 *
 * Uses your live site as the redirect URI (no local server needed).
 *
 * BEFORE running:
 *   1. Go to https://developer.spotify.com/dashboard → your app → Edit Settings
 *   2. Add  https://ogulcantokmak.me/  as a Redirect URI and save.
 *
 * STEP 1 — print auth URL:
 *   SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/get-spotify-token.mjs
 *
 * STEP 2 — exchange code (paste the FULL redirect URL from the browser address bar):
 *   SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/get-spotify-token.mjs "https://ogulcantokmak.me/?code=AQ..."
 */

const CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI  = "https://ogulcantokmak.me/";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing env vars. Run like:\n");
  console.error("  SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/get-spotify-token.mjs\n");
  process.exit(1);
}

const arg = process.argv[2];

if (!arg) {
  // Step 1: print the auth URL
  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    response_type: "code",
    redirect_uri:  REDIRECT_URI,
    scope:         "user-top-read user-read-private playlist-read-private",
  });

  console.log("\n=== STEP 1: Visit this URL in your browser ===\n");
  console.log(`https://accounts.spotify.com/authorize?${params}\n`);
  console.log("After authorizing, your browser will redirect to ogulcantokmak.me");
  console.log("The address bar will look like:");
  console.log("  https://ogulcantokmak.me/?code=AQxxxxx...\n");
  console.log("Copy the ENTIRE URL from the address bar, then run:");
  console.log('  SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/get-spotify-token.mjs "PASTE_FULL_URL_HERE"\n');
} else {
  // Step 2: extract code from the pasted URL and exchange it
  let code;
  try {
    code = new URL(arg).searchParams.get("code");
  } catch {
    // maybe they pasted just the code, not the full URL
    code = arg;
  }

  if (!code) {
    console.error("Could not extract code from:", arg);
    process.exit(1);
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type:   "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("✖  Token exchange failed:", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log("\n✓  SUCCESS! Your new SPOTIFY_REFRESH_TOKEN:\n");
  console.log(data.refresh_token);
  console.log("\n→ Go to: GitHub repo → Settings → Secrets → Actions");
  console.log("→ Update SPOTIFY_REFRESH_TOKEN with the value above.");
  console.log("→ Then manually trigger the 'Update Spotify Data' workflow.\n");
}
