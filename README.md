# Spanier Painting — Design Review

A custom-built decision tool for Lukas Spanier to walk through seven website mockups and tell Aidan what works.

**Live:** [aidanmath.github.io/spanier-design-review](https://aidanmath.github.io/spanier-design-review/)

## What's here

This repo holds the production build (`dist/`) of a React SPA whose source lives in a sibling repo at `~/Desktop/Projects/spanier-review-react/`. The mockups themselves are self-contained HTML files served at `/mockups/<slug>/index.html` and embedded via iframe.

## Architecture

- **Stack:** React 18 + Vite + TypeScript + Tailwind + Framer Motion + React Router
- **Style direction:** "Curator's evaluation tool" — Fraunces 144 (display) + IBM Plex Sans (body) + JetBrains Mono (labels)
- **Persistence:** localStorage (themes, viewport choice, form drafts, annotation pins, progress)
- **Forms:** Inline submit via fetch to Formspree (placeholder ID — replace before showing Lukas)

## Features

- Theme picker reframed as "Gallery lighting" — Studio / Ivory / Linen / Dusk
- Viewport toggle on every review page (Desktop / Tablet / Mobile)
- Annotation pins — click anywhere on the live design to drop a numbered pin + leave a note
- Progress strip (n/7) updates across pages on every submit
- Auto-save form drafts; resume banner on landing
- Animated success state per review; ranking page for final 1–7

## Updating the deployed build

```bash
# In the source repo:
cd ~/Desktop/Projects/spanier-review-react
npm run build

# Copy the build over this repo:
rsync -av --delete --exclude='.git' --exclude='README.md' dist/ ~/Desktop/Projects/spanier-design-review/
cp -R public/mockups ~/Desktop/Projects/spanier-design-review/

cd ~/Desktop/Projects/spanier-design-review
git add . && git commit -m "Rebuild" && git push
```

GitHub Pages will redeploy automatically within ~60 seconds.

## Before sending to Lukas

1. Create a Formspree form at [formspree.io](https://formspree.io) (free 50/mo)
2. Replace `https://formspree.io/f/YOUR_ID_HERE` in `src/pages/Review.tsx` AND `src/pages/Ranking.tsx`
3. Rebuild + push (above)
