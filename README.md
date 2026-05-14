# Spanier Painting — Design Review

A custom-built decision tool for Lukas Spanier to walk through six website mockups and tell Aidan what works.

**Live:** [aidanmath.github.io/spanier-design-review](https://aidanmath.github.io/spanier-design-review/)

## What's here

This repo is the GitHub Pages deploy target — it holds the production build (`dist/`) of a React SPA whose source lives in a sibling repo at `~/Desktop/Projects/spanier-review-react/`. The mockups themselves are self-contained HTML files served at `/mockups/<slug>/index.html` and embedded via iframe.

## Architecture

- **Stack:** React 18 + Vite + TypeScript + Tailwind + Framer Motion + React Router
- **Style direction:** "Curator's evaluation tool" — Fraunces 144 (display) + IBM Plex Sans (body) + JetBrains Mono (labels)
- **Persistence:** localStorage (themes, viewport choice, form drafts, progress)
- **Forms:** Inline submit via fetch to Formspree (`xqennrnk`)

## Deployed mockups (display order)

1. The Painted Room — editorial magazine
2. Field Studio — monograph
3. Risograph Print — print edition
4. Plain Studio — quiet confidence
5. Brutalist Grid — structured grid
6. Delft Porcelain — heritage blue

## Features

- Per-mockup live preview in iframe; click-through to full-page review
- Theme repaint per design — preset palettes + custom hex inputs, save a favorite (★)
- Viewport toggle on every review page (Desktop / Tablet / Mobile)
- Auto-save form drafts; resume banner on landing
- Animated success state per review; final 1–6 ranking page

## Updating the deployed build

One command, from the source repo:

```bash
cd ~/Desktop/Projects/spanier-review-react
npm run deploy
```

That runs `npm run build`, syncs `dist/` + `public/mockups/` into this repo, commits with a timestamp, and pushes to `master`. GitHub Pages redeploys in ~60s.

The script lives at `scripts/deploy.sh` in the source repo. Override the target via `SPANIER_DEPLOY_REPO=/path/to/repo npm run deploy`.
