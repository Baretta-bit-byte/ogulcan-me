/**
 * GitHub data fetcher — runs via `npm run prebuild` and the `github.yml` cron.
 *
 * Optional env vars:
 *   GITHUB_TOKEN  ← GitHub Actions provides this automatically (secrets.GITHUB_TOKEN)
 *                   Raises rate limit from 60 → 5,000 req/hr. No manual setup needed.
 *
 * Output: public/github-data.json
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";

const USERNAME = "Baretta-bit-byte";
const { GITHUB_TOKEN } = process.env;

const EMPTY = { user: null, repos: [], lastPR: null, contributions: null, fetched_at: null };

const headers = {
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "ogulcan-me-portfolio",
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
};

function preserve(reason) {
  console.warn(`⚠  ${reason}`);
  if (existsSync("public/github-data.json")) {
    console.warn("⚠  Keeping existing github-data.json.");
  } else {
    console.warn("⚠  Writing empty fallback data.");
    mkdirSync("public", { recursive: true });
    writeFileSync("public/github-data.json", JSON.stringify(EMPTY, null, 2));
  }
  process.exit(0);
}

// ── 1. Fetch all endpoints in parallel ───────────────────────────────────────

let userRes, reposRes, eventsRes, contribRes;
try {
  [userRes, reposRes, eventsRes, contribRes] = await Promise.all([
    fetch(`https://api.github.com/users/${USERNAME}`, { headers }),
    fetch(`https://api.github.com/users/${USERNAME}/repos?sort=pushed&per_page=6`, { headers }),
    fetch(`https://api.github.com/users/${USERNAME}/events/public?per_page=100`, { headers }),
    fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`),
  ]);
} catch (e) {
  preserve(`Network error: ${e.message}`);
}

if (!userRes.ok) {
  preserve(`GitHub API error: ${userRes.status} ${await userRes.text()}`);
}

// ── 2. Parse responses ───────────────────────────────────────────────────────

const userData   = await userRes.json();
const reposRaw   = reposRes.ok  ? await reposRes.json()   : [];
const eventsRaw  = eventsRes.ok ? await eventsRes.json()  : [];

// ── 3. Shape data ────────────────────────────────────────────────────────────

const user = {
  followers:    userData.followers    ?? 0,
  following:    userData.following    ?? 0,
  public_repos: userData.public_repos ?? 0,
  html_url:     userData.html_url,
};

const repos = (Array.isArray(reposRaw) ? reposRaw : [])
  .slice(0, 6)
  .map((r) => ({
    id:               r.id,
    name:             r.name,
    description:      r.description  ?? null,
    html_url:         r.html_url,
    pushed_at:        r.pushed_at,
    stargazers_count: r.stargazers_count,
    forks_count:      r.forks_count,
    language:         r.language ?? null,
  }));

// Find the most recent PR event — validate date fields before saving
let lastPR = null;
if (Array.isArray(eventsRaw)) {
  const prEvent = eventsRaw.find(
    (e) => e.type === "PullRequestEvent" && e.payload?.pull_request?.title
  );
  if (prEvent?.payload?.pull_request) {
    const pr = prEvent.payload.pull_request;
    // Only accept valid ISO date strings to prevent NaN bugs client-side
    const createdAt  = pr.created_at  && !isNaN(Date.parse(pr.created_at))  ? pr.created_at  : null;
    const mergedAt   = pr.merged_at   && !isNaN(Date.parse(pr.merged_at))   ? pr.merged_at   : null;
    lastPR = {
      title:      pr.title,
      html_url:   pr.html_url,
      merged_at:  mergedAt,
      created_at: createdAt,
      repo:       prEvent.repo.name,
      state:      pr.state,
    };
  }
}

// Contributions from third-party API
let contributions = null;
if (contribRes?.ok) {
  try {
    contributions = await contribRes.json();
  } catch {
    console.warn("⚠  Could not parse contribution data.");
  }
}

// ── 4. Write output ───────────────────────────────────────────────────────────

const output = { user, repos, lastPR, contributions, fetched_at: new Date().toISOString() };
mkdirSync("public", { recursive: true });
writeFileSync("public/github-data.json", JSON.stringify(output, null, 2));

console.log(`✓  GitHub: ${repos.length} repos, ${user.followers} followers, PR: ${lastPR?.title ?? "none"}`);
