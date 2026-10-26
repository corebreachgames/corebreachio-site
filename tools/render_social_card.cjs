/* Render the code-native sharing layout; requires Node 20+ and Playwright. */
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.COREBREACH_PLAYWRIGHT || 'playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.COREBREACH_CHROMIUM ? { executablePath: process.env.COREBREACH_CHROMIUM } : {}),
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(path.join(__dirname, 'social-card.html')).href);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(image => image.decode()));
    });
    await page.screenshot({ path: path.join(__dirname, '../assets/images/social-card.jpg'), type: 'jpeg', quality: 93 });
    console.log('Prepared 1200 × 630 sharing image.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
