import { NextRequest, NextResponse } from "next/server"

// Keeps the Mailbox Layer key on the server instead of shipping it to browsers.
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.trim()
  if (!email || email.length > 254) {
    return NextResponse.json({ error: "Query param 'email' is required." }, { status: 400 })
  }

  const key = process.env.MAILBOX_API_KEY ?? process.env.NEXT_PUBLIC_MAILBOX_API_KEY
  if (!key) {
    return NextResponse.json({ error: "Email validation is not configured." }, { status: 503 })
  }

  try {
    const res = await fetch(
      `https://apilayer.net/api/check?access_key=${encodeURIComponent(key)}&email=${encodeURIComponent(email)}&smtp=1&format=1`,
      { cache: "no-store" },
    )
    const data = await res.json()
    return NextResponse.json({
      valid: !!(data.smtp_check && data.format_valid && data.mx_found),
    })
  } catch (err) {
    console.error("Error in /api/validate-email:", err)
    return NextResponse.json({ error: "Validation failed." }, { status: 502 })
  }
}
