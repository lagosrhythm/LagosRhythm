import type { Metadata } from "next"
import ClientPage from "./ClientPage"

export const metadata: Metadata = {
  title: "Book Exclusive Lagos Virtual Tour | Private E-Rhythm Booking",
  description:
    "Book your private, live Lagos virtual tour. Choose group size, dates and theme for an exclusive, interactive Lagos experience with local guides.",
  alternates: {
    canonical: "https://www.lagosrhythm.com/exclusive-tour-form",
  },
  openGraph: {
    title: "Book Exclusive Lagos Virtual Tour | Private E-Rhythm Booking",
    description: "Book your private live Lagos virtual tour with Lagos Rhythm.",
    siteName: "Lagos Rhythm",
  }
}

export default function Page() {
  return <ClientPage />
}
