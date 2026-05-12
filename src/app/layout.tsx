import { Analytics } from "@vercel/analytics/next"
import * as Sentry from "@sentry/nextjs"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

const BASE_URL = "https://carashelters.ie"

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: "Cara | Animal Shelter Management Software Ireland",
      template: "%s | Cara",
    },
    description:
      "Manage adoptions, applications and animals in one place. Built for Irish animal rescues.",
    keywords: [
      "animal shelter software ireland",
      "rescue management ireland",
      "adopt a dog ireland",
      "adopt a cat ireland",
      "animal adoption ireland",
      "cara shelters",
    ],
    openGraph: {
      type: "website",
      locale: "en_IE",
      url: BASE_URL,
      siteName: "Cara",
      title: "Cara | Animal Shelter Management Software Ireland",
      description:
        "Manage adoptions, applications and animals in one place. Built for Irish animal rescues.",
      images: [{ url: "/logo.svg", width: 512, height: 512, alt: "Cara" }],
    },
    twitter: {
      card: "summary",
      title: "Cara | Animal Shelter Management Software Ireland",
      description:
        "Manage adoptions, applications and animals in one place. Built for Irish animal rescues.",
    },
    alternates: { canonical: BASE_URL },
    other: {
      ...Sentry.getTraceData(),
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
