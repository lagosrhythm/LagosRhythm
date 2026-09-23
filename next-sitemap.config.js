/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.lagosrhythm.com',
  generateRobotsTxt: false,
  exclude: [
    '/auth/*',
    '/profile/*',
    '/reset-password/*',
    '/event-admin/*',
    '/api/*',
  ],
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
}
