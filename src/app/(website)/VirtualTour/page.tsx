import type { Metadata } from "next"
import ClientPage from "./ClientPage"
import JsonLd from "@/components/seo/JsonLd"

export const metadata: Metadata = {
  title: "Virtual Tours of Lagos | Live & Interactive Online Experiences",
  description:
    "Join free and exclusive live virtual tours of Lagos, Nigeria. Experience the culture, streets, food, art, and nightlife of Africa's most vibrant city — guided by locals, streamed in real time.",
  alternates: {
    canonical: "https://www.lagosrhythm.com/VirtualTour",
  },
  openGraph: {
    title: "Virtual Tours of Lagos | Live & Interactive Online Experiences",
    description:
      "Join live virtual tours of Lagos, Nigeria. Experience the culture, streets, food, art, and nightlife guided by locals in real time.",
    siteName: "Lagos Rhythm",
  },
}

const tourSchema = {
  "@context": "https://schema.org",
  "@type": "TouristTrip",
  "name": "Virtual Tours of Lagos",
  "description": "Live interactive virtual tours of Lagos, Nigeria covering culture, streets, food, art and nightlife.",
  "touristType": "Virtual",
  "offers": {
    "@type": "Offer",
    "url": "https://www.lagosrhythm.com/VirtualTour",
    "availability": "https://schema.org/InStock"
  },
  "provider": {
    "@type": "Organization",
    "name": "Lagos Rhythm",
    "url": "https://www.lagosrhythm.com"
  }
}

export default function Page() {
  return (
    <>
      <JsonLd data={tourSchema} />
      <ClientPage />
    </>
  )
}
