export interface VerifiedPayment {
  /** true when Flutterwave confirmed the charge (or verification is not configured). */
  verified: boolean
  /** false when FLUTTERWAVE_SECRET_KEY is not configured, so nothing could be checked. */
  checked: boolean
  amount?: number
  currency?: string
  reason?: string
}

// Confirms with Flutterwave that a transaction really succeeded.
export async function verifyFlutterwaveTransaction(transactionId: string | number): Promise<VerifiedPayment> {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY
  if (!secret) {
    // Fail open so a missing env var can't swallow bookings for customers who already paid.
    console.error("FLUTTERWAVE_SECRET_KEY is not set - payments are NOT being verified")
    return { verified: true, checked: false }
  }

  const id = String(transactionId).trim()
  if (!/^\d{1,20}$/.test(id)) {
    return { verified: false, checked: true, reason: "Invalid transaction id" }
  }

  try {
    const res = await fetch(`https://api.flutterwave.com/v3/transactions/${id}/verify`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    })
    const body = await res.json()
    const data = body?.data

    if (!res.ok || body?.status !== "success" || data?.status !== "successful") {
      return { verified: false, checked: true, reason: "Payment was not successful" }
    }

    return { verified: true, checked: true, amount: Number(data.amount), currency: String(data.currency) }
  } catch (err) {
    console.error("Flutterwave verification error:", err)
    return { verified: false, checked: true, reason: "Could not verify payment" }
  }
}

// Fetches the USD -> currency rate server-side (same source as /api/rates).
export async function getUsdRate(currency: string): Promise<number | null> {
  const key = process.env.EXCHANGERATE_API_KEY
  if (!key) return null
  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${key}/latest/USD`, { next: { revalidate: 3600 } })
    const data = await res.json()
    const rate = data?.conversion_rates?.[currency]
    return typeof rate === "number" ? rate : null
  } catch {
    return null
  }
}

// Amount paid must cover the expected price (2% tolerance for rounding / rate drift).
export function coversPrice(paid: number, expected: number): boolean {
  return paid >= expected * 0.98
}
