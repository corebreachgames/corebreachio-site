from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
GAME = Path(r'C:\Users\rickf\git\exile-survivors')
OUT = ROOT / 'assets/images'
OUT.mkdir(parents=True, exist_ok=True)

def web_image(source, name, width=1600, quality=86):
    image = Image.open(source).convert('RGB')
    if image.width > width:
        image.thumbnail((width, 2000), Image.Resampling.LANCZOS)
    image.save(OUT / name, 'WEBP', quality=quality, method=6)

logo = Image.open(r'C:\Users\rickf\Downloads\corebreach-logo.png')
logo.save(OUT / 'corebreach-logo.png', optimize=True)
logo.crop((214, 200, 810, 795)).resize((128,128),Image.Resampling.LANCZOS).save(OUT / 'corebreach-mark.png', optimize=True)
logo.crop((214, 200, 810, 795)).resize((64,64),Image.Resampling.LANCZOS).save(ROOT / 'favicon.png', optimize=True)
web_image(GAME / 'assets/sprites/cel/menu_forge.png', 'runefall-forge.webp')
web_image(GAME / 'docs/art/app-icon/04d-runeweaver.png', 'runefall-runeweaver.webp', 1080)
web_image(GAME / 'docs/art/app-icon/03d-ember-glyph.png', 'runefall-runestone.webp', 700)
screens = {
    'runefall-forge-gameplay.webp': 'docs/verification/forge-rebuild/gameplay.png',
    'runefall-chapel-gameplay.webp': 'docs/verification/chapel-rebuild/gameplay.png',
    'runefall-library-gameplay.webp': 'docs/verification/final-twelve-stages/library_gameplay.png',
    'runefall-castle-gameplay.webp': 'docs/verification/final-twelve-stages/castle_gameplay.png',
    'runefall-passive-tree.webp': 'docs/superpowers/artifacts/runic-tree-desktop.png',
}
for name, source in screens.items():
    web_image(GAME / source, name, 1440, 90)
    web_image(GAME / source, name.replace('.webp', '-thumb.webp'), 720, 85)
print('Prepared logo, artwork, and five game screenshots.')
