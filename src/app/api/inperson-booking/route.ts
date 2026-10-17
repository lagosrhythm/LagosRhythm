import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/app/config/firebaseAdmin"
import { coversPrice, verifyFlutterwaveTransaction } from "@/lib/flutterwave"
import { themeJourneys } from "@/data/data"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")

function expectedPrice(theme: string, packageTitle: string, duration: string, paymentType: string): number | null {
  const journey = themeJourneys.find((t) => t.title === theme)
  if (!journey) return null
  const group =
    journey.minorPackages?.find((p) => p.title === packageTitle) ??
    journey.majorPackages?.find((p) => p.title === packageTitle)
  const option = group?.options.find((o) => o.duration === duration)
  if (!option) return null
  return paymentType === "Deposit (50%)" ? option.price / 2 : option.price
}

// In-person tour bookings are only recorded once Flutterwave confirms the payment.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const form = (body.form ?? {}) as Record<string, unknown>

    const emailAddress = str(form.emailAddress, 254).toLowerCase()
    if (str(form.fullName, 100).length < 2 || !EMAIL_RE.test(emailAddress)) {
      return NextResponse.json({ error: "Please provide valid contact details." }, { status: 400 })
    }

    const transactionId = String(body.transactionId ?? "").trim()
    const payment = await verifyFlutterwaveTransaction(transactionId)
    if (!payment.verified) {
      return NextResponse.json({ error: payment.reason ?? "Payment could not be verified." }, { status: 402 })
    }

    const expected = expectedPrice(
      str(body.theme, 100),
      str(body.packageTitle, 100),
      str(form.duration, 60),
      str(form.paymentType, 40),
    )
    let amountVerified = false
    if (payment.checked && payment.amount !== undefined) {
      if (expected === null || payment.currency !== "USD") {
        return NextResponse.json({ error: "Could not confirm the tour price for this payment." }, { status: 402 })
      }
      if (!coversPrice(payment.amount, expected)) {
        console.error("Underpayment", { transactionId, paid: payment.amount, expected })
        return NextResponse.json({ error: "Payment amount does not match the tour price." }, { status: 402 })
      }
      amountVerified = true
    }

    const col = getDb().collection("inperson_form")
    const ref = payment.checked ? col.doc(`tx-${transactionId}`) : col.doc()

    if (payment.checked && (await ref.get()).exists) {
      return NextResponse.json({ error: "This payment has already been used for a booking." }, { status: 409 })
    }

    await ref.set({
      fullName: str(form.fullName, 100),
      emailAddress,
      phoneNumber: str(form.phoneNumber, 40),
      country: str(form.country, 80),
      isAdult: str(form.isAdult, 5),
      fitForTravel: str(form.fitForTravel, 40),
      arrivalDate: typeof form.arrivalDate === "string" ? new Date(form.arrivalDate) : null,
      reasonForTour: str(form.reasonForTour, 200),
      otherReasonForTour: str(form.otherReasonForTour, 300),
      joiningAs: str(form.joiningAs, 50),
      preferredFood: str(form.preferredFood, 100),
      otherPreferredFood: str(form.otherPreferredFood, 200),
      specialRequest: str(form.specialRequest, 1000),
      howDidYouHear: str(form.howDidYouHear, 100),
      discountCode: str(form.discountCode, 40),
      otherMessage: str(form.otherMessage, 1000),
      paymentType: str(form.paymentType, 40),
      price: payment.checked ? payment.amount : expected,
      duration: str(form.duration, 60),
      theme: str(body.theme, 100),
      packageTitle: str(body.packageTitle, 100),
      submittedAt: new Date(),
      transactionId,
      paymentVerified: payment.checked,
      amountVerified,
    })

    return NextResponse.json({ id: ref.id }, { status: 201 })
  } catch (err) {
    console.error("Error in /api/inperson-booking:", err)
    return NextResponse.json({ error: "Booking failed. Please contact support if you were charged." }, { status: 500 })
  }
}
