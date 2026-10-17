import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/app/config/firebaseAdmin"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")
const strList = (v: unknown, maxItems: number) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, maxItems) : []

// Free E-Rhythm bookings: validated and de-duplicated on the server.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const email = str(body.email, 254).toLowerCase()
    const fullName = str(body.fullName, 100)
    const country = str(body.country, 80)
    const joiningAs = str(body.joiningAs, 50)
    const referral = str(body.referralSource, 80)

    if (!EMAIL_RE.test(email) || fullName.length < 2 || country.length < 2 || !joiningAs || !referral || body.termsAgreement !== true) {
      return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 })
    }

    const db = getDb()
    const existing = await db.collection("booked_Free_Rhythm").where("email", "==", email).limit(1).get()
    if (!existing.empty) {
      return NextResponse.json({ error: "You have already booked a Free E-Rhythm tour." }, { status: 409 })
    }

    await db.collection("booked_Free_Rhythm").add({
      fullName,
      email,
      country,
      reasonForJoin: strList(body.reasonForJoin, 10),
      joiningAs,
      otherJoin: str(body.otherJoin, 80),
      tour_date: strList(body.tourDate, 10),
      agree_to_TC: true,
      referral,
      subscribedAt: new Date(),
    })

    return NextResponse.json({ message: "Booked" }, { status: 201 })
  } catch (err) {
    console.error("Error in /api/free-booking:", err)
    return NextResponse.json({ error: "Booking failed. Please try again." }, { status: 500 })
  }
}
