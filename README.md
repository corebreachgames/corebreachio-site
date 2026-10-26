# Core Breach website

Static company website for corebreach.io, intended for GitHub Pages. HTML, CSS,
and vanilla JavaScript; no backend or database.

This branch is a work-in-progress snapshot. The landing page and press page
include the company logo, Runefall artwork and screenshots, public contact
information, and the requested development progress meters.

## Preview

From this directory, run `python -m http.server 8000 --bind 127.0.0.1` and open
`http://127.0.0.1:8000/`. Stop the server when finished.

You can also open `index.html` or `press/index.html` directly in your browser.
The progress panel uses ordered, deferred classic scripts so it works with both
`file://` previews and HTTP hosting; no local server is required for the panel.

## Validation

Run `python tools/check_site.py` to check pages, local links, required delivery
assets, and the press archive. Run `node --check site.js` for JavaScript syntax.

The floating progress panel has browser regression checks in
`tools/progress-panel.test.cjs`. With Node.js 20+ and Playwright installed, run
`node --test tools/progress-panel.test.cjs`. The tests use a temporary localhost
server and headless Chromium, and close both when finished. If using a shared
installation, set `COREBREACH_PLAYWRIGHT` to its Playwright package path and
`COREBREACH_CHROMIUM` to the Chromium executable.

Panel behavior tests use their own fixtures; configuration checks compare the
rendered panel against whatever is currently in `game-progress.js`. Adding,
removing, or renaming games and meters does not require test changes.

## Game development progress

Edit `game-progress.js` to update percentages or add games. The floating panel
lists every game and meter from that shared list on the home, press, and error
pages. It opens expanded on every page load and can be collapsed with its minus
button. It follows the bottom of the visible header (including an open mobile
menu) and stays 12 pixels from the top after the header scrolls away.

The Runefall section's inline meters are synchronized from the same list. Its
HTML also provides fallback values for visitors with JavaScript disabled;
update those fallback values when changing the published snapshot.

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
