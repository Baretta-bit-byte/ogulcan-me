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
| `/spotify` | Spotify top 12 tracks (last 4 weeks) | Build-time fetch → `public/spotify-data.json` |
| `/books` | Reading log — 12 finished books | Manual `public/books-data.json` + Open Library covers |
| `/vinyl` | Vinyl collection — spinning circular records | Manual `public/vinyl-data.json` + optional Discogs API |
| `/topics` | Maps of Content — graph nodes grouped by type | Static (`lib/graphData.ts`) |
| `/uses` | Developer environment, editor, stack & hardware | Static |
| `/posts` | Writing & essays — MDX pipeline (stub) | Static |
| `/flickr` | Photography grid (stub) | Static |
| `/steam` | Steam gaming activity (stub) | Static |

---

## Key Features

- **Animated SVG signature** — Cursive "OT" draws left-to-right then erases, loops forever
- **Organic theme toggle** — View Transitions API circular spotlight reveal from click origin
- **Interactive knowledge graph** — Local neighborhood per page; click to navigate
- **Full graph overlay** — Expand opens complete site map with color legend
- **Hover tooltip cards** — Internal links preview content without navigating
- **GitHub Dashboard** — Live repos, last PR, contribution heatmap (client-side GitHub API)
- **Spotify Top Tracks** — 4-column album art grid, 30s audio preview on hover
- **Books Reading Log** — 6-column cover grid (Open Library), hover reveals rating + date
- **Vinyl Collection** — Circular records with CSS grooves, spin on hover, SVG arc text
- **Maps of Content** — `/topics` directory groups all graph nodes by type (tech / math / personal)
- **`/uses` page** — Living document of editor, terminal, stack, and hardware setup
- **Maturity badges in hover cards** — `LinkedTerm` now reads `nodeId` from `graphData` and shows 🌱/🪴/🌳 badge inline
- **Table of Contents** — Auto-injected per article page
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

The build script runs automatically — you just need three GitHub Actions secrets:

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) → Create App
2. Set redirect URI: `http://localhost:8888/callback`
3. Authorize and get a `refresh_token` with scope `user-top-read user-read-private playlist-read-private`
4. Add secrets to GitHub Actions → Repo Settings → Secrets → Actions:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REFRESH_TOKEN`

Done!

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
- [x] `/posts` stub — Writing section placeholder (MDX pipeline pending)
- [x] `/flickr` stub — Photography grid placeholder
- [x] `/steam` stub — Steam activity placeholder
- [x] `LinkedTerm` enriched — `nodeId` prop shows maturity badge (🌱/🪴/🌳) + graph description in hover card
- [x] `graphData.ts` — 5 new nodes + 5 new links from home

### 🔲 Pending

- [ ] **2.5D Signature** — depth/shadow revamp of the SVG OT signature
- [ ] **Latest Posts / Blog** — MDX pipeline via `next-mdx-remote` (stub page exists at `/posts`)
- [ ] **Flickr / Photography** — Flickr API integration (stub page exists at `/flickr`)
- [ ] **Steam** — Steam Web API integration (stub page exists at `/steam`)

---

## Project History

| Version | Description |
|---|---|
| **v2.4 (current)** | /topics, /uses, /posts, /flickr, /steam pages + LinkedTerm maturity badges |
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
