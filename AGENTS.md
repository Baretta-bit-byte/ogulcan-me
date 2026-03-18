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

## Current State (2026-03-18)

All core features and live-data integrations are **complete and deployed**. Do not rebuild any of the following:

| Feature | File(s) | Status |
|---|---|---|
| 3-column layout | `app/layout.tsx` | ✅ Done |
| 2.5D SVG signature (parallax) | `components/Header.tsx` | ✅ Done |
| Organic theme toggle (View Transitions) | `components/ThemeToggle.tsx`, `app/globals.css` | ✅ Done |
| Knowledge graph — local + modal + search | `components/GraphNav.tsx`, `components/GraphModal.tsx` | ✅ Done |
| Hover tooltip system | `components/LinkedTerm.tsx`, `components/HoverTooltip.tsx` | ✅ Done |
| All content pages | `app/projects/`, `app/math/`, `app/community/` | ✅ Done |
| Footer + easter eggs | `components/Footer.tsx` | ✅ Done |
| Floating pill sidebar | `components/LeftSidebar.tsx` | ✅ Done |
| GitHub Dashboard | `app/github/page.tsx` | ✅ Done |
| Spotify Top Tracks | `app/spotify/page.tsx`, `scripts/fetch-spotify.mjs` | ✅ Done |
| Books Reading Log + Currently Reading | `app/books/page.tsx`, `public/books-data.json` | ✅ Done |
| Vinyl Collection | `app/vinyl/page.tsx`, `scripts/fetch-vinyl.mjs` | ✅ Done |
| Maps of Content | `app/topics/page.tsx` | ✅ Done |
| /uses page | `app/uses/page.tsx` | ✅ Done |
| MDX Blog Pipeline | `app/posts/`, `content/posts/*.mdx`, `lib/posts.ts` | ✅ Done |
| TIL Micro-notes | `app/til/`, `content/til/*.mdx`, `lib/til.ts` | ✅ Done |
| Photography (Flickr API) | `app/flickr/page.tsx`, `scripts/fetch-flickr.mjs` | ✅ Done |
| Gaming (Steam API) | `app/steam/page.tsx`, `scripts/fetch-steam.mjs` | ✅ Done |
| /now Live Widgets | `app/now/page.tsx`, `components/NowWidgets.tsx` | ✅ Done |
| /about Narrative Bio | `app/about/page.tsx` | ✅ Done |
| /stats Analytics + Graph Topology | `app/stats/page.tsx` | ✅ Done |
| /colophon ADR Page | `app/colophon/page.tsx` | ✅ Done |
| /changelog Version History | `app/changelog/page.tsx` | ✅ Done |
| /tags + /tags/[tag] | `app/tags/` | ✅ Done |
| /bookmarks Daily Puzzles | `app/bookmarks/page.tsx` | ✅ Done |
| Command Palette (Ctrl+K) | `components/CommandPalette.tsx` | ✅ Done |
| RSS Feed | `app/feed.xml/route.ts` | ✅ Done |
| Open Graph Meta | `app/posts/[slug]/page.tsx` `generateMetadata` | ✅ Done |
| Full-text Search | `scripts/build-search-index.mjs` | ✅ Done |
| Reading Progress Bar | `components/ReadingProgress.tsx` | ✅ Done |
| Page Transitions | `app/template.tsx` | ✅ Done |
| Sidenote (Tufte marginal) | `components/Sidenote.tsx` | ✅ Done |
| RelatedContent (tag-based) | `components/RelatedContent.tsx` | ✅ Done |
| Freshness indicators | `ArticlePage`, `LinkedTerm`, `Backlinks` | ✅ Done |
| Breadcrumb graph info | `components/Breadcrumb.tsx` | ✅ Done |
| Bi-directional backlinks | `components/Backlinks.tsx` | ✅ Done |
| LinkedTerm auto-resolve | `components/LinkedTerm.tsx` (`nodeId` prop) | ✅ Done |

### Pending (next session)
- [ ] **Cloudinary metadata → /flickr** — album filter + photo captions from Cloudinary context metadata

---

## Repository Structure

```
MEWebsite/
├── app/
│   ├── layout.tsx                   # Root layout: 3-column shell + theme providers + ReadingProgress
│   ├── template.tsx                 # Page transitions (Framer Motion fade+slide)
│   ├── page.tsx                     # Home: bio, courses, project previews, math highlights
│   ├── globals.css                  # Tailwind v4 + dark variant + View Transitions keyframes
│   ├── about/page.tsx               # Narrative biography, icon timeline, CV download
│   ├── github/page.tsx              # GitHub dashboard (client-side GitHub REST API)
│   ├── spotify/page.tsx             # Spotify top tracks (reads /spotify-data.json)
│   ├── books/page.tsx               # Reading log + Currently Reading (reads /books-data.json)
│   ├── vinyl/page.tsx               # Vinyl collection (reads /vinyl-data.json)
│   ├── topics/page.tsx              # Maps of Content — graph nodes grouped by type
│   ├── uses/page.tsx                # Developer environment & stack (ArticlePage)
│   ├── now/page.tsx                 # Live widget cluster: Spotify, books, GitHub
│   ├── posts/
│   │   ├── page.tsx                 # Blog listing (MDX pipeline via next-mdx-remote)
│   │   └── [slug]/page.tsx          # Post detail + RelatedContent + Backlinks
│   ├── til/
│   │   ├── page.tsx                 # TIL timeline listing
│   │   └── [slug]/page.tsx          # TIL detail
│   ├── tags/
│   │   ├── page.tsx                 # Tag index
│   │   └── [tag]/page.tsx           # Per-tag filtered view
│   ├── flickr/page.tsx              # Photography masonry grid (Flickr API)
│   ├── steam/page.tsx               # Steam player card + recent games
│   ├── stats/page.tsx               # Umami analytics + graph topology + activity heatmap
│   ├── colophon/page.tsx            # Architectural Decision Records (8 ADR cards)
│   ├── changelog/page.tsx           # Version history timeline
│   ├── bookmarks/page.tsx           # Daily puzzles, coding platforms, YouTube
│   ├── feed.xml/route.ts            # RSS 2.0 static feed
│   ├── projects/
│   │   ├── page.tsx                 # Projects index
│   │   ├── secureexam-generator/    # Article: SecureExam-Generator
│   │   └── notepadio/               # Article: NotePadIo
│   ├── math/
│   │   ├── page.tsx                 # Math index
│   │   ├── game-theory/             # Article: Game Theory
│   │   └── izmir-festival/          # Article: Izmir Mathematics Festival
│   └── community/
│       ├── page.tsx                 # Community index
│       ├── tba/                     # Article: Turkish Informatics Association
│       └── volunteering/            # Article: AFAD & LÖSEV
│
├── components/
│   ├── Header.tsx                   # 2.5D SVG "OT" signature (3 depth layers, parallax)
│   ├── LeftSidebar.tsx              # Left column: signature + floating pill nav + theme toggle
│   ├── RightPanel.tsx               # Right column: GraphNav + TOC + expand button
│   ├── GraphNav.tsx                 # Local knowledge graph (react-force-graph-2d, ssr:false)
│   ├── GraphModal.tsx               # Full-screen graph overlay + search (amber highlight)
│   ├── Footer.tsx                   # Social icons, cd../ nav, ~ easter egg, Konami code
│   ├── HoverTooltip.tsx             # Standalone hover card (no navigation)
│   ├── LinkedTerm.tsx               # Hover card + next/link; auto-resolve via nodeId
│   ├── ArticlePage.tsx              # Shared article layout (breadcrumb, title, tags, freshness)
│   ├── Breadcrumb.tsx               # Path breadcrumb + graph info (maturity + connections)
│   ├── Backlinks.tsx                # Bi-directional backlinks with freshness
│   ├── CommandPalette.tsx           # Ctrl+K search + type filters (p: post: til:)
│   ├── ReadingProgress.tsx          # Thin progress bar at viewport top
│   ├── RelatedContent.tsx           # Tag-based related posts/TIL (top 4)
│   ├── Sidenote.tsx                 # Tufte-style marginal notes (desktop: margin, mobile: toggle)
│   ├── NowWidgets.tsx               # /now page widget cluster
│   ├── TableOfContents.tsx          # TOC with smooth-scroll anchors
│   ├── ThemeProvider.tsx            # next-themes wrapper (class-based, default dark)
│   ├── ThemeReadyGate.tsx           # Adds `theme-ready` class after first paint
│   └── ThemeToggle.tsx              # Sun/moon toggle — View Transitions API reveal
│
├── content/
│   ├── posts/*.mdx                  # Blog posts (frontmatter: title, description, date, maturity, tags)
│   └── til/*.mdx                    # TIL entries (frontmatter: title, date, tags)
│
├── lib/
│   ├── graphData.ts                 # 27 graph nodes + 43 links (includes lastTended freshness)
│   ├── posts.ts                     # getAllPosts, getPostBySlug (gray-matter + next-mdx-remote)
│   ├── til.ts                       # getAllTils, getTilBySlug
│   └── rightPanelContext.tsx        # React context: pages register TOC items here
│
├── scripts/
│   ├── fetch-spotify.mjs            # Prebuild: exchanges refresh token → spotify-data.json
│   ├── fetch-vinyl.mjs              # Prebuild: Discogs collection → vinyl-data.json
│   ├── fetch-flickr.mjs             # Prebuild: Flickr API → flickr-data.json
│   ├── fetch-steam.mjs              # Prebuild: Steam Web API → steam-data.json
│   ├── build-search-index.mjs       # Prebuild: full-text index → search-index.json
│   └── get-spotify-token.mjs        # One-time helper: OAuth refresh token generator
│
├── public/
│   ├── books-data.json              # Manual — edit to add/update books
│   ├── vinyl-data.json              # fetch-vinyl.mjs or manual
│   ├── spotify-data.json            # Tracked in git — updated by spotify.yml cron
│   ├── flickr-data.json             # fetch-flickr.mjs (flickr.yml cron every 6h)
│   ├── steam-data.json              # fetch-steam.mjs (steam.yml cron every 3h)
│   ├── search-index.json            # build-search-index.mjs (prebuild)
│   ├── github-data.json             # Client-side cache
│   └── CNAME                        # ogulcantokmak.me
│
├── .github/workflows/
│   ├── deploy.yml                   # CI: prebuild → next build → GitHub Pages
│   ├── spotify.yml                  # Cron 30min: fetch top tracks → commit
│   ├── flickr.yml                   # Cron 6h: fetch photos → commit
│   └── steam.yml                    # Cron 3h: fetch Steam data → commit
│
├── v1/                              # Legacy HTML portfolio (April 2025) — READ-ONLY
├── CLAUDE.md                        # Project spec for Claude Code
├── AGENTS.md                        # This file — AI agent context
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
- `graphNodes: GraphNode[]` — `{ id, label, type, url, description, maturity?, lastTended? }`
- `graphLinks: GraphLink[]` — `{ source: id, target: id }`
- Currently: 27 nodes, 43 links

Node types: `"root"` | `"tech"` | `"math"` | `"personal"`

`GraphNav` = local graph (current page + 1-hop neighbors)
`GraphModal` = full graph in fullscreen overlay

Cross-links (non-tree edges) make this a real graph — always add at least one cross-link when a page relates to another non-parent node.

---

## Live Data Architecture

| Integration | Fetch timing | Secret(s) needed | Fallback |
|---|---|---|---|
| GitHub | Client-side (useEffect) | None | Error message shown |
| Spotify | `spotify.yml` cron every 30 min → commits JSON; page reads from `raw.githubusercontent.com` | `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN` | Preserves last committed data |
| Books | Client-side (reads static JSON) | None | Edit `public/books-data.json` |
| Vinyl | Client-side (reads static JSON) | `DISCOGS_USERNAME`, `DISCOGS_USER_TOKEN` (optional) | Existing `public/vinyl-data.json` |
| Flickr | `flickr.yml` cron every 6h → commits JSON | `FLICKR_API_KEY`, `FLICKR_USER_ID` | Existing `public/flickr-data.json` |
| Steam | `steam.yml` cron every 3h → commits JSON | `STEAM_API_KEY`, `STEAM_ID` | Existing `public/steam-data.json` |

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
