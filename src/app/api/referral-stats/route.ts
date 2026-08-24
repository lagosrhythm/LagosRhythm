import { NextResponse } from "next/server";
import { getDb } from "@/app/config/firebaseAdmin";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const snap = await db.collection("exclusive_Tour_form").get();

  const stats: Record<string, { count: number; bookings: any[] }> = {};

  snap.forEach((doc: QueryDocumentSnapshot) => {
    const data = doc.data();
    const ref = data.referralSource ?? "unknown";
    if (!stats[ref]) stats[ref] = { count: 0, bookings: [] };
    stats[ref].count += 1;
    stats[ref].bookings.push({
      id: doc.id,
      date: data.subscribedAt?.toDate?.() ?? null,
      guests: data.tourist?.map((t: any) => t.fullName).join(", "),
      country: data.country,
      price: data.paidPrice,
    });
  });

  return NextResponse.json(stats);
}