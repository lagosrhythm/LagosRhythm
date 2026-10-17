import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/app/config/firebaseAdmin"
import { coversPrice, getUsdRate, verifyFlutterwaveTransaction } from "@/lib/flutterwave"
import { detectIsNigeria } from "@/lib/serverGeo"
import { getExclusiveTourPrice } from "@/lib/pricing"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface CleanTourist {
  fullName: string
  email: string
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")
const strList = (v: unknown, maxItems: number) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, maxItems) : []

// Exclusive E-Rhythm bookings are only recorded once Flutterwave confirms the payment.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const tourists: CleanTourist[] = (Array.isArray(body.tourists) ? body.tourists.slice(0, 20) : []).map(
      (t: { fullName?: unknown; email?: unknown }) => ({
        fullName: str(t?.fullName, 100),
        email: str(t?.email, 254).toLowerCase(),
      }),
    )
    if (tourists.length === 0 || tourists.some((t) => t.fullName.length < 2 || !EMAIL_RE.test(t.email))) {
      return NextResponse.json({ error: "Please provide valid tourist details." }, { status: 400 })
    }
    if (body.termsAgreement !== true) {
      return NextResponse.json({ error: "Terms must be accepted." }, { status: 400 })
    }

    const transactionId = String(body.transactionId ?? "").trim()
    const payment = await verifyFlutterwaveTransaction(transactionId)
    if (!payment.verified) {
      return NextResponse.json({ error: payment.reason ?? "Payment could not be verified." }, { status: 402 })
    }

    // Re-compute the price server-side and make sure enough was paid.
    let amountVerified = false
    if (payment.checked && payment.amount !== undefined && payment.currency) {
      const isNigeria = await detectIsNigeria(req)
      const { price, currency: expectedCurrency } = getExclusiveTourPrice(isNigeria, str(body.discountCode, 40))
      let expectedInPaidCurrency: number | null = null

      if (payment.currency === expectedCurrency) {
        expectedInPaidCurrency = price
      } else if (payment.currency === "NGN" || payment.currency === "USD") {
        const ngnPerUsd = await getUsdRate("NGN")
        if (ngnPerUsd) {
          expectedInPaidCurrency =
            payment.currency === "NGN" ? price * ngnPerUsd : price / ngnPerUsd
        }
      }

      if (expectedInPaidCurrency !== null) {
        if (!coversPrice(payment.amount, expectedInPaidCurrency)) {
          console.error("Underpayment", { transactionId, paid: payment.amount, expected: expectedInPaidCurrency })
          return NextResponse.json({ error: "Payment amount does not match the tour price." }, { status: 402 })
        }
        amountVerified = true
      }
    }

    const db = getDb()
    // The transaction id doubles as the document id, so one payment can only
    // ever produce one booking.
    const col = db.collection("exclusive_Tour_form")
    const ref = payment.checked ? col.doc(`tx-${transactionId}`) : col.doc()

    if (payment.checked && (await ref.get()).exists) {
      return NextResponse.json({ error: "This payment has already been used for a booking." }, { status: 409 })
    }

    await ref.set({
      tourist: tourists,
      country: str(body.country, 80) || "Other",
      reasonForJoin: strList(body.reasonForJoin, 10),
      OtherReason: str(body.OtherReason, 120),
      joiningAs: str(body.joiningAs, 50) || "Tourist",
      otherJoin: str(body.otherJoin, 80),
      tourDate: strList(body.tourDate, 10),
      termsAgreement: true,
      referralSource: str(body.referralSource, 80) || "Direct",
      subscribedAt: new Date(),
      time: str(body.time, 40),
      discountCode: str(body.discountCode, 40) || "NONE",
      paidPrice: payment.checked ? `${payment.currency} ${payment.amount}` : str(body.paidPrice, 40) || "unverified",
      populationSize: str(String(body.populationSize ?? "1"), 40),
      tourTheme: str(body.tourTheme, 80) || "Exclusive E-Rhythm",
      tourCompleted: false,
      transactionId,
      paymentVerified: payment.checked,
      amountVerified,
    })

    return NextResponse.json({ id: ref.id }, { status: 201 })
  } catch (err) {
    console.error("Error in /api/exclusive-booking:", err)
    return NextResponse.json({ error: "Booking failed. Please contact support if you were charged." }, { status: 500 })
  }
}
