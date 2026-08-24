"use client";

import { useEffect, useState } from "react";

type ReferralStat = {
  count: number;
  bookings: {
    id: string;
    date: string | null;
    guests: string;
    country: string;
    price: string;
  }[];
};

const PASSCODE = "0987654321";

export default function EventAdminClient() {
  const [stats, setStats] = useState<Record<string, ReferralStat>>({});
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);

  // check sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("eventAdminAuthed");
    if (saved === "true") {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/referral-stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === PASSCODE) {
      setAuthed(true);
      sessionStorage.setItem("eventAdminAuthed", "true");
      setError(false);
    } else {
      setError(true);
    }
  };

  const logout = () => {
    setAuthed(false);
    sessionStorage.removeItem("eventAdminAuthed");
  };

  if (!authed) {
    return (
      <section className="w-full max-w-md mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold font-merienda text-[#05073C] mb-6 text-center">
          Event Admin – Enter Passcode
        </h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          {error && (
            <p className="mb-4 text-red-600 text-sm text-center">Incorrect passcode</p>
          )}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passcode
          </label>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF8F57]"
            placeholder="0987654321"
            autoComplete="off"
            required
          />
          <button
            type="submit"
            className="mt-4 w-full bg-[#EF8F57] text-white py-2 rounded-lg font-medium hover:bg-[#d97d4a] transition"
          >
            Access
          </button>
        </form>
      </section>
    );
  }

  if (loading) return <div className="p-8 text-center">Loading…</div>;

  const entries = Object.entries(stats);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-merienda text-[#05073C]">
          Referral / Event Admin
        </h1>
        <button
          onClick={logout}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Logout
        </button>
      </div>

      {entries.length === 0 && (
        <p className="text-center text-gray-500">No referral data yet.</p>
      )}

      {entries.map(([code, { count, bookings }]) => (
        <details key={code} className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden">
          <summary className="flex items-center justify-between p-5 cursor-pointer bg-gray-50 font-semibold text-[#05073C]">
            <span>
              {code} — <span className="font-normal text-gray-600">{count} booking{count !== 1 ? "s" : ""}</span>
            </span>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
          </summary>

          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-2 font-medium text-[#05073C]">Date</th>
                    <th className="pb-2 font-medium text-[#05073C]">Guests</th>
                    <th className="pb-2 font-medium text-[#05073C]">Country</th>
                    <th className="pb-2 font-medium text-[#05073C]">Price</th>
                    <th className="pb-2 font-medium text-[#05073C]">Doc ID</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-gray-100">
                      <td className="py-2 text-gray-700">{b.date ? new Date(b.date).toLocaleString() : "—"}</td>
                      <td className="py-2 text-gray-700">{b.guests || "—"}</td>
                      <td className="py-2 text-gray-700">{b.country}</td>
                      <td className="py-2 text-gray-700">{b.price}</td>
                      <td className="py-2 font-mono text-xs text-gray-500">{b.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>
      ))}
    </section>
  );
}