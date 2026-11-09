import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(import.meta.dirname, '..', 'dist');
const SITE = 'https://michaelbanditt.de';
const SEITEN = ['/', '/ueber-mich/', '/kontakt/', '/impressum/', '/datenschutz/'];

const datei = (seite) => join(DIST, seite, 'index.html');

// Astro 7 (compressHTML 'jsx') drops the line break between text and a following inline element,
// so "Text\n<a>" renders as "Text<a>". The third pattern catches "Label:</span>\n<a>".
export function klebendeInlineElemente(html) {
  const body = html.slice(html.indexOf('<body'));
  const tag = '(?:a|strong|em|code|span|abbr|b|i|small|time)';
  return [
    ...body.matchAll(new RegExp(`[A-Za-zÄÖÜäöüß:,;]<${tag}\\b[^>]*>`, 'g')),
    ...body.matchAll(new RegExp(`[^\\s>]</${tag}>[A-Za-zÄÖÜäöüß(]`, 'g')),
    ...body.matchAll(new RegExp(`[:,;]</${tag}><${tag}\\b`, 'g')),
  ].map((m) => body.slice(Math.max(0, m.index - 30), m.index + m[0].length + 20));
}

test('dist/ ist gebaut', () => {
  assert.ok(existsSync(DIST), 'dist/ fehlt – zuerst "npm run build" ausführen');
});

test('die fünf Seiten existieren', () => {
  for (const s of SEITEN) assert.ok(existsSync(datei(s)), s);
});

test('Sitemap enthält genau die fünf Seiten', () => {
  const xml = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
  assert.deepEqual(urls, SEITEN.map((s) => SITE + s).sort());
});

test('Leerzeichen: kein Wort klebt an einem Link oder Inline-Element', () => {
  for (const s of SEITEN) assert.deepEqual(klebendeInlineElemente(readFileSync(datei(s), 'utf8')), [], s);
});

test('Leerzeichen-Prüfung erkennt Fehler (Negativprobe)', () => {
  assert.equal(klebendeInlineElemente('<body><p>gelten die<a href="/x">Link</a>.</p>').length, 1);
  assert.equal(klebendeInlineElemente('<body><p><strong>fett</strong>danach</p>').length, 1);
  assert.equal(klebendeInlineElemente('<body><p><span>Von mir umgesetzt:</span><a href="/x">x</a></p>').length, 1);
  assert.deepEqual(klebendeInlineElemente('<body><p><span>Von mir umgesetzt:</span> <a href="/x">x</a></p>'), []);
  assert.deepEqual(klebendeInlineElemente('<body><div><span>Eins</span><span>Zwei</span></div>'), []);
});
