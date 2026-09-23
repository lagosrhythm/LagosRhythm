import { NextResponse } from 'next/server'

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /auth/
Disallow: /profile/
Disallow: /reset-password/
Disallow: /event-admin/
Disallow: /api/
Sitemap: https://www.lagosrhythm.com/sitemap.xml
`
  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
