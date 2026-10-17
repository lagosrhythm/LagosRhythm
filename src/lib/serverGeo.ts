import type { NextRequest } from "next/server"

// Server-side twin of /api/geo, so prices can be re-checked without trusting the browser.
export async function detectIsNigeria(request: NextRequest): Promise<boolean> {
  const vercelCountryCode = request.headers.get("x-vercel-ip-country")
  if (vercelCountryCode) return vercelCountryCode === "NG"

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    const res = await fetch(ip ? `https://ipwho.is/${ip}` : "https://ipwho.is/")
    if (!res.ok) return false
    const data = await res.json()
    return data.success !== false && data.country_code === "NG"
  } catch {
    return false
  }
}
