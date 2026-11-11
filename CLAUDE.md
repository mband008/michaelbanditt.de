# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The active **Astro** project for michaelbanditt.de — a German one-page-per-route personal
website for Michael Banditt, positioned as a **trainer profile**: trainer for adult education
with a focus on IT support, plus training templates ("Trainingsvorlagen") for support teams.
Process optimization stays visible as experience only, not as a separate service offer.
Routes: Home (`/`, with the `#trainingsvorlagen` section), Über mich (`/ueber-mich`),
Kontakt (`/kontakt`), Impressum (`/impressum`), Datenschutz (`/datenschutz`). This is the
deployment target (`site: https://michaelbanditt.de`). Coolify auto-deploys every push to
`main`, so a merge goes live immediately.

**This directory is the git root.** The parent `persönliche Website/` folder is *not* under
version control — it holds an earlier hand-written standalone-HTML prototype (`index.html`,
`ueber-mich.html`, `kontakt.html` + `css/` + `images/`) that this Astro project was migrated
from, plus the long-form content source docs (`Persoenliches_Profil_Michael_Banditt.md`,
`Mein_Ansatz.md`) and the parent `CLAUDE.md`. Those legacy files share content and CSS class
names with this project but are dead and are **not** kept in sync. The profile `.md` docs one
level up are outdated on experience figures and the certificate; the binding public facts live
in the planning folder (`~/AI-Dev-Team/Side-Hustle/projects/support-trainings/PROJECT.md`).

## Content rules

- Public facts: 20 years of customer support, over 12 years of process optimization,
  certificate "Train the Trainer (TÜV®)" issued by TÜV NORD CERT GmbH, shown as
  "seit September 2026". Never publish the certificate number or date of birth.
- No TÜV logo or test mark, and nothing implying the training materials were reviewed by
  TÜV ("TÜV-geprüft", "geprüft von TÜV", "TÜV-zertifizierte Unterlagen", "zertifizierter Kurs").
  The about page states that the certificate is a personal qualification.
- No prices, buy buttons or `Product`/`Offer` structured data on this site; selling happens
  on the product landing pages (subdomains).
- Product cards come from `src/data/trainingsvorlagen.ts`. `landingOeffentlich: false` shows
  the "Vorschau" badge without a link; `true` renders exactly one link to the product page.

## Commands

```bash
npm ci               # install exact versions from the lockfile; requires Node >= 22.23.4 (.nvmrc: 24)
npm run dev          # dev server at localhost:4321
npm run build        # production build to ./dist/ (gitignored)
npm run preview      # serve the built ./dist/ locally
npm run check        # astro check: TypeScript / Astro diagnostics
npm test             # checks the built ./dist/ (run after build): scripts/pruefen.mjs (pages, sitemap, spacing, content rules below)
                     # and scripts/pruefen-browser.mjs (no horizontal overflow at 320/360/390/1280 px; needs Chrome, skipped without)
```

Astro 7. Dependencies are pinned to exact versions (`.npmrc`: `save-exact=true`).
There is no linter or formatter.

`compressHTML` in Astro 7 drops the line break between text and a following inline element
(`Label:</span>` + newline + `<a>` renders without a space). Put `{" "}` at the end of the line
where a space is needed; `npm test` flags such spots.

## Architecture

- **Pages** (`src/pages/*.astro`) are routes. Each imports `BaseLayout`, `Header`, and
  `Footer`, and sets three frontmatter consts passed into the layout: `title`, `description`,
  and `pageStyle` (e.g. `pageStyle = "home-page.css"`).
- **`src/layouts/BaseLayout.astro`** owns the `<head>` and `<body><slot/></body>`. It always
  links the global `/styles/style.css`, then conditionally links the per-page stylesheet named
  by the `pageStyle` prop.
- **`src/components/Header.astro`** takes an `active` prop (`'home' | 'about' | 'contact'`) to
  mark the current nav link; "Trainingsvorlagen" links to the `/#trainingsvorlagen` anchor and
  has no active state. `Footer.astro` is static.
- **`src/data/trainingsvorlagen.ts`** holds the product card data for the home page.
- **Web analytics:** self-hosted Umami at `https://statistik.michaelbanditt.de`, configured in
  `src/data/statistik.ts` and rendered by `BaseLayout.astro` in production builds only. Set
  `aktiv: false` there to remove the tracker from every page. Click events use
  `data-umami-event` attributes only (`kontakt-email`, `kontakt-linkedin`,
  `trainingsvorlagen-produktseite`); no other external script may be added. When the tracker
  changes, update section 4 of `src/pages/datenschutz.astro`.
- **CSS is global, not scoped.** Astro components contain no `<style>` blocks. All styling lives
  as plain stylesheets in `public/styles/` (`style.css` + `home-page.css`, `about-page.css`,
  `contact-page.css`, `legal-page.css`) loaded via `<link>`. A class added in a component **must** have a matching
  rule in the relevant `public/styles/*.css` file — there is no component-local CSS.
- Static assets (images, favicons, `site.webmanifest`, stylesheets) live in `public/` and are
  served from the site root.

## Linking & asset paths — be consistent

Components/layout use absolute paths (`href="/ueber-mich"`, `src="/images/..."`,
`/styles/...`). Some page-body markup still uses **relative** paths without a leading slash
(`href="kontakt"`, `src="images/..."`). When editing, prefer the absolute form to match the
layout/header and avoid route-relative breakage.

## Styling system

CSS variables in `:root` (in `public/styles/style.css`):
- `--primary-color` / `--dark-color`: `#0F0F0F` (deep black)
- `--secondary-color`: `#6E6E6E` (gray)
- `--accent-color` / `--highlight-color`: `#C8A14D` (gold) — links, hover, interactive accents
- `--light-color`: `#D9D9D9` (silver, page background)
- plus `--border-radius` (8px), `--box-shadow`, `--transition`

Conventions: descriptive kebab-case class names; page-specific classes carry the page in the
name (`.home-hero-modern`, `.contact-card`); CSS Grid card layouts; mobile-first responsive.

## Notes & gotchas

- `dist/` is build output and **gitignored** — never edit by hand; regenerate with `npm run build`.
- `README.md` is the unmodified Astro starter-kit boilerplate — ignore it.
- `Task.md` and `js/` (empty) are scaffolding leftovers.
