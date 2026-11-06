# Lagos Rhythm — Born From This Ground

A standalone, dependency-free static site for **Born From This Ground**, the
Lagos Rhythm anniversary publication (October 2026). Hand-written HTML/CSS/JS
implementing the design system in [`../DESIGN.md`](../DESIGN.md).

Editorial copy — the full eight-chapter essay by **Damola Olaleye**, edited by
**Deborah Ogunlolu** — lives verbatim in `index.html`. It is the publication;
the layout exists to serve it.

No build step, no framework, no CDN runtime — it deploys as-is.

---

## Layout

```
Anniversary/site/
├── index.html          the publication (hero → byline → 8 chapters → CTA → colophon)
├── 404.html            archive-styled not-found page
├── robots.txt
├── favicon.ico
├── vercel.json         zero-config static deploy + security/cache headers
├── package.json        scripts only, no dependencies
├── assets/
│   ├── css/styles.css  DESIGN.md tokens, responsive rules, print stylesheet
│   ├── js/main.js      progress bar, scroll-spy nav, copy-quote, print, reveal
│   └── img/            locally hosted, responsive (512/1024, hero 800/1600)
└── scripts/
    ├── verify.mjs      CI gate — asset refs, hot-links, placeholders, CLS, weight
    ├── lint.mjs        CSS brace balance, tag balance, dead anchors/ids
    └── sync-to-main.mjs publishes to /public/anniversary for the main app
```

## Commands

```bash
npm run anniversary:verify   # repo root — publication gate
npm run anniversary:sync     # repo root — copy into public/anniversary

# or from inside Anniversary/site:
npm run verify
npm run dev                  # local preview on :3000
npm run sync
```

---

## Deploying to Vercel

### Option A — dedicated subdomain (recommended)

The folder is a self-contained static project. In Vercel:

1. **New Project → Import** → point at this repo.
2. **Root Directory**: `Anniversary/site`
3. **Framework Preset**: *Other* (`"framework": null` is already set)
4. **Build & Output**: none required — Vercel serves the directory directly.
5. Attach e.g. `anniversary.lagosrhythm.com`, and add the domain in
   `vercel.json` or the dashboard as usual.

`cleanUrls: true` is enabled, so `/feature` style paths resolve without `.html`.

### Option B — sub-path on the main app (`/anniversary`)

Keeps the edition off the main blog roll but on the primary domain:

```bash
npm run anniversary:sync     # copies index.html + assets → public/anniversary
```

Then deploy the normal Next.js root. Because the page lives in `public/`, it is
served verbatim at `https://www.lagosrhythm.com/anniversary`.

> The sync script wipes `public/anniversary` first, so removed assets never
> linger. Re-run it after editing the publication.

---

## Design compliance

Tokens in `assets/css/styles.css` §1 are transcribed 1:1 from `DESIGN.md`.

| Concern | Source of truth | Notes |
|---|---|---|
| Primary | `#a73400` | Pixel-sampled from `screen.png` (the YAML `primary:` token). The prose's `#D9531E` is kept as `--terracotta` for hover/focus only. |
| Surfaces | `#fcf9f8` → `#e5e2e1` | Full Material-style ramp from `colors:` |
| Type | Newsreader + Hanken Grotesk | Google Fonts, `display=swap`, preconnected |
| Spacing | `--space-*`, `--margin`, `--gutter` | From `spacing:` block; mobile margin 20px, desktop 56px |
| Shape | `border-radius: 0` | Sharp editorial geometry throughout |
| Icons | inline SVG sprite | Replaces the Material Symbols webfont (one less render-blocking request) |

**Responsive behaviour** (verified at 360 / 390 / 430 / 768 / 1024 / 1440 / 1920):

| Width | Hero aspect | Chapters / plates | Prose | Masthead |
|---|---|---|---|---|
| < 768 | 16/9 | stacked, full-bleed figures | flush-left (justification stretches word-spacing too far on phones) | back-arrow + logo, short "Oct 2026" chip |
| 768–1199 | 16/9 | stacked, 16/9 figures | justified, 704px measure | full "Special Edition" chip |
| ≥ 1200 | 21/9 | stacked, 16/9 figures | justified, 704px measure | section nav (issue chip hidden to avoid crowding) |

The essay is a single column of eight chapters at every width; five chapters
open with a photographic plate, four pull quotes are copyable. No horizontal
overflow at any of the seven tested widths.

**Print**: both "Download PDF" buttons call `window.print()`; `@media print`
strips the masthead/progress bar, flattens shadows, forces single-column images
and prints external URLs after their links.

---

## Verification

```bash
npm run anniversary:verify
```

Gates on: every local asset resolves, no hot-linked or CDN-hosted imagery, no
Tailwind/framework CDN runtime, no placeholder copy, every `<img>` has
`width`/`height`/`alt` (CLS), required deploy files present, total weight
under 2.5 MB.

It also enforces the editorial copy itself: `REQUIRED_COPY` lists the strings
the publication cannot exist without (all eight chapter titles, both bylines,
"consent, credit, return", *oríkì*, …) and `FORBIDDEN_COPY` blocks superseded
drafts of the page. At least three pull quotes must remain copyable.

Current: **24 files, ~1.67 MB.**

`scripts/lint.mjs` additionally checks CSS brace balance, HTML tag balance,
dead `#anchors`, `data-nav` targets, and JS element ids.

---

## To-do before launch

- [ ] **`rel=canonical` + `og:url`** — omitted deliberately because the final
      domain (subdomain vs sub-path) isn't decided. Add to `<head>` once known:
      ```html
      <link rel="canonical" href="https://<final-host>/">
      <meta property="og:url" content="https://<final-host>/">
      ```
      `og:image`/`twitter:image` should then become absolute URLs too — they are
      currently relative and will resolve correctly on a subdomain but not for
      scrapers on a sub-path.
- [ ] Confirm the X handle `@LagosRhythm` and the LinkedIn company slug match
      the live accounts (all five social URLs were verified at build time).
- [ ] ~~Run `npm run anniversary:sync`~~ — done automatically by `npm run build`
      (and available standalone as `npm run anniversary:sync`). The output in
      `public/anniversary/` is a generated artifact and is git-ignored.
