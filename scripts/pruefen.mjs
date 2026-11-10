import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = join(import.meta.dirname, '..', 'dist');
const SITE = 'https://michaelbanditt.de';
const SEITEN = ['/', '/ueber-mich/', '/kontakt/', '/impressum/', '/datenschutz/'];

const datei = (seite) => join(DIST, seite, 'index.html');
const LANDING = 'firmenhandys.michaelbanditt.de';
const LANDING_URL = 'https://firmenhandys.michaelbanditt.de/';
const TELEFON = '+49 340 87117800';
const TELEFON_LINK = 'tel:+4934087117800';
const ALTE_NUMMER = '15778633668';
const TRACKER_SRC = 'https://statistik.michaelbanditt.de/script.js';
const WEBSITE_ID = 'a0d027f6-39fd-4d53-9fef-5382814c5ba6';

function textdateien(dir = DIST) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return textdateien(p);
    return /\.(html|xml|txt|json|webmanifest|css|js)$/.test(e.name) ? [p] : [];
  });
}

function distInhalte() {
  return Object.fromEntries(textdateien().map((p) => [relative(DIST, p), readFileSync(p, 'utf8')]));
}

export function landingOeffentlich(quelltext) {
  const m = quelltext.match(/landingOeffentlich:\s*(true|false)/);
  if (!m) throw new Error('landingOeffentlich nicht gefunden');
  return m[1] === 'true';
}

const sichtbar = (html) =>
  html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, ' ');

const treffer = (inhalte, muster) =>
  Object.entries(inhalte).flatMap(([pfad, text]) =>
    [...text.matchAll(muster)].map((m) => `${pfad}: ${text.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30)}`),
  );

export function platzhalter(inhalte) {
  return treffer(inhalte, /\[\[/g);
}

export function verboteneWendungen(inhalte) {
  return treffer(
    inhalte,
    /TÜV[-\s]geprüft|geprüft\s+(?:von|durch)\s+(?:dem\s+|den\s+)?TÜV|TÜV[-\s]zertifizierte\s+Unterlagen|zertifizierte[rn]?\s+Kurs/gi,
  );
}

const MONATE = 'Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember';

// Certificate number and date of birth must never be published. Their values are not known
// to this repo, so the check rejects their shapes: exact day dates, number labels, long digit runs.
export function persoenlicheDaten(inhalte) {
  const html = Object.fromEntries(Object.entries(inhalte).filter(([p]) => p.endsWith('.html')));
  const text = Object.fromEntries(Object.entries(html).map(([p, h]) => [p, sichtbar(h).replaceAll(TELEFON, ' ')]));
  return [
    ...treffer(html, /\b\d{1,2}\.\s?\d{1,2}\.\s?\d{4}\b/g),
    ...treffer(html, new RegExp(`\\b\\d{1,2}\\.\\s?(?:${MONATE})\\s+\\d{4}`, 'g')),
    ...treffer(html, /\b\d{4}-\d{2}-\d{2}\b/g),
    ...treffer(html, /geboren|Geburtsdatum|Zertifikats?[-\s]?(?:nummer|nr)|Registriernummer|Reg\.-Nr/gi),
    ...treffer(text, /(?<![A-Z\d])\d{6,}/g),
  ];
}

const ziffern = (text) => text.replace(/\D/g, '');

export function seitenMitTelefon(inhalte) {
  return Object.keys(inhalte).filter((p) => ziffern(inhalte[p]).includes('87117800')).sort();
}

export function alteNummer(inhalte) {
  return Object.keys(inhalte).filter((p) => ziffern(inhalte[p]).includes(ALTE_NUMMER));
}

export function alteErfahrungsangaben(inhalte) {
  return treffer(inhalte, /12\+\s*Jahre Erfahrung in Service|rund 12 Jahre Praxis/g);
}

export function landingLinks(inhalte) {
  return treffer(inhalte, new RegExp(LANDING.replaceAll('.', '\\.'), 'g'));
}

export function verkaufselemente(inhalte) {
  return [
    ...treffer(inhalte, /\d+(?:[.,]\d{2})?\s?(?:EUR|€)|(?:EUR|€)\s?\d/g),
    ...treffer(inhalte, /\bkaufen\b|Warenkorb|Checkout|Bestellen|digistore/gi),
    ...treffer(inhalte, /"@type"\s*:\s*"(?:Offer|AggregateOffer|Product)"/g),
  ];
}

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

const ZAHLWORT = '\\d+|eine[nmr]?|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf|vierzehn|dreißig|neunzig';

export function logAngabenFehler(html) {
  const text = sichtbar(html).replace(/\s+/g, ' ');
  const fehler = [];
  if (!/gekürzte IP-Adresse/.test(text)) fehler.push('gekürzte IP-Adresse fehlt');
  if (!/automatisch überschrieben/.test(text)) fehler.push('Überschreiben fehlt');
  if (!/bei jeder Aktualisierung der Website[^.]*gelöscht/.test(text)) fehler.push('Löschen bei Aktualisierung fehlt');
  if (/anonymisierte bzw\. gekürzte/.test(text)) fehler.push('alte Formulierung');
  const frist = text.match(new RegExp(`\\b(?:${ZAHLWORT})\\s+(?:Kalender)?(?:Tag(?:e|en)?|Wochen?|Monat(?:e|en)?)\\b`, 'i'));
  if (frist) fehler.push(`feste Frist: ${frist[0]}`);
  return fehler;
}

export function abschnitt(html, ueberschrift) {
  const start = html.indexOf(ueberschrift);
  if (start < 0) throw new Error(`Abschnitt ${ueberschrift} fehlt`);
  const ende = html.indexOf('<h2', start + ueberschrift.length);
  return html.slice(start, ende < 0 ? undefined : ende);
}

export function trackerFehler(html) {
  const fehler = [];
  const tags = [...html.matchAll(/<script\b[^>]*>/g)].map((m) => m[0]);
  const tracker = tags.filter((t) => t.includes(`src="${TRACKER_SRC}"`));
  if (tracker.length !== 1) fehler.push(`${tracker.length} Tracker-Skripte`);
  else {
    for (const a of [`data-website-id="${WEBSITE_ID}"`, 'data-domains="michaelbanditt.de"', 'data-do-not-track="true"', ' defer']) {
      if (!tracker[0].includes(a)) fehler.push(`Tracker ohne ${a.trim()}`);
    }
  }
  for (const t of tags) {
    const src = t.match(/\bsrc="([^"]+)"/)?.[1];
    if (src && src !== TRACKER_SRC && /^(https?:)?\/\//i.test(src)) fehler.push(`fremde Skriptquelle: ${src}`);
  }
  return fehler;
}

const SOLL_EREIGNIS = (href) =>
  href.startsWith('mailto:') ? 'kontakt-email'
    : /^https:\/\/(www\.)?linkedin\.com\//.test(href) ? 'kontakt-linkedin'
      : href === LANDING_URL ? 'trainingsvorlagen-produktseite'
        : null;

export function linksOhneEreignis(html) {
  return [...html.matchAll(/<a\b[^>]*>/g)].map((m) => m[0]).filter((a) => {
    const soll = SOLL_EREIGNIS(a.match(/\bhref="([^"]*)"/)?.[1] ?? '');
    return soll && !a.includes(`data-umami-event="${soll}"`);
  });
}

const ereignisse = (html) => [...html.matchAll(/data-umami-event="([^"]+)"/g)].map((m) => m[1]);

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

test('kein Platzhalter [[ im Build', () => {
  assert.deepEqual(platzhalter(distInhalte()), []);
});

test('Platzhalter-Prüfung erkennt Fehler (Negativprobe)', () => {
  assert.equal(platzhalter({ 'x.html': '<p>[[Zertifikatstitel laut Urkunde]]</p>' }).length, 1);
});

test('keine verbotenen TÜV-Wendungen', () => {
  assert.deepEqual(verboteneWendungen(distInhalte()), []);
});

test('TÜV-Prüfung erkennt Fehler (Negativprobe)', () => {
  for (const t of ['TÜV-geprüft', 'tüv geprüft', 'geprüft von TÜV NORD', 'geprüft durch den TÜV', 'TÜV-zertifizierte Unterlagen', 'ein zertifizierter Kurs']) {
    assert.equal(verboteneWendungen({ 'x.html': `<p>${t}</p>` }).length, 1, t);
  }
  assert.deepEqual(verboteneWendungen({ 'x.html': '<p>Train the Trainer (TÜV®); nicht von TÜV NORD oder anderen Dritten geprüft.</p>' }), []);
});

test('keine Zertifikatsnummer, kein Geburtsdatum, keine Tagesdaten', () => {
  assert.deepEqual(persoenlicheDaten(distInhalte()), []);
});

test('Prüfung persönlicher Daten erkennt Fehler (Negativprobe)', () => {
  for (const t of ['geboren am 1.2.1986', 'seit 03.09.2026', 'seit 3. September 2026', '"dateCreated":"2026-09-03"', 'Zertifikatsnummer: X', 'Zertifikat-Nr. 4711', 'Nr. 44123456']) {
    assert.ok(persoenlicheDaten({ 'x.html': `<body><p>${t}</p></body>` }).length >= 1, t);
  }
  assert.deepEqual(persoenlicheDaten({ 'x.html': '<body><p>seit September 2026, 06844 Dessau, USt-IdNr. DE123456789</p><script>{"dateCreated":"2026-09"}</script></body>' }), []);
});

test('keine alten Erfahrungsangaben', () => {
  assert.deepEqual(alteErfahrungsangaben(distInhalte()), []);
});

test('Erfahrungs-Prüfung erkennt Fehler (Negativprobe)', () => {
  assert.equal(alteErfahrungsangaben({ 'x.html': '<p>12+ Jahre Erfahrung in Service-, Support- und Prozessumfeldern</p>' }).length, 1);
  assert.equal(alteErfahrungsangaben({ 'x.html': '<p>rund 12 Jahre Praxis in Service</p>' }).length, 1);
  assert.deepEqual(alteErfahrungsangaben({ 'x.html': '<p>12+</p><p>Jahre in der Prozessoptimierung</p>' }), []);
});

test('Produktkarte: Link auf die Landingpage passt zu landingOeffentlich', () => {
  const oeffentlich = landingOeffentlich(readFileSync(join(import.meta.dirname, '..', 'src', 'data', 'trainingsvorlagen.ts'), 'utf8'));
  const inhalte = distInhalte();
  const links = landingLinks(inhalte);
  const start = inhalte['index.html'];
  if (oeffentlich) {
    assert.equal(links.length, 1, links.join('\n'));
    assert.equal(start.split(`href="${LANDING_URL}"`).length - 1, 1);
    assert.ok(!start.includes('home-product-status'));
  } else {
    assert.deepEqual(links, []);
    assert.ok(start.includes('class="home-product-status"'));
    assert.ok(start.includes('Die Produktseite wird in Kürze veröffentlicht.'));
  }
});

test('Landingpage-Prüfung erkennt Fehler (Negativprobe)', () => {
  assert.equal(landingOeffentlich('landingOeffentlich: false,'), false);
  assert.equal(landingOeffentlich('landingOeffentlich:true'), true);
  assert.throws(() => landingOeffentlich('nichts'));
  assert.equal(landingLinks({ 'index.html': `<a href="${LANDING_URL}">Zur Produktseite</a>` }).length, 1);
  assert.equal(landingLinks({ 'sitemap-0.xml': '<loc>https://firmenhandys.michaelbanditt.de/</loc>' }).length, 1);
});

test('keine Preise, Kaufbuttons oder Offer-Daten', () => {
  assert.deepEqual(verkaufselemente(distInhalte()), []);
});

test('Verkaufs-Prüfung erkennt Fehler (Negativprobe)', () => {
  for (const t of ['149 EUR', '149,00 €', '€ 49', 'Jetzt kaufen', 'In den Warenkorb', 'zum Checkout', 'checkout.digistore24.com', '{"@type":"Offer"}', '{"@type": "Product"}']) {
    assert.equal(verkaufselemente({ 'x.html': `<p>${t}</p>` }).length >= 1, true, t);
  }
  assert.deepEqual(verkaufselemente({ 'x.html': '<p>Fragen zu einem gekauften Paket</p>' }), []);
});

test('Telefonnummer nur im Impressum, mit tel:-Link, alte Mobilnummer nirgends', () => {
  const inhalte = distInhalte();
  const impressum = inhalte['impressum/index.html'];
  assert.ok(sichtbar(impressum).replace(/\s+/g, ' ').includes(`Telefon: ${TELEFON}`));
  assert.equal(impressum.split(`href="${TELEFON_LINK}"`).length - 1, 1);
  assert.deepEqual(seitenMitTelefon(inhalte), ['impressum/index.html']);
  assert.deepEqual(alteNummer(inhalte), []);
});

test('Datenschutz: Server-Logs mit gekürzter IP, Überschreiben/Löschen, keine feste Tagesfrist', () => {
  const html = readFileSync(datei('/datenschutz/'), 'utf8');
  assert.deepEqual(logAngabenFehler(abschnitt(html, '3. Hosting und Server-Logfiles')), []);
  assert.match(sichtbar(html), /Stand: November 2026/);
});

test('Log-Prüfung erkennt Fehler (Negativprobe)', () => {
  const gut = '<p>gekürzte IP-Adresse</p><p>werden automatisch überschrieben. Spätestens bei jeder Aktualisierung der Website (Neuinstallation) werden die Protokolle gelöscht.</p>';
  assert.deepEqual(logAngabenFehler(gut), []);
  assert.deepEqual(logAngabenFehler(`${gut}<p>in der Regel wenige Wochen</p>`), []);
  for (const t of ['nach 7 Tagen gelöscht', 'für sieben Tage gespeichert', 'nach 14 Kalendertagen', 'höchstens vier Wochen', 'nach einem Monat', 'nach einem Tag', 'drei Monate lang']) {
    assert.equal(logAngabenFehler(`${gut}<p>${t}</p>`).length, 1, t);
  }
  assert.equal(logAngabenFehler('<p>anonymisierte bzw. gekürzte IP-Adresse</p>').length, 3);
  assert.equal(logAngabenFehler('<p>IP-Adresse des Geräts</p>').length, 3);
});

test('Telefon-Prüfung erkennt Fehler (Negativprobe)', () => {
  assert.deepEqual(seitenMitTelefon({ 'kontakt/index.html': `<p>${TELEFON}</p>`, 'index.html': '<p>x</p>' }), ['kontakt/index.html']);
  assert.deepEqual(seitenMitTelefon({ 'index.html': `<script>{"telephone":"+4934087117800"}</script>` }), ['index.html']);
  assert.deepEqual(alteNummer({ 'x.html': '<p>0157 78633668</p>' }), ['x.html']);
  assert.deepEqual(alteNummer({ 'x.html': '<a href="tel:+4915778633668">x</a>' }), ['x.html']);
  assert.ok(persoenlicheDaten({ 'x.html': `<body><p>${TELEFON}</p></body>` }).length === 0);
  assert.ok(persoenlicheDaten({ 'x.html': '<body><p>+49 340 99999999</p></body>' }).length >= 1);
});

test('Umami-Tracker auf allen fünf Seiten: genau einmal, richtige ID, keine andere externe Skriptquelle', () => {
  for (const s of SEITEN) assert.deepEqual(trackerFehler(readFileSync(datei(s), 'utf8')), [], s);
});

test('Tracker-Prüfung erkennt Fehler (Negativprobe)', () => {
  const gut = `<script defer src="${TRACKER_SRC}" data-website-id="${WEBSITE_ID}" data-domains="michaelbanditt.de" data-do-not-track="true"></script>`;
  assert.deepEqual(trackerFehler(gut), []);
  assert.deepEqual(trackerFehler(`${gut}<script src="/_astro/x.js"></script>`), []);
  assert.equal(trackerFehler('<p>kein Skript</p>').length, 1);
  assert.equal(trackerFehler(gut + gut).length, 1);
  assert.equal(trackerFehler(gut.replace(WEBSITE_ID, 'e60d9ce5-6ee0-4bda-970e-5ece27f08880')).length, 1);
  assert.equal(trackerFehler(gut.replace(' data-do-not-track="true"', '')).length, 1);
  assert.equal(trackerFehler(`${gut}<script src="https://www.googletagmanager.com/gtag/js"></script>`).length, 1);
  assert.equal(trackerFehler(`${gut}<script src="//cdn.example.com/a.js"></script>`).length, 1);
});

test('Ereignisse: E-Mail-, LinkedIn- und Produktseiten-Links tragen data-umami-event', () => {
  const inhalte = distInhalte();
  for (const s of SEITEN) assert.deepEqual(linksOhneEreignis(readFileSync(datei(s), 'utf8')), [], s);
  const kontakt = ereignisse(inhalte['kontakt/index.html']);
  assert.ok(kontakt.includes('kontakt-email') && kontakt.includes('kontakt-linkedin'), kontakt.join(', '));
  const index = readFileSync(join(import.meta.dirname, '..', 'src', 'pages', 'index.astro'), 'utf8');
  assert.match(index, /<a href=\{firmenhandys\.url\}[^>]*data-umami-event="trainingsvorlagen-produktseite"/);
  if (landingOeffentlich(readFileSync(join(import.meta.dirname, '..', 'src', 'data', 'trainingsvorlagen.ts'), 'utf8'))) {
    assert.deepEqual(ereignisse(inhalte['index.html']).filter((e) => e === 'trainingsvorlagen-produktseite'), ['trainingsvorlagen-produktseite']);
  }
});

test('Ereignis-Prüfung erkennt Fehler (Negativprobe)', () => {
  assert.equal(linksOhneEreignis('<a href="mailto:hallo@michaelbanditt.de">x</a>').length, 1);
  assert.equal(linksOhneEreignis('<a data-umami-event="kontakt-linkedin" href="mailto:hallo@michaelbanditt.de">x</a>').length, 1);
  assert.equal(linksOhneEreignis('<a href="https://www.linkedin.com/in/michael-banditt/">x</a>').length, 1);
  assert.equal(linksOhneEreignis(`<a href="${LANDING_URL}">x</a>`).length, 1);
  assert.deepEqual(linksOhneEreignis('<a data-umami-event="kontakt-email" href="mailto:x@y.de">x</a><a href="/kontakt">k</a>'), []);
});

test('Datenschutz: Abschnitt „Webanalyse mit Umami“ vollständig, keine Aussage „kein Tracking“ mehr', () => {
  const html = readFileSync(datei('/datenschutz/'), 'utf8');
  const text = sichtbar(abschnitt(html, '4. Webanalyse mit Umami')).replace(/\s+/g, ' ');
  for (const t of [
    'statistik.michaelbanditt.de', 'Hetzner Online GmbH in Deutschland', 'nicht an Dritte weitergegeben',
    'keine Cookies', 'speichert keine IP-Adressen', 'Referrer-URL', 'Betriebssystem und Gerätetyp',
    'Bildschirmgröße und eingestellte Sprache', 'Land, Region und Stadt', 'E-Mail-Adressen, das LinkedIn-Profil',
    'Do Not Track', 'Art. 6 Abs. 1 lit. f DSGVO', '14 Monate gespeichert, danach werden sie automatisch gelöscht',
  ]) assert.ok(text.includes(t), t);
  const alles = sichtbar(html).replace(/\s+/g, ' ');
  assert.doesNotMatch(alles, /kein Tracking|keine Analyse-Werkzeuge|täglich/);
  assert.doesNotMatch(alles, /24 Monate/);
  assert.match(alles, /Für eine datensparsame Reichweitenmessung setze ich die selbst betriebene Software Umami ein \(siehe Abschnitt 4\)/);
  const nummern = [...html.matchAll(/<h2>(\d+)\./g)].map((m) => Number(m[1]));
  assert.deepEqual(nummern, nummern.map((_, i) => i + 1));
});
