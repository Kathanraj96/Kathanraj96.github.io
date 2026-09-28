# Kathan Raj — Product in Motion

A static, scroll-driven personal-branding site. The redesign uses full-screen scenes, animated voxel art, cutout labels and paper slips, a pinned four-stage API story, thematic personal chapters, and three locally made watercolor-style city posters. It uses HTML, CSS, JavaScript and local image assets; no build step is required.

## Preview

Open `index.html` in a browser, or run `python3 -m http.server 8000` in this folder and visit `http://localhost:8000`.

## What moves

- The hero voxel field reacts to scroll and pointer movement.
- The API scene stays pinned while scrolling through overview, ERP inbound, transaction outbound and richer transaction detail.
- Incident slips reveal different root-cause notes.
- The pricing scene steps from comparison to anomaly flag to manager-approved suggestion.
- The AI console switches between independent experiments.
- Postcards shift slightly with scroll. The sport ball follows pointer or tap; Gujarati food choices, the pixel game and manga page have distinct controls.
- Reduced-motion settings suppress continuous motion while preserving the content and controls.

`qa/scroll_audit.py` verifies that the hero and API scenes remain pinned at several scroll positions and that all four API stages activate. `qa/smoke.py` checks three viewport widths, local images, browser script errors and the main controls. Both need Python Playwright and Chromium installed locally. The scripts keep output screenshots in `qa/`.

## Poster artwork and sources

The three vertical blue-and-yellow posters in `assets/` were created locally with `tools/create_postcards.py`, using paint-like washes and paper texture. They are interpretations rather than architectural reproductions. Location details were checked against the [C. N. Vidyavihar campus material](https://cnvidyavihar.edu.in/wp-content/uploads/2024/05/Smart-Class-Requirement-23-April-2024.pdf), [GCET's campus brochure](https://www.gcet.ac.in/uploads/gcetbrochure/2017.pdf), and [SCMHRD's campus description](https://scmhrd.edu/infrastructure/). The short first-principles quote links to its [source conversation](https://elonmuskarchive.org/video/foundation-kevin-rose-2012-09-08). The manga artwork is original fan art, not an official image.

## Before publication

1. Add Kathan's confirmed LinkedIn URL. The button is disabled until then.
2. Replace the `K` character placeholder when Kathan supplies personal reference photos.
3. Confirm the public contact email and review employer metrics/descriptions for public use.

There is intentionally no CV download. All work visualizations use illustrative data. The current transaction API work and independent AI experiments are described as in progress.

## GitHub Pages

This folder is a plain static site ready for branch-based GitHub Pages publishing. The `.nojekyll` marker tells Pages to serve the files as written, without a Jekyll build. Paths are relative, so the site works at a user or project repository address.

For the shortest personal URL, create a public repository named `<username>.github.io`. Once GitHub CLI is authenticated, create and upload it from this folder:

```sh
/opt/homebrew/bin/gh auth login -h github.com
/opt/homebrew/bin/gh repo create <username>.github.io --public --source=. --remote=origin --push
```

Then open the repository's **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save. The site URL will be `https://<username>.github.io/`. For a project repository with another name, the URL is normally `https://<username>.github.io/<repository>/`.

See the [official GitHub Pages publishing-source guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). GitHub Pages publishes the site publicly, even when a paid plan allows a private source repository; review contact details and employer descriptions before making it live.
