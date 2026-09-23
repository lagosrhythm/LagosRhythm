# Lagos Rhythm SEO Plan

## Executive Summary
Lagos Rhythm is a tourism-tech platform offering virtual and in-person Lagos tours, cultural storytelling, street transit guides, e-commerce, and content. Current SEO setup includes Next.js metadata at root, per-page metadata for 21 key pages, a dynamic `sitemap.ts`, and `next-sitemap` installed. Gaps remain around meta quality, robots.txt, schema markup consistency, XML sitemap completeness, and technical SEO hygiene.

## Current SEO Audit

### What exists
- Root metadata in `src/app/layout.tsx`:
  * title: "Lagos Rhythm", description: "Tourism Technology", generic.
  * keywords imported from `src/data/metadata.ts` (131 terms, mixed quality).
  * openGraph / Twitter set with favicon placeholder.
- Per-page metadata found for:
  - Home `/`, About, VirtualTour, InPersonTour, exclusive-tour-form, book_form, store, gallery, FAQ, blogs, Free_E-Rhythm, Exclusive_E-Rhythm, street-rhythm, Flights, feedback, Privacy_Policy, terms_and_conditions, profile, reset-password, auth, Inperson-Form
- Dynamic sitemap `src/app/sitemap.ts`:
  * Base URL `https://www.lagosrhythm.com`
  * 17 static pages + dynamic `/blogs/[id]` from Firestore
  * changeFrequency/priority set.
- `next-sitemap` 4.2.3 installed, not configured.
- No `robots.txt` found.
- Some pages already use JsonLd component, e.g., About page with AboutPage schema.
- Images use remote patterns for Cloudinary, Firebase Storage, Gravatar.
- `next.config.ts` ignores TypeScript/ESLint errors during build.

### Gaps
- Root title/description too generic; dilute brand message.
- Missing robots.txt & explicit sitemap reference.
- `next-sitemap` not configured → duplicate sitemap routes.
- Many pages lack OpenGraph images, Twitter cards, and structured data.
- Meta descriptions are <~155 chars on some pages, >160 on others; inconsistency.
- Keyword list is bloated and not mapped to pages; risks keyword stuffing.
- Canonical tags set per page but need verification for dynamic routes.
- Images lack descriptive alt text systematically.
- No schema for Product, Tour, BlogPosting, Organization, Breadcrumb.
- Core Web Vitals unknown; no image optimization audit.
- Auth/profile pages are indexed in sitemap (should be noindex).

## SEO Strategy & Keyword Mapping

### Core themes
1. Lagos virtual tours
2. In-person Lagos tours & travel
3. Cultural storytelling / nightlife / food / art
4. Street transit guide
5. Flights / booking
6. Store / merch
7. Blog / content hub

### Target keywords

| Page | Primary Keyword | Secondary Keywords |
|------|----------------|-------------------|
| / | Lagos virtual tours, Lagos cultural tours | Lagos travel experience, Nigeria tourism, Lagos Rhythm |
| /VirtualTour | virtual tours of Lagos | live Lagos city tour, free virtual Lagos tour, Lagos online cultural tour |
| /InPersonTour | in-person Lagos tours | guided Lagos city tour, Lagos heritage tour, book Lagos tour online |
| /exclusive-tour-form | book exclusive Lagos tour | private virtual tour Lagos, premium African experience |
| /Free_E-Rhythm | free Lagos virtual tour | free virtual tour Nigeria, online Lagos culture |
| /Exclusive_E-Rhythm | exclusive Lagos E-Rhythm | paid virtual tourism Nigeria, private Lagos experience |
| /street-rhythm | Lagos street transit guide | Lagos bus routes, Lagos commute guide |
| /gallery | Lagos culture gallery | Lagos photos, Lagos art & nightlife |
| /store | Lagos Rhythm store | African travel merch, Nigerian culture souvenirs |
| /blogs | Lagos travel blog | Nigerian culture articles, Lagos tourism insights |
| /about | about Lagos Rhythm | tourism tech startup Africa, Lagos Rhythm team |
| /FAQ | Lagos Rhythm FAQ | virtual tour questions, Lagos tour booking help |
| /Flights | flights from Lagos | book flights Africa, Lagos flight deals |

## Action Plan

### Phase 1 – Technical Foundation
1. Create `app/robots.txt/route.ts`:
   ```
   User-agent: *
   Allow: /
   Disallow: /auth/
   Disallow: /profile/
   Disallow: /reset-password/
   Disallow: /event-admin/
   Sitemap: https://www.lagosrhythm.com/sitemap.xml
   ```
2. Consolidate sitemap:
   - Keep `src/app/sitemap.ts` for dynamic blog pages.
   - Configure `next-sitemap` with custom sitemap generation, set priority/changeFrequency per page, exclude auth/profile.
   - Ensure sitemap URL is referenced in robots.txt and submitted to Google Search Console.

3. Root metadata upgrade:
   - Title: "Lagos Rhythm | Live the Vibe, Please the Mind – Virtual & In-Person Lagos Tours"
   - Description: 150‑155 chars describing core offering, tours, storytelling.
   - Improve OpenGraph image to branded hero image 1200x630.
   - Add `alternates.canonical` at root.

### Phase 2 – On-Page SEO
1. Rewrite title/description for key pages (examples):
   - Home: title "Lagos Rhythm — Live the Vibe, Please the Mind | Virtual & In-Person Lagos Tours"
   - VirtualTour: "Virtual Tours of Lagos | Live & Interactive Online Experiences"
   - InPersonTour: "In-Person Lagos Tours | Curated Travel Experiences in Nigeria"
   - About: "About Lagos Rhythm | Tourism Tech Startup Redefining Lagos Experiences"
2. Add unique H1 per page matching primary keyword.
3. Add meta robots: `index, follow` for public pages; `noindex, follow` for auth/profile.
4. Add structured data:
   - Organization schema site-wide.
   - WebSite + SearchAction.
   - Tour schema for VirtualTour/InPersonTour.
   - Product schema for store items.
   - BlogPosting for blogs.
   - BreadcrumbList.
5. Image optimization:
   - Ensure all images have descriptive alt text.
   - Use Next.js Image component where possible.

### Phase 3 – Content & Authority
1. Blog content calendar: 2 posts/week targeting long-tail keywords.
2. Internal linking: link blogs to tour pages, tours to booking forms.
3. Create XML sitemap entries for new pages and update `lastModified`.
4. Submit sitemap to Google Search Console & Bing Webmaster Tools.
5. Monitor Core Web Vitals, fix LCP/CLS/INP.

### Phase 4 – Continuous
1. Monthly keyword ranking report.
2. Quarterly meta refresh based on CTR.
3. Schema validation with Rich Results Test.
4. Backlink outreach to travel blogs, Nigerian tourism sites.

## XML Sitemap Details
Current dynamic sitemap covers:
- Home, street-rhythm, about, VirtualTour, InPersonTour, Free_E-Rhythm, Exclusive_E-Rhythm, blogs, gallery, FAQ, feedback, store, Flights, profile, auth, Privacy_Policy, terms_and_conditions, Live-stream
- Dynamic `/blogs/[id]` from Firestore.

Recommended additions:
- Add `changeFrequency` tuning: blogs weekly, tours monthly, store weekly.
- Remove `auth`, `profile`, `reset-password`, `event-admin` from sitemap.
- Ensure `lastModified` reflects actual content updates.

## Meta Titles & Descriptions Quick Sheet

| Page | Title (≤60 chars) | Description (150-160 chars) |
|------|-------------------|-----------------------------|
| Home | Lagos Rhythm – Virtual & In-Person Lagos Tours | Discover Lagos through immersive virtual tours, in-person travel experiences, and cultural storytelling. Book now. |
| VirtualTour | Virtual Tours of Lagos | Join live virtual tours of Lagos. Experience culture, streets, food, art & nightlife guided by locals in real time. |
| InPersonTour | In-Person Lagos Tours | Experience Lagos with curated journeys. Book guided cultural tours, heritage walks, food & nightlife adventures. |
| Exclusive E-Rhythm Booking | Book Exclusive Lagos Virtual Tour | Complete your private Lagos virtual tour booking. Choose group size, dates & theme for an exclusive experience. |
| About | About Lagos Rhythm | Tourism-tech startup redefining how the world experiences Lagos with authentic cultural storytelling and tours. |
| FAQ | Lagos Rhythm FAQ | Answers about virtual and in-person tours, booking, payments, and how Lagos Rhythm works. |
| Store | Lagos Rhythm Store | Shop African travel merch, Nigerian culture souvenirs & Lagos themed items. |

## Deliverables
1. `app/robots.txt/route.ts`
2. Updated `src/app/layout.tsx` metadata
3. Updated per-page metadata for top 15 pages
4. Configured `next-sitemap` with `next-sitemap.config.js`
5. Schema components for Organization, Tour, Product, BlogPosting
6. SEO audit document & keyword map

Next step: implement robots.txt, upgrade root metadata, and configure next-sitemap. Then iterate per-page metadata.
