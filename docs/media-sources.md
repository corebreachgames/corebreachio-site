# Promotional media sources

All game images and footage come from the Runefall (`exile-survivors`) project.
The source game repository and the player's normal saves were not changed.

| Published asset | Source |
| --- | --- |
| Company logo, mark, favicon | User-supplied `corebreach-logo.png`; web sizes cropped from the original logo |
| Forge illustration | `assets/sprites/cel/menu_forge.png` in the game repository |
| Runeweaver concept artwork | `docs/art/app-icon/04d-runeweaver.png` in the game repository |
| Ember Glyph concept artwork | `docs/art/app-icon/03d-ember-glyph.png` in the game repository |
| Forge and inventory screenshots | Actual Godot runtime captures on 2026-10-26; original PNGs and loadout manifest in `assets/press/screenshots/` |
| Library and Castle screenshots | `docs/verification/final-twelve-stages/library_gameplay.png` and `castle_gameplay.png` in the game repository |
| Passive tree screenshot | `docs/superpowers/artifacts/runic-tree-desktop.png` in the game repository |
| Gameplay video | Actual Forge gameplay, Godot 4.7.2 movie writer; 900 frames at 30 fps, encoded to 1280 × 720 H.264, silent |
| Video poster | Frame at eight seconds from the published gameplay clip |
| Sharing image | `tools/social-card.html`, rendered at 1200 × 630 using the supplied mark, Forge illustration, and site typography |

The Forge screenshot and clip use four equipped skills: Double Beat, Blood
Lattice, Hollow Verdict, and Spirit Litany. Expansions are equipped to the
autoattack, three skills, and the dash. The inventory image includes two normal,
two magic, and two rare equipped items with seven empty equipment slots.

Capture sessions ran in a disposable local project copy with isolated user
data. The video uses automated movement, an invulnerable character, and
suppressed reward modals so the brief clip stays in combat. These are development
materials, not a claim about final balance or performance.

Godot's movie writer captured rendered frames directly; desktop window capture
was unsuitable for the Vulkan renderer. A 900-frame script limit ended the clip,
an engine frame limit provided a second stop, and the session wrapper imposed a
wall-clock timeout and cleaned up its process. Encoding removed startup and
shutdown frames, producing exactly 30 seconds. The original failed window
recording is excluded from the public files.

`tools/prepare_media.py` rebuilds web images and thumbnails.
`tools/prepare_press_kit.py` packages nine original PNGs and written information,
with concept artwork explicitly labelled. The MP4 is a separate download.
