"""Rebuild the downloadable kit using original game assets and site captures."""
from pathlib import Path
import argparse
import zipfile

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--game-root', type=Path, default=ROOT.parent / 'exile-survivors')
args = parser.parse_args()
game = args.game_root

sources = {
    'logo/corebreach-logo.png': ROOT / 'assets/images/corebreach-logo.png',
    'screenshots/runefall-forge.png': ROOT / 'assets/press/screenshots/runefall-forge.png',
    'screenshots/runefall-inventory.png': ROOT / 'assets/press/screenshots/runefall-inventory.png',
    'screenshots/runefall-library.png': game / 'docs/verification/final-twelve-stages/library_gameplay.png',
    'screenshots/runefall-castle.png': game / 'docs/verification/final-twelve-stages/castle_gameplay.png',
    'screenshots/runefall-passive-tree.png': game / 'docs/superpowers/artifacts/runic-tree-desktop.png',
    'artwork/concept-runeweaver.png': game / 'docs/art/app-icon/04d-runeweaver.png',
    'artwork/concept-ember-glyph.png': game / 'docs/art/app-icon/03d-ember-glyph.png',
    'artwork/forge-menu-illustration.png': game / 'assets/sprites/cel/menu_forge.png',
}
missing = [str(path) for path in sources.values() if not path.is_file()]
if missing:
    raise SystemExit('Missing source images:\n' + '\n'.join(missing))

facts = '''CORE BREACH / RUNEFALL — PRESS KIT

Studio: Core Breach
Website: https://corebreach.io/
Contact: support@corebreach.io

Core Breach is an independent game studio focused on atmospheric worlds and
deep systems. Runefall is currently in development. More games will follow.

RUNEFALL
Genre: Dark fantasy action survival
Status: In development
Release date: To be announced
Platforms in development: Windows, Linux, Android

Combine runestone skills, weapons, equipment, and a branching passive tree
to face growing hordes and bosses. Build a loadout, equip skill expansions,
and survive environments including forges, chapels, and catacombs.

WHAT IS INCLUDED
- Original company logo
- Five unlabelled screenshots: Forge combat, inventory and paper doll,
  Library, Castle, and the passive tree
- Runeweaver and Ember Glyph concept artwork
- The Forge menu illustration

Gameplay footage is available separately (silent, 30 seconds, 1280 x 720):
https://corebreach.io/assets/video/runefall-gameplay.mp4

The Forge and inventory images are staged captures from the actual development
project. The inventory includes empty slots and normal, magic, and rare gear.
The Forge uses four skills with expansions on skills, autoattack, and dash.
Gameplay footage uses an automated, invulnerable character in an isolated
development project, with reward modals suppressed for uninterrupted combat.
All development materials are subject to change.

USAGE
For editorial coverage, reviews, and creator videos. Credit Core Breach and
link to https://corebreach.io/. Preserve the logo's proportions and label
concept artwork clearly. Contact support@corebreach.io for other uses.
'''

kit = ROOT / 'assets/press/corebreach-runefall-press-kit.zip'
kit.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(kit, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
    archive.writestr('corebreach-runefall/README.txt', facts)
    for name, source in sources.items():
        archive.write(source, 'corebreach-runefall/' + name)
print(f'Prepared press kit: {len(sources)} original PNGs and written game information ({kit.stat().st_size:,} bytes).')
