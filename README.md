# Kathan Raj — Product in Motion

A static, scroll-driven personal-branding site. The redesign uses full-screen scenes, animated voxel art, cutout labels and paper slips, a four-step API story, a continuous education-to-work timeline, and thematic personal chapters. It uses HTML, CSS, JavaScript and local image assets; no build step is required.

## Preview

Open `index.html` in a browser, or run `python3 -m http.server 8000` in this folder and visit `http://localhost:8000`.

## What moves

- The hero voxel field reacts to scroll and pointer movement.
- The API scene stays pinned for a shorter span; visitors can scroll or choose one of four named steps covering the map, ERP inbound, real-time outbound work and product foundations.
- Incident slips reveal different root-cause notes.
- The pricing scene steps from comparison to anomaly flag to manager-approved suggestion.
- The AI console switches between three project-specific diagrams: a connected graph, an agent workflow and a dashboard view.
- Supplied campus postcards sit in a six-stop timeline and shift slightly with scroll. The sport ball follows pointer or tap; Gujarati food choices, the pixel game and manga page have distinct controls.
- The first-principles quote has an interactive rocket-and-building-block illustration. Original anime, cartoon and manga-style character drawings give personal chapters different visual voices.
- Reduced-motion settings suppress continuous motion while preserving the content and controls.

`qa/scroll_audit.py` verifies that the hero and API scenes remain pinned at several scroll positions and that all four API stages activate. `qa/smoke.py` checks three viewport widths, local images, browser script errors and the main controls. Both need Python Playwright and Chromium installed locally. The scripts keep output screenshots in `qa/`.

## Poster artwork and sources

The timeline uses three watercolor-style campus postcard images supplied by Kathan. Earlier locally painted drafts remain in `assets/` with their source in `tools/create_postcards.py`. The short first-principles quote links to its [source conversation](https://elonmuskarchive.org/video/foundation-kevin-rose-2012-09-08). The One Piece artwork is original fan art, not an official image; the additional character illustrations are original SVG drawings.

## Draft items to finish

1. Add Kathan's confirmed LinkedIn URL. The button is disabled until then.
2. Replace the `K` character placeholder when Kathan supplies personal reference photos.
3. Confirm the public contact email and review employer metrics/descriptions.

There is intentionally no CV download. All work visualizations use illustrative data. The current transaction API work and independent AI experiments are described as in progress.

## GitHub Pages

The site is live at [kathanraj96.github.io](https://kathanraj96.github.io/) from the public [Kathanraj96.github.io repository](https://github.com/Kathanraj96/Kathanraj96.github.io). GitHub Pages publishes the `main` branch from `/ (root)`. The `.nojekyll` marker tells Pages to serve the static files as written.

To publish a later edit from this folder:

```sh
git add -A
git commit -m "Describe the update"
git push
```

GitHub Pages will rebuild after the push. See the [official publishing-source guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
