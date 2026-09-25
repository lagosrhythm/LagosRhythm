import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Lato, Merienda, Merriweather, Playfair_Display, Signika } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { LagosRhythmProvider } from "./context/AppContext";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import Providers from "./providers/Providers";
import { metadataKeywords } from "@/data/metadata";
import JsonLd from "@/components/seo/JsonLd";
import AwardPopup from "@/components/AwardPopup";





const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
})


const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})


const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})


const merriWeather = Merriweather({
  variable: '--font-merriweather',
  subsets: ['latin'],
  weight: ['400', '700'],
})

const merienda = Merienda({
  variable: "--font-merienda",
  subsets: ["latin"],
  weight: ['400', '700']
})

const signika = Signika({
  variable: "--font-signika",
  weight: ['400', '700'],
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: "Lagos Rhythm | Live the Vibe, Please the Mind – Virtual & In-Person Lagos Tours",
  description: "Discover Lagos through immersive virtual tours, in-person travel experiences and authentic cultural storytelling. Book free and exclusive Lagos tours with Lagos Rhythm.",
  keywords: metadataKeywords,
  applicationName: "Lagos Rhythm",
  authors: [{ name: "Lagos Rhythm Team", url: "https://www.lagosrhythm.com" }],
  creator: "Lagos Rhythm Team",
  publisher: "Lagos Rhythm",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: "index, follow",
  icons: {
    icon: "./favicon.ico",
    shortcut: "./favicon.ico",
    apple: "./favicon.ico",
  },
  openGraph: {
    title: "Lagos Rhythm | Live the Vibe, Please the Mind",
    description:
      "Discover Lagos, Nigeria through immersive virtual tours, in-person travel experiences, street transit guides, and cultural storytelling.",
    url: "https://www.lagosrhythm.com",
    siteName: "Lagos Rhythm",
    images: [
      {
        url: "https://www.lagosrhythm.com/hero-image.png",
        width: 1200,
        height: 630,
        alt: "Lagos Rhythm",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lagos Rhythm | Live the Vibe, Please the Mind",
    description:
      "Discover Lagos through immersive virtual and in-person tours with Lagos Rhythm.",
    site: "@LagosRhythm",
    creator: "@LagosRhythm",
    images: ["https://www.lagosrhythm.com/hero-image.png"],
  },
  metadataBase: new URL("https://www.lagosrhythm.com"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Lagos Rhythm",
    "url": "https://www.lagosrhythm.com",
    "logo": "https://www.lagosrhythm.com/hero-image.png",
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61576980652512",
      "https://www.instagram.com/lagos_rhythm/",
      "https://www.linkedin.com/company/lagos-rhythm/",
      "https://youtube.com/@lagosrhythm"
    ],
    "description": "Tourism-tech platform offering virtual and in-person tours, cultural experiences and storytelling in Lagos, Nigeria.",
    "slogan": "Live the vibe, please the mind."
  }

  return (
    <html lang="en">
      <head>
        <JsonLd data={orgSchema} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${playfair.variable} ${lato.variable} ${merriWeather.variable} ${merienda.variable} ${signika.variable} antialiased`}
      >
        <Providers>
          <ClerkProvider>
            <LagosRhythmProvider>
              {children}
              <Toaster position="bottom-right" />
              <AwardPopup />
            </LagosRhythmProvider>
          </ClerkProvider>
        </Providers>
      </body>
    </html>
  );
}
