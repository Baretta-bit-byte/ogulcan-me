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
| `/flickr` | Photography grid (stub) | Static |
| `/steam` | Steam gaming activity (stub) | Static |

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

### 🔲 Pending

- [ ] **2.5D Signature** — depth/shadow revamp of the SVG OT signature
- [ ] **Flickr / Photography** — Flickr API integration (stub page exists at `/flickr`)
- [ ] **Steam** — Steam Web API integration (stub page exists at `/steam`)
- [ ] **Analytics (/stats)** — Public metrics dashboard (Umami / Plausible)

---

## Project History

| Version | Description |
|---|---|
| **v3.0 (current)** | MDX blog + TIL, bi-directional backlinks, graph search, command palette, /now live widgets, TOC highlighting |
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
