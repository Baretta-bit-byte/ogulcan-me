# AGENTS.md — Guide for AI Agents & LLMs

This file provides structured context for any AI agent, LLM, or automated tool working inside this repository.

---

## Project Identity

- **Name:** ogulcan.me
- **Type:** Personal Digital Garden + Portfolio Website
- **Owner:** Ogulcan (GitHub: Baretta-bit-byte)
- **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · react-force-graph-2d

---

## Repository Structure

```
MEWebsite/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout: ThemeProvider + 3-column shell
│   ├── page.tsx                  # Home page
│   ├── globals.css               # Tailwind v4 + dark mode variant
│   ├── projects/
│   │   ├── page.tsx              # Projects index
│   │   ├── secureexam-generator/ # Article page
│   │   └── notepadio/            # Article page
│   ├── math/
│   │   ├── page.tsx              # Math index
│   │   ├── game-theory/          # Article page
│   │   └── izmir-festival/       # Article page
│   └── community/
│       ├── page.tsx              # Community index
│       ├── tba/                  # Article page
│       └── volunteering/         # Article page
│
├── components/
│   ├── Header.tsx                # Animated SVG signature (Framer Motion)
│   ├── LeftSidebar.tsx           # Sticky left column: signature + nav + theme toggle
│   ├── RightPanel.tsx            # Sticky right column: GraphNav + TOC + expand button
│   ├── GraphNav.tsx              # Local knowledge graph (react-force-graph-2d, SSR-disabled)
│   ├── GraphModal.tsx            # Full-screen graph overlay (all nodes)
│   ├── HoverTooltip.tsx          # Radix HoverCard tooltip (standalone, no navigation)
│   ├── LinkedTerm.tsx            # HoverCard + next/link (hover preview + click navigate)
│   ├── ArticlePage.tsx           # Shared article layout (breadcrumb, title, tags, TOC)
│   ├── Breadcrumb.tsx            # Breadcrumb nav component
│   ├── TableOfContents.tsx       # TOC with smooth-scroll anchors
│   ├── ThemeProvider.tsx         # next-themes wrapper (class-based, default dark)
│   └── ThemeToggle.tsx           # Sun/moon animated toggle button
│
├── lib/
│   ├── graphData.ts              # Node + link definitions for the knowledge graph
│   └── rightPanelContext.tsx     # React context: lets pages register TOC items
│
├── v1/                           # Legacy HTML portfolio (April 2025) — DO NOT MODIFY
│   ├── index.html
│   ├── public/
│   └── assets/
│
├── CLAUDE.md                     # Project spec for Claude Code
├── AGENTS.md                     # This file
├── README.md                     # Human-readable documentation
└── LICENSE                       # MIT License
```

---

## Critical Rules for Agents

### NEVER modify
- `v1/` — This is the preserved legacy portfolio. It is read-only history.
- `CLAUDE.md` — Project specification file; only edit if the human owner explicitly requests it.

### Always check before editing
- `lib/graphData.ts` — Adding a new page requires adding a node + link here too, otherwise the graph won't reflect it.
- `app/layout.tsx` — Central layout file; changes affect all pages.

### When adding a new page
1. Create the route under `app/`
2. Wrap content in `<ArticlePage>` for article-style pages
3. Add a node to `graphNodes` in `lib/graphData.ts`
4. Add a link to `graphLinks` connecting it to its parent section
5. Add a `LinkedTerm` reference from the parent section page

---

## Design System

### Color tokens
| Name | Dark Mode | Light Mode | Usage |
|---|---|---|---|
| Background | `#0F172A` (slate-900) | `#F8FAFC` (slate-50) | Page background |
| Body text | slate-200 | slate-900 | Primary text |
| Tech accent | `#38BDF8` (sky-400) | sky-500 | Projects, code, tech |
| Math accent | `#A78BFA` (violet-400) | violet-500 | Mathematics |
| Muted | slate-400 | slate-500 | Secondary text |

### Typography
- **Body:** `Inter` (via `next/font/google`)
- **Code / Technical terms:** `JetBrains Mono` (via `next/font/google`)

### Variant system
`LinkedTerm` and `HoverTooltip` both accept a `variant` prop:
- `"tech"` → sky-400 accent
- `"math"` → violet-400 accent
- `"default"` → neutral slate

---

## Graph System

The knowledge graph (`lib/graphData.ts`) defines:
- `graphNodes: GraphNode[]` — Each node has `id`, `label`, `type`, `url`, `description`
- `graphLinks: GraphLink[]` — Directed edges `{ source: id, target: id }`

`GraphNav` renders a **local graph** (current page + 1-hop neighbors) using `usePathname()`.
`GraphModal` renders the **full graph** (all nodes) in a fullscreen overlay.

Node sizing: `radius = base + degree × scale` where degree = number of edges in the full graph.

---

## Content Owner Notes

- **Projects:** SecureExam-Generator (Python, PDF+QR), NotePadNeo (low-code collab notes)
- **Mathematics:** Game Theory (Ali Nesin Mathematics Village), Izmir Mathematics Festival
- **Community:** Turkish Informatics Association (active member), AFAD + LÖSEV volunteering (March 2026+)
- **Academics:** DSA (C++), Advanced C, Probability & Stats (Python), Data Mining, Numerical Analysis

---

## Development Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build (must pass before committing)
npm run lint     # ESLint
```

Always run `npm run build` before finalizing changes — TypeScript errors will be caught here.
