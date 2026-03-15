# AGENTS.md — Guide for AI Agents & LLMs

This file provides structured context for any AI agent, LLM, or automated tool working inside this repository. Read this before making any changes.

---

## Project Identity

- **Name:** ogulcan.me
- **Type:** Personal Digital Garden + Portfolio Website
- **Owner:** Ogulcan Tokmak (GitHub: Baretta-bit-byte)
- **Live URL:** https://ogulcantokmak.me
- **Stack:** Next.js 16 (App Router) · TypeScript 5 · Tailwind CSS v4 · Framer Motion v12 · react-force-graph-2d
- **Deploy:** GitHub Pages, static export (`output: "export"`), CI via GitHub Actions

---

## Current State (2026-03-16)

All core features and live-data integrations are **complete and deployed**. Do not rebuild any of the following:

| Feature | File(s) | Status |
|---|---|---|
| 3-column layout | `app/layout.tsx` | ✅ Done |
| SVG signature animation | `components/Header.tsx` | ✅ Done |
| Organic theme toggle (View Transitions) | `components/ThemeToggle.tsx`, `app/globals.css` | ✅ Done |
| Knowledge graph — local + modal | `components/GraphNav.tsx`, `components/GraphModal.tsx` | ✅ Done |
| Hover tooltip system | `components/LinkedTerm.tsx`, `components/HoverTooltip.tsx` | ✅ Done |
| All content pages | `app/projects/`, `app/math/`, `app/community/` | ✅ Done |
| Footer + easter eggs | `components/Footer.tsx` | ✅ Done |
| Floating pill sidebar | `components/LeftSidebar.tsx` | ✅ Done |
| GitHub Dashboard | `app/github/page.tsx` | ✅ Done |
| Spotify Top Tracks | `app/spotify/page.tsx`, `scripts/fetch-spotify.mjs`, `.github/workflows/spotify.yml` | ✅ Done |
| Books Reading Log | `app/books/page.tsx`, `public/books-data.json` | ✅ Done |
| Vinyl Collection | `app/vinyl/page.tsx`, `scripts/fetch-vinyl.mjs`, `public/vinyl-data.json` | ✅ Done |
| Maps of Content | `app/topics/page.tsx` | ✅ Done |
| /uses page | `app/uses/page.tsx` | ✅ Done |
| /posts stub | `app/posts/page.tsx` | ✅ Done |
| /flickr stub | `app/flickr/page.tsx` | ✅ Done |
| /steam stub | `app/steam/page.tsx` | ✅ Done |
| LinkedTerm maturity badges | `components/LinkedTerm.tsx` (`nodeId` prop) | ✅ Done |

### Pending (next session)
- [ ] **2.5D Signature** — depth/shadow revamp of `components/Header.tsx` SVG paths
- [ ] **Blog / Posts** — wire `next-mdx-remote` into existing `/posts` stub
- [ ] **Flickr** — Flickr API integration into existing `/flickr` stub
- [ ] **Steam** — Steam Web API integration into existing `/steam` stub

---

## Repository Structure

```
MEWebsite/
├── app/
│   ├── layout.tsx                   # Root layout: 3-column shell + theme providers
│   ├── page.tsx                     # Home: bio, courses, project previews, math highlights
│   ├── globals.css                  # Tailwind v4 + dark variant + View Transitions keyframes
│   ├── github/
│   │   └── page.tsx                 # GitHub dashboard (client-side GitHub REST API)
│   ├── spotify/
│   │   └── page.tsx                 # Spotify top tracks (reads /spotify-data.json)
│   ├── books/
│   │   └── page.tsx                 # Reading log (reads /books-data.json + Open Library)
│   ├── vinyl/
│   │   └── page.tsx                 # Vinyl collection (reads /vinyl-data.json)
│   ├── topics/
│   │   └── page.tsx                 # Maps of Content — graph nodes grouped by type
│   ├── uses/
│   │   └── page.tsx                 # Developer environment & stack (ArticlePage)
│   ├── posts/
│   │   └── page.tsx                 # Writing/blog stub (MDX pipeline pending)
│   ├── flickr/
│   │   └── page.tsx                 # Photography grid stub (Flickr API pending)
│   ├── steam/
│   │   └── page.tsx                 # Steam activity stub (Steam Web API pending)
│   ├── projects/
│   │   ├── page.tsx                 # Projects index
│   │   ├── secureexam-generator/    # Article: SecureExam-Generator (Python, PDF+QR)
│   │   └── notepadio/               # Article: NotePadIo (low-code collab notes)
│   ├── math/
│   │   ├── page.tsx                 # Math index
│   │   ├── game-theory/             # Article: Game Theory — Ali Nesin
│   │   └── izmir-festival/          # Article: Izmir Mathematics Festival
│   └── community/
│       ├── page.tsx                 # Community index
│       ├── tba/                     # Article: Turkish Informatics Association
│       └── volunteering/            # Article: AFAD & LÖSEV
│
├── components/
│   ├── Header.tsx                   # Animated SVG "OT" cursive signature (draw-erase loop)
│   ├── LeftSidebar.tsx              # Left column: signature + floating pill nav + theme toggle
│   ├── RightPanel.tsx               # Right column: GraphNav + TOC + expand button
│   ├── GraphNav.tsx                 # Local knowledge graph (react-force-graph-2d, ssr:false)
│   ├── GraphModal.tsx               # Full-screen graph overlay (all nodes + color legend)
│   ├── Footer.tsx                   # Social icons, cd../ nav, ~ easter egg, Konami code
│   ├── HoverTooltip.tsx             # Standalone hover card (no navigation)
│   ├── LinkedTerm.tsx               # Hover card + next/link; nodeId prop adds maturity badge from graphData
│   ├── ArticlePage.tsx              # Shared article layout (breadcrumb, title, tags, TOC)
│   ├── Breadcrumb.tsx               # Path breadcrumb component
│   ├── TableOfContents.tsx          # TOC with smooth-scroll anchors
│   ├── ThemeProvider.tsx            # next-themes wrapper (class-based, default dark)
│   ├── ThemeReadyGate.tsx           # Adds `theme-ready` class after first paint (prevents FOUC)
│   └── ThemeToggle.tsx              # Sun/moon toggle — uses View Transitions API for reveal
│
├── lib/
│   ├── graphData.ts                 # All graph nodes + links — MUST be updated for every new page
│   └── rightPanelContext.tsx        # React context: pages register TOC items here
│
├── scripts/
│   ├── fetch-spotify.mjs            # Prebuild: exchanges refresh token, writes /public/spotify-data.json (preserves existing on failure)
│   ├── fetch-vinyl.mjs              # Prebuild: fetches Discogs collection, writes /public/vinyl-data.json
│   └── get-spotify-token.mjs        # One-time helper: generates a new SPOTIFY_REFRESH_TOKEN via OAuth
│
├── public/
│   ├── books-data.json              # Manually maintained — edit to add/update books
│   ├── vinyl-data.json              # Manually maintained OR overwritten by fetch-vinyl.mjs
│   ├── spotify-data.json            # Tracked in git — updated every 30 min by spotify.yml cron
│   └── CNAME                        # ogulcantokmak.me
│
├── .github/
│   └── workflows/
│       ├── deploy.yml               # CI: prebuild → next build → GitHub Pages deploy
│       │                            # Ignores spotify-data.json changes (no redeploy needed for data)
│       │                            # Exposes: SPOTIFY_CLIENT_ID/SECRET/REFRESH_TOKEN, DISCOGS_*
│       └── spotify.yml              # Cron every 30 min: fetch top tracks → commit spotify-data.json
│
├── v1/                              # Legacy HTML portfolio (April 2025) — READ-ONLY, DO NOT MODIFY
├── CLAUDE.md                        # Project spec for Claude Code (owner can edit)
├── AGENTS.md                        # This file — AI agent context
├── README.md                        # Human-readable documentation
└── LICENSE                          # MIT
```

---

## Critical Rules for Agents

### NEVER modify
- `v1/` — preserved legacy portfolio, read-only history
- `public/spotify-data.json` — managed by the `spotify.yml` cron workflow; do not manually edit or delete

### Always update together
- Adding a new page → **must** also update `lib/graphData.ts` (node + link) AND `components/LeftSidebar.tsx` (nav item)
- Changing theme behavior → check both `ThemeToggle.tsx` and `ThemeProvider.tsx` and `app/globals.css`

### Checklist: adding a new page
1. Create the route under `app/{section}/page.tsx`
2. Wrap article content in `<ArticlePage>` for consistent layout
3. Add a node to `graphNodes` in `lib/graphData.ts`
4. Add a link to `graphLinks` connecting it to its parent (`home` or a section)
5. Add a nav item to `NAV_ITEMS` in `components/LeftSidebar.tsx`
6. If it was in `SOON_ITEMS`, remove it from there
7. Optionally add a `LinkedTerm` reference from the parent section's index page

### TypeScript
- Run `npx tsc --noEmit` before finalizing. Zero errors required.
- Framer Motion easing arrays must be typed as `Easing[]` (import from `framer-motion`)

---

## Design System

### Color tokens
| Name | Dark Mode | Light Mode | Usage |
|---|---|---|---|
| Background | `#0F172A` slate-900 | `#F8FAFC` slate-50 | Page background |
| Body text | slate-200 | slate-900 | Primary text |
| Tech accent | sky-400 `#38BDF8` | sky-500 | Projects, GitHub, code |
| Math accent | violet-400 `#A78BFA` | violet-500 | Mathematics |
| Music accent | emerald-400 `#34D399` | emerald-500 | Spotify |
| Star rating | amber-400 `#FBBF24` | amber-400 | Books |
| Muted | slate-400 | slate-500 | Secondary text |

### Typography
- **Body:** `Inter` via CSS variable `--font-inter`
- **Code / mono:** `JetBrains Mono` via CSS variable `--font-mono`

### Variant system
`LinkedTerm` and `HoverTooltip` accept a `variant` prop:
- `"tech"` → sky-400 accent bar + dot
- `"math"` → violet-400 accent
- `"default"` → neutral slate

### Reusable patterns
```tsx
// Skeleton loader
<div className="animate-pulse rounded bg-slate-100 dark:bg-slate-800 h-4 w-32" />

// Card with left accent border
<div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-sky-400/40">
  <div className="absolute inset-y-0 left-0 w-0.5 bg-sky-400/50 group-hover:bg-sky-400 transition-all" />
  ...
</div>

// timeAgo helper (copy from app/github/page.tsx)
```

---

## Graph System

`lib/graphData.ts` defines:
- `graphNodes: GraphNode[]` — `{ id, label, type, url, description, maturity? }`
- `graphLinks: GraphLink[]` — `{ source: id, target: id }`

Node types: `"root"` | `"tech"` | `"math"` | `"personal"`

`GraphNav` = local graph (current page + 1-hop neighbors)
`GraphModal` = full graph in fullscreen overlay

Cross-links (non-tree edges) make this a real graph — always add at least one cross-link when a page relates to another non-parent node.

---

## Live Data Architecture

| Integration | Fetch timing | Secret(s) needed | Fallback |
|---|---|---|---|
| GitHub | Client-side (useEffect) | None | Error message shown |
| Spotify | `spotify.yml` cron every 30 min → commits `public/spotify-data.json`; page reads from `raw.githubusercontent.com` | `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` | Preserves last committed data |
| Books | Client-side (reads static JSON) | None | Edit `public/books-data.json` |
| Vinyl | Client-side (reads static JSON) | `DISCOGS_USERNAME`, `DISCOGS_USER_TOKEN` (optional, enriches data) | Existing `public/vinyl-data.json` |

### Spotify refresh token — one-time setup
If the `SPOTIFY_REFRESH_TOKEN` secret ever becomes invalid, regenerate it:
```powershell
$env:SPOTIFY_CLIENT_ID="..."
$env:SPOTIFY_CLIENT_SECRET="..."
node scripts/get-spotify-token.mjs
# visit the printed URL → authorize → copy full redirect URL → run again with it
```
Redirect URI to add in Spotify Dashboard: `https://ogulcantokmak.me/`
The refresh token does **not** expire on its own — only if you change your Spotify password or revoke the app.

---

## Development Commands

```bash
npm run dev         # Dev server at localhost:3000
npm run build       # Runs prebuild (fetch-spotify + fetch-vinyl), then next build
npx tsc --noEmit    # Type-check only — run before committing
npm run lint        # ESLint
```

The `prebuild` scripts gracefully no-op if their required env vars are missing, so local `npm run build` always works without secrets.
