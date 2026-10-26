# Corebreach website

Static company website for corebreach.io, intended for GitHub Pages. HTML, CSS,
and vanilla JavaScript; no backend or database.

This branch is a work-in-progress snapshot. The landing page and press page
include the company logo, Runefall artwork and screenshots, public contact
information, and the requested development progress meters.

## Preview

From this directory, run `python -m http.server 8000 --bind 127.0.0.1` and open
`http://127.0.0.1:8000/`. Stop the server when finished.

## Validation

Run `python tools/check_site.py` to check pages, local links, required delivery
assets, and the press archive. Run `node --check site.js` for JavaScript syntax.

## Work remaining

- Capture and verify a usable gameplay video. The attempted Vulkan window
  recording was blank and is excluded from this commit.
- Create the video poster, social sharing image, and downloadable press ZIP.
- Add GitHub Pages deployment configuration, domain configuration, robots.txt,
  and sitemap.xml.
- Complete desktop/mobile browser checks and interaction testing.
- Fix the validator's handling of site-root URLs on the 404 page.

The missing assets currently leave unfinished links on the pages. Do not deploy
this snapshot as the finished public site. No deployment or merge is included.
