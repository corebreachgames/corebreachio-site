# Core Breach website

Static company website for corebreach.io, intended for GitHub Pages. HTML, CSS,
and vanilla JavaScript; no backend or database.

The landing page and press room include the company logo, Runefall artwork,
actual gameplay footage, screenshots, a downloadable press kit, and development
progress meters. The site is ready for review on `feature/corebreachio-site`;
merging and publishing remain on hold at the user's request.

## Preview

From this directory, run `python -m http.server 8000 --bind 127.0.0.1` and open
`http://127.0.0.1:8000/`. Stop the server when finished.

You can also open `index.html` or `press/index.html` directly in your browser.
The progress panel uses ordered, deferred classic scripts so it works with both
`file://` previews and HTTP hosting; no local server is required for the panel.
Page navigation uses explicit HTML filenames so links also work in file previews.

## Validation

Run these checks before merging:

```sh
python -m unittest discover -s tools -p check_site_test.py
python tools/check_site.py
node --check site.js
node --check progress-panel.js
node --check game-progress.js
```

The validator checks pages, local links (including site-root URLs and HTML base
URLs), required delivery assets, and the press archive.

The floating progress panel has browser regression checks in
`tools/progress-panel.test.cjs`. With Node.js 20+ and Playwright installed, run
`node --test tools/progress-panel.test.cjs`. The tests use a temporary localhost
server and headless Chromium, and close both when finished. If using a shared
installation, set `COREBREACH_PLAYWRIGHT` to its Playwright package path and
`COREBREACH_CHROMIUM` to the Chromium executable.

Panel behavior tests use their own fixtures; configuration checks compare the
rendered panel against whatever is currently in `game-progress.js`. Adding,
removing, or renaming games and meters does not require test changes.

Also check desktop and mobile layouts, the menu, gallery keyboard controls,
press downloads, and video play/seek/replay in a browser. Use a browser with
H.264 support for the MP4 check (for example, installed Chrome or Edge); some
development Chromium builds omit this codec.

## Game development progress

Edit `game-progress.js` to update percentages or add games. The floating panel
lists every game and meter from that shared list on the home, press, and error
pages. It opens expanded on every page load and can be collapsed with its minus
button. It follows the bottom of the visible header (including an open mobile
menu) and stays 12 pixels from the top after the header scrolls away.

The Runefall section's inline meters are synchronized from the same list. Its
HTML also provides fallback values for visitors with JavaScript disabled;
update those fallback values when changing the published snapshot.

## Promotional media

The current Forge and inventory captures are saved as original PNGs under
`assets/press/screenshots/`. `capture-details.json` records the equipped gear,
skills, and expansions used in the capture session. `tools/prepare_media.py`
generates the full-size WebP images and thumbnails from those originals.

The silent gameplay clip is 30 seconds, 1280 × 720, H.264 at 30 fps. It was
captured offscreen using Godot's movie writer in an isolated game copy. A frame
limit stops capture automatically. For future capture sessions, send **Stop
capture** in the chat to request an early stop; the recording must be finalized
before closing the runtime. Rendering may take longer than the clip's duration.

Rebuild the press archive with `python tools/prepare_press_kit.py`. By default,
it reads original artwork and older screenshots from the sibling
`exile-survivors` repository; use `--game-root PATH` to override that location.
The published ZIP is self-contained. Its gameplay download stays separate to
keep the archive small.

The sharing image is rendered from `tools/social-card.html` with
`node tools/render_social_card.cjs` (Node 20+, Playwright, and the same optional
environment variables as the browser tests). See `docs/media-sources.md` for
asset provenance and capture details.

## GitHub Pages

`.github/workflows/pages.yml` validates and packages only public files, then
deploys pushes to `main`. Manual dispatch also requires `main`. Tools, documents,
capture projects, local saves, and Git history are excluded from the artifact.
No build step or external runtime dependencies are needed to serve the site.

When publication is authorized:

1. Run all validation and browser checks, then merge and push `main`.
2. In the repository's **Settings → Pages**, select **GitHub Actions** as the
   source and set the custom domain to `corebreach.io`.
3. Configure the domain's DNS for GitHub Pages and enable **Enforce HTTPS** once
   GitHub has issued the certificate. Follow GitHub's
   [custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
4. Verify the deployed homepage, press downloads, video playback, and a missing
   nested URL such as `/missing/page/`.

`CNAME` records the intended domain, but GitHub Actions deployments also require
the custom-domain setting in the repository. DNS, repository settings, and the
first public deployment remain outstanding; this branch has not been deployed.
