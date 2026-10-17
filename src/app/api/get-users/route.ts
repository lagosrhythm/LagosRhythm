import { clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/requireAdmin"

export async function GET() {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const client = await clerkClient()
    const users = await client.users.getUserList()

    return NextResponse.json(users)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
