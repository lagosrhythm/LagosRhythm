import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

function initAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      ? require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      : null;

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      // Fallback for local dev with default credentials
      initializeApp();
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    initAdmin();
    const db = getFirestore();
    const { email: rawEmail, name } = await req.json();
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Check duplicate
    const q = await db.collection("subscribers").where("email", "==", email).limit(1).get();
    if (!q.empty) {
      return NextResponse.json({ message: "Already subscribed" }, { status: 200 });
    }

    await db.collection("subscribers").add({
      email,
      name: typeof name === "string" ? name.trim().slice(0, 100) : "",
      subscribedAt: new Date(),
      source: "award_popup",
    });

    // EmailJS confirmation can be added here if needed using server-side EmailJS

    return NextResponse.json({ message: "Subscribed" }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
