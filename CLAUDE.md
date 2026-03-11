# Project: Ogulcan's Digital Garden & Portfolio (.me)

## Architectural Vision and Concept
This project is a seamless fusion of a personal "Digital Garden" and a professional showcase, specifically designed to demonstrate technical depth and UI/UX sensibility for 2026 Summer Software Dev Internships. Instead of traditional page transitions, the goal is to create an interconnected, explorable knowledge graph that links concepts contextually.

## Tech Stack (Mandatory)
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Theming:** next-themes (for flawless Light/Dark mode toggle)
- **Animations:** Framer Motion (signature drawing and micro-interactions)
- **Graph View:** react-force-graph-2d or d3.js (interactive node map)
- **Content Management:** MDX (Markdown + React components, for hover content and notes)
- **UI Components:** Radix UI or Floating UI (for Hover Tooltips)

## Design Language and 3-Column Layout Rules

### 1. Left Column (Sticky - Brand & Nav)
- Must contain the animated SVG path signature drawing in the top-left corner on load.
- Primary navigation links and a sun/moon Theme Toggle icon.
- Smooth, lightweight Framer Motion transitions on scroll and click (e.g., lightning-like flash effects).

### 2. Center Column (Scrollable - The Meat)
- Clean, highly readable text flow (Brian Ton style hierarchy).
- **Elevator Pitch & Academics:** Data Structures and Algorithms (C++), Low-Code Web & Mobile App Design, Advanced C Programming, Probability & Statistics for CS (Python), Data Mining (Decision Trees, Apriori), Numerical Analysis (Lagrange interpolation).
- **Technical Projects:**
  - SecureExam-Generator (Python, tamper-proof PDF generation with QR & filigree)
  - NotePadIo (Low-code note-taking app architecture)
- **Social Proofs:**
  - Turkish Informatics Association (active member)
  - AFAD and LÖSEV volunteering (since March 2026)
  - Izmir Mathematics Festival (volunteer)
  - Game Theory training at Ali Nesin Mathematics Village (with Mathematics and Technology Club)

### 3. Right Column (Sticky - Interactive)
- Interactive node-graph mapping the site's content on the right side.
- Internal links in the center column must show rich **Hover Tooltip cards** (contextual preview without navigation).

## Color Palette & Typography
| Token / Mode | Value | Usage |
|---|---|---|
| Dark Mode Bg | `#0F172A` (Slate-900) | IDE Dark Mode feel |
| Light Mode Bg| `#F8FAFC` (Slate-50) | Clean, airy feel |
| Dark Text | Slate-200 | Body copy in Dark Mode |
| Light Text | Slate-900 | Body copy in Light Mode |
| Sky-400 | `#38BDF8` | Technical/software details |
| Violet-400 | `#A78BFA` | Mathematical contexts |

- **Body:** `Inter`
- **Code/Technical terms:** `JetBrains Mono`

## Development Instructions
- Always build a **modular, component-based** structure.
- Use the images provided in the `./references` folder to guide the layout structure.
- Build in this order first: `Layout` skeleton (3 columns) → `Theme Toggle` → `GraphNav` → `HoverTooltip`
- Avoid visual clutter; use whitespace intentionally for a relaxed, readable experience.
- Deeply analyze terminal errors to find root causes; verify solutions internally before presenting.