import type { Metadata } from "next"
import { AccordionDemo } from "@/components/AccordionComponents"
import { CircleQuestionMark } from "lucide-react"
import JsonLd from "@/components/seo/JsonLd"
import { faq } from "@/data/data"

export const metadata: Metadata = {
  title: "Lagos Rhythm FAQ | Virtual & In-Person Tour Booking Help",
  description:
    "Answers to common questions about Lagos Rhythm virtual and in-person tours, bookings, payments, and how our Lagos cultural experiences work.",
  alternates: {
    canonical: "https://www.lagosrhythm.com/FAQ",
  },
  openGraph: {
    title: "Lagos Rhythm FAQ | Virtual & In-Person Tour Booking Help",
    description: "Get answers about booking Lagos tours, virtual experiences, payments and more.",
    siteName: "Lagos Rhythm",
  }
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faq.map((item) => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer
    }
  }))
}

export default function Page() {
    return (
        <div className="w-full h-fit flex items-center justify-center flex-col gap-6 py-16 md:py-28 px-5 bg-[#05073C]  " >
            <h3 className="flex items-center justify-center gap-2 border-2 border-gray-400 text-sm py-2 px-4 rounded-xl font-lato  text-gray-400 " > <CircleQuestionMark size={20} /> FAQS</h3>
            <h1 className=" text-3xl md:text-5xl font-merriweather font-bold text-white text-center" >Frequently Asked Questions</h1>
            <p className=" font-lato w-full max-w-sm text-center text-base font-normal text-gray-400 " >Find questions and answers related to the design system, purchase, updates, and support.</p>



            <div className="w-full max-w-5xl" >
                <AccordionDemo />
            </div>
            <JsonLd data={faqJsonLd} />
        </div>
    )
}

