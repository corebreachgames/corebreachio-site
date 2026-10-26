"""Validate the public static site and every local link before deployment."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_HTML = ['index.html', 'press/index.html', '404.html']
errors = []

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
        self.ids = set()
        self.images = []
        self.progress = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                errors.append(f'Duplicate id: {attrs["id"]}')
            self.ids.add(attrs['id'])
        for attr in ('href', 'src', 'poster'):
            if attrs.get(attr):
                self.refs.append(attrs[attr])
        if tag == 'img' and 'alt' not in attrs:
            errors.append('Image is missing an alt attribute')
        if tag == 'progress':
            self.progress.append(int(attrs['value']))

pages = {}
for name in PUBLIC_HTML:
    path = ROOT / name
    if not path.exists():
        errors.append(f'Missing page: {name}')
        continue
    parser = Page()
    parser.feed(path.read_text(encoding='utf-8'))
    pages[path] = parser
for path, page in pages.items():
    for ref in page.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc:
            continue
        target = (path.parent / unquote(url.path)).resolve() if url.path else path
        if url.path.endswith('/') or target.is_dir():
            target = target / 'index.html'
        if not target.is_relative_to(ROOT) or not target.exists():
            errors.append(f'{path.relative_to(ROOT)}: broken local link {ref}')
        elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
            errors.append(f'{path.relative_to(ROOT)}: missing anchor {ref}')
home = pages.get(ROOT / 'index.html')
if home and sorted(home.progress) != [0, 10, 75, 95]:
    errors.append('Runefall progress must show exactly 95%, 10%, 75%, 0%')
for name in ['assets/video/runefall-gameplay.mp4', '.nojekyll', 'CNAME', '.github/workflows/pages.yml', 'robots.txt', 'sitemap.xml']:
    if not (ROOT / name).exists():
        errors.append(f'Missing delivery asset: {name}')
kit = ROOT / 'assets/press/corebreach-runefall-press-kit.zip'
if not kit.exists():
    errors.append('Missing downloadable press kit')
else:
    with zipfile.ZipFile(kit) as archive:
        if archive.testzip():
            errors.append('Press ZIP failed its integrity check')
        if not any(n.endswith('.txt') for n in archive.namelist()):
            errors.append('Press ZIP lacks written game information')
        if len([n for n in archive.namelist() if n.endswith('.png')]) < 5:
            errors.append('Press ZIP lacks the company logo and original screenshots')
if errors:
    print('\n'.join('FAIL: ' + e for e in errors))
    sys.exit(1)
print(f'PASS: {len(pages)} pages, all local links and anchors, requested progress values, deployment files and press ZIP integrity.')
