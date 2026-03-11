# ogulcan.me — Digital Garden & Portfolio

>A personal Digital Garden and a professional showcase built in 2026 Spring.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-violet)](./LICENSE)

---

## What This Is

This is not a standard portfolio. It is an interconnected, explorable knowledge graph where every page — project, mathematics note, community activity — is a **node** you can navigate visually.

**Design inspirations:** Anthony Fu (animated signature, minimalism) · Theo Winter (3-column layout, interactive graph) · Brian Ton (content hierarchy)
https://antfu.me/ | https://theowinter.ch/ | https://www.brianton.me/

---

## Architecture

```
3-Column Layout
├── Left Sidebar   — Sticky: animated SVG signature, nav links, light/dark toggle
├── Center Column  — Scrollable: all content (bio, projects, math, community)
└── Right Panel    — Sticky: interactive knowledge graph + table of contents
```

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Graph | react-force-graph-2d |
| Tooltips | Radix UI HoverCard |
| Theming | next-themes (light/dark) |
| Icons | Lucide React |

---

## Pages

| Route | Description |
|---|---|
| `/` | Home — bio, project previews, math highlights |
| `/projects` | Projects index |
| `/projects/secureexam-generator` | SecureExam-Generator article |
| `/projects/notepadio` | NotePadNeo article |
| `/math` | Mathematics index |
| `/math/game-theory` | Game Theory — Ali Nesin Mathematics Village |
| `/math/izmir-festival` | Izmir Mathematics Festival |
| `/community` | Community index |
| `/community/tba` | Turkish Informatics Association |
| `/community/volunteering` | AFAD & LÖSEV Volunteering |

---

## Key Features

- **Animated SVG signature** — Draws on load using Framer Motion path animation
- **Interactive knowledge graph** — Local neighborhood view per page; click to navigate
- **Full graph overlay** — Expand icon opens the complete site map
- **Hover tooltips** — Internal links show contextual preview cards without navigating
- **Light / Dark mode** — Seamless toggle (Slate-900 ↔ Slate-50)
- **Table of Contents** — Auto-injected per article page, smooth scroll anchors
- **Breadcrumb navigation** — Deep-link aware trail on every sub-page

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project History

| Version | Description |
|---|---|
| **v2 (current)** | Footer added |
| **v2** | Next.js 16 + Tailwind + Framer Motion + react-force-graph-2d |
| **[v1](./v1/)** | Original plain HTML/CSS portfolio (April 2025) |

The original HTML portfolio is preserved in [`./v1/`](./v1/) as a snapshot of where this started.

---
## Upcoming Features
🎨 UI, UX & Animations

2.5D Signature Animation: Revamp the SVG signature drawing animation on the hero section with a 2.5D effect to mimic a highly realistic, hand-drawn aesthetic.

Organic Theme Toggle: Upgrade the Light/Dark mode switch. Instead of an instant color swap, implement an ultra-smooth, organic transition that mimics a physical light switch illuminating the background fluidly.

Interactive Vinyl Records: Enhance the "Vinyl Collection" section with interactive CD/record UI elements that respond to user interactions (spinning/hover effects).

📡 Live Data Integrations (The Digital Garden)

Dynamic Sidebar Navigation: Implement a sleek, interactive left-sidebar menu for seamless routing between different life/hobby aspects (Home, Posts, GitHub, Goodreads, Spotify, etc.).

GitHub Dashboard: Integrate live GitHub data to display the latest contribution graph and pinned repositories directly on the site.

Spotify Top Tracks: Fetch and display a dynamic grid of the 12 most-played tracks over the last 4 weeks.

Reading Log (Goodreads): Showcase a visual grid of the latest finished books to reflect continuous learning and personal interests.

🐛 Bug Fixes & Refinements

Layout Shift Resolution: Fix the UI jumping/shifting issues during the initial page load to ensure a stable 3-column structure.

Tooltip Content Review: Correct minor typos and inaccurate data within the interactive hover boxes and info cards.

Global Routing Fix: Update the ogulcan.me brand link in the bottom-left corner to consistently redirect users back to the homepage.

🥚 Easter Eggs & Footer

Personalized Footer: Build a comprehensive "Connect with me" footer featuring social icons, source code links, and a signature sign-off.

Hidden Shortcuts: Embed playful easter eggs and sweet personal shortcuts within the footer area, connecting different parts of the site interactively.
---
## Author

**Oğulcan Tokmak** — [@Baretta-bit-byte](https://github.com/Baretta-bit-byte)

- Türkiye Bilişim Derneği (TBD) (active member)
- AFAD & LÖSEV Volunteer (March 2026–present)
- Izmir Mathematics Festival
- Game Theory — Ali Nesin Mathematics Village

---

## License

[MIT](./LICENSE) © 2026 Ogulcan
