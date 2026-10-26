# Corebreach Website Implementation Plan

> Execute inline in this session; the user approved the design and branch. Preserve the game repository unchanged.

**Goal:** Create a polished static Corebreach company website and Runefall promotional package ready for GitHub Pages.

**Architecture:** Buildless semantic HTML and shared CSS; progressive JavaScript for navigation, gallery and video. All public assets live in assets; temporary capture tools, binaries and previews stay ignored.

**Tech stack:** HTML, CSS, vanilla JavaScript, Python/Pillow asset preparation, FFmpeg, GitHub Actions.

- [x] Prepare real media. Copy the supplied company logo and selected game artwork; optimize web variants. Copy existing game screenshots and capture a current runtime gameplay reel without changing the original repository. Record source provenance in docs/media-sources.md.
- [x] Build index.html, styles.css and site.js. Lead with the studio; give Runefall a distinct illustrated feature, real gameplay, screenshot lightbox and development status. Include studio and press/contact sections. Use accessible semantic controls and reduced-motion support.
- [x] Build press/index.html and assets/press/corebreach-runefall-press-kit.zip. Include overview text, confirmed features, company logo, game artwork and actual screenshots. Ensure every visible action leads to real content.
- [x] Add .github/workflows/pages.yml, .nojekyll, CNAME, robots.txt, sitemap.xml, 404.html and README.md. Serve repository root as a static artifact, excluding source tools and capture state from deployment.
- [x] Validate with tools/check_site.py; preview on localhost only. Check desktop, narrow mobile, image loading, keyboard gallery close/next/previous, mobile menu and actual video playback. Review diff and stop all owned preview/capture processes before finishing.

Validation: all 11 progress-panel tests and six URL-validator regression tests
pass. Source link/archive checks pass; the collected Pages package matches all
public files byte for byte and excludes developer files. Browser interaction
checks pass at 1440px and 375px for
direct local HTML and localhost hosting, including actual playback, seeking,
ending/replay, gallery focus/keyboard controls, downloads, menu, and nested 404
assets. Video playback was also checked in installed Chrome and Edge. Review
found and corrected press-thumbnail sizing, local navigation, and an unsupported
Pages action input. Merge and publication remain on hold.
