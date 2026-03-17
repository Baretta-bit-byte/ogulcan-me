# Project: Ogulcan's Digital Garden & Portfolio (.me)

## Architectural Vision and Concept
This project is a seamless fusion of a personal "Digital Garden" and a professional showcase, specifically designed to demonstrate technical depth and UI/UX sensibility for 2026 Summer Software Dev Internships. Instead of traditional page transitions, the goal is to create an interconnected, explorable knowledge graph that links concepts contextually.

## Current State (as of 2026-03-18)

All core infrastructure and live-data integrations are **complete**. The site is live at `ogulcantokmak.me`.

### ✅ Done — do not rebuild from scratch
- 3-column layout (LeftSidebar, main, RightPanel)
- Animated SVG signature — cursive "OT", draw-erase loop, `Header.tsx`
- Organic theme toggle — View Transitions API circular reveal, `ThemeToggle.tsx`
- Interactive knowledge graph — local + full modal with **search** (amber highlight + camera focus), `GraphNav.tsx` / `GraphModal.tsx`
- Hover tooltip system — `LinkedTerm.tsx` (navigate) + `HoverTooltip.tsx` (standalone)
- All content pages — projects, math, community (fully written)
- Floating pill sidebar with Framer Motion `layoutId` active state
- Footer — social icons, `cd ../` nav, `~` easter egg, Konami code
- `/github` — GitHub REST API client-side dashboard
- `/spotify` — live data via `raw.githubusercontent.com`, updated every 30 min by `spotify.yml` cron; **click-to-play 30s preview** on hover
- `/books` — manual JSON + Open Library cover art
- `/vinyl` — circular CSS groove records, spin hover, Discogs fetch script
- `/topics` — Maps of Content with maturity badges, parent/leaf distinction, Backlinks
- `/uses` — living dev environment doc, uses `ArticlePage` with `nodeId="uses"`
- `/posts` — **MDX blog pipeline** via `next-mdx-remote` + `gray-matter`; posts in `content/posts/*.mdx`
- `/til` — **Today I Learned** micro-notes, timeline layout, inline MDX; entries in `content/til/*.mdx`
- `/now` — **Live widget cluster**: Spotify top 3, last book, recently active repo
- `/flickr` — stub page, Flickr API integration planned
- `/steam` — stub page, Steam Web API integration planned
- `LinkedTerm` — enriched with optional `nodeId` prop: auto-reads description + maturity badge (🌱/🪴/🌳) from `graphData`
- **Bi-directional backlinks** — standalone `Backlinks` component on all pages: "Mentioned by" (incoming) + "Links to" (outgoing)
- **Command Palette** — `Ctrl+K` / `Cmd+K` site-wide search + navigation
- **TOC active highlighting** — `IntersectionObserver`-based current section tracking in RightPanel
- `/stats` — **Umami Cloud analytics** dashboard with tracking script + public share iframe
- `/about` — **Narrative biography** with CV download, project cards, timeline, colophon
- `/tags` + `/tags/[tag]` — **Tag index** + per-tag filtered views (posts + TIL)
- `/bookmarks` — **Daily puzzles** badge grid + coding platforms + YouTube channels
- `/changelog` — **Version history** timeline (v1.0–v3.1)
- `/feed.xml` — **RSS 2.0** static feed via `export const dynamic = "force-static"`
- **Open Graph meta** — OG + Twitter card tags for blog posts via `generateMetadata`
- **Reading time** — `Math.ceil(words / 200)` on post listings and detail pages
- **Draft support** — `draft: true` in frontmatter filters from all listings and feeds
- **Full-text search** — prebuild script (`scripts/build-search-index.mjs`) → `public/search-index.json`; CommandPalette fetches + searches pages + content
- **Graph search fix** — null-safety + try-catch for camera centering in `GraphModal.tsx`
- **2.5D Signature** — `Header.tsx` revamped: 3 depth layers (deep shadow + mid shadow + main), SVG filter blur, Framer Motion mouse parallax via `useSpring` + `useTransform`
- `/flickr` — **Flickr API** integration: `scripts/fetch-flickr.mjs` → `public/flickr-data.json`; masonry photo grid, hover overlay (title + views), `flickr.yml` cron every 6h
- `/steam` — **Steam Web API** integration: `scripts/fetch-steam.mjs` → `public/steam-data.json`; player card (avatar, status, library stats), recently played game cards with playtime bars, `steam.yml` cron every 3h

### 🔲 Pending — next session priorities
*(All v3.1 features complete — site fully live. Next: new feature ideas or polish passes.)*

---

## Tech Stack (Mandatory)
- **Framework:** Next.js 16 (App Router), `output: "export"` — static, no Node.js at runtime
- **Styling:** Tailwind CSS v4
- **Theming:** next-themes + View Transitions API for organic toggle
- **Animations:** Framer Motion v12
- **Graph View:** react-force-graph-2d (dynamic import, `ssr: false`)
- **Tooltips:** @radix-ui/react-hover-card with `forceMount` + `AnimatePresence`
- **Icons:** Lucide React

## Static Export Constraint
The site uses `output: "export"` for GitHub Pages. **No Node.js server at runtime.**
- GitHub API: public endpoints → client-side `useEffect` + `fetch` ✅
- Discogs: public collection → client-side fetch OR build-time script ✅
- Spotify: requires OAuth → `spotify.yml` cron fetches every 30 min, commits `public/spotify-data.json`; page reads from `raw.githubusercontent.com` (no redeploy needed) ✅
- Books: manual JSON, Open Library cover images loaded client-side ✅

## Design Language and 3-Column Layout Rules

### 1. Left Column (Sticky - Brand & Nav)
- Animated SVG "OT" signature at top (`Header.tsx`)
- Floating pill nav with `layoutId="nav-active-bg"` Framer Motion sliding background
- All nav items are live routes: Home, Projects, Mathematics, Community, GitHub, Spotify, Books, Vinyl, /now, Topics, /uses, Writing, TIL, Photography, Gaming
- Sun/moon theme toggle at bottom (triggers View Transitions API circular reveal)

### 2. Center Column (Scrollable)
- Clean, readable text flow (Inter body, JetBrains Mono for code/technical terms)
- All pages include a `<Footer />` at the bottom

### 3. Right Column (Sticky - Interactive)
- `RightPanel.tsx` — hosts `GraphNav` (local graph) + TOC
- Internal links use `LinkedTerm` (rich hover card + navigate) or `HoverTooltip` (no navigate)

## Color Palette & Typography
| Token / Mode | Value | Usage |
|---|---|---|
| Dark Mode Bg | `#0F172A` (Slate-900) | IDE Dark Mode feel |
| Light Mode Bg | `#F8FAFC` (Slate-50) | Clean, airy feel |
| Dark Text | Slate-200 | Body copy in Dark Mode |
| Light Text | Slate-900 | Body copy in Light Mode |
| Sky-400 | `#38BDF8` | Technical/software/GitHub accent |
| Violet-400 | `#A78BFA` | Mathematical contexts |
| Emerald-400 | `#34D399` | Spotify / music |
| Amber-400 | `#FBBF24` | Star ratings (books) |

- **Body:** `Inter`
- **Code/Technical terms:** `JetBrains Mono`

## Development Instructions
- Always build a **modular, component-based** structure.
- Every new page needs: route file + node in `lib/graphData.ts` + link from parent + sidebar entry.
- Run `npx tsc --noEmit` before committing — zero TypeScript errors required.
- Avoid visual clutter; use whitespace intentionally.
- The `prebuild` script runs `fetch-spotify.mjs`, `fetch-vinyl.mjs`, and `build-search-index.mjs` — all gracefully preserve existing data if secrets are missing or API fails.
- `public/spotify-data.json` is tracked in git (not gitignored) — updated by the nightly cron, never overwritten with empty data.
- `deploy.yml` ignores changes to `public/spotify-data.json` — Spotify data updates do not trigger a full site redeploy.

## Key Patterns to Reuse
- **Skeleton loader:** `<div className="animate-pulse rounded bg-slate-100 dark:bg-slate-800 ..." />`
- **Card with accent border:** `relative overflow-hidden rounded-xl border ... group` + `absolute inset-y-0 left-0 w-0.5 bg-{color}/50 group-hover:bg-{color}`
- **timeAgo helper:** already implemented in `/github` and `/spotify` pages — copy if needed
- **Framer Motion spring nav:** `layoutId="nav-active-bg"` pattern in `LeftSidebar.tsx`
- **AnimatePresence + Radix forceMount:** always wrap `HoverCard.Content` with `forceMount asChild` pointing to a `motion.div`, not to `AnimatePresence` directly
- **MDX blog post:** add `.mdx` file to `content/posts/` with frontmatter (title, description, date, maturity, tags)
- **TIL entry:** add `.mdx` file to `content/til/` with frontmatter (title, date, tags)
- **Backlinks:** `<Backlinks nodeId="..." />` — drop-in component for any page with a graphData node
