import Link from "next/link"
import { PawPrint, Heart, Globe, ArrowRight } from "lucide-react"

export const metadata = {
  title: "About Cara | Animal Shelter Software Ireland",
  description:
    "Cara is animal shelter management software built for Irish rescue organisations. Learn about our mission to help more animals find homes.",
  alternates: { canonical: "https://carashelters.ie/about" },
  openGraph: {
    url: "https://carashelters.ie/about",
    title: "About Cara | Animal Shelter Software Ireland",
    description:
      "Cara is animal shelter management software built for Irish rescue organisations.",
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Cara",
  url: "https://carashelters.ie",
  description:
    "Cara is animal shelter management software built for Irish and European rescue organisations. It helps shelters manage animals, adoption applications, and digital contracts — and lists adoptable animals at carashelters.ie/adopt.",
  areaServed: ["Ireland", "United Kingdom"],
  knowsAbout: [
    "Animal shelter management",
    "Pet adoption in Ireland",
    "Animal rescue software",
    "Dog adoption Ireland",
    "Cat adoption Ireland",
  ],
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nav */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1a3a2a] flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-[#4ade80]" />
            </div>
            <span className="font-bold text-[#1a3a2a]">Cara</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/adopt" className="text-sm text-gray-600 hover:text-[#1a3a2a] transition-colors">
              Adopt a pet
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-[#1a3a2a] text-white px-4 py-2 rounded-lg hover:bg-[#2d5a3d] transition-colors"
            >
              Register shelter
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-16">

        {/* Hero */}
        <section>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1a3a2a] leading-tight mb-6">
            About Cara
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Cara is animal shelter management software built for Irish and European rescue
            organisations. We help shelters find more forever homes by replacing spreadsheets,
            Facebook DMs, and paper contracts with a purpose-built platform.
          </p>
        </section>

        {/* Mission */}
        <section className="bg-[#1a3a2a] rounded-3xl p-8 sm:p-12 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-6 h-6 text-[#4ade80]" />
            <h2 className="text-2xl font-bold">Our mission</h2>
          </div>
          <p className="text-[#a7c4b5] text-lg leading-relaxed mb-4">
            Every year, thousands of dogs, cats, and other animals pass through rescue shelters
            across Ireland. Most shelters run on the goodwill of volunteers — people who give up
            their evenings chasing email threads and updating shared spreadsheets.
          </p>
          <p className="text-[#a7c4b5] text-lg leading-relaxed">
            Cara exists to give that time back. When volunteers spend less time on admin, they
            spend more time with the animals — and more animals find homes.
          </p>
        </section>

        {/* What Cara does */}
        <section>
          <h2 className="text-2xl font-bold text-[#1a3a2a] mb-4">What Cara does</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Cara gives each shelter a complete management system and a public-facing adoption
            portal. Shelters can list animals, receive and review adoption applications, send
            digitally-signed contracts, manage their team, and collect donations — all in one place.
          </p>
          <ul className="space-y-3">
            {[
              "Animal intake records with photos, medical notes, and status tracking",
              "Online adoption application forms — no paper, no email attachments",
              "Digital e-sign contracts sent directly to adopters by email",
              "A public adoption portal for each shelter at carashelters.ie/portal/your-shelter",
              "Team management with admin and staff roles",
              "Donor management and one-off donations via Stripe",
              "GDPR tools for data requests and compliance",
            ].map(item => (
              <li key={item} className="flex items-start gap-3 text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Adopt directory */}
        <section className="border border-[#c6e8d3] bg-[#edf7f0] rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-[#1a3a2a]" />
            <h2 className="text-xl font-bold text-[#1a3a2a]">Find a rescue animal near you</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-5">
            Cara also powers a public directory of adoptable animals at{" "}
            <strong>carashelters.ie/adopt</strong>. Anyone looking to adopt a dog, cat, rabbit,
            or other animal in Ireland can browse animals from multiple shelters in one place,
            filter by species and county, and apply directly online. No account needed.
          </p>
          <Link
            href="/adopt"
            className="inline-flex items-center gap-2 bg-[#1a3a2a] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#2d5a3d] transition-colors text-sm"
          >
            Browse animals for adoption
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* Who it's for */}
        <section>
          <h2 className="text-2xl font-bold text-[#1a3a2a] mb-4">Who Cara is for</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Cara is built for animal rescue organisations in Ireland and the United Kingdom —
            from small volunteer-run rescues rehoming a handful of animals each month, to larger
            multi-location shelters managing hundreds of animals at a time.
          </p>
          <p className="text-gray-600 leading-relaxed">
            If your shelter still relies on Facebook to manage enquiries, shared Google Sheets to
            track applications, or printed contracts sent by post — Cara is built for you.
          </p>
        </section>

        {/* Pricing callout */}
        <section className="border border-gray-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-[#1a3a2a] mb-2">Simple pricing</h2>
          <p className="text-gray-500 mb-1">€34.99 per month. 30-day free trial. No setup fee.</p>
          <p className="text-gray-500 text-sm mb-6">Cancel any time.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#1a3a2a] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#2d5a3d] transition-colors"
          >
            Register your shelter
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-[#1a3a2a]" />
            <span className="font-semibold text-[#1a3a2a] text-sm">Cara</span>
          </Link>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Cara. Built in Ireland.</p>
          <div className="flex items-center gap-5 flex-wrap justify-center">
            <a href="/legal/cara-privacy-policy.docx" download className="text-xs text-gray-400 hover:text-[#1a3a2a] transition-colors">
              Privacy Policy
            </a>
            <a href="/legal/cara-terms-of-service.docx" download className="text-xs text-gray-400 hover:text-[#1a3a2a] transition-colors">
              Terms of Service
            </a>
            <a href="/legal/cara-data-processing-agreement.docx" download className="text-xs text-gray-400 hover:text-[#1a3a2a] transition-colors">
              DPA
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
