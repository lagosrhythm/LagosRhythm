import { NextResponse } from "next/server";
import { db } from "@/app/config/firebaseAdmin";

export async function GET() {
  const snap = await db.collection("exclusive_Tour_form").get();

  const stats: Record<string, { count: number; bookings: any[] }> = {};

  snap.forEach((doc) => {
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