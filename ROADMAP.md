# Roadmap – michaelbanditt.de

Strukturierte Verbesserungs-Roadmap für die Astro-Website. Jeder Meilenstein ist
**eigenständig** umsetzbar (eigener Branch/Commit) und hat ein klares Ziel, eine
Aufgabenliste, eine „Definition of Done" (DoD) und eine grobe Aufwandsschätzung.

**Empfohlene Reihenfolge:** M1 → M2 → M3 → M4 → M5 → M6 → M7
(M1 & M2 zuerst — größter Effekt bzw. rechtliche Absicherung. Reihenfolge ist aber
nicht zwingend; Meilensteine sind weitgehend unabhängig.)

Legende Aufwand: 🟢 klein (<1 h) · 🟡 mittel (1–3 h) · 🔴 größer (>3 h)

---

## M1 — Bilder austauschen & optimieren 🟡 ✅ ERLEDIGT
**Ziel:** Die neuen professionellen Porträts ersetzen das alte Foto; alle Bilder sind
web-optimiert und verursachen keinen Layout-Shift.

**Ausgangslage:** Alle drei Seiten nutzten noch das alte, niedrig aufgelöste
`17883980_…_n.jpg`. Die neuen `Gemini_…`-PNGs waren ~8 MB groß (zu schwer fürs Web).

- [x] Porträts den Seiten zuordnen:
  - [x] Über-mich-Hero → `portrait-office.png` (Halbkörper, vormals `Gemini_…t11y…`)
  - [x] Startseite-Kurzprofil → `portrait-headshot.png` (Headshot, vormals `cropped_corporate.png`)
  - [x] Kontakt-Card → `portrait-headshot.png`
- [x] Auf `astro:assets` (`<Image />`) umgestellt → WebP, `quality=80`, korrekte
      `width`/`height` (kein CLS), `loading="eager"` (Hero-Bilder).
- [x] Porträts nach `src/assets/` verschoben (nur so greift die Optimierung); Quell-PNGs
      werden von Astro automatisch herunterskaliert. `portrait-closeup.png` als ungenutzte
      Alternative abgelegt (KI-„Sparkle"-Artefakt → nicht für sichtbare Slots).
- [x] Aussagekräftige `alt`-Texte vergeben.
- [x] Altes Foto `17883980_…_n.jpg` entfernt.

**Ergebnis:** Headshot 363 kB → 19 kB; Büro 7,8 MB → 37 kB. `astro check` 0 Fehler,
`npm run build` grün, Browser-Test (Desktop + Mobil) bestanden, ungenutztes 8,5-MB-Bild
nicht ausgeliefert.

> **Offen für M4/M5:** `2500-1600-max.jpg` (1,45 MB) wird noch ausgeliefert, hängt aber
> nur an totem CSS (`.hero`). Logo-Platzierung gehört zu M5, CSS-Aufräumen zu M4.

**DoD:** ✅ Kein genutztes Bild im `dist/` > ~200 KB; keine `<img>` ohne Dimensionen;
`npm run build` fehlerfrei.

---

## M2 — Rechtssicherheit: Impressum & Datenschutz 🟡 ✅ ERLEDIGT
**Ziel:** Pflichtseiten für eine deutsche (geschäftliche) Website vorhanden und verlinkt.

**Ausgangslage:** Nur Home / Über mich / Kontakt vorhanden — Impressum (§ 5 DDG) und
Datenschutzerklärung (DSGVO) fehlten vollständig, ebenso Footer-Links.

- [x] Seite `/impressum` (`src/pages/impressum.astro`) angelegt — § 5 DDG: Diensteanbieter,
      Kontakt, USt-IdNr., Verantwortlicher nach § 18 MStV, Verbraucherschlichtungs-Klausel,
      Haftung/Links/Urheberrecht. Ohne die zum 20.07.2025 abgeschaltete EU-OS-Plattform.
- [x] Seite `/datenschutz` (`src/pages/datenschutz.astro`) angelegt — DSGVO in 9 Abschnitten
      (Verantwortlicher, Hosting Hetzner/Falkenstein + AVV, Server-Logfiles, Kontaktaufnahme,
      externe Links, TLS, Betroffenenrechte, Aufsichtsbehörde Sachsen-Anhalt, Änderungen).
- [x] Echte Pflichtangaben per Interview eingesetzt (keine Platzhalter mehr).
- [x] Footer um Links zu Impressum & Datenschutz erweitert (+ Footer-CSS).
- [x] Datenschutztext an die tatsächliche Lage angepasst (kein Tracking/Cookies/Embeds,
      nur mailto + LinkedIn-Link). Neues `legal-page.css` für Langform-Typografie.
- [x] Rechtstexte neutral, restliche Website weiterhin „du".

**Ergebnis:** `astro check` 0 Fehler, Build erzeugt beide Routen, Footer-Links auf allen
5 Seiten verifiziert, Browser-Test (Desktop + Mobil) bestanden.

> **Hinweis:** Sorgfältige, aktuelle Vorlage — keine Rechtsberatung. Für geschäftliche
> Nutzung anwaltliche Prüfung empfohlen.

**DoD:** ✅ Beide Seiten erreichbar, aus dem Footer verlinkt, mobil sauber; keine
Platzhalter mehr.

---

## M3 — Bugfixes 🟢 ✅ ERLEDIGT
**Ziel:** Bekannte kleine Fehler beseitigt, Pfade konsistent.

- [x] **Aktiver Nav-Link Kontakt:** `kontakt.astro` `active="kontakt"` → `active="contact"`
      (passend zum dokumentierten Header-Prop). Im Browser bestätigt (Desktop + Mobil).
- [x] **Pfade vereinheitlicht:** 7 relative interne Links (`href="kontakt"`,
      `href="ueber-mich"`) auf absolute Form umgestellt. Relative `src="images/…"` gab es
      durch M1 nicht mehr.
- [x] **`width`/`height` an Bildern:** Header-Logo `height="auto"` (ungültig) →
      `height="48"` (Verhältnis 654×312, kein Layout-Shift). Porträts bereits via M1.
- [x] `npm run astro check` ohne Fehler; Build erzeugt alle Routen.

**DoD:** ✅ Aktiver Menüpunkt korrekt hervorgehoben; keine relativen Asset-/Routen-Pfade
mehr; `astro check` grün.

---

## M4 — CSS-Aufräumen 🟡
**Ziel:** Toter Code raus, gemeinsame Bausteine zentralisiert, schlankere Stylesheets.

**Ausgangslage:** `style.css` enthält überwiegend Regeln für das alte Layout
(`.hero`, `.about-hero`, `.skill-card`, `.experience-item`, `form`, `.approach-grid` …),
das die `*-modern`-Seiten nicht mehr nutzen. `contact-page.css` enthält ungenutzte
Formular-Styles. `.section-eyebrow`, `.secondary-button`, `.method-item`, `.proof-strip`
sind in allen drei Page-CSS-Dateien dupliziert.

- [ ] Ungenutzte Legacy-Regeln aus `style.css` entfernen.
- [ ] Ungenutzte Formular-Styles aus `contact-page.css` entfernen.
- [ ] Gemeinsame Bausteine in `style.css` zentralisieren, Duplikate in Page-CSS löschen.
- [ ] `public/styles/style_backup.css` löschen oder bewusst behalten (Entscheidung).
- [ ] Visuell auf allen drei Seiten gegenprüfen (Desktop + Mobil).

**DoD:** Keine sichtbaren Regressionen; spürbar kleinere CSS-Dateien; keine
doppelten Regel-Blöcke mehr.

---

## M5 — Typografie & Markenbild 🟡
**Ziel:** Hochwertigere, eigenständigere Anmutung passend zu Schwarz/Gold.

- [ ] Web-Schrift einbinden (z. B. Inter / Source Sans 3, optional Serifen-Headline)
      statt System-Stack `Segoe UI, Tahoma …` — selbst gehostet wegen DSGVO.
- [ ] Button-Kontrast prüfen/erhöhen (`.cta-button`: weiß auf Gold ist WCAG-grenzwertig)
      → dunkler Text auf Gold oder dunkleres Gold.
- [ ] Logo-Konsistenz: Header-Logo (`E`/`Ewhite.png`) vs. Wortmarke aus dem Mockup
      prüfen und vereinheitlichen.
- [ ] Dezente visuelle Tiefe ergänzen (z. B. Logo-Mockup als Hero-/Footer-Akzent).

**DoD:** Konsistente Schrift auf allen Seiten; Buttons erreichen AA-Kontrast;
Schrift wird lokal ausgeliefert (kein externer Font-CDN-Call).

---

## M6 — Inhaltliche Schärfung 🟡
**Ziel:** Weniger Abstraktion, mehr Glaubwürdigkeit und Konkretheit.

**Quelle der Wahrheit:** `Persoenliches_Profil_Michael_Banditt.md` und `Mein_Ansatz.md`
(eine Ebene über dem Repo).

- [ ] Pro beruflicher Station ein konkretes Mini-Ergebnis ergänzen (z. B. messbarer
      Effekt einer Prozessverbesserung).
- [ ] Du/Sie-Ansprache bewusst festlegen und durchgängig vereinheitlichen.
- [ ] Abstrakte Formulierungen durch greifbarere Beispiele ergänzen
      („Komplexität reduzieren" → was konkret?).
- [ ] Meta-Titel/-Descriptions auf Prägnanz & Keywords prüfen.

**DoD:** Jede Station hat mind. einen konkreten Beleg; einheitliche Ansprache;
Texte mit den Quell-Dokumenten abgeglichen.

---

## M7 — SEO, Performance & technische Politur 🟡
**Ziel:** Auffindbarkeit, Teilbarkeit und technische Sauberkeit.

- [ ] Open-Graph-/Twitter-Card-Meta-Tags im `BaseLayout` (Vorschaubild + Titel/Text).
- [ ] `sitemap.xml` & `robots.txt` (Astro-Sitemap-Integration).
- [ ] `lang`/Struktur prüfen, ggf. JSON-LD `Person`/`ProfessionalService` ergänzen.
- [ ] Favicon-/Webmanifest-Pfade verifizieren (liegen unter `/images/`).
- [ ] Finaler Lighthouse-Lauf (Performance / SEO / Best Practices / Accessibility).

**DoD:** Aussagekräftige Link-Vorschau beim Teilen; Sitemap erreichbar;
Lighthouse-Werte dokumentiert.

---

## Optionaler Ausbau (Backlog)
- Kontaktformular (Astro-Action / externer Form-Endpoint) statt nur mailto.
- Dark/Light-Anpassungen oder dezente Animationen (Scroll-Reveal).
- Mehrsprachigkeit (DE/EN), falls Zielgruppe international.
- Blog/Referenzen-Bereich für Praxisbeispiele.

---

### Statusübersicht
| # | Meilenstein | Aufwand | Status |
|---|-------------|---------|--------|
| M1 | Bilder austauschen & optimieren | 🟡 | ✅ erledigt |
| M2 | Impressum & Datenschutz | 🟡 | ✅ erledigt |
| M3 | Bugfixes | 🟢 | ✅ erledigt |
| M4 | CSS-Aufräumen | 🟡 | offen |
| M5 | Typografie & Markenbild | 🟡 | offen |
| M6 | Inhaltliche Schärfung | 🟡 | offen |
| M7 | SEO, Performance & Politur | 🟡 | offen |
