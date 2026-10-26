/* Run with node --test. Playwright and Chromium are development-only tools. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFile, mkdir } = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { runInNewContext } = require('node:vm');
const { chromium } = require(process.env.COREBREACH_PLAYWRIGHT || 'playwright');

const root = path.resolve(__dirname, '..');
const contentTypes = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp' };

// Behavior tests own their fixtures. Editing the published game list must not
// change which scroll, collapse, accessibility, or overflow cases get exercised.
const basicFixture = [{
  id: 'fixture-game',
  name: 'Fixture Game',
  updated: '2026-01-01',
  meters: [
    { id: 'planning', label: 'Design & discovery', value: 0 },
    { id: 'build', label: 'Working build', value: 37 },
    { id: 'release', label: 'Release preparation', value: 100 },
  ],
}];

function makeFixtureGame(index, meterCount) {
  return {
    id: `fixture-${index}`,
    name: `Test project ${index}`,
    updated: '2026-01-01',
    meters: Array.from({ length: meterCount }, (_, meter) => ({
      id: `milestone-${meter}`,
      label: `Milestone ${meter + 1}`,
      value: (index * 17 + meter * 23) % 101,
    })),
  };
}

async function readConfiguredGames() {
  // Read the source independently from the browser-rendered result. Compare the
  // complete configured list, without assuming any names, values, or counts.
  const scope = { window: {} };
  const source = await readFile(path.join(root, 'game-progress.js'), 'utf8');
  runInNewContext(source, scope, { timeout: 1000 });
  assert.ok(Array.isArray(scope.window.corebreachGameProgress), 'The game configuration is an array');
  return JSON.parse(JSON.stringify(scope.window.corebreachGameProgress));
}

async function assertRenderedGames(page, games, homeURL) {
  const panel = page.locator('.progress-panel');
  assert.equal(await panel.count(), games.length ? 1 : 0, 'A panel appears when games are configured');
  if (!games.length) return;

  const actual = await panel.locator('.progress-panel-game').evaluateAll(sections => sections.map(section => ({
    name: section.querySelector('h3').textContent,
    updated: section.querySelector('time').dateTime,
    href: section.querySelector('a').href,
    meters: [...section.querySelectorAll('progress')].map(meter => ({
      label: [...meter.labels].map(label => label.textContent).join(' '),
      value: meter.value,
      max: meter.max,
      percentage: meter.closest('.progress-panel-meter').querySelector('.progress-panel-label > span').textContent,
    })),
  })));
  const expected = games.map(game => ({
    name: game.name,
    updated: game.updated,
    href: new URL(`#${game.id}`, homeURL).href,
    meters: game.meters.map(meter => ({
      label: meter.label,
      value: meter.value,
      max: 100,
      percentage: `${meter.value}%`,
    })),
  }));
  assert.deepEqual(actual, expected, 'Every game, accessible meter label, value and percentage matches the supplied data');
  const meterCount = games.reduce((total, game) => total + game.meters.length, 0);
  assert.equal(await panel.getByRole('progressbar').count(), meterCount);
  const ids = await panel.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id));
  assert.equal(new Set(ids).size, ids.length, 'Game and meter IDs stay unique across the panel');
}

test('floating game progress', async (t) => {
  const server = createServer(async (request, response) => {
    try {
      let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      pathname = pathname.replace(/^\/corebreachio-site(?=\/)/, '');
      const filename = path.resolve(root, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
      if (!filename.startsWith(root + path.sep)) throw new Error('Outside test root');
      const body = await readFile(filename);
      response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filename)] || 'application/octet-stream' });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.COREBREACH_CHROMIUM || undefined });
    const base = `http://127.0.0.1:${server.address().port}`;

    async function visit(t, { url = '/', viewport = { width: 1440, height: 1000 }, games = basicFixture, useConfiguredData = false } = {}) {
      const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
      t.after(() => context.close());
      const page = await context.newPage();
      const expected = useConfiguredData ? await readConfiguredGames() : games;
      if (!useConfiguredData) {
        await page.route('**/game-progress.js', route => route.fulfill({
          contentType: 'text/javascript',
          body: `window.corebreachGameProgress = ${JSON.stringify(games)};`,
        }));
      }
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base + url, { waitUntil: 'networkidle' });
      assert.deepEqual(errors, [], 'No JavaScript runtime errors');
      const home = new URL(url.startsWith('/corebreachio-site/') ? '/corebreachio-site/' : '/', base);
      await assertRenderedGames(page, expected, home);
      return page;
    }

    async function checkPosition(page, includeMenu = false) {
      await page.waitForFunction(includeMenu => {
        const header = document.querySelector('.site-header').getBoundingClientRect();
        const nav = document.querySelector('.main-nav')?.getBoundingClientRect();
        const bottom = Math.max(0, header.bottom, includeMenu ? nav.bottom : 0);
        return Math.abs(document.querySelector('.progress-panel').getBoundingClientRect().top - (bottom + 12)) < 2;
      }, includeMenu, { timeout: 3000 });
    }

    async function capture(page, name) {
      if (!process.env.COREBREACH_SCREENSHOTS) return;
      const directory = path.join(root, '.preview');
      await mkdir(directory, { recursive: true });
      await page.screenshot({ path: path.join(directory, name + '.png') });
    }

    await t.test('renders the current configuration without fixed game or meter counts', async t => {
      await visit(t, { useConfiguredData: true });
    });

    await t.test('starts expanded with accessible progress values', async t => {
      const page = await visit(t);
      assert.equal(await page.getByRole('button', { name: 'Collapse game progress' }).getAttribute('aria-expanded'), 'true');
      assert.equal(await page.locator('#game-progress-content').isVisible(), true);
      assert.equal(await page.locator('.progress-panel').evaluate(panel => getComputedStyle(panel).position), 'fixed');
      await checkPosition(page);
      await capture(page, 'progress-desktop');
    });

    await t.test('works when the HTML files are opened directly without a server', async t => {
      const games = await readConfiguredGames();
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
      t.after(() => context.close());
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error' && /progress-panel|game-progress|CORS/.test(message.text())) errors.push(message.text());
      });
      const home = pathToFileURL(path.join(root, 'index.html'));
      for (const filename of ['index.html', 'press/index.html', '404.html']) {
        await page.goto(pathToFileURL(path.join(root, filename)).href, { waitUntil: 'networkidle' });
        await assertRenderedGames(page, games, home);
        if (!games.length) continue;
        assert.equal(await page.locator('.progress-panel').evaluate(panel => getComputedStyle(panel).position), 'fixed');
        await checkPosition(page);
        await page.getByRole('button', { name: 'Collapse game progress' }).click();
        assert.equal(await page.locator('#game-progress-content').isVisible(), false);
        await page.getByRole('button', { name: 'Expand game progress' }).click();
        await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }));
        await checkPosition(page);
      }
      assert.deepEqual(errors, []);
    });

    await t.test('accepts empty lists, games without meters and differing meter counts', async t => {
      const configurations = [
        [],
        [makeFixtureGame(0, 0)],
        [makeFixtureGame(1, 1)],
        [makeFixtureGame(2, 0), makeFixtureGame(3, 2), makeFixtureGame(4, 11)],
      ];
      for (const games of configurations) await visit(t, { games });
    });

    await t.test('follows the header boundary, pins to the top and returns on upward scroll', async t => {
      const page = await visit(t);
      for (const top of [48, 500, 0]) {
        await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), top);
        await checkPosition(page);
      }
      await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }));
      await checkPosition(page);
      assert.ok(Math.abs((await page.locator('.progress-panel').boundingBox()).y - 12) < 2);
    });

    await t.test('collapses and reopens with the keyboard, and reloads expanded', async t => {
      const page = await visit(t);
      const expanded = await page.locator('.progress-panel').boundingBox();
      await page.getByRole('button', { name: 'Collapse game progress' }).focus();
      await page.keyboard.press('Enter');
      const toggle = page.getByRole('button', { name: 'Expand game progress' });
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      assert.equal(await page.locator('#game-progress-content').isVisible(), false);
      const collapsed = await page.locator('.progress-panel').boundingBox();
      assert.ok(collapsed.width < expanded.width && collapsed.height < expanded.height);
      await page.keyboard.press('Space');
      assert.equal(await page.locator('#game-progress-content').isVisible(), true);
      await page.getByRole('button', { name: 'Collapse game progress' }).click();
      await page.reload({ waitUntil: 'networkidle' });
      assert.equal(await page.locator('#game-progress-content').isVisible(), true);
    });

    await t.test('fits mobile screens and follows an opened navigation menu', async t => {
      const page = await visit(t, { viewport: { width: 375, height: 667 } });
      await checkPosition(page);
      const panel = await page.locator('.progress-panel').boundingBox();
      assert.ok(panel.x >= 12 && panel.x + panel.width <= 363);
      assert.ok(panel.y + panel.height <= 655);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.ok((await page.locator('.hero-content .eyebrow').boundingBox()).y >= panel.y + panel.height + 12, 'The expanded panel leaves the mobile introduction readable');
      await capture(page, 'progress-mobile');
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      await checkPosition(page, true);
      const underMenu = await page.locator('.progress-panel').boundingBox();
      assert.ok(underMenu.y + underMenu.height <= 655);
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      await checkPosition(page);
      await page.setViewportSize({ width: 1440, height: 1000 });
      await checkPosition(page);
    });

    await t.test('keeps every game reachable on a short landscape screen', async t => {
      const games = Array.from({ length: 8 }, (_, index) => makeFixtureGame(index, index % 5 + 1));
      const page = await visit(t, { viewport: { width: 667, height: 375 }, games });
      const panel = await page.locator('.progress-panel').boundingBox();
      assert.ok(panel.y + panel.height <= 363);
      assert.equal(await page.locator('#game-progress-content').evaluate(content => content.scrollHeight > content.clientHeight), true);
      const lastGame = page.locator('.progress-panel-game').last().getByRole('link');
      await lastGame.focus();
      assert.equal(await lastGame.evaluate(link => {
        const rect = link.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= innerHeight;
      }), true);
      await page.getByRole('button', { name: 'Collapse game progress' }).click();
      assert.equal(await page.locator('#game-progress-content').isVisible(), false);
    });

    await t.test('synchronizes an existing inline meter from supplied fixture data', async t => {
      // These IDs target the existing HTML fallback, independently of which
      // games or categories are present in the published configuration.
      const games = [{
        id: 'runefall', name: 'Inline fixture', updated: '2026-01-01',
        meters: [
          { id: 'core', label: 'Changed milestone', value: 62 },
          { id: 'extra', label: 'An additional category', value: 17 },
        ],
      }];
      const page = await visit(t, { games });
      assert.equal(await page.locator('#progress-core').getAttribute('value'), '62');
      assert.equal(await page.locator('label[for="progress-core"]').textContent(), 'Changed milestone');
    });

    await t.test('is available on the press and error pages and under a GitHub project path', async t => {
      for (const url of ['/press/', '/404.html', '/corebreachio-site/press/']) {
        const page = await visit(t, { url });
        await checkPosition(page);
      }
    });
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
});
