# Spanier Painting — Design Review

Static review microsite hosting 7 finalist mockups for Lukas Spanier's website redesign. Hosted on GitHub Pages.

## Structure

- `index.html` — landing, gallery of all 7 designs as live previews
- `reviews/<slug>.html` — per-mockup review page: full live design + 4-question feedback form
- `ranking.html` — final 1–7 ranking + free-form note
- `thanks.html` — Formspree redirect target after submission
- `mockups/<slug>/index.html` — the 7 finalist mockups (self-contained single-file HTML)
- `styles.css` — shared chrome styles
- `.build_reviews.py` — regenerates `reviews/*.html` from the template

## Mockups included

1. atelier-journal — workshop journal
2. open-house — real-estate listing register
3. the-painted-room — editorial magazine
4. delft-porcelain — heritage blue + tile explorer
5. brutalist-grid — structured grid + written promises
6. risograph-print — bold print poster
7. plain-studio — radical minimalism

## Form backend

All forms POST to **Formspree**. Before deploying, replace the placeholder endpoint in **two locations**:

- `.build_reviews.py` — `FORMSPREE_ENDPOINT` constant (then re-run the script)
- `ranking.html` — `<form action="...">`

Replace `https://formspree.io/f/YOUR_ID_HERE` with the form ID you get after creating the form at [formspree.io](https://formspree.io). The free tier allows 50 submissions/month — plenty for one client review pass.

Set the form's redirect-after-submit to `https://<your-pages-url>/thanks.html` in the Formspree dashboard.

## Deploying to GitHub Pages

```bash
git init
git add .
git commit -m "Initial design review site"
gh repo create spanier-design-review --public --source=. --push
# Then in repo settings → Pages: deploy from main branch / root
```

Site will be live at `https://<username>.github.io/spanier-design-review/` within a couple minutes.

## Regenerating review pages

Edit copy or reorder mockups in `.build_reviews.py`, then:

```bash
python3 .build_reviews.py
```
