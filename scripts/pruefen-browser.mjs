import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { existsSync, readdirSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, relative, sep } from 'node:path';

const DIST = join(import.meta.dirname, '..', 'dist');
const BREITEN = [320, 360, 390, 1280];

const TYPEN = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function seiten(dir = DIST) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return seiten(p);
    if (e.name !== 'index.html') return [];
    const ordner = relative(DIST, dir).split(sep).join('/');
    return [ordner ? `/${ordner}/` : '/'];
  });
}

async function starteServer(wurzel) {
  const server = createServer(async (req, res) => {
    let datei = join(wurzel, normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)));
    try {
      if ((await stat(datei)).isDirectory()) datei = join(datei, 'index.html');
      const inhalt = await readFile(datei);
      res.writeHead(200, { 'content-type': TYPEN[extname(datei)] ?? 'application/octet-stream' });
      res.end(inhalt);
    } catch {
      res.writeHead(404, { 'content-type': TYPEN['.txt'] });
      res.end('not found');
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { url: `http://127.0.0.1:${server.address().port}`, schliessen: () => new Promise((r) => server.close(r)) };
}

// Skipped where no Chrome or no playwright-core is installed (e.g. a production-only install);
// locally both must be present for the check to count.
let chromium, ohneBrowser;
try {
  ({ chromium } = await import('playwright-core'));
  const probe = await chromium.launch({ channel: 'chrome', headless: true });
  await probe.close();
} catch (e) {
  ohneBrowser = `kein Chrome/playwright-core: ${e.message.split('\n')[0]}`;
}

let server, browser;
before(async () => {
  if (ohneBrowser) return;
  server = await starteServer(DIST);
  browser = await chromium.launch({ channel: 'chrome', headless: true });
});
after(async () => {
  await browser?.close();
  await server?.schliessen();
});

test('Browser: alle Seiten aus dist/ gefunden', { skip: ohneBrowser }, () => {
  assert.ok(existsSync(DIST), 'dist/ fehlt – zuerst "npm run build" ausführen');
  assert.ok(seiten().length >= 5, seiten().join(', '));
});

for (const breite of BREITEN) {
  test(`Browser ${breite} px: kein horizontaler Überlauf auf allen Seiten`, { skip: ohneBrowser }, async () => {
    const context = await browser.newContext({ viewport: { width: breite, height: 900 } });
    // Only the local test server is reachable; the Umami tracker and anything else external is aborted.
    await context.route('**/*', (route) => (route.request().url().startsWith(server.url) ? route.continue() : route.abort()));
    const page = await context.newPage();
    const ueberlauf = [];
    for (const pfad of seiten()) {
      const antwort = await page.goto(server.url + pfad, { waitUntil: 'load' });
      assert.equal(antwort.status(), 200, pfad);
      await page.evaluate(() => document.fonts.ready);
      const breiteDok = await page.evaluate(() => document.documentElement.scrollWidth);
      const fenster = await page.evaluate(() => window.innerWidth);
      if (breiteDok > fenster) ueberlauf.push(`${pfad}: scrollWidth ${breiteDok} > ${fenster}`);
    }
    await context.close();
    assert.deepEqual(ueberlauf, []);
  });
}
