# SEO Submission & Monitoring Guide

## Google Search Console

1. Go to https://search.google.com/search-console
2. Add property: Domain -> enter `lagosrhythm.com`
3. Verify via DNS TXT record or HTML file upload.
4. Submit sitemap:
   - Sitemaps -> Add new sitemap: `https://www.lagosrhythm.com/sitemap.xml`
   - Also submit `https://www.lagosrhythm.com/robots.txt`
5. Request indexing for key pages: Home, VirtualTour, InPersonTour, About, Blogs.
6. Check Coverage & Enhancements for errors.

## Bing Webmaster Tools
1. https://www.bing.com/webmasters
2. Add site, verify via meta tag.
3. Submit sitemap `sitemap.xml`.

## Core Web Vitals Monitoring
1. In GSC -> Core Web Vitals report.
2. Use PageSpeed Insights for key URLs.
3. Monitor LCP, INP, CLS.
4. Optimize images with Next.js Image, lazy load, preconnect fonts.
5. Keep TypeScript/ESLint errors ignored in build but fix performance issues.

## Ongoing
- Monthly ranking report
- Quarterly meta refresh
- Schema validation via Rich Results Test
