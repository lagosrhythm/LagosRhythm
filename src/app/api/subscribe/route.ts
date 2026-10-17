import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/config/firebaseAdmin";

const SOURCES = ["award_popup", "newsletter"];

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const { email: rawEmail, name, source } = await req.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Check duplicate
    const q = await db.collection("subscribers").where("email", "==", email).limit(1).get();
    if (!q.empty) {
      return NextResponse.json({ message: "Already subscribed", alreadySubscribed: true }, { status: 200 });
    }

    await db.collection("subscribers").add({
      email,
      name: typeof name === "string" ? name.trim().slice(0, 100) : "",
      subscribedAt: new Date(),
      source: SOURCES.includes(source) ? source : "newsletter",
    });

    return NextResponse.json({ message: "Subscribed" }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
