import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { getAdminAuth, getDb } from "@/app/config/firebaseAdmin"
import { isAdminEmail } from "@/lib/admin"

export const dynamic = "force-dynamic"

// Exchanges a Clerk session for a Firebase custom token so Firestore security
// rules (isSignedIn / isAdmin) can recognise the visitor.
export async function POST() {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const email = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? ""

  try {
    const token = await getAdminAuth().createCustomToken(user.id, {
      admin: isAdminEmail(email),
      userEmail: email,
    })

    // Make sure the profile document exists so the profile page can read it.
    if (email) {
      const ref = getDb().collection("user_profile").doc(email)
      const snap = await ref.get()
      if (!snap.exists) {
        await ref.set({
          fullName: [user.firstName, user.lastName].filter(Boolean).join(" "),
          country: "",
          createdAt: new Date(),
        })
      }
    }

    return NextResponse.json({ token })
  } catch (err) {
    console.error("Error in /api/firebase-token:", err)
    return NextResponse.json({ error: "Could not create Firebase session" }, { status: 500 })
  }
}
