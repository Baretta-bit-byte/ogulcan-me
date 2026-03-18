# [ogulcantokmak](https://ogulcantokmak.me/).me — Digital Garden & Portfolio & Blog

> A personal Digital Garden and professional showcase built in 2026 Spring.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-violet)](./LICENSE)

---

## What This Is

Not a standard portfolio. Every page — project, math note, community activity, GitHub dashboard, Spotify, books, vinyl — is a **node** in an interactive knowledge graph you can explore visually.

**Design inspirations:** Anthony Fu · Theo Winter · Brian Ton · Chris Vogt

---

## Architecture

```
3-Column Layout
├── Left Sidebar   — Sticky: animated SVG signature (OT cursive, draw-erase loop)
│                    nav links (all live), light/dark organic toggle
├── Center Column  — Scrollable: all content + footer
└── Right Panel    — Sticky: interactive knowledge graph + table of contents
```

### Infrastructure

| | |
|---|---|
| **Domain** | `ogulcantokmak.me` |
| **Hosting** | GitHub Pages (static export — `output: "export"`) |
| **CDN** | Cloudflare (proxied DNS, DDoS protection, Full SSL/TLS) |
| **CI/CD** | GitHub Actions: `main` push → prebuild scripts → `next build` → deploy |

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion v12 |
| Graph | react-force-graph-2d |
| Tooltips | Radix UI HoverCard |
| MDX | next-mdx-remote + gray-matter |
| Theming | next-themes + View Transitions API |
| Icons | Lucide React |

---

## Pages

| Route | Description | Data Source |
|---|---|---|
| `/` | Home — bio, project previews, math highlights | Static |
| `/projects` | Projects index | Static |
| `/projects/secureexam-generator` | SecureExam-Generator article | Static |
| `/projects/notepadio` | NotePadIo article | Static |
| `/math` | Mathematics index | Static |
| `/math/game-theory` | Game Theory — Ali Nesin Mathematics Village | Static |
| `/math/izmir-festival` | Izmir Mathematics Festival | Static |
| `/community` | Community index | Static |
| `/community/tba` | Turkish Informatics Association | Static |
| `/community/volunteering` | AFAD & LÖSEV Volunteering | Static |
| `/github` | GitHub dashboard — repos, last PR, contribution heatmap | GitHub REST API (client-side) |
| `/spotify` | Spotify top 12 tracks (last 4 weeks) | `spotify.yml` cron (every 30 min) → `raw.githubusercontent.com` |
| `/books` | Reading log — 12 finished books | Manual `public/books-data.json` + Open Library covers |
| `/vinyl` | Vinyl collection — spinning circular records | Manual `public/vinyl-data.json` + optional Discogs API |
| `/now` | Living status — location, focus, live Spotify/Books/GitHub widgets | Client-side fetch |
| `/topics` | Maps of Content — graph nodes grouped by type with maturity badges | Static (`lib/graphData.ts`) |
| `/uses` | Developer environment, editor, stack & hardware | Static |
| `/posts` | Writing & essays — full MDX pipeline | `content/posts/*.mdx` via `next-mdx-remote` |
| `/til` | Today I Learned — micro-notes timeline | `content/til/*.mdx` via `next-mdx-remote` |
| `/about` | Narrative biography + CV download + colophon | Static |
| `/stats` | Analytics dashboard — site metrics + Umami embed | Umami Cloud (iframe) |
| `/tags` | Browse all content by tag | Aggregated from posts + TIL frontmatter |
| `/tags/[tag]` | Posts and TILs filtered by a single tag | Dynamic static params |
| `/bookmarks` | YouTube channels, daily puzzles, coding platforms | Static |
| `/changelog` | Version history timeline (v1.0–v3.1) | Static |
| `/feed.xml` | RSS 2.0 feed of all blog posts | Static route (`force-static`) |
| `/flickr` | Photography masonry grid | Flickr API (`flickr.yml` cron every 6h) |
| `/steam` | Steam player card + recent games | Steam Web API (`steam.yml` cron every 3h) |
| `/colophon` | Architectural Decision Records (8 ADR cards) | Static |

---

## Key Features

- **Animated SVG signature** — Cursive "OT" draws left-to-right then erases, loops forever
- **Organic theme toggle** — View Transitions API circular spotlight reveal from click origin
- **Interactive knowledge graph** — Local neighborhood per page; click to navigate
- **Full graph overlay** — Expand opens complete site map with color legend + **search** (amber highlight, camera focus)
- **Command Palette** — `Ctrl+K` / `Cmd+K` global search + keyboard navigation
- **Hover tooltip cards** — Internal links preview content without navigating
- **Bi-directional backlinks** — Every page shows "Mentioned by" + "Links to" from the knowledge graph
- **GitHub Dashboard** — Live repos, last PR, contribution heatmap (client-side GitHub API)
- **Spotify Top Tracks** — 4-column album art grid, 30s audio preview on hover
- **Books Reading Log** — 6-column cover grid (Open Library), hover reveals rating + date
- **Vinyl Collection** — Circular records with CSS grooves, spin on hover, SVG arc text
- **Maps of Content** — `/topics` directory groups all graph nodes by type (tech / math / personal)
- **`/uses` page** — Living document of editor, terminal, stack, and hardware setup
- **Maturity badges in hover cards** — `LinkedTerm` now reads `nodeId` from `graphData` and shows 🌱/🪴/🌳 badge inline
- **Table of Contents** — Auto-injected per article page with **active section highlighting** (IntersectionObserver)
- **MDX Blog** — `/posts` with frontmatter (title, date, maturity badges, tags); prose typography
- **TIL Micro-Notes** — `/til` timeline layout with inline MDX + code blocks
- **Live /now Widgets** — Spotify top 3, last finished book, recently pushed GitHub repo
- **Footer easter eggs** — `~` tooltip + Konami code `↑↑↓↓←→←→BA`
- **`cd ../` terminal nav** — Footer always links back to parent path
- **`/about` narrative bio** — Hero with "Open to internships" badge, CV download, project cards, timeline, colophon
- **`/stats` analytics** — Site metrics cards + Umami Cloud public share iframe
- **`/tags` index** — Browse all tags across posts and TIL entries, with counts
- **`/bookmarks`** — Daily puzzles badge grid (Queens, Tango, Zip, Sudoku, Chess.com) + coding platforms (LeetCode, HackerRank) + YouTube channels
- **`/changelog`** — Version timeline from v1.0 to v3.1
- **RSS feed** — `/feed.xml` with all published blog posts
- **Open Graph meta** — OG + Twitter card tags for all blog posts
- **Reading time** — Word-count-based estimates on post listings and detail pages
- **Draft support** — `draft: true` in frontmatter hides posts/TILs from listings and feeds
- **Full-text search** — Prebuild script indexes all content; Command Palette searches pages + post/TIL body text
- **Freshness indicators** — `lastTended` dates on graph nodes; "tended 3d ago" shown in article headers, hover cards, and backlinks
- **Reading progress bar** — Thin scroll-tracking bar at viewport top
- **Page transitions** — Framer Motion fade+slide between routes
- **Currently reading** — Books page shows in-progress books with progress bar
- **Tufte sidenotes** — Marginal notes on desktop, inline toggle on mobile
- **Related content** — Tag-based recommendations on blog detail pages
- **Breadcrumb graph info** — Maturity badge + connection count in breadcrumbs
- **Content activity heatmap** — GitHub contribution-graph-style heatmap on /stats
- **Graph topology metrics** — Avg connections, density, most connected nodes, orphan detection
- **/colophon ADR** — Architectural Decision Records explaining each technology choice

---

## Getting Started

```bash
npm install
npm run dev         # localhost:3000 (Spotify/Discogs data will be empty without secrets)
npm run build       # runs prebuild scripts first, then next build
```

---

## Live Data Setup

### Spotify (top tracks)

Data is fetched every 30 minutes by the `spotify.yml` GitHub Actions workflow and committed to `public/spotify-data.json`. The page reads this file directly from `raw.githubusercontent.com` — no full site redeploy needed for data updates.

**One-time setup:**

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) → your app → Edit Settings
2. Add redirect URI: `https://ogulcantokmak.me/`
3. Run the token helper (PowerShell):
   ```powershell
   $env:SPOTIFY_CLIENT_ID="your_client_id"
   $env:SPOTIFY_CLIENT_SECRET="your_client_secret"
   node scripts/get-spotify-token.mjs
   ```
4. Visit the printed URL → authorize → copy the full redirect URL from the address bar → run again:
   ```powershell
   node scripts/get-spotify-token.mjs "https://ogulcantokmak.me/?code=AQ..."
   ```
5. Add the three secrets to **GitHub → Repo Settings → Secrets → Actions**:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REFRESH_TOKEN`
6. Manually trigger the **Update Spotify Data** workflow once to populate the data.

The refresh token does **not** expire — you only need to redo this if you change your Spotify password or revoke the app at [spotify.com/account/apps](https://www.spotify.com/account/apps).

### Discogs (vinyl collection)

1. Go to [discogs.com/settings/developers](https://www.discogs.com/settings/developers) → Generate Personal Access Token
2. Add secrets:
   - `DISCOGS_USERNAME`
   - `DISCOGS_USER_TOKEN`

> Without these secrets the build still completes — Spotify falls back to empty JSON, Discogs keeps the existing `vinyl-data.json`.

### Books (reading log)

No secrets needed. Edit `public/books-data.json` directly:

```json
{
  "isbn":     "9780374533557",
  "title":    "Book Title",
  "author":   "Author Name",
  "finished": "2026-03-12",
  "rating":   5,
  "url":      "https://openlibrary.org/isbn/..."
}
```
DONE
Cover art is fetched automatically from Open Library using the ISBN.

---

## Roadmap

### ✅ Completed

- [x] 3-column layout skeleton (sidebar, main, right panel)
- [x] Animated SVG signature — cursive OT, draw-and-erase loop
- [x] Organic Theme Toggle — View Transitions API circular reveal
- [x] Interactive knowledge graph (local + full modal)
- [x] Hover tooltip cards (LinkedTerm + HoverTooltip)
- [x] All content pages (projects, math, community)
- [x] Floating pill sidebar with Framer Motion active state
- [x] Footer — social icons, cd../ nav, easter eggs (~ button + Konami code)
- [x] GitHub Dashboard — repos, last PR, contribution heatmap
- [x] Spotify Top Tracks — build-time fetch, audio preview
- [x] Books Reading Log — Open Library covers, star rating, hover overlay
- [x] Vinyl Collection — circular records, CSS grooves, spinning hover, arc text
- [x] Graph: all new pages wired as nodes (github, spotify, books, vinyl)
- [x] `/topics` — Maps of Content: Wikipedia-style directory of all graph nodes
- [x] `/uses` — Developer environment & stack showcase (ArticlePage with maturity badge)
- [x] `/posts` — Full MDX blog pipeline with `next-mdx-remote` + `gray-matter`
- [x] `/til` — Today I Learned micro-notes with timeline layout
- [x] `/now` live widgets — Spotify + Books + GitHub client-side data
- [x] Bi-directional backlinks — standalone `Backlinks` component on all pages
- [x] Command Palette — `Ctrl+K` global search + keyboard nav
- [x] Graph search — search input in full graph modal, amber highlight + camera focus
- [x] TOC active highlighting — IntersectionObserver-based current section tracking
- [x] `/flickr` stub — Photography grid placeholder
- [x] `/steam` stub — Steam activity placeholder
- [x] `LinkedTerm` enriched — `nodeId` prop shows maturity badge (🌱/🪴/🌳) + graph description in hover card
- [x] `graphData.ts` — 5 new nodes + 5 new links from home
- [x] `/about` — Narrative biography with CV download, project cards, timeline, colophon
- [x] `/stats` — Umami Cloud analytics dashboard (tracking + public share iframe)
- [x] `/tags` + `/tags/[tag]` — Tag index and per-tag filtered views
- [x] `/bookmarks` — Daily puzzles, coding platforms, YouTube channels (badge grid)
- [x] `/changelog` — Version history timeline (v1.0–v3.1)
- [x] `/feed.xml` — RSS 2.0 static feed
- [x] OG meta tags for blog posts
- [x] Reading time estimates
- [x] Draft support (`draft: true` in frontmatter)
- [x] Full-text search in Command Palette (prebuild JSON index)
- [x] Graph search null-safety fix

- [x] 2.5D Signature — 3 depth layers + mouse parallax
- [x] Flickr — Flickr API integration with masonry grid
- [x] Steam — Steam Web API with player card + recent games
- [x] Freshness indicators (lastTended) across ArticlePage, LinkedTerm, Backlinks
- [x] Reading progress bar
- [x] Page transitions (Framer Motion)
- [x] Currently reading widget (books + /now)
- [x] /colophon — Architectural Decision Records
- [x] Content activity heatmap on /stats
- [x] Tufte sidenotes component
- [x] Breadcrumb graph info (maturity + connections)
- [x] RelatedContent (tag-based) on blog posts
- [x] 3 new TIL entries (CRDT, SHA-256, event sourcing)
- [x] Spring 2026 retrospective blog post

### 🔲 Pending

- [ ] **Cloudinary metadata → /flickr** — Album filter + photo captions from Cloudinary context

---

## Project History

| Version | Description |
|---|---|
| **v3.2 (current)** | 2.5D signature, Flickr + Steam integrations, freshness indicators, reading progress, page transitions, /colophon ADR, activity heatmap, sidenotes, breadcrumb graph info, related content, 3 new TILs |
| **v3.1** | /about, /stats (Umami), /tags, /bookmarks, /changelog, RSS feed, OG meta, reading time, draft support, full-text search |
| **v3.0** | MDX blog + TIL, bi-directional backlinks, graph search, command palette, /now live widgets, TOC highlighting |
| **v2.6** | Spotify live data: 30-min cron, raw.githubusercontent.com fetch, no-redeploy architecture |
| **v2.5** | Books reading log updated with real personal reading history |
| **v2.4** | /topics, /uses, /posts, /flickr, /steam pages + LinkedTerm maturity badges |
| **v2.3** | GitHub, Spotify, Books, Vinyl pages + organic theme toggle |
| **v2.2** | Footer redesign, easter eggs, sidebar floating pill |
| **v2.1** | Graph interactivity, hover cards, all content pages, signature animation |
| **v2.0** | Next.js 16 + Tailwind + Framer Motion + react-force-graph-2d |
| **[v1](./v1/)** | Original plain HTML/CSS portfolio (April 2025) |

---

## Author

**Oğulcan Tokmak** — [@Baretta-bit-byte](https://github.com/Baretta-bit-byte)

- Turkish Informatics Association (TBD) — active member
- AFAD & LÖSEV Volunteer (March 2026–present)
- Izmir Mathematics Festival
- Game Theory — Ali Nesin Mathematics Village

---

## License

[MIT](./LICENSE) © 2026 Ogulcan
