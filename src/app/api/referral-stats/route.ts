import { NextResponse } from "next/server";
import { getDb } from "@/app/config/firebaseAdmin";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

interface Tourist {
  fullName?: string;
}

interface ReferralBooking {
  id: string;
  date: Date | null;
  guests: string | undefined;
  country: string;
  price: string;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const db = getDb();
    const snap = await db.collection("exclusive_Tour_form").get();

    const stats: Record<string, { count: number; bookings: ReferralBooking[] }> = {};

    snap.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      const ref = data.referralSource ?? "unknown";
      if (!stats[ref]) stats[ref] = { count: 0, bookings: [] };
      stats[ref].count += 1;
      stats[ref].bookings.push({
        id: doc.id,
        date: data.subscribedAt?.toDate?.() ?? null,
        guests: data.tourist?.map((t: Tourist) => t.fullName).join(", "),
        country: data.country,
        price: data.paidPrice,
      });
    });

    return NextResponse.json(stats);
  } catch (err) {
    console.error("Error in /api/referral-stats:", err);
    return NextResponse.json({ error: "Failed to load referral stats" }, { status: 500 });
  }
}
