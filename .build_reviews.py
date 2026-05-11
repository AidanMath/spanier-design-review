#!/usr/bin/env python3
"""One-shot generator for per-mockup review pages.

Reads the MOCKUPS list and writes reviews/<slug>.html for each.
Re-run anytime the copy or ordering needs to change.
"""
from pathlib import Path

FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_ID_HERE"  # TODO: replace after creating Formspree form

MOCKUPS = [
    ("atelier-journal", "Atelier Journal", "The Studio Journal",
     "Reads like your working notebook — diagrams, technical notes, project entries numbered like a logbook."),
    ("open-house", "Open House", "Real-Estate Register",
     "Every project framed like a property listing. Includes a hand-drawn project map of central Minnesota."),
    ("the-painted-room", "The Painted Room", "Editorial Magazine",
     "Built like a design magazine — masthead, issue numbers, paint specs annotated onto finished rooms."),
    ("delft-porcelain", "Delft Porcelain", "Heritage Blue",
     "Old-world porcelain blue throughout. Includes a tile-explorer interaction that swaps through pattern variations."),
    ("brutalist-grid", "Brutalist Grid", "Structured Grid",
     "Strict lines and section numbers, softened with a 'Written Promises' contract block that lays out how you work."),
    ("risograph-print", "Risograph Print", "Print Edition",
     "Bold single-color print poster feel — big misregistered wordmark, halftone textures, project plates."),
    ("plain-studio", "Plain Studio", "Quiet Confidence",
     "Almost nothing on the page — just clean type, generous space, one hero image, the work speaks for itself."),
]

ROOT = Path(__file__).parent
REVIEWS_DIR = ROOT / "reviews"
REVIEWS_DIR.mkdir(exist_ok=True)


def html_page(idx: int, slug: str, name: str, tag: str, desc: str, prev_slug: str | None, next_slug: str | None) -> str:
    num = f"{idx+1:02d}"
    total = len(MOCKUPS)
    prev_link = f'<a class="prev-link" href="{prev_slug}.html">Previous design</a>' if prev_slug else '<a class="prev-link" href="../index.html">All designs</a>'
    next_link = f'<a class="next-link" href="{next_slug}.html">Next design</a>' if next_slug else '<a class="next-link" href="../ranking.html">Final ranking</a>'
    if next_slug:
        success_next = f'<a class="next-btn" href="{next_slug}.html">Next design</a>'
    else:
        success_next = '<a class="next-btn" href="../ranking.html">Rank them all</a>'

    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Spanier Painting — Review · {name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,300;9..144,1,300;9..144,0,400;9..144,0,500&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../styles.css">
</head>
<body>

<header class="topbar">
  <div class="container topbar-inner">
    <div class="topbar-brand"><strong>Spanier Painting</strong> · <em>Design Review</em></div>
    <nav>
      <a href="../index.html">All designs</a>
      <a href="../ranking.html">Final Ranking</a>
    </nav>
    <div class="progress-pill" aria-label="Review progress">
      <span><strong data-progress-count>0 / {total:02d}</strong> reviewed</span>
      <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="{total}" aria-valuenow="0" data-progress-bar></div>
    </div>
    <div class="topbar-meta">{num} / {total:02d}</div>
  </div>
</header>

<div class="viewport-host" data-viewport-host></div>

<div class="review-page">
  <div class="review-frame-wrap">
    <iframe src="../mockups/{slug}/index.html" title="{name} live preview"></iframe>
  </div>

  <aside class="review-sidebar">
    <div class="review-sidebar-head">
      <span class="review-num">Design {num} · {tag}</span>
      <h1><em>{name}</em></h1>
      <p class="review-pitch">{desc}</p>
    </div>

    <div class="sidebar-section">
      <p class="sidebar-section-label">Pin notes to the design</p>
      <p class="sidebar-section-helper">Click "Pin a note" then click anywhere on the live design to drop a numbered pin and leave a comment about that exact spot.</p>
      <div class="pin-controls" data-pin-controls></div>
      <div class="pin-list" data-pin-list></div>
    </div>

    <form class="review-form" data-inline-submit data-slug="{slug}" action="{FORMSPREE_ENDPOINT}" method="POST">
      <input type="hidden" name="_subject" value="Spanier Painting Review · {name}">
      <input type="hidden" name="design" value="{slug}">
      <input type="hidden" name="design_name" value="{name}">

      <fieldset>
        <legend>1. Overall feel
          <span class="legend-helper">How does it sit with you? Gut reaction.</span>
        </legend>
        <div class="rating-group" role="radiogroup" aria-label="Overall feel">
          <input type="radio" id="overall-1-{slug}" name="overall" value="1" required>
          <label for="overall-1-{slug}">1</label>
          <input type="radio" id="overall-2-{slug}" name="overall" value="2">
          <label for="overall-2-{slug}">2</label>
          <input type="radio" id="overall-3-{slug}" name="overall" value="3">
          <label for="overall-3-{slug}">3</label>
          <input type="radio" id="overall-4-{slug}" name="overall" value="4">
          <label for="overall-4-{slug}">4</label>
          <input type="radio" id="overall-5-{slug}" name="overall" value="5">
          <label for="overall-5-{slug}">5</label>
        </div>
        <div class="rating-scale"><span>Not for me</span><span>Love it</span></div>
      </fieldset>

      <fieldset>
        <legend>2. Fit to your work
          <span class="legend-helper">Does it match how Spanier Painting actually works — residential and commercial in central MN?</span>
        </legend>
        <div class="rating-group" role="radiogroup" aria-label="Fit to your work">
          <input type="radio" id="fit-1-{slug}" name="fit" value="1" required>
          <label for="fit-1-{slug}">1</label>
          <input type="radio" id="fit-2-{slug}" name="fit" value="2">
          <label for="fit-2-{slug}">2</label>
          <input type="radio" id="fit-3-{slug}" name="fit" value="3">
          <label for="fit-3-{slug}">3</label>
          <input type="radio" id="fit-4-{slug}" name="fit" value="4">
          <label for="fit-4-{slug}">4</label>
          <input type="radio" id="fit-5-{slug}" name="fit" value="5">
          <label for="fit-5-{slug}">5</label>
        </div>
        <div class="rating-scale"><span>Wrong direction</span><span>Spot on</span></div>
      </fieldset>

      <fieldset>
        <legend>3. The thing you'd keep
          <span class="legend-helper">One element, color, section, or moment from this design that should survive into the final.</span>
        </legend>
        <textarea name="keep" rows="3" placeholder="e.g. the hero photo, the project map, the timeline, the font..."></textarea>
      </fieldset>

      <fieldset>
        <legend>4. The thing you'd change
          <span class="legend-helper">One element that doesn't land for you. Be blunt — that's the whole point.</span>
        </legend>
        <textarea name="change" rows="3" placeholder="e.g. too cold, too busy, wrong photo, copy is off..."></textarea>
      </fieldset>

      <div class="submit-row">
        <button type="submit" class="submit-btn">Send feedback</button>
        <div class="review-next">
          {prev_link}
          {next_link}
        </div>
      </div>
      <div class="form-error" role="alert" aria-live="polite"></div>
    </form>

    <div class="form-success" role="status" aria-live="polite">
      <div class="check" aria-hidden="true">✓</div>
      <h2><em>Saved.</em></h2>
      <p>Your notes on <em>{name}</em> are in. Keep going — there's more to see.</p>
      {success_next}
    </div>
  </aside>
</div>

<script src="../chrome.js" defer></script>
</body>
</html>
'''


def main():
    for i, (slug, name, tag, desc) in enumerate(MOCKUPS):
        prev_slug = MOCKUPS[i-1][0] if i > 0 else None
        next_slug = MOCKUPS[i+1][0] if i < len(MOCKUPS) - 1 else None
        out_path = REVIEWS_DIR / f"{slug}.html"
        out_path.write_text(html_page(i, slug, name, tag, desc, prev_slug, next_slug))
        print(f"wrote {out_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
