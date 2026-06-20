# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The active **Astro** project for michaelbanditt.de — a German one-page-per-route personal
website for Michael Banditt (process optimization, automation, change facilitation). Three
routes: Home (`/`), Über mich (`/ueber-mich`), Kontakt (`/kontakt`). This is the deployment
target (`site: https://michaelbanditt.de`).

**This directory is the git root.** The parent `persönliche Website/` folder is *not* under
version control — it holds an earlier hand-written standalone-HTML prototype (`index.html`,
`ueber-mich.html`, `kontakt.html` + `css/` + `images/`) that this Astro project was migrated
from, plus the long-form content source docs (`Persoenliches_Profil_Michael_Banditt.md`,
`Mein_Ansatz.md`) and the parent `CLAUDE.md`. Those legacy files share content and CSS class
names with this project but are dead and are **not** kept in sync. Treat the profile `.md`
docs one level up as the content source of truth when writing or revising page copy.

## Commands

```bash
npm install          # first-time setup; requires Node >= 22.12.0 (see .nvmrc)
npm run dev          # dev server at localhost:4321
npm run build        # production build to ./dist/ (gitignored)
npm run preview      # serve the built ./dist/ locally
npm run astro check  # TypeScript / Astro diagnostics — the closest thing to a lint/test
```

There is no test suite, linter, or formatter. Use `astro check` for validation.

## Architecture

- **Pages** (`src/pages/*.astro`) are routes. Each imports `BaseLayout`, `Header`, and
  `Footer`, and sets three frontmatter consts passed into the layout: `title`, `description`,
  and `pageStyle` (e.g. `pageStyle = "home-page.css"`).
- **`src/layouts/BaseLayout.astro`** owns the `<head>` and `<body><slot/></body>`. It always
  links the global `/styles/style.css`, then conditionally links the per-page stylesheet named
  by the `pageStyle` prop.
- **`src/components/Header.astro`** takes an `active` prop (`'home' | 'about' | 'contact'`) to
  mark the current nav link. `Footer.astro` is static.
- **CSS is global, not scoped.** Astro components contain no `<style>` blocks. All styling lives
  as plain stylesheets in `public/styles/` (`style.css` + `home-page.css`, `about-page.css`,
  `contact-page.css`) loaded via `<link>`. A class added in a component **must** have a matching
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
- `--secondary-color`: `#7A7A7A` (gray)
- `--accent-color` / `--highlight-color`: `#C8A14D` (gold) — links, hover, interactive accents
- `--light-color`: `#D9D9D9` (silver, page background)
- plus `--border-radius` (8px), `--box-shadow`, `--transition`

Conventions: descriptive kebab-case class names; page-specific classes carry the page in the
name (`.home-hero-modern`, `.contact-card`); CSS Grid card layouts; mobile-first responsive.

## Notes & gotchas

- `dist/` is build output and **gitignored** — never edit by hand; regenerate with `npm run build`.
- `public/styles/style_backup.css` is a backup, not loaded by any page.
- `README.md` is the unmodified Astro starter-kit boilerplate — ignore it.
- `Task.md` and `js/` (empty) are scaffolding leftovers.
