"""Regression checks for URL resolution in the static-site validator."""
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import zipfile


class LocalLinkChecks(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.write('tools/check_site.py', Path(__file__).with_name('check_site.py').read_text(encoding='utf-8'))
        self.write('index.html', ''.join(f'<progress value="{value}"></progress>' for value in [95, 10, 75, 0]))
        self.write('press/index.html', '<h1 id="facts">Press</h1>')
        self.write('404.html', '<h1 id="main">Missing page</h1>')
        for name in ['assets/video/runefall-gameplay.mp4', '.nojekyll', 'CNAME', '.github/workflows/pages.yml', 'robots.txt', 'sitemap.xml', 'assets/logo mark.png']:
            self.write(name, '')
        kit = self.root / 'assets/press/corebreach-runefall-press-kit.zip'
        kit.parent.mkdir(parents=True)
        with zipfile.ZipFile(kit, 'w') as archive:
            archive.writestr('facts.txt', 'Fixture')
            for index in range(5):
                archive.writestr(f'image-{index}.png', '')

    def write(self, name, contents):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(contents, encoding='utf-8')

    def check(self):
        return subprocess.run([sys.executable, str(self.root / 'tools/check_site.py')], capture_output=True, text=True)

    def test_site_root_links_and_encoded_names(self):
        self.write('404.html', '<base href="/"><a href="/">Home</a><a href="/press/#facts">Press</a><img src="/assets/logo%20mark.png" alt="Logo">')
        result = self.check()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_base_href_resolves_relative_assets_from_site_root(self):
        self.write('press/index.html', '<base href="/"><img src="assets/logo%20mark.png" alt="Logo"><a href="press/#facts">Facts</a><h1 id="facts">Facts</h1>')
        result = self.check()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_parent_links_keep_normal_page_relative_behavior(self):
        self.write('press/index.html', '<img src="../assets/logo%20mark.png" alt="Logo"><a href="../">Home</a>')
        result = self.check()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_missing_root_file_is_reported(self):
        self.write('404.html', '<base href="/"><img src="/missing.png" alt="Missing">')
        result = self.check()
        self.assertEqual(result.returncode, 1)
        self.assertIn('broken local link /missing.png', result.stdout)

    def test_missing_root_anchor_is_reported(self):
        self.write('404.html', '<a href="/press/#missing">Missing</a>')
        result = self.check()
        self.assertEqual(result.returncode, 1)
        self.assertIn('missing anchor /press/#missing', result.stdout)

    def test_encoded_path_cannot_escape_site_directory(self):
        self.write('404.html', '<a href="/%2e%2e/outside.html">Outside</a>')
        result = self.check()
        self.assertEqual(result.returncode, 1)
        self.assertIn('broken local link /%2e%2e/outside.html', result.stdout)


if __name__ == '__main__':
    unittest.main()
