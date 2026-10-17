import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { isAdminEmail } from "@/lib/admin"

// Call at the top of an admin-only route handler. Returns a ready-made
// error response when the caller is not an admin, otherwise null.
export async function requireAdmin(): Promise<NextResponse | null> {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!isAdminEmail(user.primaryEmailAddress?.emailAddress)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  return null
}
