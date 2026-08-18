import { NextRequest, NextResponse } from "next/server"

// Detects the visitor's country from their IP so we can price the
// exclusive tour form without requiring anyone to sign in.
export async function GET(request: NextRequest) {
  try {
    // Vercel's edge network stamps this header on every request in production.
    const vercelCountryCode = request.headers.get("x-vercel-ip-country")
    if (vercelCountryCode) {
      return NextResponse.json({
        countryCode: vercelCountryCode,
        isNigeria: vercelCountryCode === "NG",
      })
    }

    // Fallback for local dev / non-Vercel hosting. No API key required.
    const forwardedFor = request.headers.get("x-forwarded-for")
    const ip = forwardedFor?.split(",")[0]?.trim()
    const lookupUrl = ip ? `https://ipwho.is/${ip}` : "https://ipwho.is/"

    const res = await fetch(lookupUrl)
    if (!res.ok) {
      throw new Error(`Geo lookup failed: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()
    if (data.success === false) {
      throw new Error(`Geo lookup unsuccessful: ${data.message ?? "unknown reason"}`)
    }

    const countryCode: string | null = data.country_code ?? null

    return NextResponse.json({ countryCode, isNigeria: countryCode === "NG" })
  } catch (err) {
    console.error("Error in /api/geo:", err)
    // Default to non-Nigeria pricing when detection fails.
    return NextResponse.json({ countryCode: null, isNigeria: false })
  }
}
