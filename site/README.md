# Converge Challenge — Site

Event website for **Converge Challenge**, the AI Agents hackathon powered by Tako
and organized by Ligia (CIn-UFPE) and TAIL (UFPB). Built with Vite + React.
Live at https://convergechallenge.cin.ufpe.br. The copy is in Portuguese (pt-BR).

## Run

```sh
cd site
npm install
npm run dev       # local dev server
npm run build     # production build in site/dist
npm run preview   # serve the build locally
```

## Editing content

- **Event facts** (dates, hours, venue, participants, application window), the **Luma links**
  and the **contact email** all live in [`src/config.js`](src/config.js).
  Every section reads from there.
- **SEO:** the `<head>` gets a schema.org `Event` (JSON-LD) built from `config.js`
  by a small plugin in `vite.config.js`. The public URL (`SITE_URL`) is repeated in
  `index.html` (canonical, `og:url`), `public/robots.txt` and `public/sitemap.xml`.
- **Schedule:** `DAYS` in `src/components/Schedule.jsx`.
- **FAQ:** `QUESTIONS` in `src/components/Faq.jsx`.
- **Sponsorship tiers** (benefits only, no prices): `TIERS` in
  `src/components/Sponsor.jsx`.
- **Partner logos** (blurbs too): `src/components/Logos.jsx`, in the tiers of the
  event's partner chart. The event logo with "powered by Tako" (Tako bought naming rights)
  must always show; organizers (Ligia, TAIL) whenever possible; partners
  (Canastra, Porto Digital, CIn-UFPE, CESAR) and supporters (AWS, Featherless) when there is room.
  `converge-logo.svg` is the official logo. Porto Digital, CESAR and Tako were cropped
  from the partner chart, CIn-UFPE comes from the CIn portal (recolored for dark
  backgrounds), TAIL's lockup (`tail.png`) was supplied separately and trimmed to its ink, and the other
  SVGs come from the old institutional deck's logo sprite.
- **Share image:** `public/og-image.jpg` (1200×630, used by `og:image`). Its source is
  [`scripts/og-image.html`](scripts/og-image.html); the render command is in that file.
  Regenerate it when the partners change.

## Structure

```
src/
  config.js            event facts, Luma URLs, contact, nav links
  App.jsx              section order
  styles/global.css    design tokens (navy / orange), type, buttons, reveal-on-scroll
  components/          one component + CSS file per section
  hooks/               in-view, reduced-motion, page-wide reveal/spotlight effects
  lib/ascii.js         static ASCII art backgrounds (#*+= motif from the deck)
public/                favicon, share image, robots.txt, sitemap.xml
scripts/og-image.html  source of the share image
scripts/tv-hands.py    builds the hands image for the TV display
tv/index.html          TV display page, served at /tv/
src/tv/                its scenes (scenes/), artwork (assets/), dotted mesh and dissolve
```

Fonts are self-hosted through Fontsource: **Geist** (body), **Geist Mono**
(headlines, labels) and **Instrument Serif** italic (accent words).

Animations (ASCII torus, text scramble, typing terminal, count-ups, countdown)
pause off screen and turn off for visitors with `prefers-reduced-motion`.

## TV display (`/tv/`)

A second page for the venue TVs during intervals: ASCII artwork in the style of
the campaign posts, one piece at a time in the centre of the screen, each
dissolving in (3.5 s), holding (25 s) and dissolving out, the next one already
dissolving in as the last one goes, over the faint dotted mesh. The pieces: the hands from Michelangelo's *Creation of Adam*, rings and
links, a twisting ribbon, a halftone sphere and the torus. No logos yet. Live at
https://convergechallenge.cin.ufpe.br/tv/ once merged (keep the trailing slash).

- Press **F** or double-click for fullscreen. The cursor hides after a few seconds
  and the page asks the browser to keep the screen awake.
- URL options (combine with `&`):
  - `?hold=25`: seconds each piece stays fully visible.
  - `?fade=3.5`: seconds each dissolve, in and out, takes.
  - `?pause=-1`: seconds between one piece fully gone and the next starting.
    Negative overlaps them (the default starts the next one a second early); use
    `0` or more for an empty beat between pieces.
  - `?scene=3`: start from a given piece.
  - `?captions=1`: show a small number + name caption (off by default).
  - `?at=20`: jump into the loop, handy for previews.
- Scenes live in `src/tv/scenes/`, one file each. The order and timing are at the
  top of `src/tv/main.js`.
- The hands come from the public-domain fresco (Wikimedia Commons scan, linked in
  [`scripts/tv-hands.py`](scripts/tv-hands.py)). That script crops the arms, masks out
  the plaster and writes `src/tv/assets/creation-hands.png` (brightness + mask),
  which the page turns into characters at any screen size.
- The page is `noindex` and not in the sitemap. It's a separate Vite entry
  (`build.rollupOptions.input` in `vite.config.js`) in plain JS and canvas, so the
  main site only shares the Geist Mono font with it.

## Deploy

Pushing to `main` runs [`.github/workflows/pages.yml`](../.github/workflows/pages.yml),
which builds this app and publishes it to GitHub Pages under `/site/`
(https://automlsummerschool.cin.ufpe.br/ligia-challenge/site/). The CIn proxy
serves that path at **https://convergechallenge.cin.ufpe.br**, so keep the site
under `/site/`. The Pages root only redirects to the official domain.

`vite.config.js` uses `base: './'`, so the same `dist/` also works on any
other host (Vercel, Netlify, a sub-path) without changes.
